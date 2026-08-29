"use client";

import { useEffect, useState } from "react";

import { useSelfPRSnippets } from "../hooks/useSelfPRSnippets";

type Props = {
  companyId: string;
  showPicker: boolean;
  onClosePicker: () => void;
};

function storageKey(companyId: string) {
  return `career-radar:es-notes:${companyId}`;
}

export function ESNotesSection({ companyId, showPicker, onClosePicker }: Props) {
  const { snippets } = useSelfPRSnippets();
  const [content, setContent] = useState("");

  useEffect(() => {
    setContent(window.localStorage.getItem(storageKey(companyId)) ?? "");
  }, [companyId]);

  const onChange = (value: string) => {
    setContent(value);
    window.localStorage.setItem(storageKey(companyId), value);
  };

  const insertSnippet = (text: string) => {
    onChange(content ? `${content}\n\n${text}` : text);
    onClosePicker();
  };

  return (
    <div className="flex flex-col gap-2">
      <textarea
        className="min-h-[100px] w-full rounded-xl border border-border bg-background p-2 text-sm"
        placeholder="この企業向けのES下書きメモ。自己PRライブラリから挿入できます。"
        value={content}
        onChange={(e) => onChange(e.target.value)}
      />

      {showPicker && (
        <div className="flex flex-col gap-1.5 rounded-xl border border-border bg-muted/20 p-2">
          <div className="flex items-center justify-between">
            <span className="text-[11px] font-semibold text-muted-foreground">
              ライブラリから挿入
            </span>
            <button
              type="button"
              onClick={onClosePicker}
              className="text-[11px] text-muted-foreground hover:text-foreground"
            >
              閉じる
            </button>
          </div>
          {snippets.length === 0 ? (
            <p className="text-xs text-muted-foreground">
              自己PRライブラリにスニペットがありません。「📝 自己PRライブラリ」から追加してください。
            </p>
          ) : (
            snippets.map((s) => (
              <button
                key={s.id}
                type="button"
                onClick={() => insertSnippet(s.content)}
                className="rounded-lg border border-border bg-background px-2 py-1.5 text-left text-xs hover:border-[hsl(var(--accent))]/40"
              >
                <span className="font-medium">{s.title}</span>
                <span className="ml-1 line-clamp-1 text-muted-foreground">{s.content}</span>
              </button>
            ))
          )}
        </div>
      )}
    </div>
  );
}
