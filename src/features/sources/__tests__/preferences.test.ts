import { describe, expect, it } from "vitest";

import { applyEventInterestProfile, applyInterestProfile, effectiveIncludeKeywords, normalizeKeywords, normalizeTopicHistory, sameTopics } from "../preferences";

describe("personal interest profile", () => {
  it("希望語を含む候補を加点し、除外語を含む候補を下げる", () => {
    const profile = { includeKeywords: ["AI", "長期インターン"], excludeKeywords: ["オンラインのみ"], selectedTopics: [], topicHistory: [], eventTopics: [], eventPeople: [], eventTalks: [] };
    const wanted = applyInterestProfile({ baseScore: 50, text: "AIの長期インターンを募集", profile });
    const unwanted = applyInterestProfile({ baseScore: 50, text: "AIインターン（オンラインのみ）", profile });

    expect(wanted.score).toBeGreaterThan(50);
    expect(wanted.reasons).toContain("希望条件: AI・長期インターン");
    expect(unwanted.score).toBeLessThan(50);
    expect(unwanted.reasons).toContain("除外条件: オンラインのみ");
  });

  it("入力語を重複なく安全な長さに整える", () => {
    expect(normalizeKeywords("AI, 海外\nAI、x")).toEqual(["AI", "海外"]);
  });

  it("選択トピックの語句を希望条件に加える", () => {
    const keywords = effectiveIncludeKeywords({ includeKeywords: [], excludeKeywords: [], selectedTopics: ["overseas", "ai"], topicHistory: [], eventTopics: [], eventPeople: [], eventTalks: [] });
    expect(keywords).toContain("マレーシア");
    expect(keywords).toContain("生成AI");
  });

  it("過去のトピック選択を日時つきで安全に読み込む", () => {
    const history = normalizeTopicHistory([{ topicIds: ["intern", "career_events"], selectedAt: "2026-09-03T10:00:00.000Z" }, { topicIds: ["unknown"], selectedAt: "not-a-date" }]);
    expect(history).toEqual([{ topicIds: ["intern", "career_events"], selectedAt: "2026-09-03T10:00:00.000Z" }]);
    expect(sameTopics(["intern", "ai"], ["ai", "intern"])).toBe(true);
  });

  it("イベント専用の話題と交流ニーズが一致した候補を上に出す", () => {
    const profile = { includeKeywords: [], excludeKeywords: [], selectedTopics: [], topicHistory: [], eventTopics: ["design", "meetup"], eventPeople: ["エンジニア"], eventTalks: ["アイデア創出"] };
    const result = applyEventInterestProfile({ baseScore: 50, text: "Design Sprintでエンジニアとアイデア創出を体験するワークショップ", profile });
    expect(result.score).toBeGreaterThan(50);
    expect(result.matchedTopics).toEqual(expect.arrayContaining(["design", "meetup"]));
    expect(result.matchedPeople).toEqual(["エンジニア"]);
    expect(result.matchedTalks).toEqual(["アイデア創出"]);
  });
});
