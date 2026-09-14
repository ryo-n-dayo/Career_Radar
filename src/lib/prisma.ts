import type { D1Database } from "@cloudflare/workers-types";
import { PrismaD1 } from "@prisma/adapter-d1";
import { PrismaClient as NodePrismaClient } from "@prisma/client";
// workerd では Rust の query engine が動かないので wasm ビルドを使う。
// 逆に next dev（Node）では wasm ローダー（.wasm の dynamic import）が動かないので通常ビルドを使う。
// どちらか片方だけを import すると、もう片方のランタイムで必ず落ちる。
//
// 拡張子付きなのは、@prisma/client の exports が "./wasm" -> 実在しない wasm.mjs を指していて
// esbuild が解決できないため（ワイルドカード export 経由で wasm.js に解決させる）。
import { PrismaClient as WorkerdPrismaClient } from "@prisma/client/wasm.js";
import { getCloudflareContext } from "@opennextjs/cloudflare";
import { cache } from "react";

const isWorkerd = typeof navigator !== "undefined" && navigator.userAgent === "Cloudflare-Workers";
const PrismaClient = (isWorkerd ? WorkerdPrismaClient : NodePrismaClient) as typeof NodePrismaClient;
type PrismaClient = NodePrismaClient;

/**
 * Cloudflare D1 を Prisma の driver adapter 経由で使う。
 *
 * - fetch ハンドラ側: getCloudflareContext() から env を取り、リクエスト単位でクライアントを作る
 *   （Workers ではコネクションを跨いで使い回さないのが OpenNext の推奨）
 * - cron（scheduled ハンドラ）側: getCloudflareContext() が使えないので setWorkerEnv() で env を渡す
 */
let workerEnv: CloudflareEnv | undefined;
let cronClient: PrismaClient | undefined;

function createClient(database: D1Database): PrismaClient {
  return new PrismaClient({ adapter: new PrismaD1(database) });
}

export function setWorkerEnv(env: CloudflareEnv): void {
  if (workerEnv !== env) {
    workerEnv = env;
    cronClient = undefined;
  }
}

const getRequestClient = cache((): PrismaClient => {
  const { env } = getCloudflareContext();
  if (!env?.DB) {
    throw new Error("D1 バインディング DB が見つかりません。wrangler.jsonc の d1_databases を確認してください。");
  }
  return createClient(env.DB);
});

function getClient(): PrismaClient {
  if (workerEnv?.DB) {
    cronClient ??= createClient(workerEnv.DB);
    return cronClient;
  }
  return getRequestClient();
}

/**
 * 呼び出し時までクライアント生成を遅らせる Proxy。
 * これで既存の `import { prisma } from "@/lib/prisma"`（35ファイル）をそのまま使える。
 */
export const prisma: PrismaClient = new Proxy({} as PrismaClient, {
  get(_target, property, receiver) {
    const instance = getClient();
    const value = Reflect.get(instance as object, property, receiver);
    return typeof value === "function" ? value.bind(instance) : value;
  }
});
