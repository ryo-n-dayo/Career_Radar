import Link from "next/link";

export const metadata = { title: "データについて" };

export default function PrivacyPage() {
  return <main className="mx-auto max-w-2xl px-6 py-12"><Link href="/" className="text-sm text-muted-foreground hover:text-foreground">← ホームに戻る</Link><h1 className="mt-8 text-2xl font-bold">データについて</h1><div className="mt-8 space-y-6 text-sm leading-7 text-muted-foreground"><p>DailyNewsはlocalhostで使う個人用ツールです。企業情報、監視先、収集候補、イベント、保存したX投稿は、このPCの <code className="rounded bg-muted px-1">prisma/dev.db</code> に保存されます。</p><p>サイト収集時は対象サイトへ通常のHTTPリクエストを送り、robots.txtと更新確認情報を参照します。取得したページ全文は保存せず、URL、短い要点、更新判定用ハッシュだけを残します。</p><p>AI要約を実行した場合だけ、入力した投稿本文が設定済みのOpenAI APIへ送信されます。APIキーを設定していない場合、AI要約による外部送信は行われません。</p><p>Xのログイン情報、Cookie、パスワードは保存しません。ブックマークレットは現在表示している投稿本文とURLだけをlocalhostへ渡します。</p></div></main>;
}
