import { profileFromRow, type InterestProfile } from "@/features/sources/preferences";
import { prisma } from "@/lib/prisma";

export async function getInterestProfile(): Promise<InterestProfile> {
  const row = await prisma.interestProfile.findUnique({
    where: { id: "personal" },
    select: { includeKeywords: true, excludeKeywords: true, selectedTopics: true, topicHistory: true, eventTopics: true, eventPeople: true, eventTalks: true, updatedAt: true }
  });
  return profileFromRow(row);
}
