import { WorkspaceShell } from "@/components/workspace/WorkspaceShell";
import { MeetupBoard } from "@/features/meetups/MeetupBoard";
import { EMPTY_PLAN, type MeetupItem } from "@/features/meetups/model";
import { isDiscoverableMeetup } from "@/features/meetups/discovery";
import { getInterestProfile } from "@/features/sources/server/interestProfile";
import { techEventDetails } from "@/features/x/recruitingMeetup";
import { prisma } from "@/lib/prisma";

export const dynamic = "force-dynamic";

export default async function MeetupsPage() {
  const [rows, profile, plans] = await Promise.all([
    prisma.candidate.findMany({
      where: { source: { kind: { in: ["X_ALGO_TECH_EVENT", "TECH_EVENTS"] } } },
      include: { source: true },
      // Deduplicate by URL using the latest collected content, before client-side filters.
      orderBy: [{ detectedAt: "desc" }, { id: "asc" }]
    }),
    getInterestProfile(),
    prisma.meetupPlan.findMany({ select: { url: true, saved: true, people: true, talks: true } })
  ]);
  const planByUrl = new Map(plans.map((plan) => [plan.url, plan]));
  const seen = new Set<string>();
  const events: MeetupItem[] = rows.filter((item) => {
    if (seen.has(item.url)) return false;
    seen.add(item.url);
    if (planByUrl.get(item.url)?.saved) return true;
    return isDiscoverableMeetup(item);
  })
    .map((item) => {
      const details = techEventDetails(`${item.title} ${item.summary ?? ""}`);
      return {
        id: item.id,
        title: item.title,
        summary: item.summary ?? undefined,
        url: item.url,
        score: item.score,
        sourceName: item.source.name,
        sourceKind: item.source.kind,
        schedule: details.schedule,
        place: details.place,
        detectedAt: item.detectedAt.toISOString(),
        checkedAt: (item.source.lastCheckedAt ?? item.detectedAt).toISOString(),
        plan: planByUrl.get(item.url) ?? EMPTY_PLAN
      };
    });

  return <WorkspaceShell><MeetupBoard events={events} preference={{ eventTopics: profile.eventTopics, eventPeople: profile.eventPeople, eventTalks: profile.eventTalks }} /></WorkspaceShell>;
}
