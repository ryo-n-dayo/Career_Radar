import { describe, expect, it } from "vitest";
import { queryForTechEventDiscovery } from "../scanX";

describe("technical-event X query", () => {
  it("keeps the event query below X API query length limits", () => {
    const query = queryForTechEventDiscovery(
      Array.from({ length: 30 }, (_, index) => `very-long-interest-keyword-${index}`),
      { includeKeywords: [], excludeKeywords: [], selectedTopics: [], topicHistory: [], eventTopics: ["ai", "cloud", "hackathon", "data", "design", "oss", "meetup"], eventPeople: Array.from({ length: 30 }, (_, index) => `person-${index}`), eventTalks: Array.from({ length: 30 }, (_, index) => `talk-${index}`) }
    );
    expect(query.length).toBeLessThanOrEqual(1024);
    expect(query).toContain("-is:retweet -is:reply");
    expect(query).toContain("ハッカソン");
  });
});
