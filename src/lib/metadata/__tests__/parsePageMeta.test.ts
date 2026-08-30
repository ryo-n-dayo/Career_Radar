import { describe, expect, it } from "vitest";

import { DESCRIPTION_MAX_LENGTH, parsePageMeta, truncateDescription } from "../parsePageMeta";

const URL = "https://example.com/events/1";

describe("parsePageMeta", () => {
  it("JSON-LD の Event を最優先で使う", () => {
    const html = `
      <html><head>
        <meta property="og:title" content="OGPのタイトル">
        <script type="application/ld+json">
        {
          "@context": "https://schema.org",
          "@type": "Event",
          "name": "第5回 学生ハッカソン",
          "description": "48時間の開発イベント",
          "startDate": "2026-09-12T10:00:00+09:00",
          "endDate": "2026-09-13T18:00:00+09:00",
          "location": { "@type": "Place", "name": "渋谷ヒカリエ" }
        }
        </script>
      </head><body></body></html>`;

    const meta = parsePageMeta(html, URL);
    expect(meta.title).toBe("第5回 学生ハッカソン");
    expect(meta.description).toBe("48時間の開発イベント");
    expect(meta.venue).toBe("渋谷ヒカリエ");
    expect(meta.startsAt?.toISOString()).toBe("2026-09-12T01:00:00.000Z");
    expect(meta.endsAt?.toISOString()).toBe("2026-09-13T09:00:00.000Z");
  });

  it("@graph の中に入った Event も見つける", () => {
    const html = `<script type="application/ld+json">
      {"@graph":[{"@type":"WebSite","name":"サイト"},{"@type":"Event","name":"ビジコン決勝","startDate":"2026-10-01T13:00:00Z"}]}
    </script>`;

    const meta = parsePageMeta(html, URL);
    expect(meta.title).toBe("ビジコン決勝");
    expect(meta.startsAt?.toISOString()).toBe("2026-10-01T13:00:00.000Z");
  });

  it("location が PostalAddress のときは住所を組み立てる", () => {
    const html = `<script type="application/ld+json">
      {"@type":"Event","name":"X","location":{"@type":"Place","name":"会場A","address":{"addressRegion":"東京都","addressLocality":"渋谷区"}}}
    </script>`;

    expect(parsePageMeta(html, URL).venue).toBe("会場A (東京都 渋谷区)");
  });

  it("JSON-LD が無ければ OGP を使う", () => {
    const html = `
      <meta property="og:title" content="サマーインターン募集">
      <meta property="og:description" content="3日間の就業体験">
      <meta property="og:image" content="https://example.com/a.png">
      <meta property="og:site_name" content="サンプル株式会社">`;

    const meta = parsePageMeta(html, URL);
    expect(meta.title).toBe("サマーインターン募集");
    expect(meta.description).toBe("3日間の就業体験");
    expect(meta.imageUrl).toBe("https://example.com/a.png");
    expect(meta.siteName).toBe("サンプル株式会社");
    expect(meta.startsAt).toBeUndefined();
  });

  it("属性の順序が逆でも meta を拾える", () => {
    const html = `<meta content="逆順のタイトル" property="og:title">`;
    expect(parsePageMeta(html, URL).title).toBe("逆順のタイトル");
  });

  it("OGP が無ければ <title> にフォールバックする", () => {
    const html = `<html><head><title>  ページ  タイトル  </title></head></html>`;
    expect(parsePageMeta(html, URL).title).toBe("ページ タイトル");
  });

  it("壊れた JSON-LD は無視して OGP へ落ちる", () => {
    const html = `
      <script type="application/ld+json">{ this is not json }</script>
      <meta property="og:title" content="フォールバック">`;
    expect(parsePageMeta(html, URL).title).toBe("フォールバック");
  });

  it("HTML エンティティをデコードする", () => {
    const html = `<meta property="og:title" content="A &amp; B &quot;C&quot;">`;
    expect(parsePageMeta(html, URL).title).toBe('A & B "C"');
  });

  it("最終 URL をそのまま返す", () => {
    expect(parsePageMeta("", "https://example.com/final").url).toBe("https://example.com/final");
  });
});

describe("truncateDescription", () => {
  it("上限を超えたら切って … を付ける", () => {
    const long = "あ".repeat(DESCRIPTION_MAX_LENGTH + 50);
    const result = truncateDescription(long);
    expect(result).toHaveLength(DESCRIPTION_MAX_LENGTH + 1);
    expect(result?.endsWith("…")).toBe(true);
  });

  it("上限以内ならそのまま", () => {
    expect(truncateDescription("短い説明")).toBe("短い説明");
  });

  it("空文字や空白のみは undefined", () => {
    expect(truncateDescription("   ")).toBeUndefined();
    expect(truncateDescription(undefined)).toBeUndefined();
  });
});
