# Career Radar（キャリア・レーダー）

## 起動方法

Node.js（LTS推奨）をインストールした上で、以下を実行してください。

```bash
cd nextjs-app
npm install
npm run dev
```

ブラウザで `http://localhost:3000` を開きます。

## DB（Supabase + Prisma）

1) `.env` を作成（`.env.example` をコピー）して `DATABASE_URL` を設定

2) migration & seed

```bash
cd nextjs-app
npm run prisma:generate
npm run prisma:migrate -- --name init
npm run db:seed
```

（確認用）Prisma Studio:

```bash
npm run prisma:studio
```

## dev時に `EMFILE: too many open files` が出る場合

環境によってはファイル監視上限に当たりエラーが出ます。その場合は:

```bash
CHOKIDAR_USEPOLLING=1 npm run dev
```

## 現状の実装

- **3ペインレイアウト（左ナビ / 中央DBリスト / 右詳細）**: `src/features/dashboard/components/ThreePaneDashboard.tsx`
- **UI（shadcn/ui風の最小セット）**: `src/components/ui/*`

## ディレクトリ構成（機能ベース / features）

```txt
src/
  app/                          # Next.js App Router
    page.tsx                    # いまはダッシュボードを表示
    layout.tsx
    globals.css

  components/
    ui/                         # shadcn/uiのUIコンポーネント置き場

  features/
    dashboard/
      components/               # 3ペイン、一覧、詳細など
      types/                    # 画面・機能単位の型

    companies/                  # 企業CRUD/タグ/フォルダ等（予定）
      components/
      api/
      types/

    es/                         # ES作成フロー（予定）
      components/
      api/
      types/

    ingestion/                  # SNS/公式サイト収集（予定）
      api/
      services/

    ai/                         # 分析・要約・ES生成（予定）
      api/
      prompts/
      services/

  lib/                          # 横断ユーティリティ（例: cn）
```

## 次のステップ（MVP）

- **状態管理**: `companies`/`selectedId` を Zustand or TanStack Query に移す
- **DB**: Prisma + Supabase(PostgreSQL) を導入して `Company` を永続化
- **API Routes**: 企業一覧/詳細、収集ジョブ、AI分析のエンドポイントを追加


変更しました　4/22
