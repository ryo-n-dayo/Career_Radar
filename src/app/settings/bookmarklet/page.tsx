"use client";

import { useEffect, useState } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";

function buildBookmarklet(origin: string): string {
  const code = `
(function(){
  var url=location.href;
  var m=url.match(/(?:x|twitter)\\.com\\/([^\\/?#]+)\\/status\\/(\\d+)/i);
  if(!m){alert('X の個別ツイートページで使ってください');return;}
  var handle=m[1];
  var tweetId=m[2];
  var art=document.querySelector('article');
  var textEl=art&&art.querySelector('[data-testid="tweetText"]');
  var text=textEl?textEl.innerText:'';
  var timeEl=art&&art.querySelector('time');
  var timestamp=timeEl?timeEl.getAttribute('datetime'):'';
  var nameEl=art&&art.querySelector('[data-testid="User-Name"]');
  var authorName=nameEl?nameEl.innerText.split('\\n')[0]:handle;
  var q=new URLSearchParams({tweetId:tweetId,handle:handle,authorName:authorName,text:text,timestamp:timestamp||'',url:url});
  window.open('${origin}/import/x?'+q.toString(),'_blank');
})();`
    .replace(/\s+/g, " ")
    .trim();
  return `javascript:${encodeURIComponent(code)}`;
}

export default function BookmarkletPage() {
  const [origin, setOrigin] = useState("");

  useEffect(() => {
    setOrigin(window.location.origin);
  }, []);

  const href = origin ? buildBookmarklet(origin) : "";

  return (
    <div className="mx-auto max-w-2xl p-6">
      <h1 className="mb-4 text-xl font-semibold">ブックマークレット設定</h1>

      <p className="mb-4 text-sm text-muted-foreground">
        以下のリンクを<strong>ブックマークバーにドラッグ</strong>してください。X上の気になるツイートのページを開いてクリックすると、取り込みフォームに自動で情報が入力されます。
      </p>

      <div className="rounded-md border border-border p-4">
        <div className="mb-2 text-xs text-muted-foreground">アプリ URL</div>
        <Input value={origin} onChange={(e) => setOrigin(e.target.value)} />

        <div className="mt-4 flex items-center gap-3">
          {href ? (
            <a
              href={href}
              className="inline-flex items-center rounded-md bg-primary px-4 py-2 text-sm font-medium text-primary-foreground shadow hover:opacity-90"
              onClick={(e) => e.preventDefault()}
              draggable
            >
              📌 Xから取り込む
            </a>
          ) : (
            <span className="text-sm text-muted-foreground">読み込み中...</span>
          )}
          <span className="text-xs text-muted-foreground">← ドラッグしてブックマーク</span>
        </div>
      </div>

      <div className="mt-6 rounded-md border border-border p-4">
        <div className="mb-2 text-sm font-medium">使い方</div>
        <ol className="list-decimal space-y-1 pl-5 text-sm text-muted-foreground">
          <li>上のボタンをブックマークバーにドラッグ</li>
          <li>X(Twitter)で取り込みたいツイートのページを開く（URLに /status/ が含まれる個別ページ）</li>
          <li>ブックマークをクリック → 取り込みフォームが別タブで開く</li>
          <li>内容確認・必要なら企業IDを入力して「取り込む」</li>
        </ol>
      </div>

      <div className="mt-6 rounded-md border border-border p-4">
        <div className="mb-2 text-sm font-medium">手動でも取り込める</div>
        <p className="text-sm text-muted-foreground">
          ブックマークレットが動かない場合は{" "}
          <a href="/import/x" className="text-primary underline">
            /import/x
          </a>{" "}
          にURLと本文を貼り付けてください。
        </p>
      </div>

      <div className="mt-6">
        <Button variant="ghost" onClick={() => window.history.back()}>
          戻る
        </Button>
      </div>
    </div>
  );
}
