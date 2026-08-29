import { prisma } from "@/lib/prisma";
import type { ConnectorResult, EventConnector, NormalizedEvent } from "./types";

/**
 * 登録済みのコネクタ。
 * connpass の API キーは申請・審査制のため、キーが手に入るまでここは空のまま。
 * コネクタを実装したらこの配列に追加すれば cron から呼ばれるようになる。
 */
export const CONNECTORS: EventConnector[] = [];

async function upsertEvent(event: NormalizedEvent): Promise<"created" | "updated"> {
  const data = {
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

  const existing = await prisma.event.findUnique({ where: { url: event.url }, select: { id: true } });
  await prisma.event.upsert({
    where: { url: event.url },
    create: { url: event.url, ...data },
    update: data
  });

  return existing ? "updated" : "created";
}

/**
 * 有効なコネクタを順に走らせ、url をキーに冪等 upsert する。
 * 1 つのコネクタが落ちても他は続行させたいので、失敗はそのコネクタの結果として返す。
 */
export async function runIngest(): Promise<ConnectorResult[]> {
  const results: ConnectorResult[] = [];

  for (const connector of CONNECTORS) {
    if (!connector.isEnabled()) {
      results.push({ connector: connector.name, status: "skipped", fetched: 0, created: 0, updated: 0 });
      continue;
    }

    try {
      const events = await connector.fetchEvents();
      let created = 0;
      let updated = 0;

      for (const event of events) {
        const outcome = await upsertEvent(event);
        if (outcome === "created") created += 1;
        else updated += 1;
      }

      results.push({
        connector: connector.name,
        status: "ok",
        fetched: events.length,
        created,
        updated
      });
    } catch (error) {
      results.push({
        connector: connector.name,
        status: "error",
        fetched: 0,
        created: 0,
        updated: 0,
        error: error instanceof Error ? error.message : String(error)
      });
    }
  }

  return results;
}
