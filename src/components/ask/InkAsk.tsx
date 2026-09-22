import React, { useEffect, useRef, useState } from "react";
import { useTranslation } from "react-i18next";
import { retrieve, type Retrieved } from "../../lib/askInk";

type Msg = { role: "user" | "assistant"; content: string; sources?: Retrieved[] };

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

const InkAsk: React.FC = () => {
  const { i18n } = useTranslation();
  const isEn = i18n.language.startsWith("en");
  const [open, setOpen] = useState(false);
  const [msgs, setMsgs] = useState<Msg[]>([]);
  const [input, setInput] = useState("");
  const [busy, setBusy] = useState(false);
  const [sugs] = useState(isEn ? SUGGESTIONS_EN : SUGGESTIONS_ZH);
  const bodyRef = useRef<HTMLDivElement>(null);
  const abortRef = useRef<AbortController | null>(null);

  useEffect(() => {
    if (bodyRef.current) bodyRef.current.scrollTop = bodyRef.current.scrollHeight;
  }, [msgs, open]);

  useEffect(() => () => abortRef.current?.abort(), []);

  const send = async (text: string) => {
    const q = text.trim();
    if (!q || busy) return;
    setInput("");
    setMsgs((m) => [...m, { role: "user", content: q }]);
    setBusy(true);
    try {
      const sources = await retrieve(q, 5);
      const lang = i18n.language;
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
            { role: "system", content: systemPrompt(lang, sources) },
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
      setMsgs((m) => [...m, { role: "assistant", content: "", sources }]);
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
              acc += delta;
              setMsgs((m) => {
                const copy = m.slice();
                copy[copy.length - 1] = { ...copy[copy.length - 1], content: acc };
                return copy;
              });
            }
          } catch {
            /* partial json line, ignore */
          }
        }
      }
    } catch (e: any) {
      if (e?.name !== "AbortError") {
        setMsgs((m) => [...m, { role: "assistant", content: isEn ? "Something went wrong — please retry, or email wtiroo@163.com." : "出错了，请重试，或直接发邮件 wtiroo@163.com。" }]);
      }
    } finally {
      setBusy(false);
    }
  };

  return (
    <>
      <button
        type="button"
        className="ink-ask-fab"
        aria-label={isEn ? "Ask AI about Eric" : "AI 问答"}
        onClick={() => setOpen((o) => !o)}
      >
        {open ? "×" : "✦"}
      </button>
      {open && (
        <div className="ink-ask-panel" role="dialog" aria-label={isEn ? "AI assistant" : "AI 助手"}>
          <div className="ink-ask-head">
            <span>{isEn ? "✦ Ask about Eric" : "✦ 问我的博客"}</span>
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
            {msgs.map((m, i) => (
              <div key={i} className={`ink-ask-msg ${m.role}`}>
                <div className="ink-ask-bubble">
                  {m.content || (isEn ? "…" : "…")}
                  {m.sources && m.sources.length > 0 && (
                    <div className="ink-ask-src">
                      {m.sources.slice(0, 3).map((s, j) => (
                        <span key={j}>[{j + 1}] {s.title}</span>
                      ))}
                    </div>
                  )}
                </div>
              </div>
            ))}
          </div>
          <form
            className="ink-ask-input"
            onSubmit={(e) => {
              e.preventDefault();
              send(input);
            }}
          >
            <input
              value={input}
              onChange={(e) => setInput(e.target.value)}
              placeholder={isEn ? "Ask something…" : "问点什么…"}
              disabled={busy}
            />
            <button type="submit" disabled={busy || !input.trim()}>
              {isEn ? "Send" : "发送"}
            </button>
          </form>
        </div>
      )}
    </>
  );
};

export default InkAsk;
