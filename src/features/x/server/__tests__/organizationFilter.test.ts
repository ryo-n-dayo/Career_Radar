import { describe, expect, it } from "vitest";

import { assessCorporatePost, assessOrganizationAuthor } from "../organizationFilter";

describe("企業・団体発信の判定", () => {
  it("公式サイトと採用プロフィールを持つ企業の募集投稿を通す", () => {
    const author = {
      id: "1",
      name: "Example株式会社 採用",
      username: "example_recruit",
      description: "Example株式会社の新卒・インターン採用情報です。",
      url: "https://example.com/careers",
      public_metrics: { followers_count: 740 }
    };

    const result = assessCorporatePost("27卒向け長期インターンの募集を開始しました。", author);

    expect(result.eligible).toBe(true);
    expect(result.reasons).toContain("企業・団体の公式発信");
  });

  it("一般ユーザーのイベント感想は通さない", () => {
    const author = {
      id: "2",
      name: "太郎",
      username: "taro_diary",
      description: "大学生。日常と趣味の記録。",
      public_metrics: { followers_count: 42 }
    };

    expect(assessCorporatePost("AIイベントに参加してきた感想。最高だった！", author).eligible).toBe(false);
  });

  it("公式サイトと認証がある企業アカウントは自己紹介に社名がなくても通す", () => {
    const author = {
      id: "3",
      name: "Product News",
      username: "product_news",
      description: "Updates from our team.",
      url: "https://product.example.com",
      verified: true,
      public_metrics: { followers_count: 120 }
    };

    expect(assessOrganizationAuthor(author).eligible).toBe(true);
    expect(assessCorporatePost("新サービスをリリースしました。", author).eligible).toBe(true);
  });

  it("専門プロフィールを持つ認証済み個人の学生向けイベント告知を通す", () => {
    const author = {
      id: "4",
      name: "Arisa Ito",
      username: "arisa_startup",
      description: "スタートアップと学生のキャリアイベントを企画しています。",
      verified: true,
      public_metrics: { followers_count: 3_000 }
    };

    const result = assessCorporatePost("インターンを探している大学生に必見のキャリアイベントを開催します！", author);

    expect(result.eligible).toBe(true);
    expect(result.reasons).toContain("イベント主催者・告知者の一次発信");
  });

  it("企業公式の学生参加可デザインイベント告知を通す", () => {
    const author = {
      id: "5",
      name: "MIXI 新卒採用公式アカウント",
      username: "HR_mixi",
      description: "MIXIグループの新卒採用・イベント情報を発信しています。",
      url: "https://mixi.co.jp/recruit/",
      verified: true,
      public_metrics: { followers_count: 12_000 }
    };

    const result = assessCorporatePost("3社のデザインリードが登壇するイベントを開催。学生の方も参加いただけます。", author);

    expect(result.eligible).toBe(true);
    expect(result.reasons.some((reason) => reason.includes("一次発信"))).toBe(true);
  });

  it("海外の公式技術団体による英語イベント告知を通す", () => {
    const author = {
      id: "6",
      name: "Cloud Native Computing Foundation",
      username: "cloudnativefdn",
      description: "The foundation for cloud native open source communities.",
      url: "https://www.cncf.io",
      verified: true,
      public_metrics: { followers_count: 90_000 }
    };

    expect(assessCorporatePost("Registration is open for our Kubernetes conference and hands-on workshops.", author).eligible).toBe(true);
  });
});
