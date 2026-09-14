import Link from "next/link";
import { ArrowRight, BrainCircuit, CircleAlert, Heart, ShieldCheck, Sigma, SlidersHorizontal, Sparkles, ThumbsDown, ThumbsUp } from "lucide-react";

import { WorkspaceShell } from "@/components/workspace/WorkspaceShell";
import { eventInterestKeywords, effectiveIncludeKeywords, EVENT_TOPIC_OPTIONS, TOPIC_OPTIONS } from "@/features/sources/preferences";
import { getInterestProfile } from "@/features/sources/server/interestProfile";
import { buildLearningProfile, suggestXQueryTerms, type FeedbackExample } from "@/features/sources/learning";
import { getXApiConfig } from "@/features/x/server/config";
import { prisma } from "@/lib/prisma";

export const dynamic = "force-dynamic";

function TopicPills({ values, empty }: { values: string[]; empty: string }) {
  return values.length > 0 ? <div className="mt-3 flex flex-wrap gap-2">{values.map((value) => <span key={value} className="rounded-full bg-[hsl(var(--accent-soft))] px-3 py-1.5 text-sm font-medium text-foreground">{value}</span>)}</div> : <p className="mt-3 text-sm text-muted-foreground">{empty}</p>;
}

export default async function AlgorithmPage() {
  const [profile, ratedRows] = await Promise.all([
    getInterestProfile(),
    prisma.candidate.findMany({
      where: { feedbackValue: { not: null } },
      include: { source: { select: { id: true, name: true, kind: true } } },
      orderBy: { detectedAt: "desc" },
      take: 500
    })
  ]);
  const examples: FeedbackExample[] = ratedRows.map((row) => ({ sourceId: row.sourceId, text: `${row.title} ${row.summary ?? ""}`, relevant: row.status === "REVIEWED", value: row.feedbackValue, reason: row.feedbackReason }));
  const learningModel = buildLearningProfile(examples);
  const searchTerms = suggestXQueryTerms({
    examples,
    includeKeywords: effectiveIncludeKeywords(profile),
    excludeKeywords: profile.excludeKeywords,
    fallback: getXApiConfig().keywords
  });
  const selectedTopics = TOPIC_OPTIONS.filter((topic) => profile.selectedTopics.includes(topic.id)).map((topic) => topic.label);
  const selectedEventTopics = EVENT_TOPIC_OPTIONS.filter((topic) => profile.eventTopics.includes(topic.id)).map((topic) => topic.label);
  const likes = ratedRows.filter((row) => (row.feedbackValue ?? 0) > 0);
  const skips = ratedRows.filter((row) => (row.feedbackValue ?? 0) < 0);
  const average = ratedRows.length === 0 ? 0 : ratedRows.reduce((sum, row) => sum + (row.feedbackValue ?? 0), 0) / ratedRows.length;
  const sourceNames = new Map(ratedRows.map((row) => [row.sourceId, { name: row.source.name, kind: row.source.kind }]));
  const sourceStats = learningModel.sources
    .filter((source) => source.observations > 0)
    .sort((left, right) => Math.abs(right.points) - Math.abs(left.points) || right.observations - left.observations)
    .slice(0, 6);
  const positiveSignals = learningModel.signals.filter((signal) => signal.points > 0).sort((left, right) => right.points - left.points || right.observations - left.observations).slice(0, 6);
  const negativeSignals = learningModel.signals.filter((signal) => signal.points < 0).sort((left, right) => left.points - right.points || right.observations - left.observations).slice(0, 6);
  const eventTerms = eventInterestKeywords(profile);

  return <WorkspaceShell><div className="mx-auto max-w-5xl px-5 py-8 sm:px-8 sm:py-12">
    <header className="flex flex-wrap items-start justify-between gap-5"><div><p className="text-sm font-medium text-[hsl(var(--accent))]">FEED ALGORITHM</p><h1 className="mt-1 text-3xl font-semibold tracking-tight sm:text-4xl">フィードの仕組み</h1><p className="mt-2 max-w-2xl text-sm leading-6 text-muted-foreground">DailyNewsが何を優先し、なぜ候補に出したかを、このPC内の設定と判定履歴から確認できます。</p></div><Link href="/sources" className="inline-flex items-center gap-2 rounded-xl border border-border bg-background px-4 py-3 text-sm font-semibold shadow-sm transition hover:bg-muted">興味を編集<ArrowRight className="h-4 w-4" /></Link></header>

    <section className="mt-8 grid gap-4 sm:grid-cols-3"><div className="rounded-2xl border border-border bg-background p-5 shadow-sm"><ThumbsUp className="h-5 w-5 text-emerald-700" /><p className="mt-4 text-3xl font-semibold tabular-nums">{likes.length}</p><p className="mt-1 text-sm text-muted-foreground">興味あり</p></div><div className="rounded-2xl border border-border bg-background p-5 shadow-sm"><ThumbsDown className="h-5 w-5 text-rose-700" /><p className="mt-4 text-3xl font-semibold tabular-nums">{skips.length}</p><p className="mt-1 text-sm text-muted-foreground">興味なし</p></div><div className="rounded-2xl border border-border bg-background p-5 shadow-sm"><Heart className="h-5 w-5 text-[hsl(var(--accent))]" /><p className="mt-4 text-3xl font-semibold tabular-nums">{average >= 0 ? "+" : ""}{average.toFixed(1)}</p><p className="mt-1 text-sm text-muted-foreground">判定の平均</p></div></section>

    <section className="mt-6 grid gap-6 lg:grid-cols-2"><div className="rounded-[28px] border border-border bg-background p-6 shadow-sm"><div className="flex items-center gap-3"><SlidersHorizontal className="h-5 w-5 text-[hsl(var(--accent))]" /><h2 className="text-xl font-semibold">今の関心設定</h2></div><h3 className="mt-6 text-sm font-semibold">Xフィードの話題</h3><TopicPills values={[...selectedTopics, ...profile.includeKeywords]} empty="まだ追加の話題はありません。" /><h3 className="mt-6 text-sm font-semibold">避けたい情報</h3><TopicPills values={profile.excludeKeywords} empty="除外語は設定していません。" /><h3 className="mt-6 text-sm font-semibold">技術イベントの関心</h3><TopicPills values={[...selectedEventTopics, ...profile.eventPeople, ...profile.eventTalks]} empty="技術イベントの分野・目的は未設定です。" /></div>
      <div className="rounded-[28px] border border-border bg-background p-6 shadow-sm"><div className="flex items-center gap-3"><BrainCircuit className="h-5 w-5 text-[hsl(var(--accent))]" /><h2 className="text-xl font-semibold">次のX検索に使う語句</h2></div><p className="mt-2 text-sm leading-6 text-muted-foreground">興味設定、興味あり・なしの履歴、興味なし理由の語句、初期設定から最大6語を選びます。</p><TopicPills values={searchTerms} empty="判定が増えると、ここにあなた向けの検索語が表示されます。" /><div className="mt-6 rounded-2xl bg-muted/55 p-4"><p className="text-sm font-semibold">技術イベント検索に追加する語句</p><TopicPills values={eventTerms.slice(0, 12)} empty="技術イベントの個別条件は未設定です。" /></div></div></section>

    <section className="mt-6 rounded-[28px] border border-border bg-background p-6 shadow-sm"><div className="flex items-center gap-3"><ShieldCheck className="h-5 w-5 text-[hsl(var(--accent))]" /><h2 className="text-xl font-semibold">候補を出すまでの流れ</h2></div><ol className="mt-6 grid gap-4 md:grid-cols-2"><li className="rounded-2xl bg-muted/45 p-4"><span className="text-sm font-semibold text-[hsl(var(--accent))]">1. 一次情報を優先</span><p className="mt-2 text-sm leading-6 text-muted-foreground">企業・団体の公式プロフィール、または条件を満たすイベント主催者の告知を通します。一般の感想、リポスト、返信は対象外です。</p></li><li className="rounded-2xl bg-muted/45 p-4"><span className="text-sm font-semibold text-[hsl(var(--accent))]">2. 機会らしさを採点</span><p className="mt-2 text-sm leading-6 text-muted-foreground">インターン、募集、イベント、締切、技術職、掲載直後などを加点します。各カードには実際に一致した理由を表示します。</p></li><li className="rounded-2xl bg-muted/45 p-4"><span className="text-sm font-semibold text-[hsl(var(--accent))]">3. あなたの条件を重ねる</span><p className="mt-2 text-sm leading-6 text-muted-foreground">選んだ話題は最大+34点、除外語は-38点。関心語があるのに一致しない候補は-14点に調整します。</p></li><li className="rounded-2xl bg-muted/45 p-4"><span className="text-sm font-semibold text-[hsl(var(--accent))]">4. 確率的に微調整</span><p className="mt-2 text-sm leading-6 text-muted-foreground">判定が5件以上になると、情報源と話題ごとの傾向を平滑化して補正します。少ない評価ほど全体傾向に寄せるため、1回の誤タップでは順位が大きく変わりません。</p></li></ol><p className="mt-5 flex items-start gap-2 text-sm leading-6 text-muted-foreground"><CircleAlert className="mt-0.5 h-4 w-4 shrink-0" />これは説明可能な個人用ランキングです。あなたの判定やメール本文を外部AIに渡したり、他人の行動データと混ぜたりしません。</p></section>

    <section className="mt-6 rounded-[28px] border border-border bg-background p-6 shadow-sm"><div className="flex items-center gap-3"><Sigma className="h-5 w-5 text-[hsl(var(--accent))]" /><h2 className="text-xl font-semibold">確率モデルの計算</h2></div><p className="mt-2 text-sm leading-6 text-muted-foreground">評価を「興味なし=-2」から「興味あり=+2」までの0〜1の報酬に換算します。α={learningModel.alpha} は、最初に置く中立の仮想評価数です。</p><div className="mt-5 grid gap-4 lg:grid-cols-2"><div className="rounded-2xl bg-slate-950 p-5 font-mono text-sm leading-7 text-slate-100"><p>P₀ = (Σ reward + α × 0.5) / (N + α)</p><p>P(feature) = (Σ reward(feature) + α × P₀) / (n + α)</p><p>confidence = n / (n + α)</p><p>final = rule score + source lift + topic lifts</p></div><div className="rounded-2xl bg-muted/45 p-5 text-sm leading-6 text-muted-foreground"><p><span className="font-semibold text-foreground">現在の全体的な興味確率:</span> {(learningModel.globalProbability * 100).toFixed(0)}%</p><p className="mt-2"><span className="font-semibold text-foreground">評価数:</span> {learningModel.feedbackCount}件</p><p className="mt-2">情報源・話題の確率は全体P₀へ寄せます。nが増えるほど confidence が上がり、繰り返された好みだけが強く順位に反映されます。</p></div></div><div className="mt-5 grid gap-4 md:grid-cols-2"><div className="rounded-2xl border border-emerald-200 bg-emerald-50/60 p-4"><p className="text-sm font-semibold text-emerald-900">上がりやすい話題</p>{positiveSignals.length ? <div className="mt-3 flex flex-wrap gap-2">{positiveSignals.map((signal) => <span key={signal.key} className="rounded-full bg-white px-3 py-1 text-xs font-medium text-emerald-900">{signal.key} · +{signal.points}点 · n={signal.observations}</span>)}</div> : <p className="mt-3 text-sm text-emerald-800">まだ十分なプラス傾向はありません。</p>}</div><div className="rounded-2xl border border-rose-200 bg-rose-50/60 p-4"><p className="text-sm font-semibold text-rose-900">避けたい話題・理由の語句</p>{negativeSignals.length ? <div className="mt-3 flex flex-wrap gap-2">{negativeSignals.map((signal) => <span key={signal.key} className="rounded-full bg-white px-3 py-1 text-xs font-medium text-rose-900">{signal.key} · {signal.points}点 · n={signal.observations}</span>)}</div> : <p className="mt-3 text-sm text-rose-800">まだ十分なマイナス傾向はありません。</p>}</div></div></section>

    <section className="mt-6 rounded-[28px] border border-border bg-background p-6 shadow-sm"><div className="flex items-center gap-3"><Sparkles className="h-5 w-5 text-[hsl(var(--accent))]" /><h2 className="text-xl font-semibold">情報源ごとの確率的な傾向</h2></div><p className="mt-2 text-sm text-muted-foreground">確率と信頼度を併記します。点数は最終順位に加える補正で、少ない履歴では小さくなります。</p>{sourceStats.length === 0 ? <p className="mt-4 text-sm text-muted-foreground">まだ判定履歴がありません。Xフィードで興味あり・なしを選ぶと表示されます。</p> : <div className="mt-5 divide-y divide-border">{sourceStats.map((source) => { const details = sourceNames.get(source.key); return <div key={source.key} className="flex flex-wrap items-center justify-between gap-4 py-4"><div><p className="font-medium">{details?.name ?? source.key}</p><p className="mt-0.5 text-xs text-muted-foreground">{source.observations}件を判定 · {details?.kind === "X_ALGO_TECH_EVENT" ? "技術イベントX" : details?.kind === "X_ALGO" ? "企業X" : details?.kind ?? "情報源"}</p></div><div className="flex gap-2 text-xs"><span className="rounded-full bg-muted px-3 py-1.5">興味確率 {(source.probability * 100).toFixed(0)}%</span><span className="rounded-full bg-muted px-3 py-1.5">信頼度 {(source.confidence * 100).toFixed(0)}%</span><span className={`rounded-full px-3 py-1.5 font-semibold ${source.points > 0 ? "bg-emerald-50 text-emerald-800" : source.points < 0 ? "bg-rose-50 text-rose-800" : "bg-muted text-muted-foreground"}`}>{source.points >= 0 ? "+" : ""}{source.points}点</span></div></div>; })}</div>}</section>
  </div></WorkspaceShell>;
}
