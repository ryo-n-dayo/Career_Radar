/**
 * かつてローカルの SQLite に対して定期スキャンを走らせていたスクリプト。
 *
 * データベースを Cloudflare D1 に移したため、スキャンは Worker の scheduled ハンドラ
 * （worker.ts / wrangler.jsonc の triggers.crons）が担当する。
 * Node から D1 バインディングは触れないので、このスクリプトは案内だけを出す。
 */
const MESSAGE = [
  "[DailyNews] このスクリプトは廃止しました。データベースは Cloudflare D1 です。",
  "",
  "  本番: Cloudflare の Cron Trigger が毎日 JST 6:00 に scanAllSources() を実行します。",
  "        ログは npx wrangler tail で確認できます。",
  "  手元: pnpm cf:build && npx wrangler dev",
  '        別ターミナルで curl "http://127.0.0.1:8787/cdn-cgi/local/scheduled"',
  "",
  "  ローカルの Windows タスク（scripts/install-windows-task.ps1）はもう不要です。"
].join("\n");

console.error(MESSAGE);
process.exitCode = 1;
