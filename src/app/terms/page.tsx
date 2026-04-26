import Link from "next/link";

export const metadata = {
  title: "利用規約 | Career Radar",
};

export default function TermsPage() {
  return (
    <main className="min-h-screen bg-background text-foreground">
      <div className="max-w-2xl mx-auto px-6 py-12 yui-fade-rise">
        <Link
          href="/"
          className="text-sm text-muted-foreground hover:text-foreground transition-colors mb-8 inline-block"
        >
          ← ダッシュボードに戻る
        </Link>

        <h1 className="text-2xl font-bold mb-2 yui-heading">利用規約</h1>
        <p className="text-sm text-muted-foreground mb-10">最終更新: 2026年4月26日</p>

        <section className="space-y-8 text-sm leading-7">
          <div>
            <h2 className="font-semibold text-base mb-2">1. サービス概要</h2>
            <p className="text-muted-foreground">
              Career Radar（以下「本サービス」）は、就職活動に関する情報を一元管理するための個人向けツールです。
              本規約に同意の上でご利用ください。
            </p>
          </div>

          <div>
            <h2 className="font-semibold text-base mb-2">2. 禁止事項</h2>
            <p className="text-muted-foreground">以下の行為を禁止します。</p>
            <ul className="mt-3 space-y-1 list-disc list-inside text-muted-foreground">
              <li>企業サイトへの過度なアクセス・大量スクレイピング</li>
              <li>他者のGoogleアカウントを無断で連携すること</li>
              <li>本サービスを通じて取得した情報を第三者へ無断で提供・販売すること</li>
              <li>本サービスのリバースエンジニアリング・改ざん</li>
              <li>法令または公序良俗に反する行為</li>
            </ul>
          </div>

          <div>
            <h2 className="font-semibold text-base mb-2">3. 認証情報の保存について</h2>
            <p className="text-muted-foreground">
              就活サービスのID・パスワードをローカルに保存する機能は、利便性向上のための補助機能です。
              保存された認証情報の管理・セキュリティは利用者自身の責任とします。
              本サービスの運営者は、認証情報の漏洩・不正利用について一切の責任を負いません。
            </p>
          </div>

          <div>
            <h2 className="font-semibold text-base mb-2">4. AI生成コンテンツについて</h2>
            <p className="text-muted-foreground">
              本サービスが提供するAI要約・分析結果は自動生成されたものです。
              内容の正確性・完全性を保証するものではありません。
              就職活動に関する重要な判断は、必ず一次情報（企業公式サイト等）を確認の上で行ってください。
            </p>
          </div>

          <div>
            <h2 className="font-semibold text-base mb-2">5. 免責事項</h2>
            <p className="text-muted-foreground">
              本サービスは現状有姿で提供されます。運営者は以下について責任を負いません。
            </p>
            <ul className="mt-3 space-y-1 list-disc list-inside text-muted-foreground">
              <li>本サービスの停止・中断・データ消失による損害</li>
              <li>AI要約の誤りによる損害</li>
              <li>外部サービス（Google・各就活サービス）の仕様変更による機能停止</li>
              <li>企業サイトのスクレイピングに関するトラブル</li>
            </ul>
          </div>

          <div>
            <h2 className="font-semibold text-base mb-2">6. 規約の変更</h2>
            <p className="text-muted-foreground">
              本規約は予告なく変更されることがあります。変更後の規約はこのページに掲載した時点で効力を生じます。
            </p>
          </div>
        </section>

        <div className="mt-12 pt-8 border-t flex gap-6 text-xs text-muted-foreground">
          <Link href="/privacy" className="hover:text-foreground transition-colors">プライバシーポリシー</Link>
          <Link href="/" className="hover:text-foreground transition-colors">ダッシュボード</Link>
        </div>
      </div>
    </main>
  );
}
