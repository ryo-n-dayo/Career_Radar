import { describe, expect, it } from "vitest";

import {
  computeHiringHeatMap,
  computePostingTrend,
  extractHiringKeywords,
  type HeatmapPost
} from "./heatmap";

function post(daysAgo: number, text: string): HeatmapPost {
  const d = new Date(Date.now() - daysAgo * 24 * 60 * 60 * 1000);
  return { postedAt: d, content: text, source: "X" };
}

describe("extractHiringKeywords", () => {
  it("採用関連キーワードを抽出できる", () => {
    const posts: HeatmapPost[] = [
      { content: "新卒採用 募集 開始しました", postedAt: new Date() },
      { content: "説明会のご案内。エントリー受付中", postedAt: new Date() }
    ];
    const kws = extractHiringKeywords(posts);
    expect(kws).toContain("採用");
    expect(kws).toContain("募集");
    expect(kws).toContain("説明会");
    expect(kws).toContain("エントリー");
  });
});

describe("computePostingTrend", () => {
  it("直近7日が増えたらtrend=up", () => {
    const now = new Date("2026-04-21T00:00:00.000Z");
    const posts: HeatmapPost[] = [
      { postedAt: new Date("2026-04-20T00:00:00.000Z"), content: "募集" },
      { postedAt: new Date("2026-04-19T00:00:00.000Z"), content: "募集" },
      { postedAt: new Date("2026-04-18T00:00:00.000Z"), content: "募集" },
      { postedAt: new Date("2026-04-12T00:00:00.000Z"), content: "募集" } // previous window
    ];
    const t = computePostingTrend(posts, now);
    expect(t.trend).toBe("up");
  });
});

describe("computeHiringHeatMap", () => {
  it("OpenAIなしでもスコアを返す（エラーにしない）", async () => {
    const now = new Date();
    const posts: HeatmapPost[] = [
      post(2, "採用 募集 インターン"),
      post(1, "説明会 エントリー 〆切"),
      post(10, "会社紹介")
    ];
    const result = await computeHiringHeatMap(posts, { now, openaiApiKey: "" });
    expect(result.score).toBeGreaterThanOrEqual(0);
    expect(result.score).toBeLessThanOrEqual(100);
    expect(["up", "stable", "down"]).toContain(result.trend);
    expect(Array.isArray(result.keywords)).toBe(true);
    expect(result.reasoning.length).toBeGreaterThan(0);
  });

  it("センチメントが強くpositiveならtrendが上向きになり得る", async () => {
    const now = new Date("2026-04-21T00:00:00.000Z");
    const posts: HeatmapPost[] = [
      // posting trendをstableにする（直近7日:1件 / その前7日:1件）
      { postedAt: new Date("2026-04-20T00:00:00.000Z"), content: "募集" },
      { postedAt: new Date("2026-04-10T00:00:00.000Z"), content: "募集" }
    ];
    const result = await computeHiringHeatMap(posts, {
      now,
      sentimentProvider: async (ps) => ({
        labels: ps.map(() => "positive"),
        reasoning: "採用関連の告知が多く、前向きな内容が中心です。"
      })
    });
    expect(result.trend).toBe("up");
    expect(result.score).toBeGreaterThan(0);
  });
});

