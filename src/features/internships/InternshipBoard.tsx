"use client";

import { useMemo, useState } from "react";
import { ArrowUpRight, BadgeCheck, BriefcaseBusiness, CalendarDays, Code2, Globe2, Layers3, MapPin, Monitor, Radar, Search, ShieldCheck, Sparkles, type LucideIcon } from "lucide-react";

import { INTERNSHIP_REGION_LABELS, type InternshipRegion } from "./model";

type InternshipItem = { id: string; title: string; summary?: string; url: string; company: string; checkedAt: string; region: InternshipRegion; fullRemote: boolean };
type OpportunityVisual = { label: string; icon: LucideIcon; iconClass: string; surfaceClass: string };
const REGION_TABS: { id: InternshipRegion; Icon: LucideIcon }[] = [{ id: "japan", Icon: MapPin }, { id: "malaysia", Icon: MapPin }, { id: "overseas", Icon: Globe2 }, { id: "online", Icon: Monitor }];

function visualFor(title: string, summary?: string): OpportunityVisual {
  const text = `${title} ${summary ?? ""}`;
  if (/ai|llm|機械学習|人工知能|rag/i.test(text)) return { label: "AI / LLM", icon: Sparkles, iconClass: "text-[#7c3aed]", surfaceClass: "bg-[#f2edff]" };
  if (/sre|インフラ|セキュリティ|開発基盤|cloud|aws|gcp/i.test(text)) return { label: "Platform", icon: ShieldCheck, iconClass: "text-[#2563eb]", surfaceClass: "bg-[#eaf2ff]" };
  if (/デザイン|ui|ux/i.test(text)) return { label: "Product", icon: Layers3, iconClass: "text-[#d9466e]", surfaceClass: "bg-[#fff0f4]" };
  return { label: "Engineering", icon: Code2, iconClass: "text-[#d35c27]", surfaceClass: "bg-[#fff1e9]" };
}

function tagsFor(title: string, summary?: string): string[] {
  const text = `${title} ${summary ?? ""}`.toLowerCase();
  const options: Array<[string, RegExp]> = [["AI・LLM", /ai|llm|rag|機械学習|人工知能/], ["バックエンド", /バックエンド|go|ruby|java|python/], ["フロントエンド", /フロントエンド|react|typescript|web/], ["SRE・インフラ", /sre|インフラ|ci\/cd|クラウド|aws|gcp/], ["セキュリティ", /セキュリティ/], ["プロダクト", /プロダクト|ui|ux|デザイン/]];
  return options.filter(([, pattern]) => pattern.test(text)).map(([label]) => label).slice(0, 3);
}

function workStyle(title: string, summary?: string): string {
  const text = `${title} ${summary ?? ""}`;
  if (/1\s*week|1週間|1week/i.test(text)) return "1 week";
  if (/長期/.test(text)) return "長期";
  if (/実務|就業/.test(text)) return "実務型";
  return "技術インターン";
}

function compactDate(value: string): string { return new Intl.DateTimeFormat("ja-JP", { month: "numeric", day: "numeric" }).format(new Date(value)); }

export function InternshipBoard({ internships }: { internships: InternshipItem[] }) {
  const [region, setRegion] = useState<InternshipRegion | "all">("all");
  const [fullRemoteOnly, setFullRemoteOnly] = useState(false);
  const [query, setQuery] = useState("");
  const counts = useMemo(() => new Map(REGION_TABS.map(({ id }) => [id, internships.filter((item) => item.region === id).length])), [internships]);
  const visible = useMemo(() => {
    const terms = query.normalize("NFKC").toLocaleLowerCase("ja-JP").trim().split(/\s+/).filter(Boolean);
    return internships.filter((item) => (region === "all" || item.region === region) && (!fullRemoteOnly || item.fullRemote) && terms.every((term) => `${item.title} ${item.summary ?? ""} ${item.company}`.toLocaleLowerCase("ja-JP").includes(term)));
  }, [fullRemoteOnly, internships, query, region]);

  return <div className="mx-auto max-w-[1600px] px-5 py-6 sm:px-7 sm:py-8">
    <header className="rounded-[26px] border border-[#f0ded3] bg-[#fffaf6] px-6 py-6 shadow-[0_12px_40px_rgba(93,49,23,0.06)] sm:px-8"><div className="flex flex-wrap items-end justify-between gap-5"><div><div className="inline-flex items-center gap-2 rounded-full bg-white px-3 py-1.5 text-xs font-bold tracking-[0.12em] text-[#b75020] shadow-sm"><Radar className="h-3.5 w-3.5" />OPPORTUNITY BOARD</div><h1 className="mt-3 text-3xl font-semibold tracking-tight text-[#332118] sm:text-4xl">技術インターン</h1><p className="mt-1 text-sm text-[#80695e]">公式採用ページで確認した、いま応募できる募集</p></div><div className="flex items-center gap-3 rounded-2xl bg-white px-4 py-3 shadow-sm"><div className="grid h-10 w-10 place-items-center rounded-xl bg-[#fff0e7] text-[#c7501b]"><BriefcaseBusiness className="h-5 w-5" /></div><div><div className="text-2xl font-bold leading-none text-[#332118] tabular-nums">{visible.length}</div><div className="mt-1 text-xs text-[#80695e]">表示中 / 全{internships.length}件</div></div></div></div></header>
    <section className="mt-4 rounded-2xl border border-[#eee1d8] bg-white/80 p-3 sm:p-4" aria-label="インターン募集の絞り込み"><div className="flex flex-wrap items-center gap-2"><span className="mr-1 text-xs font-bold text-[#80695e]">勤務・参加場所</span><button type="button" aria-pressed={region === "all"} onClick={() => setRegion("all")} className="rounded-xl border border-[#ead9cd] px-3 py-2 text-xs font-bold text-[#765f53] aria-pressed:bg-[#a84921] aria-pressed:text-white">すべて <span className="ml-1 opacity-70">{internships.length}</span></button>{REGION_TABS.map(({ id, Icon }) => <button key={id} type="button" aria-pressed={region === id} onClick={() => setRegion(id)} className="inline-flex items-center gap-1.5 rounded-xl border border-[#ead9cd] px-3 py-2 text-xs font-bold text-[#765f53] aria-pressed:bg-[#a84921] aria-pressed:text-white"><Icon className="h-3.5 w-3.5" />{INTERNSHIP_REGION_LABELS[id]} <span className="opacity-70">{counts.get(id)}</span></button>)}</div><div className="mt-2 flex flex-wrap items-center gap-2"><span className="mr-1 text-xs font-bold text-[#80695e]">働き方</span><button type="button" aria-pressed={fullRemoteOnly} onClick={() => setFullRemoteOnly((current) => !current)} className="inline-flex items-center gap-1.5 rounded-xl border border-[#ead9cd] px-3 py-2 text-xs font-bold text-[#765f53] aria-pressed:bg-[#43281a] aria-pressed:text-white"><Monitor className="h-3.5 w-3.5" />フルリモート可のみ <span className="opacity-70">{internships.filter((item) => item.fullRemote).length}</span></button><span className="text-[11px] text-[#92796d]">一部リモート可は含めません</span></div><label className="mt-3 flex max-w-xl items-center gap-2 rounded-xl border border-[#ead9cd] bg-[#fffdfb] px-3 text-[#80695e]"><Search className="h-4 w-4 shrink-0" /><span className="sr-only">企業名・技術・キーワードで検索</span><input className="h-10 w-full bg-transparent text-sm text-[#332118] outline-none placeholder:text-[#a59084]" type="search" value={query} onChange={(event) => setQuery(event.target.value)} placeholder="企業名・技術・キーワードで探す" /></label></section>
    {visible.length === 0 ? <section className="mt-5 rounded-[24px] border border-dashed border-border bg-background px-6 py-14 text-center shadow-sm"><Radar className="mx-auto h-8 w-8 text-[hsl(var(--accent))]" /><h2 className="mt-4 text-xl font-semibold">条件に合う募集はありません。</h2><p className="mx-auto mt-2 max-w-lg text-sm leading-6 text-muted-foreground">場所や検索条件を広げると、ほかの技術インターンを確認できます。</p></section> : <section className="mt-5 grid gap-3 sm:grid-cols-2 xl:grid-cols-3 2xl:grid-cols-4">{visible.map((item) => { const visual = visualFor(item.title, item.summary); const Icon = visual.icon; const tags = tagsFor(item.title, item.summary); return <article key={item.id} className="group relative flex min-h-[258px] flex-col overflow-hidden rounded-[20px] border border-border bg-background p-4 shadow-[0_8px_24px_rgba(74,40,22,0.05)] transition hover:-translate-y-0.5 hover:shadow-[0_14px_30px_rgba(74,40,22,0.10)]"><div className={`absolute right-[-20px] top-[-20px] h-24 w-24 rounded-full ${visual.surfaceClass} opacity-70`} /><div className="relative flex items-center justify-between gap-2"><div className="flex min-w-0 items-center gap-2.5"><div className={`grid h-10 w-10 shrink-0 place-items-center rounded-xl ${visual.surfaceClass} ${visual.iconClass}`}><Icon className="h-5 w-5" /></div><div className="min-w-0"><p className="truncate text-sm font-bold text-[#3d2a20]">{item.company}</p><p className="mt-0.5 flex items-center gap-1 text-[11px] text-[#8c7569]"><BadgeCheck className="h-3.5 w-3.5 text-[#cf6a36]" />公式採用</p></div></div><span className="shrink-0 rounded-full bg-[#faf6f3] px-2 py-1 text-[11px] font-medium text-[#80695e]">{compactDate(item.checkedAt)}確認</span></div><h2 className="relative mt-3 text-[16px] font-bold leading-snug tracking-tight text-[#332118]">{item.title}</h2><div className="relative mt-3 grid grid-cols-2 gap-2"><div className="rounded-xl bg-[#faf8f6] px-2.5 py-2"><p className="text-[10px] font-medium text-[#92796d]">領域</p><p className={`mt-0.5 text-xs font-bold ${visual.iconClass}`}>{visual.label}</p></div><div className="rounded-xl bg-[#faf8f6] px-2.5 py-2"><p className="text-[10px] font-medium text-[#92796d]">形式</p><p className="mt-0.5 text-xs font-bold text-[#3d2a20]">{workStyle(item.title, item.summary)}</p></div></div><div className="relative mt-2 flex min-h-6 flex-wrap gap-1.5"><span className="rounded-full bg-[#fff0e4] px-2 py-0.5 text-[11px] font-bold text-[#a84921]">{INTERNSHIP_REGION_LABELS[item.region]}</span>{item.fullRemote && <span className="rounded-full bg-[#ede9fe] px-2 py-0.5 text-[11px] font-bold text-[#6d48a2]">フルリモート可</span>}{tags.length > 0 ? tags.slice(0, 2).map((tag) => <span key={tag} className="rounded-full border border-[#eeded4] bg-[#fffaf7] px-2 py-0.5 text-[11px] font-medium text-[#80695e]">{tag}</span>) : <span className="rounded-full border border-[#eeded4] bg-[#fffaf7] px-2 py-0.5 text-[11px] font-medium text-[#80695e]">技術職</span>}</div><div className="relative mt-auto border-t border-[#f1e7e1] pt-3"><a href={item.url} target="_blank" rel="noreferrer" className="flex items-center justify-between rounded-xl bg-[#43281a] px-3 py-2.5 text-sm font-semibold text-white transition hover:bg-[#5a3522]"><span>公式ページを見る</span><ArrowUpRight className="h-4 w-4" /></a></div></article>; })}</section>}
    {visible.length > 0 && <p className="mt-5 flex items-center justify-center gap-1.5 text-xs text-muted-foreground"><CalendarDays className="h-3.5 w-3.5" />募集の可否・締切は、開いた公式ページで最終確認</p>}
  </div>;
}
