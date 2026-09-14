import { WorkspaceShell } from "@/components/workspace/WorkspaceShell";
import { JobHuntingBoard } from "@/features/jobHunting/JobHuntingBoard";
import { graduationLabel, jobFocus, jobTrack } from "@/features/jobHunting/model";
import { isEligibleGraduationWindow } from "@/features/sources/scoring";
import { prisma } from "@/lib/prisma";

export const dynamic = "force-dynamic";

export default async function JobHuntingPage() {
  const now = new Date();
  const rows = await prisma.candidate.findMany({
    where: { source: { kind: "NEW_GRAD" }, isActive: true, OR: [{ deadline: null }, { deadline: { gte: now } }] },
    include: { source: { include: { company: true } } },
    orderBy: [{ score: "desc" }, { lastSeenAt: "desc" }, { detectedAt: "desc" }]
  });
  const jobs = rows.filter((item) => isEligibleGraduationWindow(`${item.title} ${item.summary ?? ""}`)).map((item) => ({
    id: item.id, title: item.title, summary: item.summary ?? undefined, url: item.url,
    company: item.source.company?.name ?? item.source.name.split("｜")[0],
    checkedAt: (item.lastSeenAt ?? item.detectedAt).toISOString(),
    track: jobTrack(item.title, item.summary), graduation: graduationLabel(item.title, item.summary), focus: jobFocus(item.title, item.summary)
  }));
  return <WorkspaceShell><JobHuntingBoard jobs={jobs} /></WorkspaceShell>;
}
