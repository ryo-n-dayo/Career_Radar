"use client";

import { useMemo, useState } from "react";
import { ArrowUpRight, BadgeCheck, BriefcaseBusiness, Code2, Cpu, Search, ShieldCheck, Sparkles, type LucideIcon } from "lucide-react";

import { type JobTrack } from "./model";

type JobItem = { id: string; title: string; summary?: string; url: string; company: string; checkedAt: string; track: JobTrack; graduation: string; focus: string };
type Visual = { Icon: LucideIcon; label: string; surface: string; text: string };

function visualFor(item: JobItem): Visual {
  if (/AI|Data/i.test(item.focus)) return { Icon: Sparkles, label: "AI・データ", surface: "bg-[#f2edff]", text: "text-[#7047b8]" };
  if (/Cloud|Architecture/i.test(item.focus)) return { Icon: Cpu, label: "クラウド", surface: "bg-[#eaf2ff]", text: "text-[#2864b2]" };
  if (/Security/i.test(item.focus)) return { Icon: ShieldCheck, label: "セキュリティ", surface: "bg-[#e9f8f0]", text: "text-[#1f7a53]" };
  return { Icon: Code2, label: "開発", surface: "bg-[#fff0e7]", text: "text-[#c7501b]" };
}

function checkedAt(value: string): string {
  return new Intl.DateTimeFormat("ja-JP", { month: "numeric", day: "numeric", hour: "2-digit", minute: "2-digit" }).format(new Date(value));
}

export function JobHuntingBoard({ jobs }: { jobs: JobItem[] }) {
  const [track, setTrack] = useState<JobTrack | "all">("all");
  const [query, setQuery] = useState("");
  const visible = useMemo(() => {
    const terms = query.normalize("NFKC").toLocaleLowerCase("ja-JP").trim().split(/\s+/).filter(Boolean);
    return jobs.filter((job) => (track === "all" || job.track === track) && terms.every((term) => `${job.title} ${job.summary ?? ""} ${job.company} ${job.focus}`.toLocaleLowerCase("ja-JP").includes(term)));
  }, [jobs, query, track]);
  const newGraduateCount = jobs.filter((job) => job.track === "newGraduate").length;
  const earlyCareerCount = jobs.filter((job) => job.track === "earlyCareer").length;

  return <div className="mx-auto max-w-[1600px] px-5 py-6 sm:px-7 sm:py-8">
    <header className="rounded-[26px] border border-[#f0ded3] bg-[#fffaf6] px-6 py-6 shadow-[0_12px_40px_rgba(93,49,23,0.06)] sm:px-8">
      <div className="flex flex-wrap items-end justify-between gap-5"><div><div className="inline-flex items-center gap-2 rounded-full bg-white px-3 py-1.5 text-xs font-bold tracking-[0.12em] text-[#b75020] shadow-sm"><BriefcaseBusiness className="h-3.5 w-3.5" />OFFICIAL JOB BOARD</div><h1 className="mt-3 text-3xl font-semibold tracking-tight text-[#332118] sm:text-4xl">就活</h1><p className="mt-1 text-sm text-[#80695e]">2028年9月までに学位取得見込みの方と、以後の技術職募集を公式ページから確認</p></div><div className="flex items-center gap-3 rounded-2xl bg-white px-4 py-3 shadow-sm"><div className="grid h-10 w-10 place-items-center rounded-xl bg-[#fff0e7] text-[#c7501b]"><BadgeCheck className="h-5 w-5" /></div><div><div className="text-2xl font-bold leading-none text-[#332118] tabular-nums">{visible.length}</div><div className="mt-1 text-xs text-[#80695e]">表示中 / 全{jobs.length}件</div></div></div></div>
    </header>

    <section className="mt-4 rounded-2xl border border-[#eee1d8] bg-white/80 p-3 sm:p-4" aria-label="就活募集の絞り込み"><div className="flex flex-wrap items-center gap-2"><span className="mr-1 text-xs font-bold text-[#80695e]">対象</span><button type="button" aria-pressed={track === "all"} onClick={() => setTrack("all")} className="rounded-xl border border-[#ead9cd] px-3 py-2 text-xs font-bold text-[#765f53] aria-pressed:bg-[#a84921] aria-pressed:text-white">すべて <span className="ml-1 opacity-70">{jobs.length}</span></button><button type="button" aria-pressed={track === "newGraduate"} onClick={() => setTrack("newGraduate")} className="rounded-xl border border-[#ead9cd] px-3 py-2 text-xs font-bold text-[#765f53] aria-pressed:bg-[#a84921] aria-pressed:text-white">新卒 <span className="ml-1 opacity-70">{newGraduateCount}</span></button><button type="button" aria-pressed={track === "earlyCareer"} onClick={() => setTrack("earlyCareer")} className="rounded-xl border border-[#ead9cd] px-3 py-2 text-xs font-bold text-[#765f53] aria-pressed:bg-[#a84921] aria-pressed:text-white">第二新卒・既卒 <span className="ml-1 opacity-70">{earlyCareerCount}</span></button></div><label className="mt-3 flex max-w-xl items-center gap-2 rounded-xl border border-[#ead9cd] bg-[#fffdfb] px-3 text-[#80695e]"><Search className="h-4 w-4 shrink-0" /><span className="sr-only">企業名・職種・技術で検索</span><input className="h-10 w-full bg-transparent text-sm text-[#332118] outline-none placeholder:text-[#a59084]" type="search" value={query} onChange={(event) => setQuery(event.target.value)} placeholder="企業名・職種・技術で探す" /></label></section>

    {visible.length === 0 ? <section className="mt-5 rounded-[24px] border border-dashed border-border bg-background px-6 py-14 text-center"><BriefcaseBusiness className="mx-auto h-8 w-8 text-[hsl(var(--accent))]" /><h2 className="mt-4 text-xl font-semibold">条件に合う技術職はありません。</h2><p className="mx-auto mt-2 max-w-lg text-sm leading-6 text-muted-foreground">公式採用ページを追加すると、次回の収集からここに表示します。</p></section> : <section className="mt-5 grid gap-3 sm:grid-cols-2 xl:grid-cols-3 2xl:grid-cols-4">{visible.map((item) => { const visual = visualFor(item); const Icon = visual.Icon; return <article key={item.id} className="relative flex min-h-[270px] flex-col overflow-hidden rounded-[20px] border border-border bg-background p-4 shadow-[0_8px_24px_rgba(74,40,22,0.05)] transition hover:-translate-y-0.5 hover:shadow-[0_14px_30px_rgba(74,40,22,0.10)]"><div className={`absolute right-[-20px] top-[-20px] h-24 w-24 rounded-full ${visual.surface} opacity-70`} /><div className="relative flex items-center gap-2.5"><div className={`grid h-10 w-10 shrink-0 place-items-center rounded-xl ${visual.surface} ${visual.text}`}><Icon className="h-5 w-5" /></div><div className="min-w-0"><p className="truncate text-sm font-bold text-[#3d2a20]">{item.company}</p><p className="mt-0.5 flex items-center gap-1 text-[11px] text-[#8c7569]"><BadgeCheck className="h-3.5 w-3.5 text-[#cf6a36]" />公式採用</p></div></div><h2 className="relative mt-3 text-[16px] font-bold leading-snug tracking-tight text-[#332118]">{item.title}</h2><div className="relative mt-3 grid grid-cols-2 gap-2"><div className="rounded-xl bg-[#faf8f6] px-2.5 py-2"><p className="text-[10px] font-medium text-[#92796d]">職種領域</p><p className={`mt-0.5 truncate text-xs font-bold ${visual.text}`}>{item.focus}</p></div><div className="rounded-xl bg-[#faf8f6] px-2.5 py-2"><p className="text-[10px] font-medium text-[#92796d]">対象</p><p className="mt-0.5 text-xs font-bold text-[#3d2a20]">{item.graduation}</p></div></div><div className="relative mt-2 flex flex-wrap gap-1.5"><span className="rounded-full bg-[#fff0e4] px-2 py-0.5 text-[11px] font-bold text-[#a84921]">{item.track === "newGraduate" ? "新卒" : "第二新卒・既卒"}</span><span className={`rounded-full px-2 py-0.5 text-[11px] font-bold ${visual.surface} ${visual.text}`}>{visual.label}</span></div><p className="relative mt-3 text-[11px] text-[#8c7569]">取得 {checkedAt(item.checkedAt)}</p><div className="relative mt-auto border-t border-[#f1e7e1] pt-3"><a href={item.url} target="_blank" rel="noreferrer" className="flex items-center justify-between rounded-xl bg-[#43281a] px-3 py-2.5 text-sm font-semibold text-white transition hover:bg-[#5a3522]"><span>公式募集を見る</span><ArrowUpRight className="h-4 w-4" /></a></div></article>; })}</section>}
    <p className="mt-5 text-center text-xs text-muted-foreground">「2028年9月までに学位取得見込み」の明記を確認します。卒業年だけの表記は対象時期を確認できないため表示しません。</p>
  </div>;
}
