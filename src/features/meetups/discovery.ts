import { isVisibleInPersonalFeed } from "@/features/x/candidateVisibility";
import { isAllowedTechEventLocation, isTechEventRecord } from "@/features/x/recruitingMeetup";

type MeetupCandidate = {
  status: string;
  reasons: unknown;
  title: string;
  summary?: string | null;
  source: { kind: string; name: string; notes?: string | null };
};

/** The same conservative conditions drive both the event page and its home-screen count. */
export function isDiscoverableMeetup(candidate: MeetupCandidate): boolean {
  return candidate.status !== "IGNORED"
    && isVisibleInPersonalFeed(candidate)
    && isTechEventRecord(candidate)
    && isAllowedTechEventLocation({
      title: candidate.title,
      summary: candidate.summary,
      sourceName: candidate.source.name,
      sourceNotes: candidate.source.notes,
      sourceKind: candidate.source.kind
    });
}
