import { describe, expect, it } from "vitest";

import { classifyFormat, classifyKind } from "../classify";

describe("classifyKind", () => {
  it("ハッカソンを検出する", () => {
    expect(classifyKind({ title: "第5回 学生ハッカソン 2026" })).toBe("HACKATHON");
    expect(classifyKind({ title: "Spring Hackathon Tokyo" })).toBe("HACKATHON");
    expect(classifyKind({ title: "開発合宿 in 熱海" })).toBe("HACKATHON");
  });

  it("ビジコン系をコンテストに寄せる", () => {
    expect(classifyKind({ title: "学生ビジネスコンテスト2026" })).toBe("CONTEST");
    expect(classifyKind({ title: "ビジコン説明会つき本選" })).toBe("CONTEST");
    expect(classifyKind({ title: "地域課題アイデアソン" })).toBe("CONTEST");
    expect(classifyKind({ title: "AIピッチコンテスト" })).toBe("CONTEST");
  });

  it("セミナー語が混ざってもハッカソン本体を優先する", () => {
    expect(classifyKind({ title: "ハッカソン参加者向け事前説明会" })).toBe("HACKATHON");
  });

  it("インターン・勉強会・セミナーを振り分ける", () => {
    expect(classifyKind({ title: "3days サマーインターン" })).toBe("INTERNSHIP");
    expect(classifyKind({ title: "React もくもく会 #12" })).toBe("MEETUP");
    expect(classifyKind({ title: "エンジニア向けキャリアセミナー" })).toBe("SEMINAR");
  });

  it("タグからも判定できる", () => {
    expect(classifyKind({ title: "TechDay 2026", tags: ["hackathon", "student"] })).toBe("HACKATHON");
  });

  it("マイナビの仕事体験系をインターンに寄せる", () => {
    expect(classifyKind({ title: "セキュリティエンジニア　ワンデー仕事体験" })).toBe("INTERNSHIP");
    expect(classifyKind({ title: "実務型プログラム", tags: ["仕事体験", "実務型", "WEB開催"] })).toBe("INTERNSHIP");
  });

  it("オープン・カンパニーは説明会側に寄せる", () => {
    expect(classifyKind({ title: "【オープン・カンパニー】企業がよくわかる！企業理解プログラム" })).toBe("SEMINAR");
    expect(classifyKind({ title: "オープンカンパニー 2028" })).toBe("SEMINAR");
  });

  it("手がかりが無ければ OTHER", () => {
    expect(classifyKind({ title: "定例ミーティング" })).toBe("OTHER");
  });
});

describe("classifyFormat", () => {
  it("会場が無くオンライン語があれば ONLINE", () => {
    expect(classifyFormat({ title: "オンライン開催のLT会" })).toBe("ONLINE");
  });

  it("会場も手がかりも無ければ OFFLINE", () => {
    expect(classifyFormat({ title: "第3回 交流会" })).toBe("OFFLINE");
  });

  it("会場がオンライン表記だけなら ONLINE", () => {
    expect(classifyFormat({ venue: "オンライン(Zoom)" })).toBe("ONLINE");
  });

  it("実会場とオンライン語が両方あれば HYBRID", () => {
    expect(classifyFormat({ venue: "渋谷ヒカリエ 11F", title: "現地+オンライン同時開催" })).toBe("HYBRID");
  });

  it("実会場のみなら OFFLINE", () => {
    expect(classifyFormat({ venue: "渋谷ヒカリエ 11F" })).toBe("OFFLINE");
  });

  it("会場欄が空でも説明文のオンライン表記を拾う", () => {
    expect(
      classifyFormat({ title: "第169回 勉強会", description: "## 場所 オンライン会場： Zoom 会場" })
    ).toBe("ONLINE");
  });

  it("実会場があり説明文にオンライン表記があれば HYBRID", () => {
    expect(
      classifyFormat({ venue: "渋谷ヒカリエ 11F", description: "オンライン配信も行います" })
    ).toBe("HYBRID");
  });

  it("マイナビの WEB開催 タグを ONLINE として拾う", () => {
    expect(classifyFormat({ title: "ワンデー仕事体験", tags: ["仕事体験", "実務型", "WEB開催"] })).toBe("ONLINE");
  });
});
