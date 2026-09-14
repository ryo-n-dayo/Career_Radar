import { describe, expect, it } from "vitest";

import { applyLearning, buildLearningProfile, suggestXQueryTerms } from "../learning";

describe("applyLearning", () => {
  const examples = [
    { sourceId: "startup", text: "学生インターン募集", relevant: true },
    { sourceId: "startup", text: "インターン説明会", relevant: true },
    { sourceId: "startup", text: "採用イベント", relevant: true },
    { sourceId: "other", text: "キャンペーン告知", relevant: false },
    { sourceId: "other", text: "プレゼント企画", relevant: false },
    { sourceId: "other", text: "キャンペーン実施中", relevant: false }
  ];

  it("役立つ判定が多い情報源を加点する", () => {
    const result = applyLearning({ baseScore: 50, sourceId: "startup", text: "学生向けインターン募集", examples });
    expect(result.score).toBeGreaterThan(50);
    expect(result.reasons).toContain("この情報源の保存実績");
  });

  it("学習例が少ない時は既存スコアを維持する", () => {
    const result = applyLearning({ baseScore: 55, sourceId: "startup", text: "インターン", examples: examples.slice(0, 4) });
    expect(result).toEqual({ score: 55, reasons: [] });
  });

  it("強い興味なしを、通常の不要より強く減点する", () => {
    const strongNegative = [
      { sourceId: "unwanted", text: "営業職 募集", relevant: false, value: -2 },
      { sourceId: "unwanted", text: "営業 インターン", relevant: false, value: -2 },
      { sourceId: "startup", text: "AI インターン", relevant: true, value: 2 },
      { sourceId: "other", text: "採用 イベント", relevant: true, value: 1 },
      { sourceId: "other", text: "会社説明会", relevant: false, value: -1 }
    ];
    const result = applyLearning({ baseScore: 60, sourceId: "unwanted", text: "営業職向けインターン", examples: strongNegative });
    expect(result.score).toBeLessThan(60);
    expect(result.reasons).toContain("この情報源の不要判定実績");
  });

  it("興味ありの傾向をX検索語に採用し、除外語は使わない", () => {
    const terms = suggestXQueryTerms({
      examples: [
        { sourceId: "a", text: "生成AIの長期インターン募集", relevant: true, value: 2 },
        { sourceId: "b", text: "海外スタートアップのイベント", relevant: true, value: 1 },
        { sourceId: "c", text: "営業職の新卒採用", relevant: false, value: -2 }
      ],
      includeKeywords: ["マレーシア"],
      excludeKeywords: ["営業"],
      fallback: ["インターン", "営業"]
    });
    expect(terms).toContain("生成AI");
    expect(terms).toContain("マレーシア");
    expect(terms).not.toContain("営業");
  });

  it("一回だけの評価を平滑化し、十分な履歴より強く扱わない", () => {
    const profile = buildLearningProfile([
      { sourceId: "oneTap", text: "AI イベント", relevant: true, value: 2 },
      { sourceId: "steady", text: "AI インターン", relevant: true, value: 2 },
      { sourceId: "steady", text: "AI 募集", relevant: true, value: 2 },
      { sourceId: "steady", text: "AI 説明会", relevant: true, value: 2 },
      { sourceId: "skip", text: "営業 採用", relevant: false, value: -2 },
      { sourceId: "skip", text: "営業 新卒", relevant: false, value: -2 }
    ]);
    const oneTap = profile.sources.find((item) => item.key === "oneTap");
    const steady = profile.sources.find((item) => item.key === "steady");
    expect(oneTap?.confidence).toBeLessThan(steady?.confidence ?? 1);
    expect(oneTap?.points).toBeLessThan(steady?.points ?? 0);
  });

  it("候補に使った情報源・話題の根拠を返す", () => {
    const result = applyLearning({ baseScore: 50, sourceId: "startup", text: "長期インターン募集", examples });
    expect(result.contributions?.some((item) => item.kind === "source" && item.key === "startup")).toBe(true);
    expect(result.contributions?.some((item) => item.kind === "signal" && item.key === "インターン")).toBe(true);
  });
});
