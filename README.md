# Event Radar

> **ハッカソン・ビジコン・企業主催イベントを一箇所にまとめる Next.js アプリ**
> 方々に散らばっているイベント募集情報を集約し、締切から逆算して探せるようにする。

---

## なぜ作ったか

ハッカソンやビジネスコンテスト、企業主催の勉強会・インターンの案内は、connpass・企業サイト・SNS などバラバラの場所に転がっている。探しに行くのは面倒だが、締切を過ぎてから知るのはもっと惜しい。だから「一覧で眺めて、締切が近い順に並べて、気になったらカレンダーに入れる」だけができるサイトを作った。

ログイン不要。保存はブラウザの localStorage に閉じている。

---

## 主要機能

| 機能 | 説明 |
|------|------|
| **イベント一覧** | ハッカソン / コンテスト / インターン / 勉強会 / セミナーを1つのリストに集約 |
| **締切カウントダウン** | SVG リングで残日数を可視化（3日以内→赤・7日以内→アクセント色） |
| **フィルタ** | 種別・開催形式（オンライン/オフライン/ハイブリッド）・地域・期間・キーワード。URL クエリに同期するので絞り込んだ状態を共有できる |
| **カレンダービュー** | 月次カレンダー上に開催日を種別ごとの色で表示 |
| **保存** | ★ で保存、「保存済み」ビューで一覧。localStorage のみ |
| **カレンダー連携** | Googleカレンダー追加リンク / `.ics` ダウンロード。OAuth 不要 |
| **個別ページ** | `/events/[id]` に OGP 付きの共有用ページ |
| **手動登録（管理者）** | `/admin` から URL を貼るだけで登録。ブックマークレットで X・マイナビのページから1クリック |

---

## セットアップ

```bash
npm install
cp .env.example .env
# .env の DATABASE_URL / DIRECT_URL に Neon の接続文字列を設定する
npm run prisma:migrate
npm run db:seed
npm run dev
```

`prisma/seed.ts` は **デモ用のサンプルイベント**（架空の主催者・`example.com` の URL）を投入する。UI の確認用であり、実データは取り込みコネクタ経由で入る。

### よく使うコマンド

```bash
npm run dev            # 開発サーバー
npm run build          # 本番ビルド（DATABASE_URL が必要）
npm run lint           # ESLint
npm run test           # Vitest
npm run prisma:generate
npm run prisma:migrate # 開発用マイグレーション
npm run prisma:deploy  # 本番マイグレーション適用
npm run prisma:studio
npm run db:seed
```

---

## アーキテクチャ

```
src/
  app/
    page.tsx              # トップ。getEvents() → EventBrowser（ISR 10分）
    events/[id]/page.tsx  # 個別イベントページ（OGP 付き）
    api/cron/ingest/      # Vercel Cron から叩く取り込みエンドポイント
    admin/                # 管理画面（手動登録 / ブックマークレット）
    api/admin/            # preview（URL からメタ取得）/ events（登録・削除）
  components/
    timeline/FilterBar.tsx
    ui/                   # shadcn 系 + Calendar
  features/events/
    components/           # EventBrowser / EventList / EventDetailPanel / LeftNav
      admin/              # EventForm / EventAdminList / BookmarkletLink
    hooks/useSavedEvents.ts
    ingest/               # 取り込み層（コネクタ + 手動登録の共通 upsert）
    server/getEvents.ts   # Prisma → EventItem のマッピング
    types/eventItem.ts    # EventItem と表示ラベル
  hooks/useFilterState.ts # フィルタ状態と URL クエリの同期
  lib/
    calendarLink.ts       # Googleカレンダー URL / .ics 生成
    filters.ts            # applyFilters / isExpired / 期間プリセット
    metadata/             # fetchPageMeta（取得）/ parsePageMeta（OGP・JSON-LD 抽出）
prisma/
  schema.prisma           # Event 単一モデル
  seed.ts
```

### 主要コンポーネント

- **`EventBrowser.tsx`** — 3ペインのレイアウトとステートのオーケストレーター。`GRID_OPEN` / `GRID_CLOSED` でグリッド幅を制御。viewMode（list / calendar / saved）、showExpired、selectedId、sortKey を保持。
- **`LeftNav.tsx`** — ロゴ、今週のサマリ（7日以内に締切 / 今週開催 / 掲載件数）、ビュー切替、テーマ切替。
- **`EventList.tsx`** — イベントカード一覧。アバター（主催者頭文字）/ タイトル・メタ情報 / 締切カウントダウンリング（SVG）。下部に締切までの進捗バー。
- **`EventDetailPanel.tsx`** — 詳細ペイン。ヒーローに `DeadlineRing` と保存ボタン、Googleカレンダー追加、`.ics` ダウンロード。以下 Section で概要 / 開催情報 / 賞金・特典 / タグ / リンク。
- **`FilterBar.tsx`** — 種別・形式・地域は共通の `MultiSelectDropdown` で描画。`useFilterState` と `applyFilters` を利用。

### データモデル（`prisma/schema.prisma`）

`Event` 単一モデル。主催者は文字列で持ち、企業テーブルは作らない。

- `url` が **冪等 upsert のキー**（同じ告知ページを何度取り込んでも重複しない）
- `kind`（HACKATHON / CONTEST / INTERNSHIP / MEETUP / SEMINAR / OTHER）
- `format`（ONLINE / OFFLINE / HYBRID）+ `prefecture` + `venue`
- `startsAt` / `endsAt` / `applyDeadline` — カウントダウンは `applyDeadline ?? startsAt`
- `prize` — ハッカソン・ビジコンでの主要な判断材料なので独立カラム
- `ingestSource`（CONNPASS / DOORKEEPER / MYNAVI / X / MANUAL）— 登録 URL のホスト名から自動判定

### イベント取り込み

`src/features/events/ingest/` にコネクタ層がある。

- `types.ts` — `NormalizedEvent` と `EventConnector`（`isEnabled()` / `fetchEvents()`）
- `classify.ts` — タイトル・タグから `EventKind` / `EventFormat` を推定する純関数
- `run.ts` — 有効なコネクタを走らせて `url` で upsert。`CONNECTORS` 配列に追加するだけで cron から呼ばれる

**connpass API は申請・審査制**（個人・コミュニティは無償）。<https://help.connpass.com/api/> の利用申請フォームからキーを取得し、`CONNPASS_API_KEY` を設定する。未設定ならそのコネクタは `isEnabled()` が false を返してスキップされる。

`vercel.json` の Cron が毎日 `/api/cron/ingest` を叩く（`CRON_SECRET` による Bearer 認証）。

### 手動登録（マイナビ・X）

マイナビと X は自動取り込みができない。

- **X** — 2026年2月に API の無料枠が廃止。全文検索は Enterprise 契約（月 $42,000〜）
- **マイナビ** — sitemap の URL は 302 スタブで、リダイレクト先はクエリ文字列付き。robots.txt の `Disallow: /*?` に該当するためクローラでの巡回は不可

そこで `/admin` に管理者向けの手動登録を用意している。

| 入口 | 使い方 |
|---|---|
| `/admin/new` | 告知ページの URL を貼って「取得」→ OGP / JSON-LD から分かる範囲を前埋め → 確認して登録 |
| `/admin/bookmarklet` | ブックマークレットをブックマークバーに置き、X やマイナビのページ上でクリック → 登録フォームが開く |

ブックマークレットは**自分のブラウザで開いているページの DOM を読むだけ**で、サーバーからページを取得しない。

`url` が冪等キーなので、同じページを二度登録しても重複しない。`ingestSource` は URL のホスト名から自動判定する。

**概要は 200 文字で保存される**（`DESCRIPTION_MAX_LENGTH`）。告知本文をそのまま複製して再配信しないための制限で、詳細は必ず元ページへのリンクで見せる。

### スタイリング

- Tailwind + CSS カスタムプロパティ（`src/app/globals.css`）
  - `--accent: 26 54% 56%`（caramel）/ `--accent-2`（terracotta）/ `--accent-soft`
  - `--radius: 14px`
- yui540 風アニメーション群：`yui-fade-rise` / `yui-shine` / `yui-card` / `yui-ring-pulse` / `yui-heading`
- カードは基本 `rounded-2xl border bg-background` + `yui-card` クラス

---

## デプロイ（Vercel + Neon）

1. [Neon](https://neon.tech) でプロジェクトを作り、pooled 接続（`DATABASE_URL`）と直接接続（`DIRECT_URL`）を取得する
2. Vercel にリポジトリを接続し、環境変数を設定
   - `DATABASE_URL` / `DIRECT_URL` / `CRON_SECRET` / `NEXT_PUBLIC_SITE_URL`
   - `ADMIN_PASSWORD`（管理画面を使う場合。未設定だと `/admin` は 404）
   - （キー取得後）`CONNPASS_API_KEY`
3. `npm run prisma:deploy` でマイグレーションを適用
4. デプロイ

`package.json` の `postinstall` で `prisma generate` が走るため、Vercel 側の追加設定は不要。

`src/middleware.ts` は2層になっている。

- `ADMIN_PASSWORD` — `/admin` と `/api/admin` の Basic 認証。**未設定なら 404 を返して機能ごと無効化する**（設定漏れで管理画面が露出しないように、401 ではなく 404）
- `SITE_AUTH_PASSWORD` — サイト全体の Basic 認証。ステージング保護用で、一般公開時は未設定にする
