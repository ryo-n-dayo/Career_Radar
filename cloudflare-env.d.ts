// Cloudflare Workers のバインディング定義。
//
// `wrangler types` が吐く形（グローバルなランタイム型を丸ごと同梱する形）は、
// Next.js 側の DOM 型と衝突して `Response.json()` などが unknown になってしまうため、
// ここでは必要な型だけを module スコープで import し、CloudflareEnv だけを global に置く。
// wrangler.jsonc のバインディングを増やしたらこのファイルも手で更新する。
import type { D1Database, Fetcher } from "@cloudflare/workers-types";

declare global {
  interface CloudflareEnv {
    /** wrangler.jsonc の d1_databases バインディング */
    DB: D1Database;
    ASSETS: Fetcher;

    OPENAI_API_KEY?: string;
    X_API_ENABLED?: string;
    X_API_BEARER_TOKEN?: string;
    X_API_DAILY_POST_LIMIT?: string;
    X_API_MONTHLY_BUDGET_USD?: string;
    X_API_KEYWORDS?: string;
    GOOGLE_CLIENT_ID?: string;
    GOOGLE_CLIENT_SECRET?: string;
    GOOGLE_OAUTH_REDIRECT_URI?: string;
    GOOGLE_TOKEN_ENCRYPTION_KEY?: string;
  }
}

export {};
