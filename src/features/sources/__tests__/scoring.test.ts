import { describe, expect, it } from "vitest";

import { isEligibleGraduationWindow, isEngineeringInternship, isEngineeringNewGraduate, scoreCandidate } from "../scoring";

describe("scoreCandidate", () => {
  it("短期インターン募集を最優先にする", () => {
    const now = new Date("2026-09-01T05:00:00+09:00");
    const result = scoreCandidate({ title: "学生インターン追加募集", summary: "締切 2026年9月2日 12:00", now });
    expect(result.kind).toBe("INTERNSHIP");
    expect(result.score).toBeGreaterThanOrEqual(90);
    expect(result.reasons).toContain("48時間以内");
  });

  it("通常のお知らせは低優先度にする", () => {
    const result = scoreCandidate({ title: "コーポレートサイトを更新しました", now: new Date("2026-09-01T05:00:00+09:00") });
    expect(result.kind).toBe("COMPANY_UPDATE");
    expect(result.score).toBe(0);
  });

  it("技術系インターンを通し、営業職インターンを除外する", () => {
    expect(isEngineeringInternship("生成AIプロダクトのバックエンドエンジニア長期インターン募集")).toBe(true);
    expect(isEngineeringInternship("法人営業の長期インターン募集")).toBe(false);
  });

  it("技術職の新卒募集を通し、営業職の新卒募集を除外する", () => {
    expect(isEngineeringNewGraduate("2028年9月までに学士号以上を取得見込みの方（2028年卒） ソリューションアーキテクト 新卒採用 エントリー受付中")).toBe(true);
    expect(isEngineeringNewGraduate("2028年卒 ソリューションアーキテクト 新卒採用 エントリー受付中")).toBe(false);
    expect(isEngineeringNewGraduate("2029年卒 法人営業 新卒採用 エントリー受付中")).toBe(false);
    expect(isEngineeringNewGraduate("2029年卒 Data AI ストラテジスト ビジネス職 募集中")).toBe(false);
    expect(isEligibleGraduationWindow("2029年卒 エンジニア採用")).toBe(true);
  });

  it("空白を含む公式ページの日付も期限として扱う", () => {
    const now = new Date("2026-09-07T05:00:00+09:00");
    const result = scoreCandidate({ title: "AWS認定試験が50%割引", summary: "2026 年 9 月 8 日までに受験してください", now });
    expect(result.deadline?.getFullYear()).toBe(2026);
    expect(result.reasons).toContain("48時間以内");
  });
});
