"use client";

import { useCallback, useEffect, useMemo, useState } from "react";
import { cn } from "@/lib/utils";
import { CATEGORY_LABEL, SOURCE_LABEL } from "./types";
import type { NewsArticle, NewsCategory } from "./types";

type DateTab = "TODAY" | "ARCHIVE";

const CATEGORIES: Array<{ key: NewsCategory | "ALL"; label: string }> = [
  { key: "ALL", label: "すべて" },
  { key: "CAREER_TIP", label: CATEGORY_LABEL["CAREER_TIP"] },
  { key: "COLUMN", label: CATEGORY_LABEL["COLUMN"] },
];

const CATEGORY_COLORS: Record<NewsCategory, string> = {
  CAREER_TIP: "bg-[hsl(var(--accent))]/15 text-[hsl(var(--accent))]",
  INTERNSHIP: "bg-sky-100 text-sky-700 dark:bg-sky-950/40 dark:text-sky-300",
  COLUMN: "bg-violet-100 text-violet-700 dark:bg-violet-950/40 dark:text-violet-300",
};

const SOURCE_ICONS: Record<string, string> = {
  hatena: "B!",
  gnews: "G",
  qiita: "Q",
  zenn: "Z",
};

const TODAY_LIMIT = 3;

/** 過去 7 日以内に公開された記事を「最新」扱いにする */
function isRecent(date: Date | string): boolean {
  const d = new Date(date);
  return Date.now() - d.getTime() < 7 * 24 * 60 * 60 * 1000;
}

function relativeTime(date: Date): string {
  const diff = (Date.now() - date.getTime()) / 1000;
  if (diff < 3600) return `${Math.floor(diff / 60)}分前`;
  if (diff < 86400) return `${Math.floor(diff / 3600)}時間前`;
  return `${Math.floor(diff / 86400)}日前`;
}

function NewsCard({
  article,
  onRead,
}: {
  article: NewsArticle;
  onRead: (id: string) => void;
}) {
  const category = article.category as NewsCategory;
  return (
    <a
      href={article.url}
      target="_blank"
      rel="noopener noreferrer"
      onClick={() => onRead(article.id)}
      className={cn(
        "yui-card group block rounded-2xl border bg-background px-4 py-3.5 text-left transition",
        article.isRead
          ? "border-border opacity-70"
          : "border-[hsl(var(--accent))]/25 shadow-sm"
      )}
    >
      <div className="mb-2 flex items-center gap-2">
        <span className={cn("yui-pill px-2 py-0.5 text-[10px] font-semibold", CATEGORY_COLORS[category])}>
          {CATEGORY_LABEL[category]}
        </span>
        <span className="inline-flex h-4 w-4 items-center justify-center rounded-full bg-foreground/10 text-[9px] font-bold text-foreground/60">
          {SOURCE_ICONS[article.source] ?? article.source}
        </span>
        <span className="text-[10px] text-muted-foreground">
          {SOURCE_LABEL[article.source] ?? article.source}
        </span>
        <span className="ml-auto text-[10px] tabular-nums text-muted-foreground">
          {relativeTime(new Date(article.publishedAt))}
        </span>
        {!article.isRead && (
          <span className="h-2 w-2 shrink-0 rounded-full bg-[hsl(var(--accent))]" />
        )}
      </div>
      <h3 className="line-clamp-2 text-sm font-semibold leading-snug tracking-tight group-hover:text-[hsl(var(--accent))]">
        {article.title}
      </h3>
      {article.summary && (
        <p className="mt-1.5 line-clamp-2 text-xs leading-relaxed text-foreground/70">
          {article.summary}
        </p>
      )}
    </a>
  );
}

export function NewsPanel() {
  const [articles, setArticles] = useState<NewsArticle[]>([]);
  const [unreadCount, setUnreadCount] = useState(0);
  const [dateTab, setDateTab] = useState<DateTab>("TODAY");
  const [activeCategory, setActiveCategory] = useState<NewsCategory | "ALL">("ALL");
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const fetchArticles = useCallback(async () => {
    setLoading(true);
    setError(null);
    try {
      const res = await fetch("/api/news/list?limit=100");
      if (!res.ok) throw new Error("取得に失敗しました");
      const data = (await res.json()) as { articles: NewsArticle[]; unreadCount: number };
      setArticles(data.articles);
      setUnreadCount(data.unreadCount);
    } catch (e) {
      setError(e instanceof Error ? e.message : "エラーが発生しました");
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    fetchArticles();
  }, [fetchArticles]);

  const { todayArticles, archiveArticles } = useMemo(() => {
    const today: NewsArticle[] = [];
    const archive: NewsArticle[] = [];
    for (const a of articles) {
      if (isRecent(a.publishedAt)) today.push(a);
      else archive.push(a);
    }
    return { todayArticles: today.slice(0, TODAY_LIMIT), archiveArticles: archive };
  }, [articles]);

  const filteredArticles = useMemo(() => {
    const base = dateTab === "TODAY" ? todayArticles : archiveArticles;
    return activeCategory === "ALL"
      ? base
      : base.filter((a) => a.category === activeCategory);
  }, [dateTab, todayArticles, archiveArticles, activeCategory]);

  const { todayUnread, archiveUnread } = useMemo(
    () => ({
      todayUnread: todayArticles.filter((a) => !a.isRead).length,
      archiveUnread: archiveArticles.filter((a) => !a.isRead).length,
    }),
    [todayArticles, archiveArticles]
  );

  const handleRead = useCallback(async (id: string) => {
    setArticles((prev) =>
      prev.map((a) => (a.id === id ? { ...a, isRead: true } : a))
    );
    setUnreadCount((c) => Math.max(0, c - 1));
    await fetch(`/api/news/list?id=${encodeURIComponent(id)}`, { method: "PATCH" });
  }, []);

  const handleMarkAllRead = useCallback(async () => {
    setArticles((prev) => prev.map((a) => ({ ...a, isRead: true })));
    setUnreadCount(0);
    await fetch("/api/news/list?all=true", { method: "PATCH" });
  }, []);

  const handleRefresh = useCallback(async () => {
    setRefreshing(true);
    setError(null);
    try {
      const res = await fetch("/api/news/refresh");
      if (!res.ok) {
        const body = await res.json().catch(() => ({})) as { error?: string };
        throw new Error(body.error ?? `更新に失敗しました (${res.status})`);
      }
      await fetchArticles();
    } catch (e) {
      setError(e instanceof Error ? e.message : "更新に失敗しました");
    } finally {
      setRefreshing(false);
    }
  }, [fetchArticles]);

  return (
    <section className="flex h-full min-w-0 flex-col">
      <div className="flex items-center gap-3 px-1 py-2">
        <div className="flex items-center gap-2">
          <span className="text-sm font-semibold tracking-tight">今日のニュース</span>
          {unreadCount > 0 && (
            <span className="inline-flex min-w-[20px] items-center justify-center rounded-full bg-[hsl(var(--accent))] px-1.5 py-0.5 text-[10px] font-bold text-white tabular-nums">
              {unreadCount}
            </span>
          )}
        </div>
        <div className="ml-auto flex items-center gap-1.5">
          {unreadCount > 0 && (
            <button
              type="button"
              onClick={handleMarkAllRead}
              className="yui-pill px-2.5 py-1 text-[10px] text-muted-foreground hover:text-foreground border border-border bg-background"
            >
              すべて既読
            </button>
          )}
          <button
            type="button"
            onClick={handleRefresh}
            disabled={refreshing}
            className={cn(
              "yui-pill px-3 py-1 text-[10px] font-medium transition-colors border border-[hsl(var(--accent))]/40 text-[hsl(var(--accent))]",
              refreshing ? "opacity-50" : "hover:bg-[hsl(var(--accent))]/10"
            )}
          >
            {refreshing ? "取得中…" : "🔄 更新"}
          </button>
        </div>
      </div>

      <div className="mb-2 flex gap-1 rounded-full border border-border bg-background p-0.5 shadow-sm">
        <button
          type="button"
          onClick={() => setDateTab("TODAY")}
          className={cn(
            "flex flex-1 items-center justify-center gap-1.5 rounded-full py-1 text-[11px] font-medium transition-colors",
            dateTab === "TODAY"
              ? "bg-[hsl(var(--accent))] text-white shadow-sm"
              : "text-muted-foreground hover:text-foreground"
          )}
        >
          <span>✦ 最新の厳選</span>
          <span
            className={cn(
              "rounded-full px-1.5 py-0.5 text-[9px] font-bold tabular-nums",
              dateTab === "TODAY" ? "bg-white/20 text-white" : "bg-muted text-muted-foreground"
            )}
          >
            {TODAY_LIMIT}件
          </span>
          {todayUnread > 0 && <span className="size-1.5 rounded-full bg-rose-400" />}
        </button>
        <button
          type="button"
          onClick={() => setDateTab("ARCHIVE")}
          className={cn(
            "flex flex-1 items-center justify-center gap-1.5 rounded-full py-1 text-[11px] font-medium transition-colors",
            dateTab === "ARCHIVE"
              ? "bg-[hsl(var(--accent))] text-white shadow-sm"
              : "text-muted-foreground hover:text-foreground"
          )}
        >
          <span>📁 アーカイブ</span>
          {archiveUnread > 0 && dateTab !== "ARCHIVE" && (
            <span className="rounded-full bg-muted px-1.5 py-0.5 text-[9px] font-bold tabular-nums text-muted-foreground">
              {archiveUnread}未読
            </span>
          )}
        </button>
      </div>

      <div className="mb-3 flex gap-1 rounded-full border border-border bg-background p-0.5 shadow-sm">
        {CATEGORIES.map(({ key, label }) => (
          <button
            key={key}
            type="button"
            onClick={() => setActiveCategory(key)}
            className={cn(
              "flex-1 rounded-full py-1 text-[11px] font-medium transition-colors",
              activeCategory === key
                ? "bg-foreground/10 text-foreground shadow-sm"
                : "text-muted-foreground hover:text-foreground"
            )}
          >
            {label}
          </button>
        ))}
      </div>

      <div className="min-h-0 flex-1 overflow-auto">
        {loading ? (
          <div className="flex items-center justify-center py-16 text-sm text-muted-foreground">
            <span className="animate-pulse">読み込み中…</span>
          </div>
        ) : error ? (
          <div className="rounded-2xl border border-dashed border-rose-200 bg-rose-50/50 p-6 text-center text-sm text-rose-600">
            {error}
            <button
              type="button"
              onClick={fetchArticles}
              className="mt-3 block mx-auto yui-pill border border-border px-3 py-1 text-xs text-foreground"
            >
              再試行
            </button>
          </div>
        ) : filteredArticles.length === 0 ? (
          <div className="flex flex-col items-center justify-center py-16 text-center">
            <div className="mb-3 text-3xl">{dateTab === "TODAY" ? "✨" : "📁"}</div>
            <p className="text-sm text-muted-foreground">
              {dateTab === "TODAY" ? "直近7日間の記事はありません" : "アーカイブはありません"}
            </p>
            {dateTab === "TODAY" && (
              <>
                <p className="mt-1 text-xs text-muted-foreground">
                  「更新」ボタンで最新情報を取得できます
                </p>
                <button
                  type="button"
                  onClick={handleRefresh}
                  disabled={refreshing}
                  className="mt-4 yui-pill border border-[hsl(var(--accent))]/40 bg-[hsl(var(--accent))]/10 px-4 py-2 text-sm font-medium text-[hsl(var(--accent))] hover:bg-[hsl(var(--accent))]/20 disabled:opacity-50"
                >
                  {refreshing ? "取得中…" : "今すぐ取得する"}
                </button>
              </>
            )}
          </div>
        ) : (
          <>
            {dateTab === "TODAY" && (
              <p className="mb-2 px-1 text-[10px] text-muted-foreground">
                直近7日間の記事から厳選した {TODAY_LIMIT} 件を表示しています
              </p>
            )}
            <ul className="flex flex-col gap-3 pb-4 pr-1">
              {filteredArticles.map((article, idx) => (
                <li
                  key={article.id}
                  className="yui-row"
                  style={{ ["--yui-delay" as string]: `${Math.min(idx, 10) * 0.03}s` }}
                >
                  <NewsCard article={article} onRead={handleRead} />
                </li>
              ))}
            </ul>
            {dateTab === "TODAY" && archiveArticles.length > 0 && (
              <button
                type="button"
                onClick={() => setDateTab("ARCHIVE")}
                className="mx-auto mt-1 mb-4 flex items-center gap-1.5 yui-pill border border-border px-4 py-1.5 text-[11px] text-muted-foreground hover:text-foreground hover:border-[hsl(var(--accent))]/40 transition-colors"
              >
                <span>📁 過去の記事を見る</span>
                <span className="text-[10px] tabular-nums">({archiveArticles.length}件)</span>
              </button>
            )}
          </>
        )}
      </div>
    </section>
  );
}
