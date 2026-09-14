import { defineCloudflareConfig } from "@opennextjs/cloudflare";

// 個人用・単一ユーザーなので ISR キャッシュ（R2）は持たない。
// すべてのページを force-dynamic で描画し、構成を単純に保つ。
export default defineCloudflareConfig();
