import {
  EVENT_FORMATS,
  EVENT_KINDS,
  INGEST_SOURCES,
  ingestSourceFromUrl,
  type EventFormat,
  type EventKind,
  type IngestSource
} from "../types/eventItem";
import { truncateDescription } from "@/lib/metadata/parsePageMeta";
import type { NormalizedEvent } from "./types";

export type ParseResult =
  | { ok: true; value: NormalizedEvent }
  | { ok: false; error: string };

function asString(value: unknown): string | undefined {
  if (typeof value !== "string") return undefined;
  const trimmed = value.trim();
  return trimmed.length > 0 ? trimmed : undefined;
}

function asDate(value: unknown, field: string): { date?: Date; error?: string } {
  const raw = asString(value);
  if (!raw) return {};
  const date = new Date(raw);
  if (Number.isNaN(date.getTime())) return { error: `${field} の日時が不正です` };
  return { date };
}

function asPositiveInt(value: unknown): number | undefined {
  if (typeof value === "number" && Number.isInteger(value) && value >= 0) return value;
  if (typeof value === "string" && /^\d+$/.test(value.trim())) return Number(value.trim());
  return undefined;
}

function asTags(value: unknown): string[] {
  const raw = Array.isArray(value)
    ? value
    : typeof value === "string"
      ? value.split(",")
      : [];

  const seen = new Set<string>();
  for (const entry of raw) {
    if (typeof entry !== "string") continue;
    const tag = entry.trim().replace(/^#/, "");
    if (tag) seen.add(tag);
  }
  return [...seen].slice(0, 12);
}

/**
 * 管理画面 / API から来た生の JSON を NormalizedEvent に落とす。
 * ここを通さずに upsertEvent を呼ばないこと。
 */
export function parseEventInput(body: unknown): ParseResult {
  if (!body || typeof body !== "object") {
    return { ok: false, error: "リクエストボディが不正です" };
  }
  const input = body as Record<string, unknown>;

  const url = asString(input.url);
  if (!url) return { ok: false, error: "url は必須です" };
  let parsedUrl: URL;
  try {
    parsedUrl = new URL(url);
  } catch {
    return { ok: false, error: "url の形式が正しくありません" };
  }
  if (parsedUrl.protocol !== "http:" && parsedUrl.protocol !== "https:") {
    return { ok: false, error: "url は http/https である必要があります" };
  }

  const title = asString(input.title);
  if (!title) return { ok: false, error: "title は必須です" };

  const kind = asString(input.kind);
  if (!kind || !EVENT_KINDS.includes(kind as EventKind)) {
    return { ok: false, error: "kind が不正です" };
  }

  const format = asString(input.format);
  if (!format || !EVENT_FORMATS.includes(format as EventFormat)) {
    return { ok: false, error: "format が不正です" };
  }

  const starts = asDate(input.startsAt, "開催日時");
  if (starts.error) return { ok: false, error: starts.error };
  if (!starts.date) return { ok: false, error: "startsAt は必須です" };

  const ends = asDate(input.endsAt, "終了日時");
  if (ends.error) return { ok: false, error: ends.error };
  if (ends.date && ends.date < starts.date) {
    return { ok: false, error: "終了日時が開催日時より前になっています" };
  }

  const deadline = asDate(input.applyDeadline, "応募締切");
  if (deadline.error) return { ok: false, error: deadline.error };

  const requestedSource = asString(input.ingestSource);
  const ingestSource: IngestSource =
    requestedSource && INGEST_SOURCES.includes(requestedSource as IngestSource)
      ? (requestedSource as IngestSource)
      : ingestSourceFromUrl(url);

  // オンライン専用イベントは開催地を持たない（locationLabel の前提を壊さないため）
  const prefecture = format === "ONLINE" ? undefined : asString(input.prefecture);

  return {
    ok: true,
    value: {
      url,
      externalId: asString(input.externalId),
      ingestSource,
      title,
      description: truncateDescription(asString(input.description)),
      imageUrl: asString(input.imageUrl),
      kind: kind as EventKind,
      format: format as EventFormat,
      prefecture,
      venue: asString(input.venue),
      startsAt: starts.date,
      endsAt: ends.date,
      applyDeadline: deadline.date,
      organizer: asString(input.organizer),
      organizerUrl: asString(input.organizerUrl),
      prize: asString(input.prize),
      tags: asTags(input.tags),
      capacity: asPositiveInt(input.capacity),
      accepted: asPositiveInt(input.accepted)
    }
  };
}
