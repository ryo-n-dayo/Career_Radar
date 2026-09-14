"use client";

import { useMemo, useState } from "react";
import { ArrowUpRight, BadgeCheck, CalendarClock, CheckCircle2, CircleDollarSign, Clock3, Cloud, ExternalLink, Filter, Gift, Newspaper, Search, ShieldCheck, Sparkles } from "lucide-react";

type NewsItem = {
  id: string;
  title: string;
  summary?: string;
  url: string;
  sourceName: string;
  sourceKind: string;
  deadline?: string;
  checkedAt: string;
};

type NewsTheme = "all" | "cloud" | "ai" | "security" | "other";

const THEME_LABEL: Record<NewsTheme, string> = {
  all: "すべて",
  cloud: "クラウド",
  ai: "AI・データ",
  security: "セキュリティ",
  other: "その他の技術情報"
};

function themeFor(item: Pick<NewsItem, "title" | "summary">): NewsTheme {
  const text = `${item.title} ${item.summary ?? ""}`;
  if (/aws|azure|gcp|google\s*cloud|クラウド/i.test(text)) return "cloud";
  if (/ai|生成ai|機械学習|データ|llm/i.test(text)) return "ai";
  if (/security|セキュリティ|cissp|comptia/i.test(text)) return "security";
  return "other";
}

function newsTypeFor(item: Pick<NewsItem, "title" | "summary">): string {
  const text = `${item.title} ${item.summary ?? ""}`;
  if (/脆弱性|security\s+(?:update|advisory)|セキュリティ(?:更新|情報)?|cve|障害/i.test(text)) return "セキュリティ";
  if (/新機能|新サービス|リリース|提供開始|アップデート|changelog|release|launch|update|now\s+supports?/i.test(text)) return "製品更新";
  if (/50\s*%|半額/i.test(text)) return "50% OFF";
  if (/再受験.*無料|free\s+retake/i.test(text)) return "再受験無料";
  if (/無料|無償/i.test(text)) return "無料";
  if (/バウチャー|voucher|クーポン/i.test(text)) return "バウチャー";
  if (/割引|discount/i.test(text)) return "割引";
  return "技術ニュース";
}

function deadlineText(deadline?: string): string | undefined {
  if (!deadline) return undefined;
  const date = new Date(deadline);
  return Number.isNaN(date.getTime()) ? undefined : new Intl.DateTimeFormat("ja-JP", { month: "numeric", day: "numeric" }).format(date);
}

function checkedAtText(value: string): string {
  const date = new Date(value);
  if (Number.isNaN(date.getTime())) return "日時不明";
  return new Intl.DateTimeFormat("ja-JP", { month: "numeric", day: "numeric", hour: "2-digit", minute: "2-digit" }).format(date);
}

export function LearningBenefitBoard({ benefits }: { benefits: NewsItem[] }) {
  const [theme, setTheme] = useState<NewsTheme>("all");
  const [query, setQuery] = useState("");
  const counts = useMemo(() => new Map((Object.keys(THEME_LABEL) as NewsTheme[]).map((id) => [id, id === "all" ? benefits.length : benefits.filter((item) => themeFor(item) === id).length])), [benefits]);
  const visible = useMemo(() => {
    const terms = query.normalize("NFKC").toLocaleLowerCase("ja-JP").trim().split(/\s+/).filter(Boolean);
    return benefits.filter((item) => (theme === "all" || themeFor(item) === theme) && terms.every((term) => `${item.title} ${item.summary ?? ""} ${item.sourceName}`.toLocaleLowerCase("ja-JP").includes(term)));
  }, [benefits, query, theme]);

  return <div className="mx-auto max-w-[1600px] px-5 py-6 sm:px-7 sm:py-8">
    <header className="rounded-[26px] border border-[#efe0d3] bg-[#fffaf6] px-6 py-6 shadow-[0_12px_40px_rgba(93,49,23,0.06)] sm:px-8">
      <div className="flex flex-wrap items-end justify-between gap-5">
        <div>
          <div className="inline-flex items-center gap-2 rounded-full bg-white px-3 py-1.5 text-xs font-bold tracking-[0.12em] text-[#b75020] shadow-sm"><Newspaper className="h-3.5 w-3.5" />IT NEWS</div>
          <h1 className="mt-3 text-3xl font-semibold tracking-tight text-[#332118] sm:text-4xl">ITニュース</h1>
          <p className="mt-1 text-sm text-[#80695e]">公式の製品更新・セキュリティ情報・開発者向け告知・資格キャンペーン</p>
        </div>
        <div className="flex items-center gap-3 rounded-2xl bg-white px-4 py-3 shadow-sm">
          <div className="grid h-10 w-10 place-items-center rounded-xl bg-[#fff0e7] text-[#c7501b]"><Newspaper className="h-5 w-5" /></div>
          <div><div className="text-2xl font-bold leading-none text-[#332118] tabular-nums">{visible.length}</div><div className="mt-1 text-xs text-[#80695e]">表示中 / 全{benefits.length}件</div></div>
        </div>
      </div>
    </header>

    <section className="mt-4 rounded-2xl border border-[#eee1d8] bg-white/80 p-3 sm:p-4" aria-label="ITニュースの絞り込み">
      <div className="flex flex-wrap items-center gap-2"><Filter className="ml-1 h-3.5 w-3.5 text-[#80695e]" /><span className="mr-1 text-xs font-bold text-[#80695e]">分野</span>{(Object.keys(THEME_LABEL) as NewsTheme[]).map((id) => <button key={id} type="button" aria-pressed={theme === id} onClick={() => setTheme(id)} className="rounded-xl border border-[#ead9cd] px-3 py-2 text-xs font-bold text-[#765f53] aria-pressed:bg-[#a84921] aria-pressed:text-white">{THEME_LABEL[id]} <span className="ml-1 opacity-70">{counts.get(id)}</span></button>)}</div>
      <label className="mt-3 flex max-w-xl items-center gap-2 rounded-xl border border-[#ead9cd] bg-[#fffdfb] px-3 text-[#80695e]"><Search className="h-4 w-4 shrink-0" /><span className="sr-only">技術・提供元・キーワードで検索</span><input className="h-10 w-full bg-transparent text-sm text-[#332118] outline-none placeholder:text-[#a59084]" type="search" value={query} onChange={(event) => setQuery(event.target.value)} placeholder="技術・提供元・キーワードで探す" /></label>
      <p className="mt-2 text-[11px] leading-relaxed text-[#92796d]">公式ページと、X APIで取得した公式アカウントの一次告知だけを表示します。個人の感想、転載、一般的な宣伝は表示しません。</p>
    </section>

    {visible.length === 0 ? <section className="mt-5 rounded-[24px] border border-dashed border-border bg-background px-6 py-14 text-center shadow-sm"><Gift className="mx-auto h-8 w-8 text-[hsl(var(--accent))]" /><h2 className="mt-4 text-xl font-semibold">条件に合うITニュースはありません。</h2><p className="mx-auto mt-2 max-w-lg text-sm leading-6 text-muted-foreground">検索条件を広げるか、収集設定から公式の開発者・製品情報ページを追加できます。</p></section> : <section className="mt-5 grid gap-3 sm:grid-cols-2 xl:grid-cols-3 2xl:grid-cols-4">{visible.map((item) => {
      const itemTheme = themeFor(item);
      const deadline = deadlineText(item.deadline);
      const checkedAt = checkedAtText(item.checkedAt);
      const isX = item.sourceKind === "X_ALGO_LEARNING_BENEFIT";
      const Icon = itemTheme === "cloud" ? Cloud : itemTheme === "security" ? ShieldCheck : itemTheme === "ai" ? Sparkles : CircleDollarSign;
      return <article key={item.id} className="group relative flex min-h-[278px] flex-col overflow-hidden rounded-[20px] border border-border bg-background p-4 shadow-[0_8px_24px_rgba(74,40,22,0.05)] transition hover:-translate-y-0.5 hover:shadow-[0_14px_30px_rgba(74,40,22,0.10)]"><div className="absolute right-[-20px] top-[-20px] h-24 w-24 rounded-full bg-[#fff0e7] opacity-80" /><div className="relative flex items-center justify-between gap-2"><div className="flex min-w-0 items-center gap-2.5"><div className="grid h-10 w-10 shrink-0 place-items-center rounded-xl bg-[#fff0e7] text-[#c7501b]"><Icon className="h-5 w-5" /></div><div className="min-w-0"><p className="truncate text-sm font-bold text-[#3d2a20]">{item.sourceName}</p><p className="mt-0.5 flex items-center gap-1 text-[11px] text-[#8c7569]">{isX ? <ExternalLink className="h-3.5 w-3.5 text-[#cf6a36]" /> : <BadgeCheck className="h-3.5 w-3.5 text-[#cf6a36]" />}{isX ? "X公式告知" : "公式ページ"}</p></div></div><span className="shrink-0 rounded-full bg-[#fff0e4] px-2 py-1 text-[11px] font-bold text-[#a84921]">{newsTypeFor(item)}</span></div><h2 className="relative mt-3 text-[16px] font-bold leading-snug tracking-tight text-[#332118]">{item.title}</h2>{item.summary && <p className="relative mt-2 line-clamp-3 text-xs leading-5 text-[#80695e]">{item.summary}</p>}<div className="relative mt-3 flex flex-wrap gap-1.5"><span className="rounded-full border border-[#eeded4] bg-[#fffaf7] px-2 py-0.5 text-[11px] font-medium text-[#80695e]">{THEME_LABEL[itemTheme]}</span><span className="inline-flex items-center gap-1 rounded-full border border-[#eeded4] bg-[#fffaf7] px-2 py-0.5 text-[11px] font-medium text-[#80695e]"><Clock3 className="h-3 w-3" />取得 {checkedAt}</span>{deadline && <span className="inline-flex items-center gap-1 rounded-full bg-[#fff0e4] px-2 py-0.5 text-[11px] font-bold text-[#a84921]"><CalendarClock className="h-3 w-3" />期限 {deadline}</span>}</div><div className="relative mt-auto border-t border-[#f1e7e1] pt-3"><a href={item.url} target="_blank" rel="noreferrer" className="flex items-center justify-between rounded-xl bg-[#43281a] px-3 py-2.5 text-sm font-semibold text-white transition hover:bg-[#5a3522]"><span>{isX ? "Xの告知を開く" : "公式情報を見る"}</span><ArrowUpRight className="h-4 w-4" /></a></div></article>;
    })}</section>}
    <p className="mt-5 flex items-center justify-center gap-1.5 text-xs text-muted-foreground"><CheckCircle2 className="h-3.5 w-3.5" />「NEW」は収集後に追加された告知です。内容と適用条件は必ず公式ページで確認</p>
  </div>;
}
