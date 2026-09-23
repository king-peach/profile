import React, { useEffect, useRef, useState } from "react";
import { useTranslation } from "react-i18next";
import ReactMarkdown from "react-markdown";
import remarkGfm from "remark-gfm";
import { retrieve, type Retrieved } from "../../lib/askInk";

type Phase = "idle" | "retrieving" | "waiting" | "streaming";
type Msg = { role: "user" | "assistant"; content: string; sources?: Retrieved[]; error?: boolean };

/* ---------- lightweight streaming renderer ----------
   Parses **bold** / *italic* / `code` / links into React nodes.
   Block-level (headings/lists) is handled by splitting into lines
   and grouping list items; no HTML injection. */
function renderInline(text: string, keyBase: string): React.ReactNode[] {
  const nodes: React.ReactNode[] = [];
  const re = /(\*\*[^*]+\*\*|\*[^*\n]+\*|`[^`]+`|\[[^\]]+\]\([^)]+\))/g;
  let last = 0;
  let m: RegExpExecArray | null;
  let i = 0;
  while ((m = re.exec(text))) {
    if (m.index > last) nodes.push(text.slice(last, m.index));
    const tok = m[0];
    const key = `${keyBase}-${i++}`;
    if (tok.startsWith("**")) nodes.push(<strong key={key}>{tok.slice(2, -2)}</strong>);
    else if (tok.startsWith("`")) nodes.push(<code key={key}>{tok.slice(1, -1)}</code>);
    else if (tok.startsWith("*")) nodes.push(<em key={key}>{tok.slice(1, -1)}</em>);
    else {
      const lm = /\[([^\]]+)\]\(([^)]+)\)/.exec(tok);
      nodes.push(
        <a key={key} href={lm![2]} target="_blank" rel="noreferrer">{lm![1]}</a>
      );
    }
    last = m.index + tok.length;
  }
  if (last < text.length) nodes.push(text.slice(last));
  return nodes;
}

const StreamMarkdown: React.FC<{ text: string }> = ({ text }) => {
  const lines = text.split("\n");
  const blocks: React.ReactNode[] = [];
  let list: { ordered: boolean; items: string[] } | null = null;
  const flush = (key: string) => {
    if (!list) return;
    const Tag = (list.ordered ? "ol" : "ul") as "ol" | "ul";
    blocks.push(
      <Tag key={key}>
        {list.items.map((it, i) => (
          <li key={i}>{renderInline(it, `${key}-${i}`)}</li>
        ))}
      </Tag>
    );
    list = null;
  };
  lines.forEach((line, idx) => {
    const key = `b${idx}`;
    const t = line.trim();
    const ol = /^\d+[.、]\s+(.*)$/.exec(t);
    const ul = /^[-*]\s+(.*)$/.exec(t);
    const h = /^(#{1,4})\s+(.*)$/.exec(t);
    if (ol) {
      if (!list || !list.ordered) {
        flush(key);
        list = { ordered: true, items: [] };
      }
      list.items.push(ol[1]);
    } else if (ul) {
      if (!list || list.ordered) {
        flush(key);
        list = { ordered: false, items: [] };
      }
      list.items.push(ul[1]);
    } else {
      flush(key);
      if (h) {
        blocks.push(<strong key={key} className="ink-ask-md-h">{renderInline(h[2], key)}</strong>);
      } else if (t) {
        blocks.push(<p key={key}>{renderInline(t, key)}</p>);
      }
    }
  });
  flush("tail");
  return <div className="ink-ask-md">{blocks}</div>;
};

/* Full markdown for finished messages (consistent with the site's article renderer) */
const FinalMarkdown: React.FC<{ text: string }> = ({ text }) => (
  <div className="ink-ask-md">
    <ReactMarkdown
      remarkPlugins={[remarkGfm]}
      components={{
        a: ({ href, children }) => (
          <a href={href} target="_blank" rel="noreferrer">{children}</a>
        ),
      }}
    >
      {text}
    </ReactMarkdown>
  </div>
);

const SUGGESTIONS_ZH = ["王涛擅长什么？", "有哪些 AI 落地项目？", "讲讲微前端的实践经验", "怎么联系他？"];
const SUGGESTIONS_EN = ["What is Eric good at?", "Any AI delivery projects?", "Micro-frontend experience?", "How to get in touch?"];

function systemPrompt(lang: string, sources: Retrieved[]): string {
  const ctx = sources
    .map((s, i) => `[${i + 1}] ${s.title}${s.published ? "" : "（草稿）"}\n${s.text}`)
    .join("\n\n");
  return lang.startsWith("en")
    ? `You are Eric Wang's portfolio assistant. Answer STRICTLY from the context below about Eric (王涛). If the answer is not in the context, say you don't know and suggest the contact email wtiroo@163.com. Keep it concise (under 150 words), cite sources like [1]. Never invent facts.\n\nContext:\n${ctx}`
    : `你是王涛 (Eric Wang) 作品集的 AI 助手。仅根据下面的上下文回答关于王涛的问题；上下文没有的信息就直说不知道，并提示可发邮件 wtiroo@163.com 联系本人。回答简洁（150 字内），引用来源用 [1] 格式。禁止编造。\n\n上下文：\n${ctx}`;
}

const LoadingBubble: React.FC<{ phase: "retrieving" | "waiting"; label: string }> = ({ phase, label }) => (
  <div className="ink-ask-msg assistant">
    <div className="ink-ask-bubble ink-ask-loading-bubble">
      <span className="ink-ask-loading">
        <span className="ink-ask-dots"><span /><span /><span /></span>
        {phase === "retrieving" ? label : label}
      </span>
    </div>
  </div>
);

const InkAsk: React.FC = () => {
  const { i18n } = useTranslation();
  const isEn = i18n.language.startsWith("en");
  const [open, setOpen] = useState(false);
  const [msgs, setMsgs] = useState<Msg[]>([]);
  const [input, setInput] = useState("");
  const [phase, setPhase] = useState<Phase>("idle");
  const [sugs] = useState(isEn ? SUGGESTIONS_EN : SUGGESTIONS_ZH);
  const bodyRef = useRef<HTMLDivElement>(null);
  const inputRef = useRef<HTMLInputElement>(null);
  const abortRef = useRef<AbortController | null>(null);
  const lastQuestion = useRef<string>("");

  const busy = phase !== "idle";
  const loadingLabel = phase === "retrieving" ? (isEn ? "Reading the posts…" : "翻阅文章中…") : isEn ? "Thinking…" : "思考中…";

  useEffect(() => {
    if (bodyRef.current) bodyRef.current.scrollTop = bodyRef.current.scrollHeight;
  }, [msgs, phase, open]);

  useEffect(() => {
    if (open) setTimeout(() => inputRef.current?.focus(), 120);
  }, [open]);

  useEffect(() => () => abortRef.current?.abort(), []);

  const patchLast = (patch: Partial<Msg>) => {
    setMsgs((m) => {
      const copy = m.slice();
      copy[copy.length - 1] = { ...copy[copy.length - 1], ...patch };
      return copy;
    });
  };

  const send = async (text: string) => {
    const q = text.trim();
    if (!q || busy) return;
    lastQuestion.current = q;
    setInput("");
    setMsgs((m) => [...m, { role: "user", content: q }]);
    setPhase("retrieving");
    try {
      // 1) retrieval
      const sources = await retrieve(q, 5);
      if (abortRef.current?.signal.aborted) return;
      // 2) LLM stream
      setPhase("waiting");
      const ctrl = new AbortController();
      abortRef.current = ctrl;
      const res = await fetch("/api/ai/chat/completions", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        signal: ctrl.signal,
        body: JSON.stringify({
          model: "deepseek-ai/DeepSeek-V3",
          stream: true,
          max_tokens: 500,
          temperature: 0.3,
          messages: [
            { role: "system", content: systemPrompt(i18n.language, sources) },
            ...msgs.slice(-6).map((m) => ({ role: m.role, content: m.content })),
            { role: "user", content: q },
          ],
        }),
      });
      if (!res.ok || !res.body) throw new Error("chat " + res.status);
      const reader = res.body.getReader();
      const dec = new TextDecoder();
      let buf = "";
      let acc = "";
      let first = true;
      for (;;) {
        const { done, value } = await reader.read();
        if (done) break;
        buf += dec.decode(value, { stream: true });
        const lines = buf.split("\n");
        buf = lines.pop() || "";
        for (const line of lines) {
          const t = line.trim();
          if (!t.startsWith("data:")) continue;
          const payload = t.slice(5).trim();
          if (payload === "[DONE]") continue;
          try {
            const delta = JSON.parse(payload).choices?.[0]?.delta?.content;
            if (delta) {
              if (first) {
                first = false;
                setPhase("streaming");
                setMsgs((m) => [...m, { role: "assistant", content: delta, sources }]);
              } else {
                acc += delta;
                patchLast({ content: acc });
              }
            }
          } catch {
            /* partial json line, ignore */
          }
        }
      }
      if (first) {
        setMsgs((m) => [...m, { role: "assistant", content: isEn ? "(empty response — try again)" : "（空回复，请重试）", error: true }]);
      }
    } catch (e: any) {
      if (e?.name === "AbortError") {
        // user stopped — keep whatever streamed; if nothing, drop back to idle quietly
        setMsgs((m) => {
          const last = m[m.length - 1];
          if (last && last.role === "assistant" && !last.content) {
            return m.slice(0, -1);
          }
          return m;
        });
      } else {
        setMsgs((m) => [...m, {
          role: "assistant",
          content: isEn ? "Something went wrong. You can retry, or email wtiroo@163.com." : "出错了。可以重试，或直接发邮件 wtiroo@163.com。",
          error: true,
        }]);
      }
    } finally {
      setPhase("idle");
      abortRef.current = null;
      setTimeout(() => inputRef.current?.focus(), 50);
    }
  };

  const stop = () => {
    abortRef.current?.abort();
    // abort during retrieval has no controller yet; fake one so finally cleanup runs
    setPhase("idle");
  };

  return (
    <>
      <button
        type="button"
        className="ink-ask-fab"
        data-tip={isEn ? "Ask my blog" : "问我的博客"}
        aria-label={isEn ? "Ask AI about Eric" : "AI 问答"}
        onClick={() => setOpen((o) => !o)}
      >
        {open ? "×" : "✦"}
      </button>
      {open && (
        <div className="ink-ask-panel" role="dialog" aria-label={isEn ? "AI assistant" : "AI 助手"}>
          <div className="ink-ask-head">
            <span>
              {isEn ? "✦ Ask about Eric" : "✦ 问我的博客"}
              {busy && <span className="ink-ask-status" />}
            </span>
            <button type="button" className="ink-ask-x" onClick={() => setOpen(false)} aria-label="close">×</button>
          </div>
          <div className="ink-ask-body" ref={bodyRef}>
            {msgs.length === 0 && (
              <div className="ink-ask-hello">
                <p>{isEn ? "Hi! Ask me anything about Eric's experience, projects, or posts — answers come from his own writing." : "你好！关于王涛的经历、项目和文章都可以问我——回答全部来自他自己的文字。"}</p>
                <div className="ink-ask-sugs">
                  {sugs.map((s) => (
                    <button key={s} type="button" disabled={busy} onClick={() => send(s)}>
                      {s}
                    </button>
                  ))}
                </div>
              </div>
            )}
            {msgs.map((m, i) => {
              const isStreamingTail = phase === "streaming" && i === msgs.length - 1 && m.role === "assistant";
              return (
                <div key={i} className={`ink-ask-msg ${m.role}`}>
                  <div className={`ink-ask-bubble${m.error ? " err" : ""}`}>
                    {m.role === "user" ? (
                      m.content
                    ) : isStreamingTail ? (
                      <>
                        <StreamMarkdown text={m.content} />
                        <span className="ink-ask-cursor" />
                      </>
                    ) : (
                      <FinalMarkdown text={m.content} />
                    )}
                    {m.sources && m.sources.length > 0 && !isStreamingTail && (
                      <div className="ink-ask-src">
                        {m.sources.slice(0, 3).map((s, j) => (
                          <span key={j}>[{j + 1}] {s.title}</span>
                        ))}
                      </div>
                    )}
                    {m.error && (
                      <button
                        type="button"
                        className="ink-ask-err-btn"
                        onClick={() => {
                          const q = lastQuestion.current;
                          setMsgs((mm) => (mm.length >= 2 ? mm.slice(0, -2) : []));
                          send(q);
                        }}
                      >
                        {isEn ? "Retry" : "重试"}
                      </button>
                    )}
                  </div>
                </div>
              );
            })}
            {phase === "retrieving" && <LoadingBubble phase="retrieving" label={loadingLabel} />}
            {phase === "waiting" && <LoadingBubble phase="waiting" label={loadingLabel} />}
          </div>
          <form
            className="ink-ask-input"
            onSubmit={(e) => {
              e.preventDefault();
              send(input);
            }}
          >
            <input
              ref={inputRef}
              value={input}
              onChange={(e) => setInput(e.target.value)}
              placeholder={isEn ? "Ask something…" : "问点什么…"}
              disabled={busy}
            />
            {busy ? (
              <button type="button" className="ink-ask-stop" onClick={stop} title={isEn ? "Stop" : "停止"}>
                {isEn ? "■ Stop" : "■ 停止"}
              </button>
            ) : (
              <button type="submit" disabled={!input.trim()}>
                {isEn ? "Send" : "发送"}
              </button>
            )}
          </form>
        </div>
      )}
    </>
  );
};

export default InkAsk;
