import type { Event } from "@prisma/client";

import { prisma } from "@/lib/prisma";
import type { EventFormat, EventItem, EventKind, IngestSource } from "../types/eventItem";

function toEventItem(event: Event): EventItem {
  return {
    id: event.id,
    companyId: event.companyId ?? undefined,
    url: event.url,
    ingestSource: event.ingestSource as IngestSource,
    title: event.title,
    description: event.description ?? undefined,
    imageUrl: event.imageUrl ?? undefined,
    kind: event.kind as EventKind,
    format: event.format as EventFormat,
    prefecture: event.prefecture ?? undefined,
    venue: event.venue ?? undefined,
    startsAt: event.startsAt.toISOString(),
    endsAt: event.endsAt?.toISOString(),
    applyDeadline: event.applyDeadline?.toISOString(),
    organizer: event.organizer ?? undefined,
    organizerUrl: event.organizerUrl ?? undefined,
    prize: event.prize ?? undefined,
    tags: Array.isArray(event.tags) ? (event.tags as string[]) : [],
    capacity: event.capacity ?? undefined,
    accepted: event.accepted ?? undefined
  };
}

/**
 * 一覧用。開催日の近い順。
 * 終了済みも返し、絞り込みはクライアント側の isExpired に任せる
 * （「期限切れも見たい」の切替をサーバー往復なしで行うため）。
 */
export async function getEvents(): Promise<EventItem[]> {
  const events = await prisma.event.findMany({ orderBy: { startsAt: "asc" } });
  return events.map(toEventItem);
}

export async function getEventById(id: string): Promise<EventItem | null> {
  const event = await prisma.event.findUnique({ where: { id } });
  return event ? toEventItem(event) : null;
}
