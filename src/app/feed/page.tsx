import { WorkspaceShell } from "@/components/workspace/WorkspaceShell";
import { FeedDeck } from "@/features/feed/FeedDeck";
import type { CandidateItem } from "@/features/sources/types";
import { applyLearning, type FeedbackExample } from "@/features/sources/learning";
import { isVisibleInPersonalFeed } from "@/features/x/candidateVisibility";
import { prisma } from "@/lib/prisma";

export const dynamic = "force-dynamic";

const X_SOURCE_KINDS = ["X_API", "X_ALGO", "X_ALGO_EVENT", "X_ALGO_MEETUP", "X_ALGO_TECH_EVENT", "X_ALGO_LEARNING_BENEFIT", "DEMO"];
const OFFICIAL_SOURCE_KINDS = ["CAREERS", "NEW_GRAD", "TECH_EVENTS", "TECH_BENEFITS", "TECH_NEWS"];

export default async function FeedPage() {
  const [xRows, officialRows, ratedRows] = await Promise.all([
    prisma.candidate.findMany({
      where: { status: "NEW", source: { kind: { in: X_SOURCE_KINDS } } },
      include: { source: true },
      orderBy: [{ score: "desc" }, { detectedAt: "desc" }],
      take: 20
    }),
    prisma.candidate.findMany({
      where: { status: "NEW", source: { kind: { in: OFFICIAL_SOURCE_KINDS } } },
      include: { source: true },
      orderBy: [{ score: "desc" }, { detectedAt: "desc" }],
      take: 20
    }),
    prisma.candidate.findMany({
      where: { feedbackValue: { not: null } },
      select: { sourceId: true, title: true, summary: true, status: true, feedbackValue: true, feedbackReason: true },
      orderBy: { detectedAt: "desc" },
      take: 500
    })
  ]);

  const examples: FeedbackExample[] = ratedRows.map((row) => ({
    sourceId: row.sourceId,
    text: `${row.title} ${row.summary ?? ""}`,
    relevant: row.status === "REVIEWED",
    value: row.feedbackValue,
    reason: row.feedbackReason
  }));
  const toItem = (candidate: (typeof xRows)[number]): CandidateItem => {
    const learned = applyLearning({
      baseScore: candidate.score,
      sourceId: candidate.sourceId,
      text: `${candidate.title} ${candidate.summary ?? ""}`,
      examples
    });
    return {
      id: candidate.id,
      url: candidate.url,
      title: candidate.title,
      summary: candidate.summary ?? undefined,
      content: candidate.content ?? undefined,
      kind: candidate.kind,
      score: learned.score,
      reasons: [...new Set([...(Array.isArray(candidate.reasons) ? candidate.reasons as string[] : []), ...learned.reasons])],
      deadline: candidate.deadline?.toISOString(),
      detectedAt: candidate.detectedAt.toISOString(),
      status: candidate.status,
      sourceName: candidate.source.name,
      sourceKind: candidate.source.kind
    };
  };
  const candidates = [...xRows.filter(isVisibleInPersonalFeed), ...officialRows]
    .map(toItem)
    .sort((left, right) => right.score - left.score || new Date(right.detectedAt).getTime() - new Date(left.detectedAt).getTime())
    .slice(0, 20);
  const feedbackStats = {
    ratedCount: ratedRows.length,
    averageValue: ratedRows.length === 0 ? 0 : ratedRows.reduce((sum, row) => sum + (row.feedbackValue ?? 0), 0) / ratedRows.length
  };

  return <WorkspaceShell><FeedDeck candidates={candidates} feedbackStats={feedbackStats} /></WorkspaceShell>;
}
