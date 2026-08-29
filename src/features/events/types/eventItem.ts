export const EVENT_KINDS = [
  "HACKATHON",
  "CONTEST",
  "INTERNSHIP",
  "MEETUP",
  "SEMINAR",
  "OTHER"
] as const;

export type EventKind = (typeof EVENT_KINDS)[number];

export const EVENT_KIND_LABEL: Record<EventKind, string> = {
  HACKATHON: "ハッカソン",
  CONTEST: "コンテスト",
  INTERNSHIP: "インターン",
  MEETUP: "勉強会",
  SEMINAR: "セミナー",
  OTHER: "その他"
};

export const EVENT_FORMATS = ["ONLINE", "OFFLINE", "HYBRID"] as const;

export type EventFormat = (typeof EVENT_FORMATS)[number];

export const EVENT_FORMAT_LABEL: Record<EventFormat, string> = {
  ONLINE: "オンライン",
  OFFLINE: "オフライン",
  HYBRID: "ハイブリッド"
};

export const INGEST_SOURCES = ["CONNPASS", "DOORKEEPER", "MANUAL"] as const;

export type IngestSource = (typeof INGEST_SOURCES)[number];

export const INGEST_SOURCE_LABEL: Record<IngestSource, string> = {
  CONNPASS: "connpass",
  DOORKEEPER: "Doorkeeper",
  MANUAL: "手動登録"
};

/**
 * 一覧・詳細パネルで直接使う表示用の型。
 * 日付は ISO 文字列で持つ（サーバーコンポーネント境界を越えるため）。
 */
export type EventItem = {
  id: string;
  url: string;
  ingestSource: IngestSource;

  title: string;
  description?: string;
  imageUrl?: string;

  kind: EventKind;
  format: EventFormat;
  prefecture?: string;
  venue?: string;

  /** ISO datetime */
  startsAt: string;
  /** ISO datetime */
  endsAt?: string;
  /** ISO datetime。無ければカウントダウンは startsAt を使う。 */
  applyDeadline?: string;

  organizer?: string;
  organizerUrl?: string;
  prize?: string;
  tags: string[];

  capacity?: number;
  accepted?: number;
};

/** カウントダウン・並び替えの基準になる日時。締切が無ければ開催日。 */
export function countdownTarget(item: EventItem): Date {
  return new Date(item.applyDeadline ?? item.startsAt);
}

/** 開催地の表示ラベル。オンラインは都道府県を持たない。 */
export function locationLabel(item: EventItem): string {
  if (item.format === "ONLINE") return "オンライン";
  const place = item.prefecture ?? item.venue;
  if (!place) return EVENT_FORMAT_LABEL[item.format];
  return item.format === "HYBRID" ? `${place} / オンライン` : place;
}
