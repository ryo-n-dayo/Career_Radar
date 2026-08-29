import { PrismaClient, EventCategory, PostSource } from "@prisma/client";
import { radarItems } from "../src/features/dashboard/mock/radarItems.legacy";
import type { RadarCategory, DeadlineLabel, CompanyProfile } from "../src/features/dashboard/types/radarItem";
import { DEFAULT_USER_ID, DEFAULT_USER_EMAIL } from "../src/lib/defaultUser";

const prisma = new PrismaClient();

function mapCategory(category: RadarCategory, deadlineLabel: DeadlineLabel): EventCategory {
  if (category === "インターン") return EventCategory.INTERN;
  if (category === "説明会") return EventCategory.INFO_SESSION;
  // category === "選考"
  return deadlineLabel === "早期選考" ? EventCategory.EARLY_SELECTION : EventCategory.FULL_TIME;
}

async function upsertCompanyByName(name: string, profile?: CompanyProfile, websiteUrl?: string) {
  const existing = await prisma.company.findFirst({ where: { name } });
  if (existing) {
    if (!existing.profile && profile) {
      await prisma.company.update({
        where: { id: existing.id },
        data: { profile: profile as object, officialUrl: existing.officialUrl ?? websiteUrl }
      });
    }
    return existing;
  }
  return prisma.company.create({
    data: {
      name,
      industry: profile?.industry,
      officialUrl: websiteUrl ?? profile?.website,
      profile: profile ? (profile as object) : undefined
    }
  });
}

async function main() {
  await prisma.user.upsert({
    where: { email: DEFAULT_USER_EMAIL },
    update: {},
    create: { id: DEFAULT_USER_ID, email: DEFAULT_USER_EMAIL, name: "Seed User" }
  });

  let eventCount = 0;
  let companyCount = 0;
  let postCount = 0;
  let participantCount = 0;

  for (const item of radarItems) {
    const company = await upsertCompanyByName(
      item.companyName,
      item.companyProfile,
      item.companyProfile?.website
    );
    companyCount++;

    const category = mapCategory(item.category, item.deadlineLabel);
    const deadline = new Date(item.date);

    await prisma.event.upsert({
      where: { id: item.id },
      update: {
        title: item.content,
        content: item.content,
        category,
        deadline,
        deadlineLabel: item.deadlineLabel,
        aiHeat: item.aiHeat,
        keywords: item.keywords,
        sources: item.sources as unknown as object,
        trust: item.trust,
        companyId: company.id
      },
      create: {
        id: item.id,
        userId: DEFAULT_USER_ID,
        companyId: company.id,
        category,
        title: item.content,
        content: item.content,
        deadline,
        deadlineLabel: item.deadlineLabel,
        aiHeat: item.aiHeat,
        keywords: item.keywords,
        sources: item.sources as unknown as object,
        trust: item.trust,
        status: item.saved ? "BOOKMARKED" : "TODO"
      }
    });
    eventCount++;

    if (item.isJoint && item.participants) {
      for (const participant of item.participants) {
        const participantCompany = await upsertCompanyByName(
          participant.companyName,
          participant.companyProfile,
          participant.companyProfile?.website
        );
        await prisma.eventParticipant.upsert({
          where: { eventId_companyId: { eventId: item.id, companyId: participantCompany.id } },
          update: { role: participant.role },
          create: { eventId: item.id, companyId: participantCompany.id, role: participant.role }
        });
        participantCount++;
      }
    }

    if (item.xInsights) {
      for (const [idx, insight] of item.xInsights.entries()) {
        const externalId = `mock_${item.id}_${idx}`;
        await prisma.post.upsert({
          where: { source_externalId: { source: PostSource.X, externalId } },
          update: {
            content: insight.message,
            author: insight.author,
            postedAt: new Date(insight.date)
          },
          create: {
            userId: DEFAULT_USER_ID,
            companyId: company.id,
            source: PostSource.X,
            externalId,
            author: insight.author,
            content: insight.message,
            postedAt: new Date(insight.date),
            isNew: false
          }
        });
        postCount++;
      }
    }
  }

  console.log("[migrate-mock-to-db] done", {
    eventCount,
    companyCount,
    postCount,
    participantCount
  });
}

main()
  .catch((e) => {
    console.error(e);
    process.exitCode = 1;
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
