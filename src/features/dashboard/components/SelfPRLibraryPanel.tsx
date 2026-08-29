"use client";

import { useMemo, useState } from "react";

import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { cn } from "@/lib/utils";

import { useSelfPRSnippets, type SelfPRSnippet, type SnippetType } from "../hooks/useSelfPRSnippets";

const TYPE_LABEL: Record<SnippetType, string> = {
  self_pr: "自己PR",
  gakuchika: "ガクチカ",
  motivation: "志望動機",
  other: "その他"
};

const TYPES: SnippetType[] = ["self_pr", "gakuchika", "motivation", "other"];

const EMPTY_FORM = { type: "self_pr" as SnippetType, title: "", content: "", tags: "" };

export function SelfPRLibraryPanel() {
  const { snippets, add, update, remove } = useSelfPRSnippets();
  const [activeType, setActiveType] = useState<SnippetType | "all">("all");
  const [editingId, setEditingId] = useState<string | null>(null);
  const [isCreating, setIsCreating] = useState(false);
  const [form, setForm] = useState(EMPTY_FORM);
  const [copiedId, setCopiedId] = useState<string | null>(null);

  const filtered = useMemo(
    () => (activeType === "all" ? snippets : snippets.filter((s) => s.type === activeType)),
    [snippets, activeType]
  );

  const startCreate = () => {
    setForm(EMPTY_FORM);
    setEditingId(null);
    setIsCreating(true);
  };

  const startEdit = (snippet: SelfPRSnippet) => {
    setForm({
      type: snippet.type,
      title: snippet.title,
      content: snippet.content,
      tags: (snippet.tags ?? []).join(", ")
    });
    setEditingId(snippet.id);
    setIsCreating(true);
  };

  const cancelEdit = () => {
    setIsCreating(false);
    setEditingId(null);
    setForm(EMPTY_FORM);
  };

  const onSubmit = () => {
    if (!form.title.trim() || !form.content.trim()) return;
    const payload = {
      type: form.type,
      title: form.title.trim(),
      content: form.content.trim(),
      tags: form.tags
        .split(",")
        .map((t) => t.trim())
        .filter(Boolean)
    };
    if (editingId) {
      update(editingId, payload);
    } else {
      add(payload);
    }
    cancelEdit();
  };

  const onCopy = async (snippet: SelfPRSnippet) => {
    await navigator.clipboard?.writeText(snippet.content);
    setCopiedId(snippet.id);
    setTimeout(() => setCopiedId((id) => (id === snippet.id ? null : id)), 1500);
  };

  const onDelete = (snippet: SelfPRSnippet) => {
    if (!confirm(`「${snippet.title}」を削除しますか?`)) return;
    remove(snippet.id);
  };

  return (
    <div className="flex flex-1 min-h-0 flex-col gap-3 overflow-auto">
      <p className="text-xs text-muted-foreground">
        自己PR・ガクチカなどを保存しておき、他社のES作成時にも再利用できます。ブラウザのlocalStorageに保存されます。
      </p>

      <div className="flex flex-wrap items-center gap-1.5">
        <button
          type="button"
          onClick={() => setActiveType("all")}
          className={cn(
            "rounded-full px-3 py-1 text-xs font-medium transition",
            activeType === "all"
              ? "bg-[hsl(var(--accent))] text-white"
              : "border border-border bg-background text-foreground hover:border-[hsl(var(--accent))]/40"
          )}
        >
          すべて
        </button>
        {TYPES.map((t) => (
          <button
            key={t}
            type="button"
            onClick={() => setActiveType(t)}
            className={cn(
              "rounded-full px-3 py-1 text-xs font-medium transition",
              activeType === t
                ? "bg-[hsl(var(--accent))] text-white"
                : "border border-border bg-background text-foreground hover:border-[hsl(var(--accent))]/40"
            )}
          >
            {TYPE_LABEL[t]}
          </button>
        ))}
        <Button size="sm" className="yui-pill ml-auto" onClick={startCreate}>
          + 新規スニペット
        </Button>
      </div>

      {isCreating && (
        <div className="flex flex-col gap-2 rounded-2xl border border-border bg-muted/20 p-3">
          <div className="flex flex-wrap gap-1.5">
            {TYPES.map((t) => (
              <button
                key={t}
                type="button"
                onClick={() => setForm((f) => ({ ...f, type: t }))}
                className={cn(
                  "rounded-full px-2.5 py-1 text-[11px] font-medium transition",
                  form.type === t
                    ? "bg-[hsl(var(--accent))] text-white"
                    : "border border-border bg-background text-foreground"
                )}
              >
                {TYPE_LABEL[t]}
              </button>
            ))}
          </div>
          <Input
            placeholder="タイトル（例: 〇〇での挑戦経験）"
            value={form.title}
            onChange={(e) => setForm((f) => ({ ...f, title: e.target.value }))}
          />
          <textarea
            className="min-h-[120px] w-full rounded-xl border border-border bg-background p-2 text-sm"
            placeholder="本文"
            value={form.content}
            onChange={(e) => setForm((f) => ({ ...f, content: e.target.value }))}
          />
          <Input
            placeholder="タグ（カンマ区切り、例: リーダーシップ, 継続力）"
            value={form.tags}
            onChange={(e) => setForm((f) => ({ ...f, tags: e.target.value }))}
          />
          <div className="flex items-center gap-2">
            <Button size="sm" className="yui-pill" onClick={onSubmit}>
              {editingId ? "更新" : "保存"}
            </Button>
            <Button size="sm" variant="ghost" className="yui-pill" onClick={cancelEdit}>
              キャンセル
            </Button>
          </div>
        </div>
      )}

      <div className="flex flex-col gap-2">
        {filtered.length === 0 && !isCreating && (
          <div className="rounded-2xl border border-dashed border-border bg-background/40 p-6 text-center text-sm text-muted-foreground">
            まだスニペットがありません。「+ 新規スニペット」から追加してください。
          </div>
        )}
        {filtered.map((snippet) => (
          <div key={snippet.id} className="rounded-2xl border border-border bg-background p-3">
            <div className="flex items-start gap-2">
              <span className="rounded-full bg-[hsl(var(--accent-soft))] px-2 py-0.5 text-[10px] font-medium text-[hsl(var(--accent))]">
                {TYPE_LABEL[snippet.type]}
              </span>
              <div className="text-sm font-semibold">{snippet.title}</div>
              <div className="ml-auto flex items-center gap-1">
                <button
                  type="button"
                  onClick={() => onCopy(snippet)}
                  className="text-[11px] text-muted-foreground hover:text-foreground"
                >
                  {copiedId === snippet.id ? "コピー済み" : "コピー"}
                </button>
                <button
                  type="button"
                  onClick={() => startEdit(snippet)}
                  className="text-[11px] text-muted-foreground hover:text-foreground"
                >
                  編集
                </button>
                <button
                  type="button"
                  onClick={() => onDelete(snippet)}
                  className="text-[11px] text-muted-foreground hover:text-foreground"
                >
                  削除
                </button>
              </div>
            </div>
            <p className="mt-1.5 whitespace-pre-wrap text-sm text-foreground/90">{snippet.content}</p>
            {snippet.tags && snippet.tags.length > 0 && (
              <div className="mt-1.5 flex flex-wrap gap-1">
                {snippet.tags.map((tag) => (
                  <span key={tag} className="rounded-full border border-border px-2 py-0.5 text-[10px] text-muted-foreground">
                    {tag}
                  </span>
                ))}
              </div>
            )}
          </div>
        ))}
      </div>
    </div>
  );
}
