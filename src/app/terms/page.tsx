import Link from "next/link";

export const metadata = { title: "利用メモ" };

export default function TermsPage() {
  return <main className="mx-auto max-w-2xl px-6 py-12"><Link href="/" className="text-sm text-muted-foreground hover:text-foreground">← ホームに戻る</Link><h1 className="mt-8 text-2xl font-bold">利用と収集のメモ</h1><div className="mt-8 space-y-6 text-sm leading-7 text-muted-foreground"><p>DailyNewsは個人利用を前提としています。ただし、個人利用であることだけで、あらゆる自動取得が許されるわけではありません。各サイトの利用規約、robots.txt、法令、権利者の意思を優先してください。</p><p>自動収集は一般公開された企業公式ページ・公式RSS・サイトマップに限定します。ログイン、Cookie、CAPTCHA、アクセス制限の回避は行いません。Xは自動取得せず、公式画面で確認した投稿を手動保存します。</p><p>保存する本文は判断に必要な短い抜粋に留め、転載・再配布しません。必ず元ページへのリンクを残し、応募や判断の前に原文を確認してください。公開情報に個人情報が含まれていても保護対象になり得るため、担当者個人の情報を不必要に蓄積しないでください。</p><p>著作権法や不正アクセス禁止法を含む法令の解釈は個別事情で変わります。迷うサイトは登録せず、公式の提供手段または許可を利用してください。<a className="text-[hsl(var(--accent))] underline" href="https://laws.e-gov.go.jp/law/345AC0000000048" target="_blank" rel="noreferrer">著作権法</a> ・ <a className="text-[hsl(var(--accent))] underline" href="https://laws.e-gov.go.jp/law/411AC0000000128" target="_blank" rel="noreferrer">不正アクセス行為の禁止等に関する法律</a></p><p>SQLiteファイルを削除すると保存内容も消えます。必要に応じて <code className="rounded bg-muted px-1">prisma/dev.db</code> をバックアップしてください。</p></div></main>;
}
