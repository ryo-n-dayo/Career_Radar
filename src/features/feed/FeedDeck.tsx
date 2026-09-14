"use client";

import Link from "next/link";
import { Check, ExternalLink, Heart, RefreshCw, Settings2, Sparkles, X } from "lucide-react";
import { useRouter } from "next/navigation";
import { useState } from "react";

import { Button } from "@/components/ui/button";
import type { CandidateItem, FeedbackStats } from "@/features/sources/types";

const SAMPLE_URL_PREFIX = "https://dailynews.local/practice-samples";
const SKIP_REASON_SUGGESTIONS = ["募集対象が違う", "営業・広告向け", "技術的に浅い", "地域が合わない", "学生向けではない", "イベント形式が合わない", "すでに知っている"];

export function FeedDeck({ candidates, feedbackStats }: { candidates: CandidateItem[]; feedbackStats: FeedbackStats }) {
  const router = useRouter();
  const [queue, setQueue] = useState<CandidateItem[]>(() => candidates);
  const [ratedCount, setRatedCount] = useState(feedbackStats.ratedCount);
  const [pendingSaves, setPendingSaves] = useState(0);
  const [busy, setBusy] = useState(false);
  const [message, setMessage] = useState<string | null>(null);
  const [showSkipReason, setShowSkipReason] = useState(false);
  const [skipReason, setSkipReason] = useState("");
  const current = queue[0];
  const upcoming = queue.slice(1, 9);
  const isXPost = ["X_API", "X_ALGO", "X_ALGO_EVENT", "X_ALGO_MEETUP", "X_ALGO_TECH_EVENT", "X_ALGO_LEARNING_BENEFIT"].includes(current?.sourceKind ?? "");
  const displayText = current?.content ?? current?.summary ?? current?.title ?? "";

  async function decide(value: -2 | 2, reason = "") {
    if (!current || busy) return;

    // Show the following post before waiting for SQLite or server refreshes.
    setQueue((items) => items.slice(1));
    setPendingSaves((count) => count + 1);
    setRatedCount((count) => count + 1);
    setMessage("保存中…");
    setShowSkipReason(false);
    setSkipReason("");

    try {
      const response = await fetch("/api/candidates", {
        method: "PATCH",
        headers: { "content-type": "application/json" },
        body: JSON.stringify({ id: current.id, feedbackValue: value, feedbackReason: value < 0 ? reason : undefined })
      });
      if (!response.ok) throw new Error("Could not save feedback");
      setMessage(value > 0 ? "興味ありとして記録しました。" : reason.trim() ? `「${reason.trim()}」を避けたい理由として記録しました。` : "興味なしとして記録しました。");
    } catch {
      // The current card is restored if its background save fails.
      setQueue((items) => [current, ...items]);
      setRatedCount((count) => Math.max(0, count - 1));
      setMessage("判定を保存できませんでした。もう一度試してください。");
    } finally {
      setPendingSaves((count) => Math.max(0, count - 1));
    }
  }

  async function addPracticeSamples() {
    setBusy(true); setMessage(null);
    const response = await fetch("/api/samples", { method: "POST" }).catch(() => null);
    const data = response ? await response.json().catch(() => ({})) : {};
    setMessage(response?.ok ? (data.created ? `練習用の候補を${data.created}件追加しました。` : "練習用の候補はすでに追加済みです。") : "練習用の候補を追加できませんでした。");
    router.refresh();
    setBusy(false);
  }

  async function collectLatestX() {
    setBusy(true); setMessage(null);
    const response = await fetch("/api/sources/auto", { method: "POST" }).catch(() => null);
    const data = response ? await response.json().catch(() => ({})) : {};
    setMessage(response?.ok
      ? (data.created ? `Xから新しい候補を${data.created}件追加しました。` : "新しい候補は見つかりませんでした。次の自動収集でも確認します。")
      : (typeof data.error === "string" ? data.error : "Xの最新投稿を収集できませんでした。"));
    router.refresh();
    setBusy(false);
  }

  return <div className="mx-auto max-w-4xl px-4 py-6 sm:px-6 sm:py-8">
    <header className="flex items-end justify-between gap-4">
      <div>
        <p className="text-sm font-medium text-[hsl(var(--accent))]">あなた向けフィード</p>
        <h1 className="mt-1 text-2xl font-semibold tracking-tight sm:text-3xl">次に見るべき情報だけ、残していく。</h1>
      </div>
      <div className="hidden rounded-2xl border border-border bg-background px-4 py-2 text-right shadow-sm sm:block">
        <div className="text-lg font-semibold tabular-nums">{ratedCount}</div>
        <div className="text-xs text-muted-foreground">これまでの判定</div>
      </div>
    </header>

    <section className="mt-8">
      <div className="mb-3 flex items-center justify-between text-sm">
        <span className="font-medium">{current ? `残り ${queue.length} 件` : "今日のフィードは空です"}</span>
        <span className="text-muted-foreground">{pendingSaves > 0 ? `保存中 ${pendingSaves}件` : "判定はこの一覧と次のX収集に反映されます"}</span>
      </div>
      <div className="h-1.5 overflow-hidden rounded-full bg-muted"><div className="h-full rounded-full bg-[hsl(var(--accent))] transition-all" style={{ width: `${Math.min(100, ratedCount < 5 ? ratedCount * 20 : 100)}%` }} /></div>
    </section>

    {current ? <section className="feed-card-enter mt-5 overflow-hidden rounded-2xl border border-border bg-background shadow-[0_18px_55px_-30px_rgba(20,35,80,0.35)]">
      <div className="border-b border-border bg-[hsl(var(--accent-soft))] px-5 py-3 sm:px-6">
        <div className="flex flex-wrap items-center gap-2 text-xs font-medium"><span className="rounded-full bg-[hsl(var(--accent))] px-2.5 py-1 font-bold tracking-wide text-white">NEW</span><span className="rounded-full bg-background px-2.5 py-1">{["X_API", "X_ALGO", "X_ALGO_EVENT", "X_ALGO_TECH_EVENT"].includes(current.sourceKind ?? "") ? "X の投稿" : "公式Webの情報"}</span><span className="text-muted-foreground">{current.sourceName}</span></div>
      </div>
      <article className="px-5 py-5 sm:px-6 sm:py-6">
        <div className="flex items-start gap-3"><div className="grid h-9 w-9 shrink-0 place-items-center rounded-xl bg-[hsl(var(--foreground))] text-xs font-semibold text-white">{current.score}</div><div className="min-w-0 flex-1">{isXPost ? <p className="whitespace-pre-wrap break-words text-[15px] leading-6 text-foreground sm:text-base sm:leading-7">{displayText}</p> : <><h2 className="text-lg font-semibold leading-snug sm:text-xl">{current.title}</h2>{current.summary && <p className="mt-2 text-sm leading-6 text-muted-foreground">{current.summary}</p>}</>}</div></div>
        <div className="mt-5 flex flex-wrap gap-1.5">{current.reasons.filter((reason) => reason !== "練習用").map((reason) => <span key={reason} className="rounded-full border border-border px-2.5 py-0.5 text-[11px] text-muted-foreground">{reason}</span>)}</div>
        {current.url.startsWith(SAMPLE_URL_PREFIX) ? <p className="mt-4 text-xs text-muted-foreground">これは実在しない練習用データです。</p> : <a href={current.url} target="_blank" rel="noreferrer" className="mt-4 inline-flex items-center gap-1.5 text-sm font-medium text-[hsl(var(--accent))] hover:underline">{isXPost ? "Xで元の投稿を開く" : "元の情報を開く"}<ExternalLink className="h-4 w-4" /></a>}
      </article>
      {showSkipReason && <div className="border-t border-rose-100 bg-rose-50/45 px-5 py-5 sm:px-8"><div className="flex flex-wrap items-start justify-between gap-3"><div><p className="font-semibold text-rose-900">どこが合わなかった？</p><p className="mt-1 text-xs leading-5 text-rose-800/80">理由の語句を次回以降の減点に使います。例：営業・広告向け、初心者向け</p></div><button type="button" className="text-xs font-medium text-muted-foreground hover:text-foreground" onClick={() => { setShowSkipReason(false); setSkipReason(""); }} disabled={busy}>閉じる</button></div><div className="mt-3 flex flex-wrap gap-2">{SKIP_REASON_SUGGESTIONS.map((reason) => <button key={reason} type="button" onClick={() => setSkipReason((current) => current.includes(reason) ? current : current ? `${current}、${reason}` : reason)} className="rounded-full border border-rose-200 bg-background px-3 py-1.5 text-xs font-medium text-rose-800 transition hover:bg-rose-100" disabled={busy}>{reason}</button>)}</div><textarea value={skipReason} onChange={(event) => setSkipReason(event.target.value)} maxLength={280} rows={3} placeholder="例：営業向け、技術が初歩的、オンラインだけが良い" className="mt-4 w-full resize-none rounded-xl border border-rose-200 bg-background px-3 py-2.5 text-sm outline-none placeholder:text-muted-foreground focus:border-rose-400 focus:ring-2 focus:ring-rose-100" disabled={busy} /><div className="mt-3 flex flex-wrap gap-2"><Button type="button" variant="outline" className="border-rose-200 text-rose-800 hover:bg-rose-100" onClick={() => void decide(-2, skipReason)} disabled={busy}><X className="mr-2 h-4 w-4" />理由を記録して興味なし</Button><Button type="button" variant="ghost" onClick={() => void decide(-2)} disabled={busy}>理由なしでスキップ</Button></div></div>}
      <div className="grid grid-cols-2 gap-3 border-t border-border bg-muted/35 p-4 sm:p-5">
        <Button type="button" variant="outline" className="h-14 border-rose-200 bg-background text-base text-rose-700 hover:border-rose-300 hover:bg-rose-50 hover:text-rose-800" onClick={() => { setShowSkipReason(true); setMessage(null); }} disabled={busy}><X className="mr-2 h-5 w-5" />興味なし</Button>
        <Button type="button" className="h-14 bg-[hsl(var(--accent))] text-base hover:bg-[hsl(var(--accent))]/90" onClick={() => void decide(2)} disabled={busy}><Heart className="mr-2 h-5 w-5" />興味あり</Button>
      </div>
    </section> : <section className="mt-6 rounded-[28px] border border-dashed border-border bg-background px-6 py-12 text-center shadow-sm">
      <Check className="mx-auto h-8 w-8 text-[hsl(var(--accent))]" />
      <h2 className="mt-4 text-xl font-semibold">今日の判断は終わりです。</h2>
      <p className="mt-2 text-sm leading-6 text-muted-foreground">判定済みの投稿は再表示しません。Xから新しい候補を補充するか、次の自動収集を待ちましょう。</p>
      <div className="mt-6 flex flex-wrap justify-center gap-3"><Button type="button" onClick={() => void collectLatestX()} disabled={busy}><RefreshCw className="mr-2 h-4 w-4" />Xから最新を収集</Button><Button type="button" variant="outline" onClick={() => void addPracticeSamples()} disabled={busy}><Sparkles className="mr-2 h-4 w-4" />練習用10件を追加</Button><Link href="/sources" className="inline-flex h-10 items-center justify-center rounded-md border border-input bg-background px-4 py-2 text-sm font-medium shadow-sm transition hover:bg-muted"><Settings2 className="mr-2 h-4 w-4" />収集設定</Link></div>
    </section>}

    {message && <p aria-live="polite" className="mt-4 text-center text-sm text-muted-foreground">{message}</p>}

    {upcoming.length > 0 && <section className="mt-10"><div className="flex items-center justify-between"><h2 className="font-semibold">このあと届いている投稿</h2><span className="text-xs text-muted-foreground">上から順に判断します</span></div><div className="mt-3 space-y-2">{upcoming.map((candidate) => <div key={candidate.id} className="rounded-2xl border border-border bg-background/70 px-4 py-3"><div className="flex items-start gap-3"><span className="mt-0.5 grid h-7 w-7 shrink-0 place-items-center rounded-lg bg-muted text-xs font-semibold tabular-nums">{candidate.score}</span><div className="min-w-0"><div className="flex items-center gap-2"><span className="rounded bg-[hsl(var(--accent-soft))] px-1.5 py-0.5 text-[10px] font-bold tracking-wide text-[hsl(var(--accent))]">NEW</span><p className="line-clamp-1 text-sm font-medium">{candidate.title}</p></div><p className="mt-1 text-xs text-muted-foreground">{candidate.sourceName}</p></div></div></div>)}</div>{queue.length > 9 && <p className="mt-3 text-center text-xs text-muted-foreground">ほかに {queue.length - 9} 件あります。</p>}</section>}

    <section className="mt-10 rounded-2xl border border-border bg-background/70 p-5"><div className="flex gap-3"><Sparkles className="mt-0.5 h-5 w-5 shrink-0 text-[hsl(var(--accent))]" /><div><h2 className="font-semibold">あなたのフィードを育てています</h2><p className="mt-1 text-sm leading-6 text-muted-foreground">興味あり・なしの判定を重ねるほど、役に立った話題と情報源を確率的に再順位付けします。{feedbackStats.ratedCount < 5 ? "あと少し判定すると、個人向けの補正が始まります。" : "この一覧と次の収集に、あなたの判定を反映しています。"}</p></div></div></section>
  </div>;
}





