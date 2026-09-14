import { describe, expect, it } from "vitest";

import { isAllowedTechEventLocation, isTechEventRecord, isTechGrowthEvent, techEventDetails } from "../recruitingMeetup";

describe("技術イベントの判定", () => {
  it("エンジニアと交流できる採用Meet Upを通す", () => {
    expect(isTechGrowthEvent("採用Meet Upを開催します。学生の方はエンジニアと直接交流できます。"))
      .toBe(true);
  });

  it("ハッカソンや技術ワークショップを通す", () => {
    expect(isTechGrowthEvent("生成AIハッカソンを開催します。参加者募集中です。"))
      .toBe(true);
  });

  it("開催や参加のない一般的な技術投稿は通さない", () => {
    expect(isTechGrowthEvent("来週の技術ミートアップで登壇します。"))
      .toBe(false);
  });

  it("イベント一覧や規約ではなく、日程のある実イベントを残す", () => {
    expect(isTechEventRecord({ title: "AWS JumpStart 2026 のご案内", summary: "9月17日〜18日、オンラインでハンズオンを開催します。申込受付中。" }))
      .toBe(true);
    expect(isTechEventRecord({ title: "イベントの利用規約", summary: "AWS のクラウドイベントについて" }))
      .toBe(false);
    expect(isTechEventRecord({ title: "クラウドイベント、ウェビナー、カンファレンス – AWS", summary: "クラウドコミュニティのイベントを開催しています。" }))
      .toBe(false);
  });

  it("公式イベントページはメタ説明に申込語がなくても残す", () => {
    expect(isTechEventRecord({
      title: "JAWS SONIC & MIDNIGHT JAWS 2026 — THE MARATHON",
      summary: "JAWS-UG（AWS User Group Japan）が贈る 24 時間オンラインリレーイベント。2026/9/5 12:00 JST → 9/6 12:00 JST"
    })).toBe(true);
    expect(isTechEventRecord({
      title: "Build with Gemini | Google Cloud",
      summary: "Join Google Cloud experts for a hands-on day building secure, production-ready AI agents."
    })).toBe(true);
    expect(isTechEventRecord({
      title: "KubeCon + CloudNativeCon North America",
      summary: "The flagship conference brings together cloud native communities for collaboration and learning."
    })).toBe(true);
    expect(isTechEventRecord({
      title: "Google宣伝！爆速アイデア創出を1日で体験！ Design Sprint",
      summary: "プロダクトとデザインを学ぶ実践型ワークショップ。参加枠あり。"
    })).toBe(true);
  });

  it("投稿から日程と会場の短い手がかりを取り出す", () => {
    expect(techEventDetails("9/11（金）19:00〜20:30 弊社オフィスで採用Meet Upを開催します")).toEqual({
      schedule: "9/11（金）19:00〜20:30",
      place: "弊社オフィスで採用Meet Upを開催します"
    });
    expect(techEventDetails("November 9-12, 2026 | Salt Lake City, Utah")).toEqual({
      schedule: "November 9-12, 2026",
      place: "Salt Lake City, Utah"
    });
  });

  it("海外はマレーシアまたはオンラインに絞り、日本国内の告知を残す", () => {
    expect(isAllowedTechEventLocation({ title: "GREE Tech Conference", summary: "東京で開催", sourceKind: "TECH_EVENTS" })).toBe(true);
    expect(isAllowedTechEventLocation({ title: "AWS Cloud and AI Day", summary: "Kuala Lumpur, Malaysia", sourceKind: "TECH_EVENTS" })).toBe(true);
    expect(isAllowedTechEventLocation({ title: "NVIDIA Developer Contest", summary: "Online sessions and virtual Q&A", sourceKind: "TECH_EVENTS" })).toBe(true);
    expect(isAllowedTechEventLocation({ title: "KubeCon North America", summary: "Las Vegas, United States", sourceKind: "TECH_EVENTS" })).toBe(false);
    expect(isAllowedTechEventLocation({ title: "開発者向けハッカソン", summary: "参加受付中", sourceKind: "X_ALGO_TECH_EVENT" })).toBe(true);
  });
});
