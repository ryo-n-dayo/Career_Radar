"use client";

import { useEffect, useRef } from "react";

const BOOKMARKLET = "javascript:(()=>{const t=document.querySelector('[data-testid=tweetText]');const a=document.querySelector('article a[href*=\\\"/status/\\\"]');const u=a?new URL(a.getAttribute('href'),location.origin).href:location.href;open('http://localhost:3000/posts?url='+encodeURIComponent(u)+'&content='+encodeURIComponent(t?.innerText||document.title),'_blank')})()";

export function PostBookmarklet() {
  const ref = useRef<HTMLAnchorElement>(null);
  useEffect(() => { ref.current?.setAttribute("href", BOOKMARKLET); }, []);
  return <a ref={ref} href="#bookmarklet" className="rounded-xl border border-border bg-background px-3 py-2 text-xs font-medium shadow-sm" title="このリンクをブックマークバーへドラッグ">Xから取り込む（ブックマークレット）</a>;
}
