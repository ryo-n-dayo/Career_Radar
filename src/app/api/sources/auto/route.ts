import { revalidatePath } from "next/cache";
import { NextResponse } from "next/server";

import { suggestXQueryTerms, type FeedbackExample } from "@/features/sources/learning";
import { effectiveIncludeKeywords } from "@/features/sources/preferences";
import { getInterestProfile } from "@/features/sources/server/interestProfile";
import { scanAllSources } from "@/features/sources/server/runScan";
import { getXApiConfig } from "@/features/x/server/config";
import { prisma } from "@/lib/prisma";

const PERSONALIZED_FEED_URL = "https://dailynews.local/personalized-x-feed";
const TECH_EVENT_DISCOVERY_FEED_URL = "https://dailynews.local/student-event-discovery-feed";
const LEARNING_BENEFIT_DISCOVERY_FEED_URL = "https://dailynews.local/learning-benefit-discovery-feed";
const RECRUITING_MEETUP_FEED_URL = "https://dailynews.local/recruiting-meetup-feed";
const CORPORATE_FILTER_VERSION = "企業・技術イベント探索フィルターv4";

async function feedbackExamples(): Promise<FeedbackExample[]> {
  const rows = await prisma.candidate.findMany({
    where: { status: { in: ["REVIEWED", "IGNORED"] } },
    select: { sourceId: true, title: true, summary: true, status: true, feedbackValue: true, feedbackReason: true },
    orderBy: { detectedAt: "desc" },
    take: 500
  });
  return rows.map((row) => ({ sourceId: row.sourceId, text: `${row.title} ${row.summary ?? ""}`, relevant: row.status === "REVIEWED", value: row.feedbackValue, reason: row.feedbackReason }));
}

/** 個人の判定履歴に基づく、公式X API検索フィードを作成・更新する。 */
export async function POST() {
  const config = getXApiConfig();
  if (!config.enabled || !config.bearerToken) return NextResponse.json({ error: "X APIを有効にすると、あなた向けの自動フィードを作成できます" }, { status: 400 });

  const [examples, profile] = await Promise.all([feedbackExamples(), getInterestProfile()]);
  const terms = suggestXQueryTerms({
    examples,
    includeKeywords: effectiveIncludeKeywords(profile),
    excludeKeywords: profile.excludeKeywords,
    fallback: config.keywords
  });
  const existing = await prisma.watchSource.findMany({
    where: { url: { in: [PERSONALIZED_FEED_URL, TECH_EVENT_DISCOVERY_FEED_URL, LEARNING_BENEFIT_DISCOVERY_FEED_URL, RECRUITING_MEETUP_FEED_URL] } },
    select: { url: true, notes: true }
  });
  // 旧来の広い検索結果を引き継がず、企業一次情報フィルター導入後の最初の実行だけ最新窓を取り直す。
  const knownNotes = new Map(existing.map((source) => [source.url, source.notes]));
  const shouldRefresh = (url: string) => Boolean(knownNotes.has(url) && !knownNotes.get(url)?.includes(CORPORATE_FILTER_VERSION));
  const source = await prisma.watchSource.upsert({
    where: { url: PERSONALIZED_FEED_URL },
    update: {
      name: "あなた向けXフィード",
      kind: "X_ALGO",
      enabled: true,
      confirmedAt: new Date(),
      notes: `自動選定語: ${terms.join("、")}／${CORPORATE_FILTER_VERSION}`,
      ...(shouldRefresh(PERSONALIZED_FEED_URL) ? { lastExternalId: null } : {})
    },
    create: {
      name: "あなた向けXフィード",
      url: PERSONALIZED_FEED_URL,
      kind: "X_ALGO",
      enabled: true,
      confirmedAt: new Date(),
      notes: `自動選定語: ${terms.join("、")}／${CORPORATE_FILTER_VERSION}`,
      lastStatus: "PENDING"
    }
  });
  const techEventSource = await prisma.watchSource.upsert({
    where: { url: TECH_EVENT_DISCOVERY_FEED_URL },
    update: {
      name: "技術イベント発見",
      kind: "X_ALGO_TECH_EVENT",
      enabled: true,
      confirmedAt: new Date(),
      notes: `自動選定語: ${terms.join("、")}／${CORPORATE_FILTER_VERSION}`,
      ...(shouldRefresh(TECH_EVENT_DISCOVERY_FEED_URL) ? { lastExternalId: null } : {})
    },
    create: {
      name: "技術イベント発見",
      url: TECH_EVENT_DISCOVERY_FEED_URL,
      kind: "X_ALGO_TECH_EVENT",
      enabled: true,
      confirmedAt: new Date(),
      notes: `自動選定語: ${terms.join("、")}／${CORPORATE_FILTER_VERSION}`,
      lastStatus: "PENDING"
    }
  });
  const learningBenefitSource = await prisma.watchSource.upsert({
    where: { url: LEARNING_BENEFIT_DISCOVERY_FEED_URL },
    update: {
      name: "ITニュース発見",
      kind: "X_ALGO_LEARNING_BENEFIT",
      enabled: true,
      confirmedAt: new Date(),
      notes: `自動選定語: ${terms.join("、")}／公式アカウントの技術更新・セキュリティ情報・資格特典だけを確認`
    },
    create: {
      name: "ITニュース発見",
      url: LEARNING_BENEFIT_DISCOVERY_FEED_URL,
      kind: "X_ALGO_LEARNING_BENEFIT",
      enabled: true,
      confirmedAt: new Date(),
      notes: `自動選定語: ${terms.join("、")}／公式アカウントの技術更新・セキュリティ情報・資格特典だけを確認`,
      lastStatus: "PENDING"
    }
  });
  // 採用Meet Up専用フィードは技術イベント発見に統合する。履歴は残し、今後の重複取得だけ止める。
  await prisma.watchSource.updateMany({
    where: { url: RECRUITING_MEETUP_FEED_URL },
    data: { enabled: false, notes: "技術イベント発見に統合（履歴保存のみ）" }
  });

  // recent search は1回10件以上が必須。個人向けは毎日10件、残り10件は
  // 技術イベントとITニュースのうち、最も長く未更新のフィードへ割り当てる。
  const discoverySource = [techEventSource, learningBenefitSource]
    .sort((a, b) => (a.lastSuccessAt?.getTime() ?? 0) - (b.lastSuccessAt?.getTime() ?? 0))[0];
  const results = [...await scanAllSources(source.id), ...await scanAllSources(discoverySource.id)];
  const created = results.reduce((sum, result) => sum + result.created, 0);
  revalidatePath("/"); revalidatePath("/feed"); revalidatePath("/sources");
  return NextResponse.json({ created, terms });
}
