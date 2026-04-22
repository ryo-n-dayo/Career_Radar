"use client";

import { Suspense, useEffect, useMemo, useState } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { matchKeywords } from "@/lib/x-keywords";

function parseTweetUrl(url: string): { handle: string; tweetId: string } | null {
  const m = url.match(/(?:x|twitter)\.com\/([^/?#]+)\/status\/(\d+)/i);
  if (!m) return null;
  return { handle: m[1], tweetId: m[2] };
}

function ImportXContent() {
  const router = useRouter();
  const sp = useSearchParams();

  const [url, setUrl] = useState(sp.get("url") ?? "");
  const [text, setText] = useState(sp.get("text") ?? "");
  const [handle, setHandle] = useState(sp.get("handle") ?? "");
  const [authorName, setAuthorName] = useState(sp.get("authorName") ?? "");
  const [timestamp, setTimestamp] = useState(sp.get("timestamp") ?? "");
  const [companyId, setCompanyId] = useState<string>("");
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [success, setSuccess] = useState(false);

  const parsed = useMemo(() => parseTweetUrl(url), [url]);
  const tweetId = sp.get("tweetId") ?? parsed?.tweetId ?? "";
  const effectiveHandle = handle || parsed?.handle || "";

  useEffect(() => {
    if (!handle && parsed?.handle) setHandle(parsed.handle);
  }, [handle, parsed]);

  const matched = useMemo(() => matchKeywords(text), [text]);

  const userId = process.env.NEXT_PUBLIC_DEMO_USER_ID;

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setError(null);
    if (!userId) {
      setError("NEXT_PUBLIC_DEMO_USER_ID が未設定です");
      return;
    }
    if (!tweetId || !text) {
      setError("URL と本文は必須です");
      return;
    }

    setSubmitting(true);
    try {
      const res = await fetch("/api/posts/x-import", {
        method: "POST",
        headers: { "content-type": "application/json" },
        body: JSON.stringify({
          userId,
          tweetId,
          url,
          authorHandle: effectiveHandle,
          authorName,
          text,
          timestamp,
          companyId: companyId || null
        })
      });
      if (!res.ok) {
        const data = await res.json().catch(() => ({}));
        setError(data.error ?? `エラー (${res.status})`);
        return;
      }
      setSuccess(true);
      setTimeout(() => router.push("/"), 800);
    } finally {
      setSubmitting(false);
    }
  }

  return (
    <div className="mx-auto max-w-2xl p-6">
      <h1 className="mb-4 text-xl font-semibold">X投稿を取り込む</h1>

      <form onSubmit={handleSubmit} className="space-y-4">
        <div>
          <label className="mb-1 block text-sm font-medium">ツイートURL</label>
          <Input
            type="url"
            placeholder="https://x.com/xxx/status/1234567890"
            value={url}
            onChange={(e) => setUrl(e.target.value)}
            required
          />
          {tweetId && (
            <div className="mt-1 text-xs text-muted-foreground">
              tweetId: {tweetId} / @{effectiveHandle}
            </div>
          )}
        </div>

        <div>
          <label className="mb-1 block text-sm font-medium">本文</label>
          <textarea
            className="flex min-h-[120px] w-full rounded-md border border-input bg-background px-3 py-2 text-sm shadow-sm placeholder:text-muted-foreground focus-visible:outline-none focus-visible:ring-1 focus-visible:ring-ring"
            placeholder="ツイート本文を貼り付け"
            value={text}
            onChange={(e) => setText(e.target.value)}
            required
          />
          {matched.length > 0 && (
            <div className="mt-2 flex flex-wrap gap-1">
              {matched.map((kw) => (
                <span
                  key={kw}
                  className="rounded bg-emerald-100 px-2 py-0.5 text-xs text-emerald-800 dark:bg-emerald-950/40 dark:text-emerald-200"
                >
                  ✓ {kw}
                </span>
              ))}
            </div>
          )}
        </div>

        <div className="grid grid-cols-2 gap-3">
          <div>
            <label className="mb-1 block text-sm font-medium">投稿者名</label>
            <Input value={authorName} onChange={(e) => setAuthorName(e.target.value)} />
          </div>
          <div>
            <label className="mb-1 block text-sm font-medium">投稿日時 (ISO)</label>
            <Input
              value={timestamp}
              onChange={(e) => setTimestamp(e.target.value)}
              placeholder="2026-04-22T08:30:00Z"
            />
          </div>
        </div>

        <div>
          <label className="mb-1 block text-sm font-medium">
            関連企業ID (任意)
          </label>
          <Input
            value={companyId}
            onChange={(e) => setCompanyId(e.target.value)}
            placeholder="company cuid (空欄可)"
          />
        </div>

        {error && <div className="text-sm text-rose-600">{error}</div>}
        {success && <div className="text-sm text-emerald-600">取り込みました。ダッシュボードに戻ります...</div>}

        <div className="flex gap-2">
          <Button type="submit" disabled={submitting}>
            {submitting ? "送信中..." : "取り込む"}
          </Button>
          <Button type="button" variant="ghost" onClick={() => router.push("/")}>
            キャンセル
          </Button>
        </div>
      </form>
    </div>
  );
}

export default function ImportXPage() {
  return (
    <Suspense fallback={<div className="p-6 text-muted-foreground">読み込み中...</div>}>
      <ImportXContent />
    </Suspense>
  );
}
