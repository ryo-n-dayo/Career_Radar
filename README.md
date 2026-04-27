# Career Radar

> **就活情報を一元管理する Next.js ダッシュボードアプリ**  
> 企業の採用イベント・説明会・選考情報を集約し、締切管理・AI 要約・X 取り込み・Google 連携を提供する。

---

## なぜ作ったか

最近の世の中は情報過多で、毎日 X・インスタ・LinkedIn・公式サイトなど大量の情報が流れてくる。いちいち見に行く時間は使いたくないけど、有益な採用情報は見逃したくない——そんな課題を解決するために作った。

---

## 画面構成（3 ペイン）

```
┌──────────┬──────────────────────────┬────────────────────┐
│ LeftNav  │     RadarTable（一覧）     │ RightDetailPanel  │
│  240px   │       minmax(0,1fr)       │      600px         │
│          │                          │                    │
│ ロゴ     │ フィルタバー              │ 企業詳細           │
│ サマリ   │ 企業カード一覧            │ 締切リング         │
│ ナビ     │ カウントダウンリング      │ 会社情報           │
│ Google   │ 進捗バー                 │ X口コミ            │
│ テーマ   │                          │ 認証情報保存       │
└──────────┴──────────────────────────┴────────────────────┘
```

---

## 主要機能

### コア機能

| 機能 | 説明 |
|------|------|
| **メインDB** | 企業採用情報（インターン／早期選考／セミナー／本選考／説明会）の集約管理 |
| **締切カウントダウン** | SVG リングアニメで残日数を可視化（3日以内→赤・それ以上→アクセント） |
| **フィルタリング** | 期間・カテゴリ・ソース・キーワード検索の複合フィルタ |
| **企業比較モード** | 複数企業をチェックして横並びで比較できるダイアログ |
| **お気に入り保存** | ★ ボタンで保存、保存済みのみ表示フィルタ |

### 連携・取り込み機能

| 機能 | 説明 |
|------|------|
| **X（Twitter）取り込み** | 投稿本文を AI キーワードマッチング・要約して DB へ登録 |
| **Gmail 同期** | 採用メールを自動取得・管理 |
| **Google Calendar 連携** | 右パネルのボタンでワンクリックで締切日を Google Calendar に追加。カレンダービューからも個別追加可能 |
| **ニュースパネル** | Hatena / Google News / Qiita / Zenn からキャリア関連ニュースを取得 |

### カレンダー機能

| 機能 | 説明 |
|------|------|
| **📅 カレンダーに追加ボタン** | 右詳細パネル・カレンダービューどちらからもワンクリックで Google Calendar に終日イベント登録 |
| **カテゴリ別カラー** | インターン→青・早期選考→オレンジ・セミナー→緑・本選考→赤・説明会→紫 |
| **統合カレンダービュー** | メインDB 全件の締切日とGoogle Calendar イベントを 1 つのカレンダーに統合表示 |
| **今日ハイライト** | 当日をオレンジ丸でマーク、日曜→赤・土曜→青 |

### AI 分析機能

| 機能 | 説明 |
|------|------|
| **採用熱量スコア** | 0〜100 のヒートスコアで企業の採用活発度を数値化 |
| **AI 要約** | 投稿・記事の自動要約生成 |
| **キーワード抽出** | 投稿から採用関連キーワードを自動抽出・タグ表示 |

### 補助機能

- **ES 下書き**：投稿・イベント・Wiki からの引用付きドラフト作成
- **マイページ認証情報保存**：各社マイページの ID／パスワードを localStorage に保存
- **テーマ切り替え**：ダーク／ライトモード（localStorage で永続化）
- **新着バナー**：未読フラグ付き新着投稿の通知

---

## 技術スタック

### フレームワーク・言語

| 技術 | バージョン | 用途 |
|------|-----------|------|
| Next.js | 14.2.0 | フルスタック Web フレームワーク（App Router） |
| React | 18.3.0 | UI ライブラリ |
| TypeScript | 5.0.0 | 型安全な開発 |

### スタイリング

| 技術 | バージョン | 用途 |
|------|-----------|------|
| Tailwind CSS | 3.0.0 | ユーティリティ CSS |
| tailwind-merge | 3.5.0 | クラス名の競合解消 |
| tailwindcss-animate | 1.0.7 | アニメーションユーティリティ |
| class-variance-authority | 0.7.1 | UI バリアント管理 |

### バックエンド・DB

| 技術 | 用途 |
|------|------|
| Prisma | ORM・マイグレーション管理 |
| SQLite | 開発環境 DB |
| PostgreSQL (Supabase) | 本番環境 DB |

### 外部連携

| 技術 | 用途 |
|------|------|
| googleapis | Gmail / Calendar API |
| @react-oauth/google | Google OAuth フロー |
| next-auth | 認証セッション管理 |

### ユーティリティ・テスト

| 技術 | 用途 |
|------|------|
| date-fns | 日付計算・フォーマット |
| Lucide React | SVG アイコン |
| Vitest | ユニットテスト |
| ESLint | コード品質チェック |

---

## セットアップ

### 1. インストール・起動

Node.js（LTS 推奨）をインストールした上で実行：

```bash
npm install
npm run dev
```

ブラウザで `http://localhost:3000` を開く。

### 2. 環境変数

`.env.example` をコピーして `.env` を作成し、必要な値を設定：

```bash
cp .env.example .env
```

### 3. DB セットアップ（Prisma）

```bash
npm run prisma:generate
npm run prisma:migrate -- --name init
npm run db:seed
```

確認用 Prisma Studio：

```bash
npm run prisma:studio
```

### トラブルシューティング

**`EMFILE: too many open files` が出る場合：**

```bash
CHOKIDAR_USEPOLLING=1 npm run dev
```

---

## よく使うコマンド

```bash
npm run dev              # 開発サーバー起動
npm run build            # 本番ビルド
npm run lint             # ESLint
npm run test             # Vitest（単発）
npm run test:watch       # Vitest watch
npm run prisma:generate  # Prisma クライアント生成
npm run prisma:migrate   # マイグレーション実行
npm run prisma:studio    # Prisma Studio
npm run db:seed          # シードデータ投入
```

---

## API エンドポイント

| エンドポイント | メソッド | 機能 |
|--------------|---------|------|
| `/api/posts/new` | GET | 新着投稿一覧取得 |
| `/api/posts/new` | POST | 既読マーク |
| `/api/posts/x-import` | POST | X 投稿取り込み（AI 要約付き） |
| `/api/auth/google` | GET | Google OAuth URL 生成 |
| `/api/auth/google` | POST | OAuth コールバック・トークン保存 |
| `/api/gmail/sync` | GET | Gmail 未読メール同期 |
| `/api/calendar/sync` | GET | Google Calendar イベント同期 |
| `/api/calendar/add-event` | POST | 締切日を Google Calendar に追加 |
| `/api/news/list` | GET | ニュース一覧・未読カウント |
| `/api/news/refresh` | GET | 外部ソースから再取得 |
| `/api/cron/daily-fetch` | GET | 日次定期ジョブ |

---

## ディレクトリ構成

```
src/
├── app/
│   ├── page.tsx                # ホーム（ThreePaneDashboard）
│   ├── layout.tsx              # ルートレイアウト
│   ├── globals.css             # CSS 変数 + keyframes
│   └── api/
│       ├── auth/google/        # Google OAuth
│       ├── posts/              # 投稿管理・X 取り込み
│       ├── gmail/sync/         # Gmail 同期
│       ├── calendar/sync/      # Google Calendar 読み込み
│       ├── calendar/add-event/ # Google Calendar 書き込み
│       ├── news/               # ニュース取得
│       └── cron/daily-fetch/   # 定期ジョブ
├── components/
│   ├── ui/                     # shadcn 互換 UI パーツ
│   └── timeline/               # FilterBar / SourceBadge
├── features/
│   ├── dashboard/
│   │   ├── components/         # ThreePaneDashboard・RadarTable・RightDetailPanel など
│   │   ├── mock/               # radarItems.ts（30 社分のモックデータ）
│   │   ├── types/              # RadarItem / CompanyProfile
│   │   └── hooks/              # useCompanyCredentials
│   └── news/
│       └── NewsPanel.tsx
├── hooks/
│   └── useFilterState.ts
└── lib/
    ├── filters.ts              # フィルタロジック
    ├── google.ts               # Google OAuth 設定
    ├── ai/                     # AI 要約・ヒートスコア
    ├── prisma.ts               # Prisma singleton
    └── utils.ts                # cn()

prisma/
├── schema.prisma               # データモデル定義
├── seed.ts                     # 初期データ
└── dev.db                      # SQLite（開発用）
```

---

## データモデル

```
User ─────────┐
              ├─── FavoriteCompany
Company ──────┘
  │
  ├─── Post ────── AIAnalysis
  ├─── Event
  ├─── WikiEntry
  ├─── ESDraft
  ├─── Email
  └─── CalendarEvent

NewsArticle（独立）
JointEvent（合同説明会）
```

> 現在 UI は `src/features/dashboard/mock/radarItems.ts` のモックデータを参照。実データ化は `radarItems` を Prisma サーバーコンポーネントに置換するだけで完了する設計。

---

## デザインシステム

yui540 風のキャラメル × クリームカラーを基調としたデザイン。

| CSS 変数 | 値 | 用途 |
|----------|----|------|
| `--accent` | `hsl(26 54% 56%)` キャラメル | メインアクセント |
| `--accent-2` | `hsl(14 70% 58%)` テラコッタ | グラデーション用 |
| `--background` | `hsl(0 0% 100%)` | 背景 |
| `--radius` | `14px` | 角丸の基準値 |

**アニメーションクラス：** `yui-fade-rise` / `yui-shine` / `yui-card` / `yui-ring-pulse` / `yui-heading` / `yui-pill`

---

## 更新履歴

| 日付 | 内容 |
|------|------|
| 2026-04-22 | 初期コミット・骨格構築 |
| 2026-04-24 | 3ペイングリッド修正・AI分析プロファイルビュー追加 |
| 2026-04-24 | 比較モード・認証情報保存・30社モックデータ追加 |
| 2026-04-25 | お気に入り機能・会社情報拡充・yui540風デザイン刷新 |
| 2026-04-25 | 独立スクロール・カード選択時トップ復帰・不要UI削除 |
| 2026-04-26 | カレンダー機能：ワンクリック Google Calendar 追加・統合カレンダービュー |
| 2026-04-27 | カレンダービューからも Google Calendar 追加ボタンを追加 |

---

## 関連リンク

- GitHub: [404-Ryo/nextjs-app](https://github.com/404-Ryo/nextjs-app)
