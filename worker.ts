// OpenNext が生成する fetch ハンドラをそのまま使い、cron 用の scheduled を足すだけの薄いエントリ。
// ビルド前は .open-next/worker.js が存在しないため、型解決は any 経由にしている。
// @ts-expect-error - .open-next/worker.js は opennextjs-cloudflare build で生成される
import { default as handler } from "./.open-next/worker.js";

import type { ExecutionContext, ScheduledController } from "@cloudflare/workers-types";

import { setWorkerEnv } from "@/lib/prisma";
import { scanAllSources } from "@/features/sources/server/runScan";

export default {
  fetch: handler.fetch,

  async scheduled(_controller: ScheduledController, env: CloudflareEnv, ctx: ExecutionContext) {
    // scheduled では getCloudflareContext() が使えないので、env を明示的に渡す
    setWorkerEnv(env);
    ctx.waitUntil(
      scanAllSources().then(
        (results) => {
          const created = results.reduce((sum, result) => sum + result.created, 0);
          console.log(`[cron] scan done: ${results.length} sources, ${created} created`);
        },
        (error: unknown) => {
          console.error("[cron] scan failed", error);
        }
      )
    );
  }
};
