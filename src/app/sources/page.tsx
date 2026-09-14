import { WorkspaceShell } from "@/components/workspace/WorkspaceShell";
import { SourceManager } from "@/features/sources/SourceManager";
import { getInterestProfile } from "@/features/sources/server/interestProfile";
import type { CandidateItem, SourceItem } from "@/features/sources/types";
import { getXApiBudgetStatus } from "@/features/x/server/config";
import { prisma } from "@/lib/prisma";

export const dynamic = "force-dynamic";

export default async function SourcesPage() {
  const [rows, candidateRows, companies, xApi, interestProfile, feedbackAggregate] = await Promise.all([
    prisma.watchSource.findMany({ where: { kind: { not: "DEMO" } }, include: { company: true }, orderBy: [{ kind: "asc" }, { name: "asc" }] }),
    prisma.candidate.findMany({ where: { status: "NEW" }, include: { source: true }, orderBy: [{ score: "desc" }, { detectedAt: "desc" }], take: 100 }),
    prisma.company.findMany({ select: { id: true, name: true }, orderBy: { name: "asc" } }),
    getXApiBudgetStatus(),
    getInterestProfile(),
    prisma.candidate.aggregate({ where: { feedbackValue: { not: null } }, _count: { id: true }, _avg: { feedbackValue: true } })
  ]);
  const sources: SourceItem[] = rows.map((source) => ({ id: source.id, name: source.name, url: source.url, kind: source.kind, lastStatus: source.lastStatus, lastError: source.lastError ?? undefined, lastCheckedAt: source.lastCheckedAt?.toISOString(), companyName: source.company?.name }));
  const candidates: CandidateItem[] = candidateRows.map((candidate) => ({ id: candidate.id, url: candidate.url, title: candidate.title, summary: candidate.summary ?? undefined, kind: candidate.kind, score: candidate.score, reasons: Array.isArray(candidate.reasons) ? candidate.reasons as string[] : [], deadline: candidate.deadline?.toISOString(), detectedAt: candidate.detectedAt.toISOString(), status: candidate.status, sourceName: candidate.source.name, sourceKind: candidate.source.kind }));

  const feedbackStats = { ratedCount: feedbackAggregate._count.id, averageValue: feedbackAggregate._avg.feedbackValue ?? 0 };
  return <WorkspaceShell><div className="mx-auto max-w-5xl px-5 py-8 sm:px-8 sm:py-12"><div className="mb-8"><p className="text-sm font-medium text-[hsl(var(--accent))]">収集設定</p><h1 className="mt-1 text-3xl font-semibold tracking-tight">届く投稿を整える。</h1><p className="mt-2 text-sm leading-6 text-muted-foreground">X APIの監視先と、自分向けに絞り込む条件をここで管理します。</p></div><SourceManager sources={sources} candidates={candidates} companies={companies} xApi={xApi} interestProfile={interestProfile} feedbackStats={feedbackStats} /></div></WorkspaceShell>;
}
