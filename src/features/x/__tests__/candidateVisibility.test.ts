import { describe, expect, it } from "vitest";

import { isVisibleInPersonalFeed } from "../candidateVisibility";

describe("個人向けフィードの表示条件", () => {
  it("企業一次情報フィルター導入前の横断検索結果を隠す", () => {
    expect(isVisibleInPersonalFeed({ source: { kind: "X_ALGO" }, reasons: ["イベント", "X API"] })).toBe(false);
  });

  it("企業・団体の公式発信は表示する", () => {
    expect(isVisibleInPersonalFeed({ source: { kind: "X_ALGO" }, reasons: ["企業・団体の公式発信", "X API"] })).toBe(true);
  });

  it("条件を満たすイベント主催者の一次発信も表示する", () => {
    expect(isVisibleInPersonalFeed({ source: { kind: "X_ALGO" }, reasons: ["イベント主催者・告知者の一次発信", "X API"] })).toBe(true);
  });

  it("技術イベント用のXフィードも同じ一次情報条件で表示する", () => {
    expect(isVisibleInPersonalFeed({ source: { kind: "X_ALGO_TECH_EVENT" }, reasons: ["企業・団体の公式発信"] })).toBe(true);
    expect(isVisibleInPersonalFeed({ source: { kind: "X_ALGO_TECH_EVENT" }, reasons: ["イベント", "X API"] })).toBe(false);
  });

  it("手動監視と練習用データはそのまま表示する", () => {
    expect(isVisibleInPersonalFeed({ source: { kind: "X_API" }, reasons: [] })).toBe(true);
    expect(isVisibleInPersonalFeed({ source: { kind: "DEMO" }, reasons: [] })).toBe(true);
  });
});
