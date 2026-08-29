import type { EventFormat, EventKind } from "../types/eventItem";

/**
 * 判定は上から順に評価し、最初に当たったものを採用する。
 * ハッカソン / コンテストを優先しているのは、
 * 「◯◯ハッカソン参加者向け説明会」のようにセミナー語が混ざるケースで
 * 本体の性質を取りこぼさないため。
 */
const KIND_PATTERNS: Array<{ kind: EventKind; patterns: RegExp[] }> = [
  {
    kind: "HACKATHON",
    patterns: [/ハッカソン/, /hackathon/i, /hack\s?day/i, /開発合宿/]
  },
  {
    kind: "CONTEST",
    patterns: [
      /ビジネスコンテスト/,
      /ビジコン/,
      /アイデアソン/,
      /ideathon/i,
      /ピッチコンテスト/,
      /コンテスト/,
      /コンペティション/,
      /contest/i,
      /competition/i,
      /大賞/,
      /グランプリ/
    ]
  },
  {
    kind: "INTERNSHIP",
    patterns: [/インターン/, /internship/i, /就業体験/, /1day仕事体験/i]
  },
  {
    kind: "SEMINAR",
    patterns: [/セミナー/, /説明会/, /講演/, /webinar/i, /seminar/i, /カンファレンス/, /conference/i]
  },
  {
    kind: "MEETUP",
    patterns: [/勉強会/, /もくもく/, /meetup/i, /LT会/i, /ライトニングトーク/, /輪読/, /ワークショップ/, /workshop/i]
  }
];

/**
 * タイトル・タグ・説明文からイベント種別を推定する。
 * connpass / Doorkeeper はどちらも種別のフィールドを持たないため、
 * 取り込み時にここで機械的に振り分ける。
 */
export function classifyKind(input: { title: string; tags?: string[]; description?: string }): EventKind {
  const haystack = [input.title, ...(input.tags ?? []), input.description ?? ""].join(" ");

  for (const { kind, patterns } of KIND_PATTERNS) {
    if (patterns.some((pattern) => pattern.test(haystack))) return kind;
  }

  return "OTHER";
}

const ONLINE_PATTERNS = [/オンライン/, /online/i, /zoom/i, /リモート/, /discord/i, /配信/];

/**
 * 会場文字列から開催形式を推定する。
 * オンラインを示す語と実会場の両方が出てくる場合はハイブリッド扱いにする。
 */
export function classifyFormat(input: { venue?: string; title?: string; tags?: string[] }): EventFormat {
  const venue = input.venue?.trim() ?? "";
  const haystack = [venue, input.title ?? "", ...(input.tags ?? [])].join(" ");
  const mentionsOnline = ONLINE_PATTERNS.some((pattern) => pattern.test(haystack));

  if (!venue) return mentionsOnline ? "ONLINE" : "OFFLINE";

  const venueIsOnlineOnly = ONLINE_PATTERNS.some((pattern) => pattern.test(venue)) && venue.length <= 20;
  if (venueIsOnlineOnly) return "ONLINE";

  return mentionsOnline ? "HYBRID" : "OFFLINE";
}
