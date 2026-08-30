import type { ConnectorResult, EventConnector } from "./types";
import { upsertEvent } from "./upsert";

/**
 * 登録済みのコネクタ。
 * connpass の API キーは申請・審査制のため、キーが手に入るまでここは空のまま。
 * コネクタを実装したらこの配列に追加すれば cron から呼ばれるようになる。
 *
 * マイナビ / X は自動取り込みが成立しない（robots.txt / API 費用）ため、
 * 管理画面の手動登録（/admin/new）から入る。
 */
export const CONNECTORS: EventConnector[] = [];

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
