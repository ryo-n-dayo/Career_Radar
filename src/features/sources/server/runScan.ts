import { createHash } from "node:crypto";

import type { WatchSource } from "@prisma/client";

import { applyLearning, type FeedbackExample } from "@/features/sources/learning";
import { applyEventInterestProfile, applyInterestProfile } from "@/features/sources/preferences";
import { isEngineeringInternship, isEngineeringNewGraduate, isUsefulITNews, looksRelevant, scoreCandidate } from "@/features/sources/scoring";
import { isTechEventRecord } from "@/features/x/recruitingMeetup";
import { prisma } from "@/lib/prisma";
import { EVENT_GATHERING_USER_AGENT, assertPublicUrl, readCapped } from "@/lib/metadata/fetchPageMeta";
import { checkRobots } from "./robots";
import { getInterestProfile } from "./interestProfile";
import { scanXSource } from "@/features/x/server/scanX";

type FoundCandidate = {
  url: string;
  title: string;
  summary?: string;
  publishedAt?: Date;
  contentHash?: string;
};

class ScanError extends Error {
  constructor(message: string, readonly status: string) {
    super(message);
  }
}

function digest(value: string): string {
  return createHash("sha256").update(value).digest("hex");
}

async function feedbackExamples(): Promise<FeedbackExample[]> {
  const rows = await prisma.candidate.findMany({
    where: { status: { in: ["REVIEWED", "IGNORED"] } },
    select: { sourceId: true, title: true, summary: true, status: true, feedbackValue: true, feedbackReason: true },
    orderBy: { detectedAt: "desc" },
    take: 500
  });
  return rows.map((row) => ({
    sourceId: row.sourceId,
    text: `${row.title} ${row.summary ?? ""}`,
    relevant: row.status === "REVIEWED",
    value: row.feedbackValue,
    reason: row.feedbackReason
  }));
}

function decode(value: string): string {
  return value
    .replace(/&lt;/gi, "<").replace(/&gt;/gi, ">").replace(/&quot;/gi, '"')
    .replace(/&#0*39;|&apos;/gi, "'").replace(/&nbsp;/gi, " ").replace(/&amp;/gi, "&")
    .replace(/&#x([0-9a-f]+);/gi, (_, hex) => String.fromCodePoint(Number.parseInt(hex, 16)))
    .replace(/&#(\d+);/g, (_, number) => String.fromCodePoint(Number(number)));
}

function cleanText(value: string, max = 260): string {
  const text = decode(value.replace(/<script\b[\s\S]*?<\/script>/gi, " ").replace(/<style\b[\s\S]*?<\/style>/gi, " ").replace(/<[^>]+>/g, " "))
    .replace(/\s+/g, " ").trim();
  return text.length > max ? `${text.slice(0, max)}…` : text;
}

function tagValue(html: string, key: string): string | undefined {
  const tags = html.match(/<meta\b[^>]*>/gi) ?? [];
  for (const tag of tags) {
    const name = tag.match(/\b(?:name|property)\s*=\s*["']([^"']+)["']/i)?.[1];
    if (name?.toLowerCase() !== key.toLowerCase()) continue;
    const content = tag.match(/\bcontent\s*=\s*["']([^"']*)["']/i)?.[1];
    if (content) return cleanText(content);
  }
}

function textValue(value: unknown): string | undefined {
  if (typeof value === "string" || typeof value === "number") return String(value).trim() || undefined;
  if (Array.isArray(value)) return value.map(textValue).filter(Boolean).join("、") || undefined;
  return undefined;
}

function jobLocation(value: unknown): string | undefined {
  if (Array.isArray(value)) return value.map(jobLocation).filter(Boolean).join("、") || undefined;
  if (!value || typeof value !== "object") return textValue(value);
  const item = value as Record<string, unknown>;
  const address = item.address && typeof item.address === "object" ? item.address as Record<string, unknown> : undefined;
  const named = textValue(item.name);
  if (named) return named;
  const addressText = [textValue(address?.addressLocality), textValue(address?.addressRegion), textValue(address?.addressCountry)].filter(Boolean).join(" ");
  return addressText || undefined;
}

function jobPostingMetadata(node: Record<string, unknown>): string[] {
  const metadata: Array<[string, string | undefined]> = [
    ["雇用形態", textValue(node.employmentType)],
    ["勤務地", jobLocation(node.jobLocation)],
    ["必要スキル", textValue(node.skills) ?? textValue(node.qualifications)],
    ["応募資格", textValue(node.experienceRequirements)],
    ["締切", textValue(node.validThrough)]
  ];
  return metadata.flatMap(([label, value]) => value ? [`${label}: ${value}`] : []);
}

function htmlCandidates(html: string, pageUrl: string, pageChanged: boolean, allowITNews = false): FoundCandidate[] {
  const page = new URL(pageUrl);
  const title = cleanText(html.match(/<title[^>]*>([\s\S]*?)<\/title>/i)?.[1] ?? tagValue(html, "og:title") ?? page.hostname, 160);
  const summary = tagValue(html, "description") ?? tagValue(html, "og:description") ?? cleanText(html, 260);
  const found: FoundCandidate[] = [];

  if (looksRelevant(`${title} ${summary}`) || pageChanged) found.push({ url: pageUrl, title, summary });

  const anchors = html.match(/<a\b[^>]*href\s*=\s*["'][^"']+["'][^>]*>[\s\S]*?<\/a>/gi) ?? [];
  for (const anchor of anchors) {
    const href = anchor.match(/href\s*=\s*["']([^"']+)["']/i)?.[1];
    const label = cleanText(anchor.replace(/^<a\b[^>]*>/i, "").replace(/<\/a>$/i, ""), 160);
    const candidateText = `${label} ${href}`;
    if (!href || !label || !(looksRelevant(candidateText) || (allowITNews && isUsefulITNews(candidateText)))) continue;
    try {
      const url = new URL(href, page);
      if (url.origin !== page.origin || !/^https?:$/.test(url.protocol)) continue;
      url.hash = "";
      found.push({ url: url.toString(), title: label });
    } catch {
      continue;
    }
  }

  const blocks = html.match(/<script\b[^>]*type\s*=\s*["']application\/ld\+json["'][^>]*>[\s\S]*?<\/script>/gi) ?? [];
  for (const block of blocks) {
    try {
      const parsed = JSON.parse(block.replace(/^<script\b[^>]*>/i, "").replace(/<\/script>$/i, ""));
      const queue: unknown[] = [parsed];
      while (queue.length) {
        const item = queue.shift();
        if (Array.isArray(item)) { queue.push(...item); continue; }
        if (!item || typeof item !== "object") continue;
        const node = item as Record<string, unknown>;
        if (node["@graph"]) queue.push(node["@graph"]);
        const rawType = Array.isArray(node["@type"]) ? node["@type"] : [node["@type"]];
        const isJobPosting = rawType.some((type) => typeof type === "string" && /JobPosting/i.test(type));
        if (!isJobPosting && !rawType.some((type) => typeof type === "string" && /Event/i.test(type))) continue;
        const nodeTitle = typeof node.title === "string" ? node.title : typeof node.name === "string" ? node.name : undefined;
        if (!nodeTitle) continue;
        const nodeUrl = typeof node.url === "string" ? new URL(node.url, page).toString() : pageUrl;
        const description = typeof node.description === "string" ? cleanText(node.description, 900) : undefined;
        const validThrough = typeof node.validThrough === "string" ? ` 締切 ${node.validThrough}` : "";
        const details = isJobPosting ? jobPostingMetadata(node) : [];
        found.push({ url: nodeUrl, title: cleanText(nodeTitle, 160), summary: [description, validThrough.trim(), ...details].filter(Boolean).join(" · ") || undefined });
      }
    } catch {
      continue;
    }
  }

  return found.slice(0, 30);
}

/**
 * 採用ページでは「応募詳細」のようにリンク文字列だけでは職種を判定できないことがある。
 * 同一ドメイン上の、求人詳細らしい URL だけを少数候補にしてから個別ページを確認する。
 */
function careerDetailCandidates(html: string, pageUrl: string): FoundCandidate[] {
  const page = new URL(pageUrl);
  const paths = /\/(?:position|positions|jobs?|entry|newgrads)\/?|\/recruitment-category\/internship\//i;
  const anchors = html.match(/<a\b[^>]*href\s*=\s*["'][^"']+["'][^>]*>[\s\S]*?<\/a>/gi) ?? [];
  const found: FoundCandidate[] = [];

  for (const anchor of anchors) {
    const href = anchor.match(/href\s*=\s*["']([^"']+)["']/i)?.[1];
    const label = cleanText(anchor.replace(/^<a\b[^>]*>/i, "").replace(/<\/a>$/i, ""), 160);
    if (!href) continue;
    try {
      const url = new URL(href, page);
      url.hash = "";
      const hint = `${url.pathname} ${url.search} ${label}`;
      if (url.origin !== page.origin || !/^https?:$/.test(url.protocol) || !paths.test(hint)) continue;
      found.push({ url: url.toString(), title: label || "公式採用ページの募集詳細" });
    } catch {
      continue;
    }
  }

  return [...new Map(found.map((item) => [item.url, item])).values()].slice(0, 12);
}

/** 採用ページ全体が一つの募集として公開される場合の、判定に使う本文抜粋。 */
function careerRootCandidate(html: string, pageUrl: string): FoundCandidate {
  const page = new URL(pageUrl);
  const title = cleanText(html.match(/<title[^>]*>([\s\S]*?)<\/title>/i)?.[1] ?? tagValue(html, "og:title") ?? page.hostname, 160);
  const allText = cleanText(html, 30_000);
  const matches = [...allText.matchAll(/インターン|intern(ship)?/gi)];
  const snippets = matches.map((match) => allText.slice(Math.max(0, match.index - 260), match.index + 1_100));
  // 採用一覧にビジネス職も混ざる場合、技術系の募集に当たる本文を優先する。
  const summary = snippets.find((snippet) => isEngineeringInternship(`${title} ${snippet}`))
    ?? snippets[0]
    ?? allText.slice(0, 1_100);
  return { url: pageUrl, title, summary };
}

/** 新卒採用ページ全体が一つの募集として公開される場合の、判定に使う本文抜粋。 */
function newGraduateRootCandidate(html: string, pageUrl: string): FoundCandidate {
  const page = new URL(pageUrl);
  const title = cleanText(html.match(/<title[^>]*>([\s\S]*?)<\/title>/i)?.[1] ?? tagValue(html, "og:title") ?? page.hostname, 160);
  const allText = cleanText(html, 30_000);
  const matches = [...allText.matchAll(/新卒|新規学卒|既卒|第二新卒|20(?:2[7-9]|3\d)\s*年?卒|(?:new|recent)\s*grad(?:uate)?/gi)];
  const snippets = matches.map((match) => allText.slice(Math.max(0, (match.index ?? 0) - 260), (match.index ?? 0) + 1_100));
  const summary = snippets.find((snippet) => isEngineeringNewGraduate(`${title} ${snippet}`))
    ?? snippets[0]
    ?? allText.slice(0, 1_100);
  return { url: pageUrl, title, summary };
}

/** 公式ITニュース一覧に個別リンクがない場合だけ、更新内容の周辺本文を候補化する。 */
function itNewsRootCandidate(html: string, pageUrl: string): FoundCandidate {
  const page = new URL(pageUrl);
  const title = cleanText(html.match(/<title[^>]*>([\s\S]*?)<\/title>/i)?.[1] ?? tagValue(html, "og:title") ?? page.hostname, 160);
  const allText = cleanText(html, 30_000);
  const marker = allText.search(/新機能|新サービス|リリース|提供開始|アップデート|公開|発表|障害|脆弱性|セキュリティ(?:更新|情報)?|サポート(?:開始|追加)?|利用可能|割引|無料|無償|クーポン|バウチャー|キャンペーン|特典|受験料|半額|50\s*%|release|launch|update|changelog|security\s+(?:update|advisory)/i);
  const summary = marker >= 0 ? allText.slice(Math.max(0, marker - 360), marker + 1_300) : allText.slice(0, 1_100);
  return { url: pageUrl, title, summary };
}

function xmlValue(block: string, tag: string): string | undefined {
  const value = block.match(new RegExp(`<${tag}\\b[^>]*>(?:<!\\[CDATA\\[)?([\\s\\S]*?)(?:\\]\\]>)?<\\/${tag}>`, "i"))?.[1];
  return value ? cleanText(value, 300) : undefined;
}

function rssCandidates(xml: string, baseUrl: string): FoundCandidate[] {
  const blocks = xml.match(/<(?:item|entry)\b[\s\S]*?<\/(?:item|entry)>/gi) ?? [];
  return blocks.slice(0, 30).flatMap((block) => {
    const title = xmlValue(block, "title");
    const href = block.match(/<link\b[^>]*href\s*=\s*["']([^"']+)["']/i)?.[1] ?? xmlValue(block, "link");
    if (!title || !href) return [];
    let url: string;
    try { url = new URL(href, baseUrl).toString(); } catch { return []; }
    const summary = xmlValue(block, "description") ?? xmlValue(block, "summary") ?? xmlValue(block, "content");
    const dateValue = xmlValue(block, "pubDate") ?? xmlValue(block, "published") ?? xmlValue(block, "updated");
    const publishedAt = dateValue ? new Date(dateValue) : undefined;
    return [{ url, title, summary, publishedAt: publishedAt && !Number.isNaN(publishedAt.getTime()) ? publishedAt : undefined }];
  });
}

function sitemapCandidates(xml: string): FoundCandidate[] {
  const blocks = xml.match(/<url\b[\s\S]*?<\/url>/gi) ?? [];
  const recentCutoff = Date.now() - 14 * 86_400_000;
  return blocks.flatMap((block) => {
    const url = xmlValue(block, "loc");
    if (!url) return [];
    const lastmod = xmlValue(block, "lastmod");
    const publishedAt = lastmod ? new Date(lastmod) : undefined;
    const recent = publishedAt && !Number.isNaN(publishedAt.getTime()) && publishedAt.getTime() >= recentCutoff;
    if (!recent && !looksRelevant(url)) return [];
    const slug = decodeURIComponent(new URL(url).pathname.split("/").filter(Boolean).pop() ?? new URL(url).hostname).replace(/[-_]/g, " ");
    return [{ url, title: cleanText(slug || url, 160), publishedAt: recent ? publishedAt : undefined }];
  }).slice(0, 40);
}

function isXHost(hostname: string): boolean {
  const host = hostname.toLowerCase();
  return host === "x.com" || host.endsWith(".x.com") || host === "twitter.com" || host.endsWith(".twitter.com");
}

async function fetchSource(source: WatchSource): Promise<{ status: number; text: string; finalUrl: string; etag?: string; lastModified?: string }> {
  let current = new URL(source.url);
  if (isXHost(current.hostname) || source.kind === "X_MANUAL") throw new ScanError("XはCookieや非公式取得を使わず、手動確認します", "X_MANUAL");
  if (!source.confirmedAt) throw new ScanError("利用条件の確認チェックが必要です", "TERMS_REQUIRED");

  for (let hop = 0; hop <= 4; hop += 1) {
    await assertPublicUrl(current);
    const robots = await checkRobots(current);
    if (!robots.allowed) throw new ScanError(robots.detail, "ROBOTS_BLOCKED");

    const headers: Record<string, string> = {
      "User-Agent": EVENT_GATHERING_USER_AGENT,
      Accept: ["PAGE", "CAREERS", "NEW_GRAD", "TECH_EVENTS", "TECH_BENEFITS", "TECH_NEWS"].includes(source.kind) ? "text/html,application/xhtml+xml" : "application/xml,text/xml,application/rss+xml,application/atom+xml,text/plain"
    };
    if (source.etag) headers["If-None-Match"] = source.etag;
    if (source.lastModified) headers["If-Modified-Since"] = source.lastModified;
    const response = await fetch(current, { redirect: "manual", signal: AbortSignal.timeout(15_000), headers });
    if (response.status === 304) return { status: 304, text: "", finalUrl: current.toString(), etag: source.etag ?? undefined, lastModified: source.lastModified ?? undefined };
    if (response.status >= 300 && response.status < 400) {
      const location = response.headers.get("location");
      if (!location) throw new ScanError("リダイレクト先が不明です", "ERROR");
      current = new URL(location, current);
      continue;
    }
    if (!response.ok) throw new ScanError(`取得失敗 (${response.status})`, "ERROR");
    return {
      status: response.status,
      text: await readCapped(response),
      finalUrl: current.toString(),
      etag: response.headers.get("etag") ?? undefined,
      lastModified: response.headers.get("last-modified") ?? undefined
    };
  }
  throw new ScanError("リダイレクトが多すぎます", "ERROR");
}

/** 登録済み採用ページから見つけた、同一企業ドメインの募集詳細を低頻度で補う。 */
async function enrichCareerCandidate(source: WatchSource, candidate: FoundCandidate): Promise<FoundCandidate> {
  try {
    const root = new URL(source.url);
    const target = new URL(candidate.url);
    if (target.origin !== root.origin || target.toString() === root.toString()) return candidate;
    await assertPublicUrl(target);
    const robots = await checkRobots(target);
    if (!robots.allowed) return candidate;
    const response = await fetch(target, {
      signal: AbortSignal.timeout(15_000),
      headers: { "User-Agent": EVENT_GATHERING_USER_AGENT, Accept: "text/html,application/xhtml+xml" }
    });
    if (!response.ok) return candidate;
    const html = await readCapped(response);
    const parsed = htmlCandidates(html, target.toString(), false)
      .find((item) => isEngineeringInternship(`${item.title} ${item.summary ?? ""}`));
    if (parsed) return { ...parsed, url: target.toString() };
    const title = cleanText(html.match(/<h1[^>]*>([\s\S]*?)<\/h1>/i)?.[1] ?? tagValue(html, "og:title") ?? candidate.title, 160);
    const summary = tagValue(html, "description") ?? tagValue(html, "og:description") ?? cleanText(html, 900);
    return { ...candidate, url: target.toString(), title, summary };
  } catch {
    return candidate;
  }
}

export async function scanSource(source: WatchSource): Promise<{ sourceId: string; status: string; created: number }> {
  const checkedAt = new Date();
  try {
    const response = await fetchSource(source);
    if (response.status === 304) {
      await prisma.watchSource.update({ where: { id: source.id }, data: { lastCheckedAt: checkedAt, lastSuccessAt: checkedAt, lastStatus: "UNCHANGED", lastError: null } });
      return { sourceId: source.id, status: "UNCHANGED", created: 0 };
    }

    const contentHash = digest(response.text.replace(/\s+/g, " "));
    const changed = Boolean(source.contentHash && source.contentHash !== contentHash);
    if (source.contentHash === contentHash) {
      await prisma.watchSource.update({ where: { id: source.id }, data: { lastCheckedAt: checkedAt, lastSuccessAt: checkedAt, lastStatus: "UNCHANGED", lastError: null, etag: response.etag, lastModified: response.lastModified } });
      return { sourceId: source.id, status: "UNCHANGED", created: 0 };
    }

    // TECH_NEWSでも、公式が案内するRSS URLならRSSとして解析し、同じITニュースの精度フィルターを通す。
    const isRssDocument = source.kind === "RSS" || /<(?:rss|feed)\b/i.test(response.text);
    const discovered = isRssDocument
      ? rssCandidates(response.text, response.finalUrl)
      : source.kind === "SITEMAP"
        ? sitemapCandidates(response.text)
      : htmlCandidates(response.text, response.finalUrl, changed || source.kind === "TECH_EVENTS", source.kind === "TECH_NEWS");
    const careerInputs = source.kind === "CAREERS"
      ? [
        // 単一ページで募集内容を掲載する採用サイトを取りこぼさない。
        careerRootCandidate(response.text, response.finalUrl),
        // 求人一覧自体が技術系インターンである場合も、詳細を保存する。
        ...discovered.filter((item) => isEngineeringInternship(`${item.title} ${item.summary ?? ""}`)),
        // 「応募詳細」などのリンクは、URL 形状で絞った上で本文を読んでから判定する。
        ...careerDetailCandidates(response.text, response.finalUrl)
      ].filter((item, index, items) => items.findIndex((other) => other.url === item.url) === index).slice(0, 8)
      : [];
    const newGraduateInputs = source.kind === "NEW_GRAD"
      ? [
        newGraduateRootCandidate(response.text, response.finalUrl),
        ...discovered.filter((item) => isEngineeringNewGraduate(`${item.title} ${item.summary ?? ""}`))
      ].filter((item, index, items) => items.findIndex((other) => other.url === item.url) === index).slice(0, 8)
      : [];
    const techInputs = source.kind === "TECH_EVENTS"
      ? [...discovered, {
        // 公式の個別告知は、本文のメタ情報が薄くても登録時に確認した開催概要を使う。
        // ページ本文で再確認し、イベント判定に通る場合だけ候補化する。
        url: response.finalUrl,
        title: source.name,
        summary: source.notes ?? undefined
      }]
      : [];
    const isITNewsSource = ["TECH_BENEFITS", "TECH_NEWS"].includes(source.kind);
    const itNewsInputs = isITNewsSource
      ? [...discovered, ...(discovered.length === 0 ? [itNewsRootCandidate(response.text, response.finalUrl)] : [])]
      : [];
    const found = source.kind === "CAREERS"
      ? (await Promise.all(careerInputs.map((item) => enrichCareerCandidate(source, item))))
        .filter((item) => isEngineeringInternship(`${item.title} ${item.summary ?? ""}`))
      : source.kind === "NEW_GRAD"
        ? newGraduateInputs.filter((item) => isEngineeringNewGraduate(`${item.title} ${item.summary ?? ""}`))
      : source.kind === "TECH_EVENTS"
        ? techInputs.filter((item) => isTechEventRecord(item))
        : isITNewsSource
          ? itNewsInputs.filter((item) => isUsefulITNews(`${item.title} ${item.summary ?? ""}`))
        : discovered;
    // metaタグとJSON-LDが同じ公式イベントURLを指す場合は、説明が詳しい方だけを残す。
    const uniqueFound = ["NEW_GRAD", "TECH_EVENTS", "TECH_BENEFITS", "TECH_NEWS"].includes(source.kind)
      ? Array.from(found.reduce((items, item) => {
        const current = items.get(item.url);
        if (!current || (item.summary?.length ?? 0) > (current.summary?.length ?? 0)) items.set(item.url, item);
        return items;
      }, new Map<string, FoundCandidate>()).values())
      : found;
    const examples = await feedbackExamples();
    const profile = await getInterestProfile();
    let created = 0;
    if (["CAREERS", "NEW_GRAD", "TECH_BENEFITS", "TECH_NEWS"].includes(source.kind)) {
      // ページ更新時に見つからなくなった募集は消さず、「現在募集中」一覧だけから外す。
      await prisma.candidate.updateMany({ where: { sourceId: source.id, isActive: true }, data: { isActive: false } });
    }
    for (const item of uniqueFound) {
      const scored = scoreCandidate(item);
      const learned = applyLearning({
        baseScore: scored.score,
        sourceId: source.id,
        text: `${item.title} ${item.summary ?? ""}`,
        examples
      });
      const tailored = applyInterestProfile({
        baseScore: learned.score,
        text: `${item.title} ${item.summary ?? ""}`,
        profile
      });
      const eventTailored = source.kind === "TECH_EVENTS"
        ? applyEventInterestProfile({ baseScore: tailored.score, text: `${item.title} ${item.summary ?? ""}`, profile })
        : { score: tailored.score, matchedTopics: [], matchedPeople: [], matchedTalks: [] };
      const itemHash = item.contentHash ?? digest(`${item.url}\n${item.title}\n${item.summary ?? ""}`);
      if (["CAREERS", "NEW_GRAD", "TECH_EVENTS", "TECH_BENEFITS", "TECH_NEWS"].includes(source.kind)) {
        const existingSourceCandidate = await prisma.candidate.findFirst({
          where: { sourceId: source.id, url: item.url, contentHash: itemHash },
          orderBy: { detectedAt: "desc" },
          select: { id: true }
        }) ?? await prisma.candidate.findFirst({
          where: { sourceId: source.id, url: item.url },
          orderBy: { detectedAt: "desc" },
          select: { id: true }
        });
        const data = {
          title: item.title,
          summary: item.summary,
          // 新卒ソースは本文に「インターン」も併記されることがあるが、就活一覧では必ず採用として扱う。
          kind: source.kind === "NEW_GRAD" ? "RECRUIT" : scored.kind,
          score: eventTailored.score,
          reasons: [...scored.reasons, ...learned.reasons, ...tailored.reasons, ...(eventTailored.matchedTopics.length ? [`イベント分野: ${eventTailored.matchedTopics.join("・")}`] : []), ...(eventTailored.matchedPeople.length ? [`交流したい人: ${eventTailored.matchedPeople.slice(0, 2).join("・")}`] : []), ...(eventTailored.matchedTalks.length ? [`聞きたい話: ${eventTailored.matchedTalks.slice(0, 2).join("・")}`] : []), source.kind === "CAREERS" ? "公式インターン採用ページ" : source.kind === "NEW_GRAD" ? "公式新卒・既卒採用ページ" : source.kind === "TECH_EVENTS" ? "公式技術イベント" : "公式ITニュース"],
          publishedAt: item.publishedAt ?? null,
          deadline: scored.deadline ?? null,
          contentHash: itemHash,
          status: "NEW",
          isActive: true,
          lastSeenAt: checkedAt
        };
        if (existingSourceCandidate) {
          await prisma.candidate.update({ where: { id: existingSourceCandidate.id }, data });
        } else {
          await prisma.candidate.create({ data: { sourceId: source.id, url: item.url, ...data } });
          created += 1;
        }
        continue;
      }
      const exists = await prisma.candidate.findUnique({ where: { sourceId_url_contentHash: { sourceId: source.id, url: item.url, contentHash: itemHash } }, select: { id: true } });
      if (exists) continue;
      await prisma.candidate.create({ data: { sourceId: source.id, url: item.url, title: item.title, summary: item.summary, kind: scored.kind, score: tailored.score, reasons: [...scored.reasons, ...learned.reasons, ...tailored.reasons], publishedAt: item.publishedAt, deadline: scored.deadline, contentHash: itemHash } });
      created += 1;
    }

    await prisma.watchSource.update({
      where: { id: source.id },
      data: { etag: response.etag, lastModified: response.lastModified, contentHash, lastCheckedAt: checkedAt, lastSuccessAt: checkedAt, lastChangedAt: checkedAt, lastStatus: created > 0 ? "CHANGED" : "UNCHANGED", lastError: null }
    });
    return { sourceId: source.id, status: created > 0 ? "CHANGED" : "UNCHANGED", created };
  } catch (error) {
    const status = error instanceof ScanError ? error.status : "ERROR";
    const message = error instanceof Error ? error.message : "取得できませんでした";
    await prisma.watchSource.update({ where: { id: source.id }, data: { lastCheckedAt: checkedAt, lastStatus: status, lastError: message.slice(0, 300) } });
    return { sourceId: source.id, status, created: 0 };
  }
}

export async function scanAllSources(sourceId?: string) {
  const sources = await prisma.watchSource.findMany({ where: { enabled: true, ...(sourceId ? { id: sourceId } : {}) }, orderBy: { createdAt: "asc" } });
  const results = [];
  for (const source of sources.filter((source) => !["X_API", "X_ALGO", "X_ALGO_TECH_EVENT", "X_ALGO_LEARNING_BENEFIT"].includes(source.kind))) results.push(await scanSource(source));
  const xPriority = (source: typeof sources[number]) => source.kind === "X_ALGO" ? 0 : ["X_ALGO_TECH_EVENT", "X_ALGO_LEARNING_BENEFIT"].includes(source.kind) ? 1 : 2;
  const xSources = [...sources.filter((source) => ["X_API", "X_ALGO", "X_ALGO_TECH_EVENT", "X_ALGO_LEARNING_BENEFIT"].includes(source.kind))]
    .sort((a, b) => xPriority(a) - xPriority(b) || (a.lastSuccessAt?.getTime() ?? 0) - (b.lastSuccessAt?.getTime() ?? 0));
  for (const source of xSources) results.push(await scanXSource(source));
  return results;
}
