import { applyEventInterestProfile, detectEventTopics, EMPTY_INTEREST_PROFILE } from "@/features/sources/preferences";

export type EventPreference = { eventTopics: string[]; eventPeople: string[]; eventTalks: string[] };
export type MeetupPlan = { saved: boolean; people: string; talks: string };
export const EMPTY_PLAN: MeetupPlan = { saved: false, people: "", talks: "" };
export type MeetupItem = {
  id: string; title: string; summary?: string; url: string; score: number;
  sourceName: string; sourceKind: string; schedule?: string; place?: string;
  detectedAt: string; checkedAt?: string; plan: MeetupPlan;
};
export type EventFormat = "online" | "onsite" | "hybrid" | "unknown";
export const FORMAT_LABELS: Record<EventFormat, string> = {
  online: "オンライン", onsite: "現地開催", hybrid: "現地＋オンライン", unknown: "形式未確認"
};
export type EventRegion = "japan" | "malaysia" | "overseas" | "online";
export const REGION_LABELS: Record<EventRegion, string> = {
  japan: "日本国内", malaysia: "マレーシア", overseas: "海外", online: "オンライン"
};

/** Only explicit statements determine format. Do not treat a place mentioned in a bio as a venue. */
export function eventFormat(text: string): EventFormat {
  const normalized = text.normalize("NFKC").toLowerCase();
  const noOnline = /(?:オンライン|配信)(?:開催|参加|対応)?(?:は|が|の)?(?:ありません|ございません|なし|無し|しません|行いません|不可)|no\s+(?:online|streaming)/.test(normalized);
  if (!noOnline && /ハイブリッド|\bhybrid\b|現地.{0,6}(?:オンライン|配信)|(?:オンライン|配信).{0,6}(?:現地|併用)/.test(normalized)) return "hybrid";
  if (!noOnline && /オンライン|\bonline\b|\bvirtual\b|ライブ配信|\blivestream\b/.test(normalized)) return "online";
  if (/現地開催|オフライン|対面|会場[:：]|開催場所[:：]|\bin[- ]person\b|\bonsite\b/.test(normalized)) return "onsite";
  return "unknown";
}

/** Online participation wins over physical geography because it is actionable from the event list. */
export function eventRegion(text: string, format: EventFormat = eventFormat(text)): EventRegion {
  const normalized = text.normalize("NFKC");
  if (format === "online" || format === "hybrid") return "online";
  if (/マレーシア|Malaysia|Kuala Lumpur|クアラルンプール|Penang|ペナン/i.test(normalized)) return "malaysia";
  if (/日本|Japan|東京|Tokyo|大阪|Osaka|京都|Kyoto|福岡|Fukuoka|名古屋|Nagoya|札幌|Sapporo|横浜|Yokohama|神戸|Kobe|渋谷|Shibuya|新宿|Shinjuku/i.test(normalized)) return "japan";
  // The collection policy permits Japanese X announcements without a venue; keep them in the domestic lane rather than hiding them.
  if (/[ぁ-んァ-ヶ一-龠]/.test(normalized)) return "japan";
  return "overseas";
}

export function describeMeetup(item: MeetupItem, preference: EventPreference) {
  const text = `${item.title} ${item.summary ?? ""}`;
  const match = applyEventInterestProfile({ baseScore: 0, text, profile: { ...EMPTY_INTEREST_PROFILE, ...preference } });
  const format = eventFormat(`${text} ${item.place ?? ""}`);
  return { item, topics: detectEventTopics(text), format, region: eventRegion(`${text} ${item.place ?? ""}`, format), ...match };
}
export type DescribedMeetup = ReturnType<typeof describeMeetup>;
export type MeetupFilters = {
  query: string; topics: string[]; format: EventFormat | "all";
  region?: EventRegion | "all";
  view: "all" | "matches" | "saved"; sort: "recommended" | "newest";
};
export function filterMeetups(entries: DescribedMeetup[], filters: MeetupFilters): DescribedMeetup[] {
  const words = filters.query.normalize("NFKC").toLocaleLowerCase("ja-JP").trim().split(/\s+/).filter(Boolean);
  return entries.filter(({ item, topics, format, region, score }) => {
    const text = `${item.title} ${item.summary ?? ""} ${item.sourceName} ${item.place ?? ""}`.normalize("NFKC").toLocaleLowerCase("ja-JP");
    return (filters.view !== "saved" || item.plan.saved)
      && (filters.view !== "matches" || score > 0)
      && (filters.format === "all" || filters.format === format)
      && (!filters.region || filters.region === "all" || filters.region === region)
      && (filters.topics.length === 0 || topics.some((topic) => filters.topics.includes(topic.id)))
      && words.every((word) => text.includes(word));
  }).sort((a, b) => {
    const recent = b.item.detectedAt.localeCompare(a.item.detectedAt);
    return filters.sort === "newest" ? recent : b.score - a.score || b.item.score - a.item.score || recent;
  });
}
