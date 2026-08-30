# CLAUDE.md

このファイルは Claude Code（claude.ai/code）がこのリポジトリで作業する際のガイドです。
実装前に必ずplanモードで設計を出してから書け
変更や実行したことは要約してobsisianに保存（user/nishikawaryo)にある

## プロジェクト概要

**Event Radar** — ハッカソン・ビジネスコンテスト・企業主催イベントの募集情報を集約する Next.js アプリ。方々に散らばっている告知を一箇所に集め、締切カウントダウン・フィルタ・カレンダー連携を提供する。

- **ログイン不要の公開サイト**。保存（★）は localStorage のみで、ユーザーテーブルを持たない
- 3ペイン構成（左：ナビ / 中央：一覧 / 右：詳細）
- オレンジアクセント（caramel）× クリーム背景の yui540 風デザイン
- Vercel + Neon (PostgreSQL) を前提

## よく使うコマンド

```bash
npm run dev            # 開発サーバー起動
npm run build          # 本番ビルド（DATABASE_URL が必要）
npm run lint           # ESLint（flat config なので next lint ではなく eslint を直接叩く）
npm run test           # Vitest 実行（単発）
npm run test:watch     # Vitest watch
npm run prisma:generate
npm run prisma:migrate # 開発用マイグレーション
npm run prisma:deploy  # 本番マイグレーション適用
npm run prisma:studio  # Prisma Studio
npm run db:seed        # prisma/seed.ts を実行
```

## アーキテクチャ

### ディレクトリ構成
```
src/
  app/
    page.tsx              # トップ。getEvents() → EventBrowser（ISR revalidate 600）
    events/[id]/page.tsx  # 個別イベントページ（generateMetadata で OGP）
    api/cron/ingest/      # Vercel Cron 用の取り込みエンドポイント
    admin/                # 管理画面（手動登録・ブックマークレット）
    api/admin/            # preview（URLからメタ取得）/ events（登録・削除）
  components/
    timeline/FilterBar.tsx
    ui/                   # shadcn 系 + Calendar
  features/events/
    components/           # EventBrowser / EventList / EventDetailPanel / LeftNav
      admin/              # EventForm / EventAdminList / BookmarkletLink
    hooks/useSavedEvents.ts
    ingest/               # 取り込み層（types / classify / run / upsert / parseEventInput）
    server/getEvents.ts
    types/eventItem.ts
  hooks/useFilterState.ts
  lib/                    # calendarLink, filters, prisma, utils
    metadata/             # fetchPageMeta（取得）/ parsePageMeta（OGP・JSON-LD 抽出）
prisma/
  schema.prisma           # Event 単一モデル
  seed.ts                 # デモ用サンプルイベント
```

### 主要コンポーネント
- **`EventBrowser.tsx`** — レイアウトとステートのオーケストレーター。`GRID_OPEN` / `GRID_CLOSED` でグリッド幅を制御。viewMode（list/calendar/saved）、showExpired、selectedId、sortKey、isRightOpen を保持。
- **`LeftNav.tsx`** — ロゴ、今週のサマリ（7日以内に締切／今週開催／掲載件数）、ビュー切替、テーマ切替。`ViewMode` 型のエクスポート元。
- **`EventList.tsx`** — イベントカード一覧。カードは「アバター（主催者頭文字 + カラー）/ 中央情報 / 右：種別チップ + 締切カウントダウンリング（SVG）」構成。下部に締切までの進捗バー。カード選択時に自動スクロールトップ。
- **`EventDetailPanel.tsx`** — 詳細ペイン。ヒーローに `DeadlineRing`・Googleカレンダー追加・`.ics`・保存ボタン。以下 Section で概要／開催情報／賞金・特典／タグ／リンク。
- **`FilterBar.tsx`** — 期間 / 種別 / 形式 / 地域 / キーワード。種別・形式・地域は共通の `MultiSelectDropdown` で描画する（3つ別々に書かない）。

### カスタムフック
- **`useSavedEvents`** (`features/events/hooks/`) — 保存済み id を localStorage に永続化。SSR とのハイドレーション不一致を避けるため初期値は空集合で、マウント後に読み込む。
- **`useFilterState`** (`hooks/`) — URLクエリパラメータとフィルタ状態を同期。

### データモデル（`prisma/schema.prisma`）

`Event` 単一モデルのみ。主催者は文字列で保持し、企業テーブルは作らない。

- `url` が **`@unique` かつ冪等 upsert のキー**。取り込みは必ず url で upsert する
- `kind`：`HACKATHON | CONTEST | INTERNSHIP | MEETUP | SEMINAR | OTHER`
- `format`：`ONLINE | OFFLINE | HYBRID`（`prefecture` はオンライン時 null）
- `startsAt` / `endsAt` / `applyDeadline` — **カウントダウンは常に `applyDeadline ?? startsAt`**（`countdownTarget()` を使う）
- `prize` — ハッカソン・ビジコンの主要な判断材料なので独立カラム
- `ingestSource`：`CONNPASS | DOORKEEPER | MYNAVI | X | MANUAL`（登録 URL のホスト名から `ingestSourceFromUrl()` で判定）

### イベント取り込み

`src/features/events/ingest/`:
- `types.ts` — `NormalizedEvent` / `EventConnector`（`isEnabled()` / `fetchEvents()`）/ `ConnectorResult`
- `classify.ts` — タイトル・タグから `EventKind` / `EventFormat` を推定する純関数。**ここは必ずテストを伴って変更する**
- `run.ts` — `CONNECTORS` 配列を走らせて url で upsert。コネクタを実装したらこの配列に追加する

- `upsert.ts` — url を冪等キーにした upsert。**コネクタと手動登録の両方がここを通る**
- `parseEventInput.ts` — 管理 API に来た生 JSON を `NormalizedEvent` に落とす。**upsertEvent を直接呼ばずここを必ず経由する**

**connpass API v2 のキーは申請・審査制**（個人・コミュニティは無償）。`CONNPASS_API_KEY` 未設定ならコネクタは `isEnabled()` が false を返してスキップされるので、キー未取得でもアプリは動く。

### 手動登録（マイナビ・X）

マイナビと X は**自動取り込みができない**（X は API 無料枠廃止で全文検索が Enterprise 契約、マイナビは実体ページが robots.txt の `Disallow: /*?` に該当）。調べ直して同じ結論に辿り着く前に、ここを読むこと。

- `/admin/new` — URL を貼る → `POST /api/admin/preview` → `fetchPageMeta` で OGP / JSON-LD を抽出 → フォーム前埋め → 人が確認して `POST /api/admin/events`
- `/admin/bookmarklet` — 見ているページの DOM から拾って `/admin/new` にクエリで渡す。**サーバーからは取得しない**
- 認証は `middleware.ts`。`ADMIN_PASSWORD` 未設定時は 404（401 ではない。設定漏れで露出させないため）
- **概要は 200 文字で保存**（`DESCRIPTION_MAX_LENGTH`）。告知本文の全文複製を避けるための制限なので、緩めないこと

### スタイリング
- Tailwind + CSS カスタムプロパティ（`src/app/globals.css`）
  - `--accent: 26 54% 56%`（caramel）/ `--accent-2`（terracotta）/ `--accent-soft`
  - `--radius: 14px`
- yui540 風アニメーション群：`yui-fade-rise` / `yui-shine` / `yui-card` / `yui-ring-pulse` / `yui-heading`
- カードは基本 `rounded-2xl border bg-background` + `yui-card` クラス

## 開発上の注意

- **エディタで UI を変更したら** プレビューサーバーでスクリーンショット確認（3ペインが崩れやすい）。
- **新規ページ追加**よりも **既存コンポーネント（特に `EventBrowser` / `EventList` / `EventDetailPanel`）の拡張**を優先。
- **ログインを前提にしない**。ユーザー単位の状態が必要になったら、まず localStorage で足りないかを検討する。
- Google カレンダー連携は **OAuth を使わない**。`src/lib/calendarLink.ts` の `googleCalendarUrl()` / `buildIcs()` でリンクを生成するだけ。
- テーマは `document.documentElement` の `.dark` クラス + `localStorage.theme`。`LeftNav` が制御。
- 色の追加は必ず `globals.css` の CSS 変数 or Tailwind のパレット（`orange-*` など）経由で。ハードコード値は避ける。
- `npm run lint` は `eslint` を直接叩く。`next lint` は flat config（`eslint.config.mjs`）と噛み合わず対話プロンプトで止まる。

## 型規約

- 表示用の型は `EventItem`（`src/features/events/types/eventItem.ts`）。日付は **ISO 文字列**で持つ（サーバーコンポーネント境界を越えるため）
- 日本語ラベルは `EVENT_KIND_LABEL` / `EVENT_FORMAT_LABEL` / `INGEST_SOURCE_LABEL` を使う。文字列リテラルを直書きしない
- 開催地の表示は `locationLabel()`、締切基準日は `countdownTarget()` を使う

## テスト

- Vitest（`vitest.config.ts`）。`src/**/__tests__/*.test.ts(x)` 形式。
- UI テストは最小限。ロジック（`classify`, `filters`, hooks）中心に追加する方針。
