import { createHash } from "node:crypto";

import type { WatchSource } from "@prisma/client";

import { applyLearning, suggestXQueryTerms, type FeedbackExample } from "@/features/sources/learning";
import { applyEventInterestProfile, applyInterestProfile, effectiveIncludeKeywords, eventInterestKeywords, type InterestProfile } from "@/features/sources/preferences";
import { isEngineeringInternship, isUsefulITNews, scoreCandidate } from "@/features/sources/scoring";
import { getInterestProfile } from "@/features/sources/server/interestProfile";
import { prisma } from "@/lib/prisma";
import { getXApiBudgetStatus, getXApiConfig, POST_READ_COST_USD, tokyoDateKey } from "./config";
import { assessCorporatePost, type XAuthor } from "./organizationFilter";
import { directCareerUrl } from "./publicCareerLink";
import { isTechGrowthEvent } from "../recruitingMeetup";

type XPost = {
  id: string;
  text: string;
  author_id?: string;
  created_at?: string;
  entities?: { urls?: Array<{ expanded_url?: string; unwound_url?: string }> };
};

function digest(value: string): string {
  return createHash("sha256").update(value).digest("hex");
}

function handleFromUrl(url: string): string | undefined {
  try {
    const parsed = new URL(url);
    if (!["x.com", "twitter.com"].some((host) => parsed.hostname === host || parsed.hostname.endsWith(`.${host}`))) return undefined;
    const handle = parsed.pathname.split("/").filter(Boolean)[0];
    return handle && /^[A-Za-z0-9_]{1,15}$/.test(handle) ? handle : undefined;
  } catch {
    return undefined;
  }
}

async function feedbackExamples(): Promise<FeedbackExample[]> {
  const rows = await prisma.candidate.findMany({
    where: { status: { in: ["REVIEWED", "IGNORED"] } },
    select: { sourceId: true, title: true, summary: true, status: true, feedbackValue: true, feedbackReason: true },
    orderBy: { detectedAt: "desc" },
    take: 500
  });
  return rows.map((row) => ({ sourceId: row.sourceId, text: `${row.title} ${row.summary ?? ""}`, relevant: row.status === "REVIEWED", value: row.feedbackValue, reason: row.feedbackReason }));
}

function queryForHandle(handle: string, keywords: string[], profile: InterestProfile): string {
  const terms = keywords.map((keyword) => `"${keyword.replaceAll('"', "")}"`).join(" OR ");
  const preferences = effectiveIncludeKeywords(profile).map((keyword) => `"${keyword.replaceAll('"', "")}"`).join(" OR ");
  return `from:${handle} (${terms})${preferences ? ` (${preferences})` : ""} -is:retweet -is:reply`;
}

function queryForPersonalizedFeed(terms: string[]): string {
  const quoted = terms.map((term) => `"${term.replaceAll('"', "")}"`).join(" OR ");
  const technical = ["エンジニア", "開発", "AI", "クラウド", "データ", "セキュリティ", "OSS", "ソフトウェア"]
    .map((term) => `"${term}"`)
    .join(" OR ");
  const corporate = ["採用", "募集", "インターン", "説明会", "ハッカソン", "技術イベント", "ミートアップ", "勉強会", "ワークショップ", "リリース", "提供開始", "新機能", "アップデート", "脆弱性", "セキュリティ情報"]
    .map((term) => `"${term}"`)
    .join(" OR ");
  return `(${quoted}) (${technical}) (${corporate}) -is:retweet -is:reply lang:ja`;
}

export function queryForTechEventDiscovery(terms: string[], profile: InterestProfile): string {
  // X APIの検索式には長さ制限がある。関心語を際限なく足すと400になり、
  // 0件より悪いので、常に短い核となる語だけを送る。
  const discoveryTerms = [...new Set([
    ...eventInterestKeywords(profile),
    ...terms,
    "エンジニア", "開発", "AI", "クラウド", "データ"
  ])].slice(0, 10);
  const quoted = discoveryTerms.map((term) => `"${term.replaceAll('"', "")}"`).join(" OR ");
  const event = ["ハッカソン", "技術イベント", "ミートアップ", "ワークショップ", "アイデアソン", "Tech Talk", "hackathon", "meetup", "workshop", "conference", "summit"]
    .map((term) => `"${term}"`)
    .join(" OR ");
  const participation = ["開催", "参加者募集", "申込", "受付", "register", "join us"]
    .map((term) => `"${term}"`)
    .join(" OR ");
  // 海外の主催者の英語告知も対象にする。後段で企業・団体／主催者の一次発信に限定する。
  return `(${quoted}) (${event}) (${participation}) -is:retweet -is:reply`;
}

export function queryForITNewsDiscovery(terms: string[]): string {
  const discoveryTerms = [...new Set([...terms, "AWS", "Azure", "GCP", "クラウド", "AI", "セキュリティ"])].slice(0, 9);
  const quoted = discoveryTerms.map((term) => `"${term.replaceAll('"', "")}"`).join(" OR ");
  const technical = ["AWS", "Azure", "GCP", "AI", "クラウド", "ソフトウェア", "セキュリティ", "OSS", "開発者"]
    .map((term) => `"${term}"`).join(" OR ");
  const news = ["認定", "資格", "試験", "training", "certification", "リリース", "新機能", "アップデート", "提供開始", "脆弱性", "セキュリティ", "割引", "無料", "無償", "クーポン", "バウチャー", "キャンペーン", "50%", "free retake", "voucher", "discount"]
    .map((term) => `"${term}"`).join(" OR ");
  return `(${quoted}) (${technical}) (${news}) -is:retweet -is:reply`;
}

function isRelevantCorporateTechPost(text: string): boolean {
  const technical = /エンジニア|開発|ソフトウェア|ai|llm|データ|クラウド|aws|azure|gcp|セキュリティ|脆弱性|oss|オープンソース/i;
  const announcement = /採用|募集|インターン|リリース|提供開始|新機能|アップデート|公開|発表|障害|脆弱性|セキュリティ|release|launch|update|announcement/i;
  return isEngineeringInternship(text) || isTechGrowthEvent(text) || isUsefulITNews(text) || (technical.test(text) && announcement.test(text));
}

async function mark(source: WatchSource, data: Record<string, unknown>) {
  await prisma.watchSource.update({ where: { id: source.id }, data });
}

export async function scanXSource(source: WatchSource): Promise<{ sourceId: string; status: string; created: number }> {
  const checkedAt = new Date();
  const config = getXApiConfig();
  const isPersonalizedFeed = ["X_ALGO", "X_ALGO_TECH_EVENT", "X_ALGO_LEARNING_BENEFIT"].includes(source.kind);
  const isTechEventDiscovery = source.kind === "X_ALGO_TECH_EVENT";
  const isITNewsDiscovery = source.kind === "X_ALGO_LEARNING_BENEFIT";
  const handle = handleFromUrl(source.url);
  if (!source.confirmedAt) {
    await mark(source, { lastCheckedAt: checkedAt, lastStatus: "TERMS_REQUIRED", lastError: "X API利用条件の確認チェックが必要です" });
    return { sourceId: source.id, status: "TERMS_REQUIRED", created: 0 };
  }
  if (!isPersonalizedFeed && !handle) {
    await mark(source, { lastCheckedAt: checkedAt, lastStatus: "ERROR", lastError: "XアカウントURLとして解釈できません" });
    return { sourceId: source.id, status: "ERROR", created: 0 };
  }
  if (!config.enabled || !config.bearerToken) {
    await mark(source, { lastCheckedAt: checkedAt, lastStatus: "X_API_DISABLED", lastError: "X_API_ENABLED と X_API_BEARER_TOKEN を設定すると取得を開始します" });
    return { sourceId: source.id, status: "X_API_DISABLED", created: 0 };
  }

  const budget = await getXApiBudgetStatus();
  const remainingDaily = budget.dailyPostLimit - budget.postsReadToday;
  const remainingBudgetPosts = Math.floor((budget.monthlyBudgetUsd - budget.estimatedCostMonthUsd) / POST_READ_COST_USD);
  // recent search の max_results は 10 件以上が必須。20件/日の上限では、
  // 個人向けフィードと技術イベントを各10件ずつ取得する。
  // 8件・6件のような値を渡すと X API が 400 を返して全フィードが止まる。
  const sourceLimit = 10;
  const maxResults = Math.min(sourceLimit, remainingDaily, remainingBudgetPosts);
  if (maxResults < sourceLimit) {
    await mark(source, { lastCheckedAt: checkedAt, lastStatus: "X_BUDGET_LIMIT", lastError: "日次または月次の投稿取得上限に達しました" });
    return { sourceId: source.id, status: "X_BUDGET_LIMIT", created: 0 };
  }

  const examples = await feedbackExamples();
  const profile = await getInterestProfile();
  const terms = suggestXQueryTerms({ examples, includeKeywords: effectiveIncludeKeywords(profile), excludeKeywords: profile.excludeKeywords, fallback: config.keywords });
  const query = isPersonalizedFeed
    ? (isTechEventDiscovery ? queryForTechEventDiscovery(terms, profile) : isITNewsDiscovery ? queryForITNewsDiscovery(terms) : queryForPersonalizedFeed(terms))
    : queryForHandle(handle!, config.keywords, profile);
  const params = new URLSearchParams({
    query,
    max_results: String(maxResults),
    "tweet.fields": "created_at,author_id,entities",
    expansions: "author_id",
    "user.fields": "description,url,verified,public_metrics"
  });
  if (source.lastExternalId) params.set("since_id", source.lastExternalId);

  let response: Response;
  try {
    response = await fetch(`https://api.x.com/2/tweets/search/recent?${params.toString()}`, {
      signal: AbortSignal.timeout(15_000),
      headers: { Authorization: `Bearer ${config.bearerToken}` }
    });
  } catch (error) {
    const cause = error instanceof Error && error.cause instanceof Error ? error.cause.message : undefined;
    const detail = cause ? `（${cause.slice(0, 160)}）` : "";
    await mark(source, { lastCheckedAt: checkedAt, lastStatus: "ERROR", lastError: `X APIへ接続できませんでした${detail}` });
    return { sourceId: source.id, status: "ERROR", created: 0 };
  }

  const payload = await response.json().catch(() => ({})) as { data?: XPost[]; includes?: { users?: XAuthor[] }; detail?: string; title?: string };
  if (!response.ok) {
    await mark(source, { lastCheckedAt: checkedAt, lastStatus: "ERROR", lastError: `X APIエラー (${response.status}): ${(payload.detail ?? payload.title ?? "不明なエラー").slice(0, 220)}` });
    return { sourceId: source.id, status: "ERROR", created: 0 };
  }

  const posts = payload.data ?? [];
  const authors = new Map((payload.includes?.users ?? []).map((author) => [author.id, author]));
  let created = 0;
  for (const post of posts) {
    const author = post.author_id ? authors.get(post.author_id) : undefined;
    const corporate = isPersonalizedFeed ? assessCorporatePost(post.text, author) : undefined;
    if (isPersonalizedFeed && !corporate?.eligible) continue;
    if (source.kind === "X_ALGO" && !isRelevantCorporateTechPost(post.text)) continue;
    if (isTechEventDiscovery && !isTechGrowthEvent(post.text)) continue;
    if (isITNewsDiscovery && !isUsefulITNews(post.text)) continue;
    const publishedAt = post.created_at ? new Date(post.created_at) : undefined;
    const scored = scoreCandidate({ title: post.text, publishedAt: publishedAt && !Number.isNaN(publishedAt.getTime()) ? publishedAt : undefined });
    const learned = applyLearning({ baseScore: scored.score, sourceId: source.id, text: post.text, examples });
    const tailored = applyInterestProfile({ baseScore: Math.min(100, learned.score + (corporate?.score ?? 0)), text: post.text, profile });
    const eventTailored = isTechEventDiscovery
      ? applyEventInterestProfile({ baseScore: tailored.score, text: post.text, profile })
      : { score: tailored.score, matchedTopics: [], matchedPeople: [], matchedTalks: [] };
    const contentHash = digest(`x:${post.id}`);
    const xPostUrl = handle ? `https://x.com/${handle}/status/${post.id}` : author?.username ? `https://x.com/${author.username}/status/${post.id}` : `https://x.com/i/web/status/${post.id}`;
    const jobUrl = source.kind === "X_ALGO" ? directCareerUrl(post.entities) : undefined;
    const postUrl = jobUrl ?? xPostUrl;
    // 求人リンクが後から見つかっても、同じX投稿を二重に並べない。
    const exists = await prisma.candidate.findFirst({ where: { sourceId: source.id, contentHash }, select: { id: true } });
    if (exists) {
      await prisma.candidate.update({ where: { id: exists.id }, data: { content: post.text } });
      continue;
    }
    await prisma.candidate.create({
      data: {
        sourceId: source.id,
        url: postUrl,
        title: post.text.slice(0, 160),
        summary: post.text.length > 160 ? post.text.slice(0, 260) : null,
        content: post.text,
        kind: scored.kind,
        score: eventTailored.score,
        reasons: [...scored.reasons, ...learned.reasons, ...tailored.reasons, ...(eventTailored.matchedTopics.length ? [`イベント分野: ${eventTailored.matchedTopics.join("・")}`] : []), ...(eventTailored.matchedPeople.length ? [`交流したい人: ${eventTailored.matchedPeople.slice(0, 2).join("・")}`] : []), ...(eventTailored.matchedTalks.length ? [`聞きたい話: ${eventTailored.matchedTalks.slice(0, 2).join("・")}`] : []), ...(corporate?.reasons ?? []), ...(isTechEventDiscovery ? ["技術成長イベント"] : []), ...(isITNewsDiscovery ? ["公式ITニュース"] : []), ...(jobUrl ? ["企業公式投稿の公開ATS求人リンク"] : []), ...(author?.username ? [`@${author.username}`] : []), "X API"],
        publishedAt: publishedAt && !Number.isNaN(publishedAt.getTime()) ? publishedAt : null,
        deadline: scored.deadline ?? null,
        contentHash
      }
    });
    created += 1;
  }

  const dateKey = tokyoDateKey();
  const estimatedCostUsd = posts.length * POST_READ_COST_USD;
  await prisma.xUsageDaily.upsert({
    where: { dateKey },
    create: { dateKey, postsRead: posts.length, requestCount: 1, estimatedCostUsd },
    update: { postsRead: { increment: posts.length }, requestCount: { increment: 1 }, estimatedCostUsd: { increment: estimatedCostUsd } }
  });
  const newest = posts.map((post) => post.id).sort((a, b) => (BigInt(a) > BigInt(b) ? -1 : 1))[0];
  await mark(source, {
    lastCheckedAt: checkedAt,
    lastSuccessAt: checkedAt,
    lastChangedAt: posts.length > 0 ? checkedAt : undefined,
    lastStatus: created > 0 ? "X_CHANGED" : "UNCHANGED",
    lastError: null,
    lastExternalId: newest ?? source.lastExternalId
  });
  return { sourceId: source.id, status: created > 0 ? "X_CHANGED" : "UNCHANGED", created };
}
