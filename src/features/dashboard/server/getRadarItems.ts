import { prisma } from "@/lib/prisma";
import { DEFAULT_USER_ID } from "@/lib/defaultUser";
import type { SourceInfo } from "@/types/source";
import type {
  CompanyProfile,
  DeadlineLabel,
  JointParticipant,
  RadarCategory,
  RadarItem,
  Trust
} from "../types/radarItem";

const CATEGORY_TO_RADAR: Record<string, RadarCategory> = {
  INTERN: "インターン",
  EARLY_SELECTION: "選考",
  SEMINAR: "説明会",
  FULL_TIME: "選考",
  INFO_SESSION: "説明会"
};

function toIsoDate(date: Date): string {
  return date.toISOString().slice(0, 10);
}

function toSourceInfo(raw: unknown): SourceInfo[] {
  if (!Array.isArray(raw)) return [];
  return (raw as Array<{ type: SourceInfo["type"]; url: string; fetchedAt: string }>).map((s) => ({
    type: s.type,
    url: s.url,
    fetchedAt: new Date(s.fetchedAt)
  }));
}

export async function getRadarItems(): Promise<RadarItem[]> {
  const events = await prisma.event.findMany({
    where: { userId: DEFAULT_USER_ID },
    include: {
      company: true,
      participants: { include: { company: true } }
    },
    orderBy: { deadline: "asc" }
  });

  const companyIds = events.map((e) => e.companyId).filter((id): id is string => Boolean(id));
  const xPosts = await prisma.post.findMany({
    where: { userId: DEFAULT_USER_ID, source: "X", companyId: { in: companyIds } }
  });
  const xPostsByCompany = new Map<string, typeof xPosts>();
  for (const post of xPosts) {
    if (!post.companyId) continue;
    const list = xPostsByCompany.get(post.companyId) ?? [];
    list.push(post);
    xPostsByCompany.set(post.companyId, list);
  }

  return events.map((event) => {
    const companyId = event.companyId;
    const insights = companyId ? xPostsByCompany.get(companyId) ?? [] : [];

    const participants: JointParticipant[] = event.participants.map((p) => ({
      companyName: p.company.name,
      role: p.role as JointParticipant["role"],
      companyProfile: (p.company.profile as CompanyProfile | null) ?? undefined
    }));

    const item: RadarItem = {
      id: event.id,
      companyName: event.company?.name ?? event.title,
      category: CATEGORY_TO_RADAR[event.category] ?? "選考",
      content: event.content ?? event.title,
      date: toIsoDate(event.deadline ?? event.startsAt ?? event.createdAt),
      deadlineLabel: (event.deadlineLabel as DeadlineLabel) ?? "締切",
      aiHeat: event.aiHeat ?? 0,
      keywords: Array.isArray(event.keywords) ? (event.keywords as string[]) : [],
      sources: toSourceInfo(event.sources),
      trust: (event.trust as Trust) ?? "needs_review",
      saved: event.status === "BOOKMARKED",
      isJoint: participants.length > 0,
      participants: participants.length > 0 ? participants : undefined,
      xInsights: insights.length
        ? insights.map((p) => ({
            author: p.author ?? "匿名",
            role: "",
            date: toIsoDate(p.postedAt ?? p.createdAt),
            message: p.content ?? ""
          }))
        : undefined,
      companyProfile: (event.company?.profile as CompanyProfile | null) ?? undefined
    };

    return item;
  });
}
