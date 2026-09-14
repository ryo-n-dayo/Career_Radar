import { revalidatePath } from "next/cache";
import { NextRequest, NextResponse } from "next/server";

import { normalizeKeywords, normalizeTopicHistory, normalizeTopics, sameTopics } from "@/features/sources/preferences";
import { prisma } from "@/lib/prisma";

export async function PATCH(request: NextRequest) {
  const body = await request.json().catch(() => null) as Record<string, unknown> | null;
  if (!body) return NextResponse.json({ error: "設定内容が不正です" }, { status: 400 });
  const includeKeywords = normalizeKeywords(body.includeKeywords);
  const excludeKeywords = normalizeKeywords(body.excludeKeywords);
  const selectedTopics = normalizeTopics(body.selectedTopics);
  const existing = await prisma.interestProfile.findUnique({
    where: { id: "personal" },
    select: { selectedTopics: true, topicHistory: true }
  });
  const previousTopics = normalizeTopics(existing?.selectedTopics);
  const history = normalizeTopicHistory(existing?.topicHistory);
  const topicHistory = selectedTopics.length > 0 && (!sameTopics(previousTopics, selectedTopics) || history.length === 0)
    ? [...history, { topicIds: selectedTopics, selectedAt: new Date().toISOString() }].slice(-20)
    : history;
  const profile = await prisma.interestProfile.upsert({
    where: { id: "personal" },
    create: { id: "personal", includeKeywords, excludeKeywords, selectedTopics, topicHistory, eventTopics: [], eventPeople: [], eventTalks: [] },
    update: { includeKeywords, excludeKeywords, selectedTopics, topicHistory }
  });
  // 話題を選び直したら、次の個人向け収集で現在の検索条件を使い直す。
  await prisma.watchSource.updateMany({ where: { kind: { in: ["X_ALGO", "X_ALGO_EVENT"] } }, data: { lastExternalId: null } });
  revalidatePath("/"); revalidatePath("/sources");
  return NextResponse.json({ includeKeywords: normalizeKeywords(profile.includeKeywords), excludeKeywords: normalizeKeywords(profile.excludeKeywords), selectedTopics: normalizeTopics(profile.selectedTopics), topicHistory: normalizeTopicHistory(profile.topicHistory) });
}
