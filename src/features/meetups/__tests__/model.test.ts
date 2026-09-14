import { describe, expect, it } from "vitest";
import { detectEventTopics } from "../../sources/preferences";
import { containsInterestTerm } from "../../../lib/textMatch";
import { describeMeetup, EMPTY_PLAN, eventFormat, eventRegion, filterMeetups, type MeetupFilters, type MeetupItem } from "../model";

const filters: MeetupFilters = { query: "", topics: [], format: "all", view: "all", sort: "recommended" };
const preference = { eventTopics: ["design"], eventPeople: ["エンジニア"], eventTalks: ["アイデア創出"] };
function event(overrides: Partial<MeetupItem>): MeetupItem {
  return { id: "a", url: "https://example.com/events/a", title: "Design Sprint ワークショップ", summary: "エンジニアとアイデア創出を体験", sourceName: "公式イベント", sourceKind: "TECH_EVENTS", score: 40, detectedAt: "2026-09-05T01:00:00.000Z", plan: EMPTY_PLAN, ...overrides };
}

describe("event discovery", () => {
  it("does not classify Latin substrings as AI, UI or OSS", () => {
    expect(detectEventTopics("Detailed build across teams")).toEqual([]);
    expect(containsInterestTerm("email", "AI")).toBe(false);
    expect(containsInterestTerm("ＡＩエンジニア", "AI")).toBe(true);
    expect(containsInterestTerm("C++ 実装", "C++")).toBe(true);
    expect(containsInterestTerm("something", " ")).toBe(false);
  });
  it("supports multiple topics and the same scoring on client and server", () => {
    const entry = describeMeetup(event({}), preference);
    expect(entry.topics.map((topic) => topic.id)).toEqual(expect.arrayContaining(["design", "meetup"]));
    expect(entry.score).toBe(30);
    expect(entry.matchedPeople).toEqual(["エンジニア"]);
    expect(entry.matchedTalks).toEqual(["アイデア創出"]);
  });
  it("does not guess remote attendance from a negative statement", () => {
    expect(eventFormat("現地開催。オンライン配信はありません")).toBe("onsite");
    expect(eventFormat("配信なし" )).toBe("unknown");
    expect(eventFormat("ハイブリッド開催" )).toBe("hybrid");
    expect(eventFormat("Virtual workshop" )).toBe("online");
    expect(eventFormat("東京のエンジニア登壇" )).toBe("unknown");
  });
  it("separates local, Malaysia, overseas and online participation lanes", () => {
    expect(eventRegion("東京で現地開催", "onsite")).toBe("japan");
    expect(eventRegion("Kuala Lumpurで開催", "onsite")).toBe("malaysia");
    expect(eventRegion("Berlin conference", "onsite")).toBe("overseas");
    expect(eventRegion("Tokyoからオンライン参加可能", "hybrid")).toBe("online");
  });
  it("combines topic OR with search, format and bookmark restrictions", () => {
    const entries = [
      describeMeetup(event({ title: "AWS オンライン交流会", plan: { ...EMPTY_PLAN, saved: true } }), preference),
      describeMeetup(event({ id: "b", title: "AI オンライン講演", summary: "", plan: EMPTY_PLAN }), preference)
    ];
    const result = filterMeetups(entries, { ...filters, topics: ["cloud", "data"], format: "online", query: "AWS", view: "saved" });
    expect(result.map((entry) => entry.item.id)).toEqual(["a"]);
    expect(filterMeetups(entries, { ...filters, query: "存在しない" })).toEqual([]);
  });
  it("allows discovery without preferences and sorts without mutating inputs", () => {
    const entries = [
      describeMeetup(event({ id: "old", detectedAt: "2026-09-01T01:00:00.000Z" }), preference),
      describeMeetup(event({ id: "new", title: "AWS交流会", summary: "", detectedAt: "2026-09-05T01:00:00.000Z" }), preference)
    ];
    expect(filterMeetups(entries, filters)[0].item.id).toBe("old");
    expect(filterMeetups(entries, { ...filters, sort: "newest" })[0].item.id).toBe("new");
    expect(entries[0].item.id).toBe("old");
    expect(filterMeetups(entries, { ...filters, view: "matches" })).toHaveLength(1);
    const noPreference = [describeMeetup(event({}), { eventTopics: [], eventPeople: [], eventTalks: [] })];
    expect(filterMeetups(noPreference, filters)).toHaveLength(1);
    expect(filterMeetups(noPreference, { ...filters, view: "matches" })).toHaveLength(0);
  });
});
