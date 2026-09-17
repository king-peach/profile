import { useEffect, useMemo, useState } from "react";
import Prism from "prismjs";
// Statically import all language components — required because Prism lang plugins
// reference the global `Prism` at load time, which breaks with Vite code-splitting.
import "prismjs/components/prism-clike.js";
import "prismjs/components/prism-bash.js";
import "prismjs/components/prism-javascript.js";
import "prismjs/components/prism-json.js";
import "prismjs/components/prism-sql.js";
import "prismjs/components/prism-typescript.js";
import "prismjs/components/prism-yaml.js";

export type LazyCodeRendererProps = {
  code: string;
  dark: boolean;
  language: string;
};

type SupportedLanguage =
  | "bash"
  | "clike"
  | "javascript"
  | "json"
  | "sql"
  | "typescript"
  | "yaml";

const LANGUAGE_ALIASES: Record<string, SupportedLanguage | "text"> = {
  bash: "bash",
  javascript: "javascript",
  js: "javascript",
  json: "json",
  plain: "text",
  plaintext: "text",
  shell: "bash",
  sh: "bash",
  sql: "sql",
  text: "text",
  ts: "typescript",
  typescript: "typescript",
  yaml: "yaml",
  yml: "yaml",
};

function escapeHtml(value: string): string {
  return value
    .replace(/&/g, "&amp;")
    .replace(/</g, "&lt;")
    .replace(/>/g, "&gt;");
}

function normalizeLanguage(language: string): SupportedLanguage | "text" {
  const normalized = language.trim().toLowerCase();

  if (!normalized) {
    return "text";
  }

  if (normalized in LANGUAGE_ALIASES) {
    return LANGUAGE_ALIASES[normalized];
  }

  if (normalized in Prism.languages) {
    return normalized as SupportedLanguage;
  }

  return "text";
}

export default function LazyCodeRenderer({ code, dark, language }: LazyCodeRendererProps) {
  const [highlightedHtml, setHighlightedHtml] = useState<string>(() => escapeHtml(code));
  const normalizedLanguage = useMemo(() => normalizeLanguage(language), [language]);
  const lineCount = useMemo(() => Math.max(1, code.split("\n").length), [code]);

  useEffect(() => {
    let active = true;
    setHighlightedHtml(escapeHtml(code));

    try {
      if (normalizedLanguage !== "text") {
        const grammar = Prism.languages[normalizedLanguage];

        if (grammar && active) {
          setHighlightedHtml(Prism.highlight(code, grammar, normalizedLanguage));
          return;
        }
      }
    } catch {
      // Keep the plain-code fallback if Prism or a language fails.
    }

    if (active) {
      setHighlightedHtml(escapeHtml(code));
    }

    return () => {
      active = false;
    };
  }, [code, normalizedLanguage]);

  return (
    <pre
      className={`m-0 overflow-x-auto p-4 text-sm leading-6 ${
        dark ? "bg-[#1e1e2e] text-gray-100" : "bg-[#1e293b] text-gray-100"
      }`}
    >
      <code className="article-code-block__shell">
        <span aria-hidden className="article-code-block__gutter">
          {Array.from({ length: lineCount }, (_, index) => (
            <span key={index} className="article-code-block__line-number">
              {index + 1}
            </span>
          ))}
        </span>
        <span
          className="article-code-block__content"
          dangerouslySetInnerHTML={{ __html: highlightedHtml }}
        />
      </code>
    </pre>
  );
}
