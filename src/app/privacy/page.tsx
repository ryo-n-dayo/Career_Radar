import Link from "next/link";

export const metadata = {
  title: "プライバシーポリシー | Career Radar",
};

export default function PrivacyPage() {
  return (
    <main className="min-h-screen bg-background text-foreground">
      <div className="max-w-2xl mx-auto px-6 py-12 yui-fade-rise">
        <Link
          href="/"
          className="text-sm text-muted-foreground hover:text-foreground transition-colors mb-8 inline-block"
        >
          ← ダッシュボードに戻る
        </Link>

        <h1 className="text-2xl font-bold mb-2 yui-heading">プライバシーポリシー</h1>
        <p className="text-sm text-muted-foreground mb-10">最終更新: 2026年4月26日</p>

        <section className="space-y-8 text-sm leading-7">
          <div>
            <h2 className="font-semibold text-base mb-2">1. 収集する情報</h2>
            <p className="text-muted-foreground">
              Career Radar は以下の情報を収集・保存します。
            </p>
            <ul className="mt-3 space-y-1 list-disc list-inside text-muted-foreground">
              <li>Googleアカウント情報（メールアドレス・名前・プロフィール画像）</li>
              <li>Gmailの未読メールの件名・送信者・スニペット（本文冒頭）</li>
              <li>Googleカレンダーのイベント情報</li>
              <li>お気に入り登録した企業の採用ページHTML（変更検知のみ）</li>
              <li>手動でインポートしたX（Twitter）投稿のテキスト</li>
            </ul>
          </div>

          <div>
            <h2 className="font-semibold text-base mb-2">2. ブラウザへのローカル保存</h2>
            <p className="text-muted-foreground">
              就活サービス（マイナビ・リクナビ等）のログインID・パスワードは、
              お使いのブラウザの <code className="bg-muted px-1 rounded text-xs">localStorage</code> にのみ保存されます。
              サーバーには一切送信されません。
              共用端末でのご利用はお控えください。
            </p>
          </div>

          <div>
            <h2 className="font-semibold text-base mb-2">3. AIへのデータ送信</h2>
            <p className="text-muted-foreground">
              記事の要約・分類のため、取得したコンテンツの一部（最大400文字）を以下のAI APIに送信することがあります。
            </p>
            <ul className="mt-3 space-y-1 list-disc list-inside text-muted-foreground">
              <li>Anthropic Claude API（ニュース要約）</li>
              <li>OpenAI API（Xポスト要約）</li>
            </ul>
            <p className="mt-3 text-muted-foreground">
              各社のプライバシーポリシーに従いデータが処理されます。個人を特定できる情報は含めません。
            </p>
          </div>

          <div>
            <h2 className="font-semibold text-base mb-2">4. 外部サービス</h2>
            <p className="text-muted-foreground">
              本サービスは以下の外部サービスを利用しています。
            </p>
            <ul className="mt-3 space-y-1 list-disc list-inside text-muted-foreground">
              <li>Supabase（データベース）</li>
              <li>Vercel（ホスティング）</li>
              <li>Google APIs（Gmail / Calendar / OAuth）</li>
            </ul>
          </div>

          <div>
            <h2 className="font-semibold text-base mb-2">5. データの削除</h2>
            <p className="text-muted-foreground">
              アカウントの削除をご希望の場合は、設定画面よりデータ削除が可能です。
              ローカルに保存された認証情報は、ブラウザの設定またはアプリ内の削除ボタンから削除できます。
            </p>
          </div>

          <div>
            <h2 className="font-semibold text-base mb-2">6. お問い合わせ</h2>
            <p className="text-muted-foreground">
              プライバシーに関するご質問はGitHubのIssueよりお問い合わせください。
            </p>
          </div>
        </section>

        <div className="mt-12 pt-8 border-t flex gap-6 text-xs text-muted-foreground">
          <Link href="/terms" className="hover:text-foreground transition-colors">利用規約</Link>
          <Link href="/" className="hover:text-foreground transition-colors">ダッシュボード</Link>
        </div>
      </div>
    </main>
  );
}
