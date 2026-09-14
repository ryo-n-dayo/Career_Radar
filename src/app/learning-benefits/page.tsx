import { WorkspaceShell } from "@/components/workspace/WorkspaceShell";
import { LearningBenefitBoard } from "@/features/learningBenefits/LearningBenefitBoard";
import { isUsefulITNews } from "@/features/sources/scoring";
import { isVisibleInPersonalFeed } from "@/features/x/candidateVisibility";
import { prisma } from "@/lib/prisma";

export const dynamic = "force-dynamic";

export default async function LearningBenefitsPage() {
  const now = new Date();
  const rows = await prisma.candidate.findMany({
    where: {
      isActive: true,
      OR: [{ deadline: null }, { deadline: { gte: now } }],
      source: { kind: { in: ["TECH_BENEFITS", "TECH_NEWS", "X_ALGO_LEARNING_BENEFIT"] } }
    },
    include: { source: true },
    orderBy: [{ score: "desc" }, { lastSeenAt: "desc" }, { detectedAt: "desc" }]
  });
  const seen = new Set<string>();
  const benefits = rows.filter((item) => {
    if (seen.has(item.url) || !isVisibleInPersonalFeed(item) || !isUsefulITNews(`${item.title} ${item.summary ?? ""}`)) return false;
    seen.add(item.url);
    return true;
  }).map((item) => ({
    id: item.id,
    title: item.title,
    summary: item.summary ?? undefined,
    url: item.url,
    sourceName: item.source.name,
    sourceKind: item.source.kind,
    deadline: item.deadline?.toISOString(),
    checkedAt: (item.lastSeenAt ?? item.detectedAt).toISOString()
  }));
  return <WorkspaceShell><LearningBenefitBoard benefits={benefits} /></WorkspaceShell>;
}
