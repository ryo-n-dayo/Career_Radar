import { revalidatePath } from "next/cache";
import { NextRequest, NextResponse } from "next/server";

import { normalizeEventTopics, normalizeKeywords } from "@/features/sources/preferences";
import { prisma } from "@/lib/prisma";

/** Xフィードとは別に、技術イベントを選ぶ条件だけを更新する。 */
export async function PATCH(request: NextRequest) {
  const body = await request.json().catch(() => null) as Record<string, unknown> | null;
  if (!body) return NextResponse.json({ error: "設定内容が不正です" }, { status: 400 });

  const eventTopics = normalizeEventTopics(body.eventTopics);
  const eventPeople = normalizeKeywords(body.eventPeople);
  const eventTalks = normalizeKeywords(body.eventTalks);
  const profile = await prisma.interestProfile.upsert({
    where: { id: "personal" },
    create: { id: "personal", eventTopics, eventPeople, eventTalks },
    update: { eventTopics, eventPeople, eventTalks }
  });

  // 技術イベント用のX検索語だけを次回更新する。通常の企業フィードは巻き戻さない。
  await prisma.watchSource.updateMany({ where: { kind: "X_ALGO_TECH_EVENT" }, data: { lastExternalId: null } });
  revalidatePath("/meetups");
  revalidatePath("/sources");
  return NextResponse.json({
    eventTopics: normalizeEventTopics(profile.eventTopics),
    eventPeople: normalizeKeywords(profile.eventPeople),
    eventTalks: normalizeKeywords(profile.eventTalks)
  });
}
