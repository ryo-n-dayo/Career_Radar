import Link from "next/link";
import { ArrowRight, BriefcaseBusiness, Clock3, GraduationCap, Heart, MessageCircleHeart, Sparkles } from "lucide-react";

import { WorkspaceShell } from "@/components/workspace/WorkspaceShell";
import { getXApiBudgetStatus } from "@/features/x/server/config";
import { isVisibleInPersonalFeed } from "@/features/x/candidateVisibility";
import { isDiscoverableMeetup } from "@/features/meetups/discovery";
import { isEligibleGraduationWindow } from "@/features/sources/scoring";
import { prisma } from "@/lib/prisma";

export const dynamic = "force-dynamic";

export default async function Home() {
  const [pendingCandidates, internshipCount, jobHuntingRows, techEventRows, feedbackAggregate, xApi] = await Promise.all([
    prisma.candidate.findMany({
      where: { status: "NEW", source: { kind: { in: ["X_API", "X_ALGO", "X_ALGO_TECH_EVENT", "DEMO"] } } },
      include: { source: true },
      orderBy: [{ score: "desc" }, { detectedAt: "desc" }],
      take: 100
    }),
    prisma.candidate.count({ where: { source: { kind: "CAREERS" }, kind: "INTERNSHIP", isActive: true, OR: [{ deadline: null }, { deadline: { gte: new Date() } }] } }),
    prisma.candidate.findMany({ where: { source: { kind: "NEW_GRAD" }, isActive: true, OR: [{ deadline: null }, { deadline: { gte: new Date() } }] }, select: { title: true, summary: true } }),
    prisma.candidate.findMany({
      where: { source: { kind: { in: ["TECH_EVENTS", "X_ALGO_TECH_EVENT"] } } },
      include: { source: { select: { kind: true, name: true, notes: true } } },
      orderBy: { detectedAt: "desc" }
    }),
    prisma.candidate.aggregate({ where: { feedbackValue: { not: null } }, _count: { id: true }, _avg: { feedbackValue: true } }),
    getXApiBudgetStatus()
  ]);
  const visibleCandidates = pendingCandidates.filter(isVisibleInPersonalFeed);
  const jobHuntingCount = jobHuntingRows.filter((candidate) => isEligibleGraduationWindow(`${candidate.title} ${candidate.summary ?? ""}`)).length;
  const visibleTechEvents = techEventRows.filter(isDiscoverableMeetup);
  const techEventCount = new Set(visibleTechEvents.map((candidate) => candidate.url)).size;
  const newTechEventCount = new Set(visibleTechEvents.filter((candidate) => candidate.status === "NEW").map((candidate) => candidate.url)).size;
  const candidateCount = visibleCandidates.length;
  const latest = visibleCandidates.slice(0, 3);
  const ratedCount = feedbackAggregate._count.id;
  const average = feedbackAggregate._avg.feedbackValue ?? 0;

  return <WorkspaceShell><div className="mx-auto max-w-6xl px-5 py-8 sm:px-8 sm:py-12">
    <header className="flex flex-wrap items-start justify-between gap-5"><div><p className="text-sm font-medium text-[hsl(var(--accent))]">OPPORTUNITY DISCOVERY</p><h1 className="mt-1 text-3xl font-semibold tracking-tight sm:text-4xl">インターンと<br className="sm:hidden" />技術イベントを探す</h1><p className="mt-2 text-sm leading-6 text-muted-foreground">公式採用ページと一次告知から、次に参加・応募できる機会を見つけます。</p></div><Link href="/feed" className="inline-flex items-center gap-2 rounded-xl bg-[hsl(var(--accent))] px-4 py-3 text-sm font-semibold text-white shadow-sm transition hover:opacity-90">Xフィードを開く<ArrowRight className="h-4 w-4" /></Link></header>

    <section className="mt-8 grid gap-3 sm:grid-cols-2 xl:grid-cols-4">
      <Link href="/internships" className="rounded-2xl border border-border bg-background p-5 shadow-sm transition hover:-translate-y-0.5 hover:shadow-md"><BriefcaseBusiness className="h-5 w-5 text-[hsl(var(--accent))]" /><div className="mt-5 text-3xl font-semibold tabular-nums">{internshipCount}</div><p className="mt-1 text-sm text-muted-foreground">募集中の技術インターン</p></Link>
      <Link href="/job-hunting" className="rounded-2xl border border-border bg-background p-5 shadow-sm transition hover:-translate-y-0.5 hover:shadow-md"><GraduationCap className="h-5 w-5 text-[hsl(var(--accent))]" /><div className="mt-5 text-3xl font-semibold tabular-nums">{jobHuntingCount}</div><p className="mt-1 text-sm text-muted-foreground">技術職の新卒・既卒採用</p></Link>
      <Link href="/meetups" className="rounded-2xl border border-border bg-background p-5 shadow-sm transition hover:-translate-y-0.5 hover:shadow-md"><Sparkles className="h-5 w-5 text-[hsl(var(--accent))]" /><div className="mt-5 text-3xl font-semibold tabular-nums">{techEventCount}</div><p className="mt-1 text-sm text-muted-foreground">表示できる技術イベント</p><p className="mt-1 text-xs text-[hsl(var(--accent))]">未判定の告知 {newTechEventCount}件</p></Link>
      <div className="rounded-2xl border border-border bg-background p-5 shadow-sm"><MessageCircleHeart className="h-5 w-5 text-[hsl(var(--accent))]" /><div className="mt-5 text-3xl font-semibold tabular-nums">{candidateCount}</div><p className="mt-1 text-sm text-muted-foreground">未判定のX投稿</p></div>
      <div className="rounded-2xl border border-border bg-background p-5 shadow-sm"><Heart className="h-5 w-5 text-[hsl(var(--accent))]" /><div className="mt-5 text-3xl font-semibold tabular-nums">{ratedCount}</div><p className="mt-1 text-sm text-muted-foreground">これまでの判定</p></div>
      <div className="rounded-2xl border border-border bg-background p-5 shadow-sm"><Clock3 className="h-5 w-5 text-[hsl(var(--accent))]" /><div className="mt-5 text-lg font-semibold">毎朝 5:00</div><p className="mt-1 text-sm text-muted-foreground">次回の自動収集</p></div>
    </section>

    <section className="mt-8 grid gap-6 lg:grid-cols-[1.35fr_0.8fr]">
      <div className="rounded-[28px] border border-border bg-background p-6 shadow-sm"><div className="flex items-center justify-between gap-4"><div><p className="text-sm font-medium text-[hsl(var(--accent))]">INBOX</p><h2 className="mt-1 text-xl font-semibold">今日届いている投稿</h2></div><Link href="/feed" className="text-sm font-medium text-[hsl(var(--accent))] hover:underline">すべて判定する</Link></div><div className="mt-5 space-y-3">{latest.length === 0 ? <div className="rounded-2xl bg-[hsl(var(--accent-soft))]/50 px-4 py-8 text-center text-sm text-muted-foreground">新しい投稿はありません。技術イベントは毎朝の収集で、企業の新着はXフィードで確認できます。</div> : latest.map((candidate) => <div key={candidate.id} className="flex items-start gap-3 rounded-2xl bg-muted/45 px-4 py-3"><span className="grid h-8 w-8 shrink-0 place-items-center rounded-xl bg-background text-xs font-semibold tabular-nums">{candidate.score}</span><div className="min-w-0"><p className="line-clamp-1 text-sm font-medium">{candidate.title}</p><p className="mt-1 text-xs text-muted-foreground">{["X_API", "X_ALGO", "X_ALGO_TECH_EVENT"].includes(candidate.source.kind) ? "X の投稿" : "練習用"} · {candidate.source.name}</p></div></div>)}</div></div>
      <div className="rounded-[28px] border border-[hsl(var(--accent))]/25 bg-[hsl(var(--accent-soft))]/40 p-6"><Sparkles className="h-5 w-5 text-[hsl(var(--accent))]" /><h2 className="mt-4 text-xl font-semibold">フィードの成長</h2><p className="mt-2 text-sm leading-6 text-muted-foreground">興味あり・なしの判定を積み重ねると、語句と情報源の優先順位に反映されます。</p><div className="mt-6 rounded-2xl bg-background/75 p-4"><div className="flex items-end justify-between"><div><p className="text-2xl font-semibold tabular-nums">{ratedCount}件</p><p className="mt-1 text-xs text-muted-foreground">判定済み</p></div><p className="text-sm font-medium">平均 {average >= 0 ? "+" : ""}{average.toFixed(1)}</p></div><div className="mt-4 h-2 overflow-hidden rounded-full bg-muted"><div className="h-full rounded-full bg-[hsl(var(--accent))]" style={{ width: `${Math.min(100, ratedCount * 20)}%` }} /></div></div><div className="mt-5 flex flex-wrap gap-x-5 gap-y-2"><Link href="/feed" className="inline-flex items-center gap-1.5 text-sm font-semibold text-[hsl(var(--accent))] hover:underline">判定を続ける<ArrowRight className="h-4 w-4" /></Link><Link href="/algorithm" className="inline-flex items-center gap-1.5 text-sm font-semibold text-[hsl(var(--accent))] hover:underline">仕組みを見る<ArrowRight className="h-4 w-4" /></Link></div></div>
    </section>

    <section className="mt-6 rounded-2xl border border-border bg-background/70 px-5 py-4 text-sm text-muted-foreground"><span className="font-medium text-foreground">X API:</span> {xApi.enabled && xApi.configured ? `有効 · 今日 ${xApi.postsReadToday}/${xApi.dailyPostLimit} 件取得` : "未設定 · 収集設定からBearer Tokenと監視アカウントを確認してください。"}</section>
  </div></WorkspaceShell>;
}
