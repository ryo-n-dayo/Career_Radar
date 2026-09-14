import type { EventFormat, EventKind, IngestSource } from "../types/eventItem";

/**
 * 各コネクタが返す正規化済みイベント。
 * Prisma の Event に upsert される直前の形で、`url` が冪等キーになる。
 */
export type NormalizedEvent = {
  url: string;
  companyId?: string;
  externalId?: string;
  ingestSource: IngestSource;

  title: string;
  description?: string;
  imageUrl?: string;

  kind: EventKind;
  format: EventFormat;
  prefecture?: string;
  venue?: string;

  startsAt: Date;
  endsAt?: Date;
  applyDeadline?: Date;

  organizer?: string;
  organizerUrl?: string;
  prize?: string;
  tags: string[];

  capacity?: number;
  accepted?: number;
};

/**
 * 取得元ごとの実装。
 * API キーなど必要な環境変数が揃っていない場合は `isEnabled()` が false を返し、
 * run() 側でスキップされる（キー取得前でも他のコネクタだけで動かせるようにするため）。
 */
export type EventConnector = {
  name: string;
  isEnabled(): boolean;
  fetchEvents(): Promise<NormalizedEvent[]>;
};

export type ConnectorResult = {
  connector: string;
  status: "ok" | "skipped" | "error";
  fetched: number;
  created: number;
  updated: number;
  error?: string;
};
