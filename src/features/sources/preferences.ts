import { containsInterestTerm } from "@/lib/textMatch";

export type InterestProfile = {
  includeKeywords: string[];
  excludeKeywords: string[];
  selectedTopics: string[];
  topicHistory: TopicHistoryEntry[];
  eventTopics: string[];
  eventPeople: string[];
  eventTalks: string[];
};

export type TopicHistoryEntry = {
  topicIds: string[];
  selectedAt: string;
};

export const TOPIC_OPTIONS = [
  { id: "ai", label: "AI・生成AI", keywords: ["AI", "生成AI", "機械学習", "LLM"] },
  { id: "intern", label: "長期インターン", keywords: ["長期インターン", "インターン", "学生"] },
  { id: "career_events", label: "学生向けキャリアイベント", keywords: ["学生向け", "大学生", "キャリアイベント", "就活イベント", "合同説明会", "参加者募集"] },
  { id: "startup", label: "スタートアップ", keywords: ["スタートアップ", "起業", "新規事業"] },
  { id: "overseas", label: "海外・東南アジア", keywords: ["海外", "東南アジア", "マレーシア", "英語"] },
  { id: "data", label: "データ・エンジニア", keywords: ["データ分析", "エンジニア", "SQL", "プロダクト開発"] },
  { id: "product_design", label: "デザイン・プロダクト", keywords: ["デザイン", "デザイナー", "プロダクト", "UI", "UX", "クリエイティブ"] },
  { id: "business", label: "事業開発", keywords: ["事業開発", "BizDev", "マーケティング"] },
  { id: "vc", label: "VC・投資", keywords: ["VC", "ベンチャーキャピタル", "投資"] },
  { id: "community", label: "イベント・コミュニティ", keywords: ["イベント", "ミートアップ", "説明会", "ハッカソン"] },
  { id: "education", label: "教育", keywords: ["教育", "EdTech", "学習"] }
] as const;

export const EVENT_TOPIC_OPTIONS = [
  { id: "ai", label: "AI・LLM", keywords: ["AI", "生成AI", "LLM", "機械学習", "人工知能"] },
  { id: "cloud", label: "クラウド", keywords: ["クラウド", "Cloud", "AWS", "Azure", "GCP", "Google Cloud", "Kubernetes", "KubeCon", "インフラ"] },
  { id: "hackathon", label: "ハッカソン", keywords: ["ハッカソン", "Hackathon", "コンテスト", "Contest", "アイデアソン"] },
  { id: "data", label: "データ", keywords: ["データ", "Data", "分析", "Analytics", "Python", "統計"] },
  { id: "design", label: "デザイン", keywords: ["デザイン", "Design", "UI", "UX", "Design Sprint", "プロダクト"] },
  { id: "oss", label: "OSS・セキュリティ", keywords: ["オープンソース", "Open Source", "OSS", "Linux", "セキュリティ", "Security"] },
  { id: "meetup", label: "交流会・実践", keywords: ["交流会", "懇親会", "ネットワーキング", "Networking", "ミートアップ", "Meetup", "勉強会", "ワークショップ", "Workshop", "ハンズオン", "Hands-on", "体験"] }
] as const;

export function detectEventTopics(text: string) {
  return EVENT_TOPIC_OPTIONS.filter((topic) => topic.keywords.some((term) => containsInterestTerm(text, term)));
}

export const EMPTY_INTEREST_PROFILE: InterestProfile = {
  includeKeywords: [],
  excludeKeywords: [],
  selectedTopics: [],
  topicHistory: [],
  eventTopics: [],
  eventPeople: [],
  eventTalks: []
};

export function normalizeKeywords(value: unknown): string[] {
  const values = Array.isArray(value)
    ? value
    : typeof value === "string"
      ? value.split(/[\n,、]/)
      : [];
  return [...new Set(values
    .filter((item): item is string => typeof item === "string")
    .map((item) => item.trim().replace(/\s+/g, " "))
    .filter((item) => item.length >= 2 && item.length <= 80))].slice(0, 30);
}

export function normalizeTopics(value: unknown): string[] {
  const allowed: Set<string> = new Set(TOPIC_OPTIONS.map((topic) => topic.id));
  return Array.isArray(value)
    ? [...new Set(value.filter((item): item is string => typeof item === "string" && allowed.has(item)))].slice(0, 6)
    : [];
}

export function normalizeEventTopics(value: unknown): string[] {
  const allowed: Set<string> = new Set(EVENT_TOPIC_OPTIONS.map((topic) => topic.id));
  return Array.isArray(value)
    ? [...new Set(value.filter((item): item is string => typeof item === "string" && allowed.has(item)))].slice(0, EVENT_TOPIC_OPTIONS.length)
    : [];
}

export function normalizeTopicHistory(value: unknown): TopicHistoryEntry[] {
  if (!Array.isArray(value)) return [];
  return value.flatMap((entry) => {
    if (!entry || typeof entry !== "object") return [];
    const value = entry as Record<string, unknown>;
    const topicIds = normalizeTopics(value.topicIds);
    const selectedAt = typeof value.selectedAt === "string" && !Number.isNaN(new Date(value.selectedAt).getTime()) ? value.selectedAt : undefined;
    return topicIds.length > 0 && selectedAt ? [{ topicIds, selectedAt }] : [];
  }).slice(-20);
}

export function sameTopics(left: string[], right: string[]): boolean {
  return [...left].sort().join("\u0000") === [...right].sort().join("\u0000");
}

export function topicKeywords(selectedTopics: string[]): string[] {
  const selected = new Set(selectedTopics);
  return TOPIC_OPTIONS.filter((topic) => selected.has(topic.id)).flatMap((topic) => topic.keywords);
}

export function effectiveIncludeKeywords(profile: InterestProfile): string[] {
  return [...new Set([...profile.includeKeywords, ...topicKeywords(profile.selectedTopics)])];
}

export function eventInterestKeywords(profile: InterestProfile): string[] {
  const selected = new Set(profile.eventTopics);
  return [...new Set([
    ...EVENT_TOPIC_OPTIONS.filter((topic) => selected.has(topic.id)).flatMap((topic) => topic.keywords),
    ...profile.eventPeople,
    ...profile.eventTalks
  ])].slice(0, 30);
}

export function profileFromRow(row?: { includeKeywords: unknown; excludeKeywords: unknown; selectedTopics?: unknown; topicHistory?: unknown; eventTopics?: unknown; eventPeople?: unknown; eventTalks?: unknown; updatedAt?: Date } | null): InterestProfile {
  if (!row) return EMPTY_INTEREST_PROFILE;
  const selectedTopics = normalizeTopics(row.selectedTopics);
  const topicHistory = normalizeTopicHistory(row.topicHistory);
  return {
    includeKeywords: normalizeKeywords(row.includeKeywords),
    excludeKeywords: normalizeKeywords(row.excludeKeywords),
    selectedTopics,
    eventTopics: normalizeEventTopics(row.eventTopics),
    eventPeople: normalizeKeywords(row.eventPeople),
    eventTalks: normalizeKeywords(row.eventTalks),
    // 履歴機能の追加前に保存された現在の選択も、最初の履歴として見えるようにする。
    topicHistory: topicHistory.length > 0 || selectedTopics.length === 0
      ? topicHistory
      : [{ topicIds: selectedTopics, selectedAt: (row.updatedAt ?? new Date()).toISOString() }]
  };
}

/** 技術イベント専用の希望条件。候補を消す前に、合う理由を付けて並び順を上げる。 */
export function applyEventInterestProfile(input: {
  baseScore: number;
  text: string;
  profile: InterestProfile;
}): { score: number; matchedTopics: string[]; matchedPeople: string[]; matchedTalks: string[] } {
  const selected = new Set(input.profile.eventTopics);
  const matchedTopics = detectEventTopics(input.text).filter((topic) => selected.has(topic.id)).map((topic) => topic.id);
  const matchedPeople = input.profile.eventPeople.filter((keyword) => containsInterestTerm(input.text, keyword));
  const matchedTalks = input.profile.eventTalks.filter((keyword) => containsInterestTerm(input.text, keyword));
  const adjustment = Math.min(42, matchedTopics.length * 12 + matchedPeople.length * 9 + matchedTalks.length * 9);
  return { score: Math.min(100, input.baseScore + adjustment), matchedTopics, matchedPeople, matchedTalks };
}

/** 人が登録した条件を、既存ルールの上に小さく重ねる。除外語は最優先で下げる。 */
export function applyInterestProfile(input: {
  baseScore: number;
  text: string;
  profile: InterestProfile;
}): { score: number; reasons: string[] } {
  const text = input.text.toLocaleLowerCase("ja-JP");
  const allIncludes = effectiveIncludeKeywords(input.profile);
  const includes = allIncludes.filter((keyword) => text.includes(keyword.toLocaleLowerCase("ja-JP")));
  const excludes = input.profile.excludeKeywords.filter((keyword) => text.includes(keyword.toLocaleLowerCase("ja-JP")));
  let adjustment = Math.min(34, includes.length * 10);
  const reasons: string[] = [];
  if (includes.length > 0) reasons.push(`希望条件: ${includes.slice(0, 2).join("・")}`);
  if (allIncludes.length > 0 && includes.length === 0) adjustment -= 14;
  if (excludes.length > 0) {
    adjustment -= 38;
    reasons.push(`除外条件: ${excludes.slice(0, 2).join("・")}`);
  }
  return { score: Math.max(0, Math.min(100, input.baseScore + adjustment)), reasons };
}
