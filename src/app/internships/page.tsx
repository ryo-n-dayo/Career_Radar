import { WorkspaceShell } from "@/components/workspace/WorkspaceShell";
import { InternshipBoard } from "@/features/internships/InternshipBoard";
import { internshipRegion, isFullRemoteEligible } from "@/features/internships/model";
import { prisma } from "@/lib/prisma";

export const dynamic = "force-dynamic";

export default async function InternshipsPage() {
  const now = new Date();
  const rows = await prisma.candidate.findMany({
    where: { source: { kind: "CAREERS" }, kind: "INTERNSHIP", isActive: true, OR: [{ deadline: null }, { deadline: { gte: now } }] },
    include: { source: { include: { company: true } } },
    orderBy: [{ score: "desc" }, { lastSeenAt: "desc" }, { detectedAt: "desc" }]
  });
  const internships = rows.map((item) => ({
    id: item.id,
    title: item.title,
    summary: item.summary ?? undefined,
    url: item.url,
    company: item.source.company?.name ?? item.source.name.split("｜")[0],
    checkedAt: (item.lastSeenAt ?? item.detectedAt).toISOString(),
    region: internshipRegion(item.title, item.summary, item.source.name),
    fullRemote: isFullRemoteEligible(item.title, item.summary, item.source.name)
  }));
  return <WorkspaceShell><InternshipBoard internships={internships} /></WorkspaceShell>;
}
