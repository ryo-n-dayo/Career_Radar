# AGENTS.md

このリポジトリで実装する前にplanモードで設計を出すこと。変更や実行内容は要約してObsidian（user/nishikawaryo）へ保存すること。

## プロジェクト概要

**DailyNews** — 個人用の情報収集・整理アプリ。公開企業サイトの更新候補、X投稿、企業、イベントを保存し、検索・修正・締切管理・カレンダー表示を行う。Cloudflare Workers + D1 で動かし、Cloudflare Access で本人だけに公開する。

- Next.js App Router + Prisma（driver adapter）+ Cloudflare D1
- アプリ内に認証は持たない。アクセス制御は Cloudflare Access に任せる
- ローカル開発も D1（miniflare のローカル DB、`.wrangler/state`）を使う
- アプリ名は `src/lib/appConfig.ts` に集約

## コマンド

```bash
pnpm dev
pnpm build
pnpm cf:build      # next build + OpenNext バンドル
pnpm cf:preview    # workerd 上で確認
pnpm cf:deploy
pnpm lint
pnpm test
pnpm d1:migrate:local
pnpm d1:export
```

## 主な構成

```text
src/app/
  page.tsx             ホーム
  posts/               X投稿管理
  companies/           企業台帳
  events/              予定一覧・カレンダー・個別ページ
  admin/               イベント編集
  api/posts/           X投稿CRUD・AI要約
  api/companies/       企業CRUD
  api/admin/events/    イベントCRUD
src/features/
  posts/
  companies/
  events/
prisma/
  schema.prisma
  seed.ts
```

## データモデル

- `SavedPost`: URLを一意キーにしたX投稿。要約、メモ、タグ、企業紐付けを持つ。
- `Company`: 企業概要、業界、メモ、タグ。削除時は投稿・イベントの関連だけを外す。
- `Event`: URLを一意キーにしたイベント・予定。開催日時、締切、形式、場所、企業紐付けを持つ。

## 開発上の注意

- UI変更後はローカルサーバーを起動し、ホーム・X投稿・企業・イベントの実画面を確認する。
- XのCookieや認証情報を保存しない。ブックマークレットは表示中のURLと本文だけを渡す。
- AI要約は `OPENAI_API_KEY` がある場合だけ外部送信する。
- 既存の締切リング、フィルタ、カレンダー、Googleカレンダー/ICS機能を維持する。
- Prismaモデル変更時はmigrationとseedを更新する。
