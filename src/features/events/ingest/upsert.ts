import { prisma } from "@/lib/prisma";
import type { NormalizedEvent } from "./types";

/**
 * url を冪等キーにした upsert。
 * 取り込みコネクタ（run.ts）と管理画面の手動登録（/api/admin/events）の両方から使う。
 */
export async function upsertEvent(event: NormalizedEvent): Promise<"created" | "updated"> {
  const data = toData(event);

  const existing = await prisma.event.findUnique({ where: { url: event.url }, select: { id: true } });
  await prisma.event.upsert({
    where: { url: event.url },
    create: { url: event.url, ...data },
    update: data
  });

  return existing ? "updated" : "created";
}

function toData(event: NormalizedEvent) {
  return {
    companyId: event.companyId ?? null,
    externalId: event.externalId ?? null,
    ingestSource: event.ingestSource,
    title: event.title,
    description: event.description ?? null,
    imageUrl: event.imageUrl ?? null,
    kind: event.kind,
    format: event.format,
    prefecture: event.prefecture ?? null,
    venue: event.venue ?? null,
    startsAt: event.startsAt,
    endsAt: event.endsAt ?? null,
    applyDeadline: event.applyDeadline ?? null,
    organizer: event.organizer ?? null,
    organizerUrl: event.organizerUrl ?? null,
    prize: event.prize ?? null,
    tags: event.tags,
    capacity: event.capacity ?? null,
    accepted: event.accepted ?? null,
    fetchedAt: new Date()
  };
}

export async function updateEvent(id: string, event: NormalizedEvent): Promise<void> {
  await prisma.event.update({ where: { id }, data: { url: event.url, ...toData(event) } });
}
