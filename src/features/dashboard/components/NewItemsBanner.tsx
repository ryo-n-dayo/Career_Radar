"use client";

import { useEffect, useState, useCallback } from "react";
import { Bell, ChevronDown, ChevronUp, X } from "lucide-react";
import { Button } from "@/components/ui/button";

type NewPost = {
  id: string;
  companyId: string | null;
  companyName: string | null;
  source: string;
  title: string | null;
  content: string | null;
  author: string | null;
  aiSummary: string | null;
  matchedKeywords: unknown;
  url: string | null;
  postedAt: string | null;
  createdAt: string;
};

type Props = {
  userId?: string;
};

export function NewItemsBanner({ userId }: Props) {
  const [posts, setPosts] = useState<NewPost[]>([]);
  const [expanded, setExpanded] = useState(false);
  const [loading, setLoading] = useState(false);

  const load = useCallback(async () => {
    if (!userId) return;
    setLoading(true);
    try {
      const res = await fetch(`/api/posts/new?userId=${encodeURIComponent(userId)}`);
      if (!res.ok) return;
      const data = await res.json();
      setPosts(data.posts ?? []);
    } finally {
      setLoading(false);
    }
  }, [userId]);

  useEffect(() => {
    load();
  }, [load]);

  const markAllRead = useCallback(async () => {
    if (!userId) return;
    await fetch("/api/posts/new", {
      method: "POST",
      headers: { "content-type": "application/json" },
      body: JSON.stringify({ userId })
    });
    setPosts([]);
  }, [userId]);

  if (!userId || posts.length === 0) return null;

  return (
    <div className="border-b border-border bg-amber-50 dark:bg-amber-950/20">
      <div className="flex items-center gap-2 px-4 py-2">
        <Bell className="h-4 w-4 text-amber-700 dark:text-amber-300" />
        <span className="text-sm font-medium text-amber-900 dark:text-amber-100">
          🆕 新着 {posts.length}件
        </span>
        <Button
          size="sm"
          variant="ghost"
          className="ml-auto h-7"
          onClick={() => setExpanded((v) => !v)}
        >
          {expanded ? (
            <>
              <ChevronUp className="mr-1 h-3 w-3" /> 閉じる
            </>
          ) : (
            <>
              <ChevronDown className="mr-1 h-3 w-3" /> 一覧
            </>
          )}
        </Button>
        <Button size="sm" variant="ghost" className="h-7" onClick={markAllRead} disabled={loading}>
          <X className="mr-1 h-3 w-3" /> 全て既読
        </Button>
      </div>
      {expanded && (
        <div className="max-h-96 overflow-y-auto border-t border-amber-200 dark:border-amber-900">
          {posts.map((p) => {
            const kws = Array.isArray(p.matchedKeywords) ? (p.matchedKeywords as string[]) : [];
            const heading =
              p.source === "X"
                ? p.author
                  ? `@${p.author}`
                  : "X投稿"
                : p.companyName ?? "不明";
            return (
              <a
                key={p.id}
                href={p.url ?? "#"}
                target={p.url ? "_blank" : undefined}
                rel={p.url ? "noopener noreferrer" : undefined}
                className="block border-b border-amber-200/50 px-4 py-2 text-sm last:border-b-0 hover:bg-amber-100/60 dark:border-amber-900/50 dark:hover:bg-amber-900/20"
              >
                <div className="flex items-center gap-2">
                  <span className="shrink-0 rounded bg-amber-200 px-1.5 py-0.5 text-xs text-amber-900 dark:bg-amber-800 dark:text-amber-100">
                    {p.source}
                  </span>
                  <span className="font-medium">{heading}</span>
                  {kws.map((kw) => (
                    <span
                      key={kw}
                      className="rounded bg-emerald-100 px-1.5 py-0.5 text-xs text-emerald-800 dark:bg-emerald-950/40 dark:text-emerald-200"
                    >
                      {kw}
                    </span>
                  ))}
                  <span className="ml-auto shrink-0 text-xs text-muted-foreground">
                    {new Date(p.createdAt).toLocaleString("ja-JP", {
                      month: "2-digit",
                      day: "2-digit",
                      hour: "2-digit",
                      minute: "2-digit"
                    })}
                  </span>
                </div>
                {p.aiSummary && (
                  <div className="mt-1 text-xs text-foreground/80">📝 {p.aiSummary}</div>
                )}
                {!p.aiSummary && p.title && (
                  <div className="mt-1 truncate text-xs text-muted-foreground">{p.title}</div>
                )}
              </a>
            );
          })}
        </div>
      )}
    </div>
  );
}
