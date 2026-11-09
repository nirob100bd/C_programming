"use client";

import Editor, { type OnMount } from "@monaco-editor/react";
import { useEffect, useState } from "react";

export function CodeEditor({
  value,
  onChange,
  height = "420px",
  fontSize = 14,
  onMount
}: {
  value: string;
  onChange: (value: string) => void;
  height?: string;
  fontSize?: number;
  onMount?: OnMount;
}) {
  const [dark, setDark] = useState(false);

  useEffect(() => {
    const observer = new MutationObserver(() => {
      setDark(document.documentElement.classList.contains("dark"));
    });
    setDark(document.documentElement.classList.contains("dark"));
    observer.observe(document.documentElement, { attributes: true, attributeFilter: ["class"] });
    return () => observer.disconnect();
  }, []);

  return (
    <Editor
      height={height}
      language="c"
      value={value}
      onChange={(next) => onChange(next ?? "")}
      onMount={onMount}
      theme={dark ? "vs-dark" : "light"}
      loading={<div className="grid h-full place-items-center text-sm muted">Loading editor…</div>}
      options={{
        minimap: { enabled: false },
        fontSize,
        fontLigatures: true,
        scrollBeyondLastLine: false,
        automaticLayout: true,
        tabSize: 4,
        insertSpaces: true,
        padding: { top: 14, bottom: 14 },
        suggest: { showWords: false },
        quickSuggestions: true,
        wordWrap: "on",
        accessibilitySupport: "auto"
      }}
    />
  );
}
