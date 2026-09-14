# DailyNews

企業公式サイトの更新候補、Xの投稿、企業情報、イベントを一箇所に集め、朝の確認と予定管理につなげる個人用アプリです。Cloudflare Workers + D1 で動かし、Cloudflare Access で本人だけがアクセスできるようにしています。

## できること

- X投稿のURL・本文・要約・メモ・タグをSQLiteへ保存
- X投稿ページからブックマークレットでURLと本文を取り込み
- `OPENAI_API_KEY` 設定時、投稿本文をAIで要約
- 企業情報を台帳化し、X投稿やイベントと紐付け
- 公開された企業公式ページ・RSS・サイトマップをrobots.txtに従って低頻度で確認
- インターン・採用・イベント候補を関連度と締切で優先表示
- イベントの登録・修正・削除
- 締切カウントダウン、一覧フィルタ、月間カレンダー
- GoogleカレンダーリンクとICS出力

データは Cloudflare D1（SQLite）に保存されます。アプリ自体はログイン機構を持たず、アクセス制御は Cloudflare Access に任せています。

## セットアップ（ローカル）

```powershell
pnpm install
Copy-Item .env.example .dev.vars
pnpm d1:migrate:local
pnpm dev
```

ブラウザで <http://localhost:3000> を開きます。ローカルでも D1（miniflare のローカル DB）を使います。
`next.config.mjs` の `initOpenNextCloudflareForDev()` が `wrangler.jsonc` のバインディングを `next dev` に橋渡しします。

手元の SQLite（`prisma/dev.db`）から D1 へデータを移すには:

```powershell
pnpm d1:export
Get-ChildItem scripts/d1-seed/*.sql | ForEach-Object { npx wrangler d1 execute dailynews --local --file=$_.FullName }
```

AI要約を使う場合は `.dev.vars` の `OPENAI_API_KEY` を設定してください。未設定でも、手動要約を含むその他の機能は利用できます。

> **Windows での注意**: Developer Mode が無効だと `fs.symlink` が EPERM で失敗し、Next.js の standalone 出力（OpenNext のビルドに必須）が落ちます。
> そのため `pnpm-workspace.yaml` で `nodeLinker: hoisted` を指定し、node_modules に symlink を作らないようにしています。

## 画面

| URL | 用途 |
|---|---|
| `/` | 件数、最近のX投稿、次の予定 |
| `/posts` | X投稿の保存・検索・編集・削除 |
| `/companies` | 企業台帳 |
| `/sources` | 監視先、収集実行、速報候補 |
| `/events` | イベント一覧、保存済み、カレンダー |
| `/admin` | イベントの登録・編集・削除 |

## よく使うコマンド

```powershell
pnpm dev                  # ローカル開発（D1 ローカルDBを使う）
pnpm test
pnpm lint
pnpm build                # next build のみ
pnpm cf:build             # next build + OpenNext バンドル
pnpm cf:preview           # workerd（本番と同じランタイム）で確認
pnpm cf:deploy            # Cloudflare へデプロイ
pnpm d1:migrate:local     # ローカル D1 にマイグレーション適用
pnpm d1:migrate:remote    # 本番 D1 にマイグレーション適用
pnpm d1:export            # prisma/dev.db → D1 投入用の INSERT 文を生成
```

スキーマを変えたら、Prisma のマイグレーションではなく D1 用の SQL を作って `migrations/` に置きます。

```powershell
npx prisma migrate diff --from-local-d1 --to-schema-datamodel prisma/schema.prisma --script > migrations/0002_xxx.sql
pnpm d1:migrate:local
pnpm d1:migrate:remote
```

## データモデル

- `SavedPost`: X投稿、要約、メモ、タグ、投稿日時
- `Company`: 企業概要、業界、メモ、タグ
- `WatchSource`: 監視URL、利用条件の確認、robots判定、最終取得状態、X APIの取得済み投稿ID
- `Candidate`: 発見した採用・インターン・イベント候補
- `XUsageDaily`: X APIの投稿取得数、リクエスト数、日別の概算費用
- `Event`: 開催日時、締切、場所、主催者、カレンダー情報

`SavedPost` と `Event` は任意で `Company` に紐付けられます。企業を削除しても投稿とイベントは残ります。

## Xの取り込み

`/posts` にある「Xから取り込む」リンクをブックマークバーへドラッグし、保存したいX投稿のページで実行します。現在表示されている投稿本文とURLだけが `localhost:3000` へ渡されます。XのCookieやログイン情報は取得・保存しません。

X側のDOM変更で取り込みに失敗した場合でも、URLと本文をフォームへ直接貼り付けて保存できます。

## 毎朝6時の自動収集（Cloudflare Cron Trigger）

`wrangler.jsonc` の `triggers.crons`（`0 21 * * *` = JST 6:00）で Worker の `scheduled` ハンドラが起動し、`scanAllSources()` を実行します。エントリは `worker.ts` です。ログは `npx wrangler tail` で確認できます。

手元で試すときは `npx wrangler dev` を起動し、別のターミナルで `curl "http://127.0.0.1:8787/cdn-cgi/local/scheduled"` を叩きます。

Windows タスクスケジューラ版（`scripts/install-windows-task.ps1` / `install-windows-startup-task.ps1`）は不要になりました。既に登録済みの場合はタスクスケジューラから削除してください。

Xは、無料運用ではCookieや非公式な取得手段を使わず、登録したXアカウントを公式画面で1日1回確認します。必要な場合だけ、公式X APIのBearer Tokenと利用上限を`.env.local`へ設定し、`X API（上限付き）`の監視先として日次収集できます。初期状態は無効で、トークンがない限り外部APIへ通信しません。

## Windowsログイン時の自動起動

`npm run startup:install` を一度実行すると、Windowsタスクスケジューラに `DailyNews Local Server` が登録されます。Windowsにサインインしたとき、DailyNewsがまだ起動していなければ `127.0.0.1:3000` で起動します。既に同ポートが使われている場合は二重起動しません。タスク登録がWindowsの権限で許可されないPCでは、同じ本人アカウントだけのWindows起動項目へ自動登録します。ログは `logs/dailynews-ui-*.log` に保存されます。

## 現在の運用状況（2026-09-14 時点）

- 本番: <https://dailynews.ppajt5zzcf.workers.dev>（Cloudflare Access で本人のみ）
- **Workers Free の CPU 10ms/リクエスト制限に当たるため、ページを開くと Error 1102 になる。** 運用するには Workers Paid（$5/月）への切り替えが必要
- そのため **X フィードの収集は一時停止中**（`wrangler.jsonc` の `X_API_ENABLED` を `"false"` に。再開時は `"true"` に戻して再デプロイ）
- ローカル（`pnpm dev`）は D1 のローカルDBで通常どおり動く

## Cloudflare へのデプロイ

1. `npx wrangler login`
2. `npx wrangler d1 create dailynews` → 表示された `database_id` を `wrangler.jsonc` に書く
3. `pnpm d1:migrate:remote` でテーブルを作る
4. `pnpm d1:export` → 生成された SQL を `npx wrangler d1 execute dailynews --remote --file=...` で投入
5. シークレットを登録する
   ```powershell
   npx wrangler secret put OPENAI_API_KEY
   npx wrangler secret put X_API_BEARER_TOKEN
   npx wrangler secret put GOOGLE_CLIENT_ID
   npx wrangler secret put GOOGLE_CLIENT_SECRET
   npx wrangler secret put GOOGLE_TOKEN_ENCRYPTION_KEY
   ```
6. `wrangler.jsonc` の `vars.GOOGLE_OAUTH_REDIRECT_URI` を本番URLに直し、Google Cloud Console の承認済みリダイレクトURIにも同じ値を追加する
7. `pnpm cf:deploy`
8. **Cloudflare ダッシュボード → Workers → dailynews → Access で本人のメールアドレスだけを許可する**（プレビューURLも保護対象に含める）

`.dev.vars` はデプロイに含まれません（`wrangler deploy --dry-run` で確認済み）。本番の秘密情報は必ず `wrangler secret put` で登録します。

### アクセス制御について

このアプリは Gmail / Google Calendar の読み取りトークン、OpenAI と X の API キーを扱い、任意 URL を取得する管理APIも持ちます。
**「URLを知っている人だけ」方式（秘密リンク）では守れません**。URLは履歴・ブックマーク同期・スクリーンショットから漏れ、漏れても気づけず、失効もできないためです。
Cloudflare Access なら Worker に紐づくすべてのホスト名（`workers.dev`・独自ドメイン・プレビューURL）がまとめて保護され、50人まで無料で、アプリ側のコード変更も不要です。

なお `/api/admin/preview` と収集処理は任意URLを取得するため、Access とは別に SSRF ガード（`src/lib/metadata/fetchPageMeta.ts` の `assertPublicUrl`）を通しています。Workers では `node:dns` の `lookup` が使えないので `resolve4` / `resolve6` で名前解決しています。

設計・技術・法律上の前提・運用手順は [設計記録](docs/DAILY_NEWS_DESIGN.md) にまとめています。
