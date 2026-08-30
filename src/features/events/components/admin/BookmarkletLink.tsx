"use client";

import { useEffect, useRef, useState } from "react";

/**
 * ブックマークレット本体。
 * 自分のブラウザで開いているページの DOM だけを読み、サーバーからは一切取得しない。
 * X も マイナビ も自動巡回できない（API 費用 / robots.txt）ため、この経路が実質唯一の入口。
 */
function buildBookmarklet(origin: string): string {
  const code = `
(function(){
  var LIMIT=500;
  function cut(s){s=(s||'').replace(/\\s+/g,' ').trim();return s.length>LIMIT?s.slice(0,LIMIT):s;}
  function meta(n){var e=document.querySelector('meta[property="'+n+'"],meta[name="'+n+'"]');return e?e.getAttribute('content'):'';}
  function txt(sel){var e=document.querySelector(sel);return e?e.innerText:'';}
  var host=location.hostname;
  var d={url:location.href,title:'',description:'',organizer:'',startsAt:'',venue:'',tags:'',hints:''};
  var hints=[];

  if(/(^|\\.)(x|twitter)\\.com$/.test(host)){
    var art=document.querySelector('article');
    var body=art?art.querySelector('[data-testid="tweetText"]'):null;
    var who=art?art.querySelector('[data-testid="User-Name"]'):null;
    var when=art?art.querySelector('time[datetime]'):null;
    d.description=cut(body?body.innerText:'');
    d.organizer=cut(who?who.innerText.split('\\n')[0]:'');
    d.title=cut((body?body.innerText:document.title).split('\\n')[0]);
    if(when)hints.push('投稿日時: '+when.getAttribute('datetime'));
    hints.push('※ 開催日時はポスト本文から読み取って入力してください');
  } else if(/(^|\\.)mynavi\\.jp$/.test(host)){
    // h1 が企業名、h2 はセクション見出し（業種 / 基本情報 / 募集コース ...）という構造
    var SKIP=/^(業種|基本情報|募集コース(一覧)?|募集要項|募集要項・採用フロー|採用後の待遇|概要|会社概要|エントリー|エントリー受付開始！?|インターンシップ.?キャリア|説明会・セミナー|前年の採用データ|この企業の.*)$/;
    var h1=document.querySelector('h1');
    d.organizer=cut(h1?h1.innerText:(document.title.split(/[の|｜]/)[0]||''));
    var heads=[].slice.call(document.querySelectorAll('h1,h2,h3')).map(function(h){return h.innerText.replace(/\\s+/g,' ').trim();})
      .filter(function(t){return t&&t.length>6&&!SKIP.test(t)&&t!==d.organizer;});
    d.title=cut(heads[0]||document.title.split(/[|｜]/)[0]);
    var tg=[].slice.call(document.querySelectorAll('span,li,p')).map(function(e){return e.innerText.replace(/\\s+/g,' ').trim();})
      .filter(function(t){return /^(仕事体験|実務型|実施型|WEB開催|対面開催|オープン[・･]?カンパニー|1day|セミナー|説明会)$/.test(t);});
    d.tags=cut(tg.filter(function(t,i,a){return a.indexOf(t)===i;}).join(','));
    // 日付らしさが無い行はノイズなので落とす
    [].slice.call(document.querySelectorAll('tr,dl,dd,li')).forEach(function(row){
      var t=row.innerText.replace(/\\s+/g,' ').trim();
      if(!t||t.length>160)return;
      if(!/(開催日|実施日|日程|開催期間|締切|開催地|会場)/.test(t))return;
      if(!/\\d/.test(t))return;
      // 入れ子要素は親と子で同じ文言が二重に取れるので、包含されている方を捨てる
      if(hints.some(function(h){return h.indexOf(t)!==-1;}))return;
      hints=hints.filter(function(h){return t.indexOf(h)===-1;});
      hints.push(t);
    });
    hints=hints.slice(0,8);
  } else {
    d.title=cut(meta('og:title')||document.title);
    d.description=cut(meta('og:description')||meta('description')||String(window.getSelection()||''));
    d.organizer=cut(meta('og:site_name'));
  }

  if(!d.title)d.title=cut(document.title);
  d.hints=cut(hints.join(' / '));

  var q=new URLSearchParams();
  Object.keys(d).forEach(function(k){if(d[k])q.set(k,d[k]);});
  window.open('${origin}/admin/new?'+q.toString(),'_blank','noopener');
})();`
    .replace(/\s*\n\s*/g, "")
    .trim();

  return `javascript:${encodeURIComponent(code)}`;
}

export function BookmarkletLink() {
  const [origin, setOrigin] = useState("");
  const [copied, setCopied] = useState(false);
  const anchorRef = useRef<HTMLAnchorElement>(null);

  useEffect(() => {
    setOrigin(window.location.origin);
  }, []);

  const href = origin ? buildBookmarklet(origin) : "";

  // React は javascript: の href を警告するので、マウント後に DOM へ直接入れる
  useEffect(() => {
    if (anchorRef.current && href) {
      anchorRef.current.setAttribute("href", href);
    }
  }, [href]);

  async function handleCopy() {
    if (!href) return;
    try {
      await navigator.clipboard.writeText(href);
      setCopied(true);
      setTimeout(() => setCopied(false), 1500);
    } catch {
      setCopied(false);
    }
  }

  return (
    <div className="mt-5 space-y-4">
      <div className="rounded-2xl border border-border bg-muted/20 p-4">
        <div className="mb-1 text-xs text-muted-foreground">アプリの URL</div>
        <div className="mb-3 truncate text-sm tabular-nums">{origin || "読み込み中..."}</div>

        <div className="flex flex-wrap items-center gap-3">
          <a
            ref={anchorRef}
            href="#"
            draggable
            onClick={(e) => e.preventDefault()}
            className="inline-flex items-center rounded-xl bg-[hsl(var(--accent))] px-4 py-2 text-sm font-medium text-white shadow-sm"
          >
            📌 イベントを取り込む
          </a>
          <span className="text-xs text-muted-foreground">← ブックマークバーにドラッグ</span>
          <button
            type="button"
            onClick={handleCopy}
            className="ml-auto inline-flex h-9 items-center rounded-md border border-border bg-background px-3 text-sm transition-colors hover:bg-muted"
          >
            {copied ? "コピーしました" : "コードをコピー"}
          </button>
        </div>
      </div>

      <div className="rounded-2xl border border-border p-4">
        <div className="mb-2 text-sm font-medium">使い方</div>
        <ol className="list-decimal space-y-1 pl-5 text-sm text-muted-foreground">
          <li>上のボタンをブックマークバーにドラッグする（ドラッグできない場合は「コードをコピー」してブックマークの URL 欄に貼る）</li>
          <li>マイナビのコースページ、X のポスト、企業の告知ページなどを開く</li>
          <li>ブックマークをクリック → 登録フォームが別タブで開き、拾えた項目が入った状態になる</li>
          <li>開催日時など足りないところを埋めて「登録する」</li>
        </ol>
      </div>

      <div className="rounded-2xl border border-border p-4">
        <div className="mb-2 text-sm font-medium">対応しているページ</div>
        <ul className="space-y-1.5 text-sm text-muted-foreground">
          <li>
            <strong className="text-foreground">X</strong> — ポスト本文・投稿者・投稿日時を拾います。開催日時は本文を読んで手で入れてください
          </li>
          <li>
            <strong className="text-foreground">マイナビ</strong> — 企業名・コース名・タグ（仕事体験 / 実務型 / WEB開催 など）と、日程らしき行を「手がかり」として拾います
          </li>
          <li>
            <strong className="text-foreground">その他</strong> — OGP と選択中のテキストを拾います
          </li>
        </ul>
        <p className="mt-3 text-[11px] text-muted-foreground">
          自分のブラウザで開いているページの内容を読むだけで、サーバーからページを取得することはありません。
        </p>
      </div>
    </div>
  );
}
