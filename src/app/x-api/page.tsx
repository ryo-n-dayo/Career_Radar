import Link from "next/link";
import { BarChart3, CircleDollarSign, Database, ExternalLink, Gauge, ReceiptText } from "lucide-react";

import { WorkspaceShell } from "@/components/workspace/WorkspaceShell";
import { getXApiBudgetStatus } from "@/features/x/server/config";
import { prisma } from "@/lib/prisma";

export const dynamic = "force-dynamic";

const money = (value: number) => `$${value.toFixed(3)}`;
const dateText = (dateKey: string) => new Intl.DateTimeFormat("ja-JP", { month: "short", day: "numeric", weekday: "short", timeZone: "Asia/Tokyo" }).format(new Date(`${dateKey}T00:00:00+09:00`));
const updatedText = (date: Date) => new Intl.DateTimeFormat("ja-JP", { month: "numeric", day: "numeric", hour: "2-digit", minute: "2-digit", timeZone: "Asia/Tokyo" }).format(date);

export default async function XApiUsagePage() {
  const [budget, days, allTime] = await Promise.all([
    getXApiBudgetStatus(),
    prisma.xUsageDaily.findMany({ orderBy: { dateKey: "desc" }, take: 30 }),
    prisma.xUsageDaily.aggregate({ _sum: { postsRead: true, requestCount: true, estimatedCostUsd: true } })
  ]);
  const monthPercent = budget.monthlyBudgetUsd > 0 ? Math.min(100, (budget.estimatedCostMonthUsd / budget.monthlyBudgetUsd) * 100) : 0;
  const remaining = Math.max(0, budget.monthlyBudgetUsd - budget.estimatedCostMonthUsd);

  return <WorkspaceShell><div className="mx-auto max-w-6xl px-5 py-8 sm:px-8 sm:py-12">
    <header className="flex flex-wrap items-start justify-between gap-4">
      <div>
        <p className="text-sm font-medium text-[hsl(var(--accent))]">X API usage</p>
        <h1 className="mt-1 text-3xl font-semibold tracking-tight">X APIの利用額</h1>
        <p className="mt-2 max-w-2xl text-sm leading-6 text-muted-foreground">DailyNewsが公式X APIから取得した投稿数・リクエスト数・推定利用額を、このPCの記録から集計します。</p>
      </div>
      <span className={`rounded-full px-3 py-1.5 text-sm font-semibold ${budget.enabled && budget.configured ? "bg-emerald-100 text-emerald-800" : "bg-muted text-muted-foreground"}`}>{budget.enabled && budget.configured ? "接続中" : "未設定"}</span>
    </header>

    <section className="mt-8 grid gap-4 sm:grid-cols-2 xl:grid-cols-4">
      <Metric icon={Database} label="今日の取得投稿" value={`${budget.postsReadToday} / ${budget.dailyPostLimit} 件`} detail="設定した1日の上限" />
      <Metric icon={ReceiptText} label="今日の推定額" value={money(budget.estimatedCostTodayUsd)} detail={`1投稿 ${money(budget.postReadCostUsd)} で計算`} />
      <Metric icon={BarChart3} label="今月の取得投稿" value={`${budget.postsReadMonth} 件`} detail="当月の合計" />
      <Metric icon={CircleDollarSign} label="今月の推定額" value={`${money(budget.estimatedCostMonthUsd)} / ${money(budget.monthlyBudgetUsd)}`} detail={`残り ${money(remaining)}`} />
    </section>

    <section className="mt-6 rounded-[28px] border border-border bg-background p-5 shadow-sm sm:p-6">
      <div className="flex flex-wrap items-start justify-between gap-4"><div><div className="flex items-center gap-2"><Gauge className="h-5 w-5 text-[hsl(var(--accent))]" /><h2 className="font-semibold">今月の予算</h2></div><p className="mt-2 text-sm text-muted-foreground">月額上限に対する推定利用額の割合です。</p></div><p className="text-2xl font-semibold tabular-nums">{monthPercent.toFixed(1)}%</p></div>
      <div className="mt-5 h-3 overflow-hidden rounded-full bg-muted"><div className={`h-full rounded-full transition-all ${monthPercent >= 90 ? "bg-rose-500" : monthPercent >= 70 ? "bg-amber-500" : "bg-[hsl(var(--accent))]"}`} style={{ width: `${monthPercent}%` }} /></div>
      <div className="mt-3 flex justify-between text-xs text-muted-foreground"><span>{money(budget.estimatedCostMonthUsd)} 使用</span><span>{money(budget.monthlyBudgetUsd)} 上限</span></div>
    </section>

    <section className="mt-6 grid gap-4 lg:grid-cols-[1.5fr_1fr]">
      <div className="rounded-[28px] border border-border bg-background p-5 shadow-sm sm:p-6"><div className="flex items-center justify-between gap-3"><div><h2 className="font-semibold">日別の利用履歴</h2><p className="mt-1 text-sm text-muted-foreground">直近30日。取得がない日は表示しません。</p></div><span className="rounded-full bg-muted px-3 py-1 text-xs font-medium">{days.length}日分</span></div>
        {days.length === 0 ? <p className="mt-6 rounded-2xl bg-muted/50 p-5 text-sm text-muted-foreground">まだX APIの取得履歴はありません。</p> : <div className="mt-5 overflow-x-auto"><table className="w-full min-w-[560px] text-left text-sm"><thead className="border-b border-border text-xs text-muted-foreground"><tr><th className="pb-3 font-medium">日付</th><th className="pb-3 text-right font-medium">投稿</th><th className="pb-3 text-right font-medium">リクエスト</th><th className="pb-3 text-right font-medium">推定額</th><th className="pb-3 pl-4 text-right font-medium">最終更新</th></tr></thead><tbody>{days.map((day) => <tr key={day.dateKey} className="border-b border-border/70 last:border-0"><td className="py-3 font-medium">{dateText(day.dateKey)}</td><td className="py-3 text-right tabular-nums">{day.postsRead}</td><td className="py-3 text-right tabular-nums">{day.requestCount}</td><td className="py-3 text-right font-medium tabular-nums">{money(day.estimatedCostUsd)}</td><td className="py-3 pl-4 text-right text-xs text-muted-foreground">{updatedText(day.updatedAt)}</td></tr>)}</tbody></table></div>}
      </div>
      <aside className="rounded-[28px] border border-border bg-[hsl(var(--accent-soft))]/45 p-5 sm:p-6"><h2 className="font-semibold">累計と計算方法</h2><dl className="mt-5 space-y-4"><div><dt className="text-xs text-muted-foreground">累計取得投稿</dt><dd className="mt-1 text-2xl font-semibold tabular-nums">{allTime._sum.postsRead ?? 0} 件</dd></div><div><dt className="text-xs text-muted-foreground">累計リクエスト</dt><dd className="mt-1 text-2xl font-semibold tabular-nums">{allTime._sum.requestCount ?? 0} 回</dd></div><div><dt className="text-xs text-muted-foreground">累計推定額</dt><dd className="mt-1 text-2xl font-semibold tabular-nums">{money(allTime._sum.estimatedCostUsd ?? 0)}</dd></div></dl><div className="mt-6 rounded-2xl border border-border bg-background/75 p-4 text-xs leading-5 text-muted-foreground">表示額は、DailyNews内での <b className="text-foreground">取得投稿数 × {money(budget.postReadCostUsd)}</b> による推定です。Xの請求明細・契約プラン料金そのものではありません。</div><Link href="/sources" className="mt-5 inline-flex items-center gap-1.5 text-sm font-semibold text-[hsl(var(--accent))] hover:underline">上限・監視先を設定する<ExternalLink className="h-4 w-4" /></Link></aside>
    </section>
  </div></WorkspaceShell>;
}

function Metric({ icon: Icon, label, value, detail }: { icon: typeof Database; label: string; value: string; detail: string }) {
  return <div className="rounded-2xl border border-border bg-background p-5 shadow-sm"><Icon className="h-5 w-5 text-[hsl(var(--accent))]" /><p className="mt-4 text-sm text-muted-foreground">{label}</p><p className="mt-1 text-2xl font-semibold tracking-tight tabular-nums">{value}</p><p className="mt-1 text-xs text-muted-foreground">{detail}</p></div>;
}
