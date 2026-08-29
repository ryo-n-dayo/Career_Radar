# AGENTS.md

このファイルは Codex（Codex.ai/code）がこのリポジトリで作業する際のガイドです。
実装前に必ずplanモードで設計を出してから書け
変更や実行したことは要約してobsisianに保存（user/nishikawaryo)にある
## プロジェクト概要

**Career Radar** — 就活情報を一元管理する Next.js アプリ。企業の採用イベント・説明会・選考情報を「メインDB」として集約し、締切カウントダウン・AI 要約・Xポスト取り込み・Googleカレンダー連携を提供する。

- 3ペイン構成のダッシュボード（左：ナビ / 中央：一覧 / 右：詳細）
- オレンジアクセント（caramel）× クリーム背景の yui540 風デザイン
- モック + Prisma バックエンド混在（現状 `radarItems` モックが中心）

## よく使うコマンド

```bash
npm run dev            # 開発サーバー起動
npm run build          # 本番ビルド
npm run lint           # ESLint
npm run test           # Vitest 実行（単発）
npm run test:watch     # Vitest watch
npm run prisma:generate
npm run prisma:migrate # マイグレーション
npm run prisma:studio  # Prisma Studio
npm run db:seed        # prisma/seed.ts を実行
```

## アーキテクチャ

### ディレクトリ構成
```
src/
  app/             # Next.js App Router（page.tsx / api/ ルート）
  components/      # 汎用 UI（shadcn 系 + timeline/ 配下）
  features/
    dashboard/     # ダッシュボード本体（当アプリのコア）
      components/  # LeftNav / RadarTable / RightDetailPanel / ThreePaneDashboard など
      mock/        # radarItems モックデータ
      types/       # RadarItem / CompanyProfile 型定義
  hooks/           # useFilterState など
  lib/             # filters, utils（cn）
  types/           # source など共通型
prisma/
  schema.prisma    # Post / Event / Company / AIAnalysis / ESDraft
```

### 主要コンポーネント
- **`ThreePaneDashboard.tsx`** — レイアウトとステートのオーケストレーター。`GRID_OPEN` / `GRID_CLOSED` でグリッド幅を制御。viewMode（db/calendar）、savedOnly、compareMode、selectedId を保持。
- **`LeftNav.tsx`** — ロゴ、今週のサマリ（7日以内／合計）、Google連携、取り込み、テーマ切替。独立スクロール対応。
- **`RadarTable.tsx`** — 企業カード一覧。カードは「アバター（頭文字 + カラー）/ 中央情報 / 右カテゴリ + 締切カウントダウンリング（SVG）」構成。下部に締切までの進捗バー。カード選択時に自動スクロールトップ。比較チェックボックス付き。
- **`RightDetailPanel.tsx`** — 詳細ペイン。ヒーローに `DeadlineRing`（大きめ SVG）と「保存済み」ボタン、以下 Section で社風キーワード／ソース／会社情報／Wiki／X口コミ等。`CredentialsSection` を含む。
- **`CompareDialog.tsx`** — 最大3社を並べて比較するモーダル。`compareMode` フラグと `compareIds[]` で制御。
- **`CredentialsSection.tsx`** — マイナビ・リクナビ等のID/PWをlocalStorageに保存するセクション（`useCompanyCredentials` フック使用）。
- **`FilterBar.tsx`** — 期間 / カテゴリ / ソース / キーワード。`useFilterState` と `applyFilters` を利用。

### カスタムフック
- **`useCompanyCredentials`** (`features/dashboard/hooks/`) — 採用サービスのログイン情報をlocalStorageに暗号化せず保存。**本番化時は要セキュリティ見直し**。
- **`useFilterState`** (`hooks/`) — URLクエリパラメータとフィルタ状態を同期。

### データモデル（`prisma/schema.prisma`）
- `Post` — ソーシャル／Web取り込み。AI 要約・キーワード・isNew を持つ。
- `Event` — category（INTERN/SEMINAR/EARLY/MAIN/INFO）+ deadline + status（TODO/APPLIED/BOOKMARKED）。
- `Company` — 会社情報、URL、サイト監視ハッシュ。
- `AIAnalysis` — heatScore(0-100)、要約、キーワード。
- `ESDraft` — ES下書き + 引用（Post/Event/Wiki）。

現状 UI は `src/features/dashboard/mock/radarItems.ts` の `RadarItem[]` を使用（30社分の実企業データを収録済み）。`RadarItem` は Event + AIAnalysis + CompanyProfile を統合した表示用型（`src/features/dashboard/types/radarItem.ts`）。

### スタイリング
- Tailwind + CSS カスタムプロパティ（`src/app/globals.css`）
  - `--accent: 26 54% 56%`（caramel）/ `--accent-2`（terracotta）/ `--accent-soft`
  - `--radius: 14px`
- yui540 風アニメーション群：`yui-fade-rise` / `yui-shine` / `yui-card` / `yui-ring-pulse` / `yui-heading`
- カードは基本 `rounded-2xl border bg-background` + `yui-card` クラス

## 開発上の注意

- **エディタで UI を変更したら** Codex のプレビューサーバーで必ず `preview_screenshot` 確認（3ペインが崩れやすい）。
- **新規ページ追加**よりも **既存コンポーネント（特に `ThreePaneDashboard` / `RadarTable` / `RightDetailPanel`）の拡張**を優先。
- モック差し替え：実データ化するときは `radarItems` を Prisma 経由のサーバーコンポーネントに置換し、`RadarItem` 型へマップ。
- Google連携は `/api/auth/google` → `googleapis`。Gmail/Calendar 同期 API も `src/app/api/` 下。
- テーマは `document.documentElement` の `.dark` クラス + `localStorage.theme`。`LeftNav` が制御。
- 色の追加は必ず `globals.css` の CSS 変数 or Tailwind のパレット（`orange-*` など）経由で。ハードコード値は避ける。

## 型規約

- `RadarItem["category"]`：`"インターン" | "早期選考" | "セミナー" | "本選考" | "説明会"`
- `RadarItem["deadlineLabel"]`：`"締切" | "早期選考" | "説明会"`
- `Trust`：`"official" | "needs_review"`

## テスト

- Vitest（`vitest.config.ts`）。`src/**/__tests__/*.test.ts(x)` 形式。
- UI テストは最小限。ロジック（filters, hooks）中心に追加する方針。
