import { describe, expect, it } from "vitest";

import { isTechLearningBenefit, isUsefulITNews, scoreCandidate } from "../scoring";

describe("技術学習特典の判定", () => {
  it("資格試験の割引・無償受験を通す", () => {
    const text = "AWS Certified AI Practitioner 試験が50%割引。合格するとCloud Practitionerを無料で受験できます。";
    expect(isTechLearningBenefit(text)).toBe(true);
    expect(scoreCandidate({ title: text }).kind).toBe("LEARNING_BENEFIT");
  });

  it("技術との関係がない一般的なセールは通さない", () => {
    expect(isTechLearningBenefit("週末限定の家電セール、全品50%割引")).toBe(false);
  });

  it("公式の製品更新・セキュリティ情報をITニュースとして通す", () => {
    expect(isUsefulITNews("Google Cloud の新機能をリリース。開発者向けのセキュリティ更新を公開しました。")).toBe(true);
    expect(isUsefulITNews("GitHub Changelog: Code scanning の新しいセキュリティ更新を公開")).toBe(true);
    expect(isUsefulITNews("Vercel が新しいデプロイメント機能を提供開始")).toBe(true);
    expect(isUsefulITNews("人気商品の新作を発表しました")).toBe(false);
  });
});
