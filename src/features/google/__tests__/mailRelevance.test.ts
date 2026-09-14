import { describe, expect, it } from "vitest";

import { isRelevantGoogleMail } from "../mailRelevance";

describe("Googleメールの表示条件", () => {
  it("インターン・採用メールを残す", () => {
    expect(isRelevantGoogleMail({ subject: "エンジニア長期インターン募集", snippet: "応募受付を開始しました" })).toBe(true);
    expect(isRelevantGoogleMail({ subject: "Software engineering internship", snippet: "Apply now" })).toBe(true);
  });

  it("技術イベントのメールを残す", () => {
    expect(isRelevantGoogleMail({ subject: "AWS開発者向けハンズオン", snippet: "クラウド技術イベントの参加登録" })).toBe(true);
    expect(isRelevantGoogleMail({ subject: "AI developer conference", snippet: "Online workshop registration" })).toBe(true);
  });

  it("技術ニュースや一般メールだけでは残さない", () => {
    expect(isRelevantGoogleMail({ subject: "今週のAIニュース", snippet: "最新モデルの紹介" })).toBe(false);
    expect(isRelevantGoogleMail({ subject: "明日の予定", snippet: "カレンダーのリマインダー" })).toBe(false);
    expect(isRelevantGoogleMail({ subject: "クラウド料金のお知らせ", snippet: "請求額を確認してください" })).toBe(false);
  });
});
