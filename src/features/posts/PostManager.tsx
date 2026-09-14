"use client";

import { useEffect, useMemo, useState } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import { Edit3, ExternalLink, Search, Sparkles, Trash2 } from "lucide-react";

import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import type { CompanyOption, PostItem } from "./types";

type FormState = {
  id: string; url: string; author: string; account: string; content: string; summary: string;
  memo: string; tags: string; postedAt: string; companyId: string;
};

const EMPTY: FormState = { id: "", url: "", author: "", account: "", content: "", summary: "", memo: "", tags: "", postedAt: "", companyId: "" };
const SELECT = "flex h-9 w-full rounded-md border border-input bg-background px-3 py-1 text-sm shadow-sm focus-visible:outline-none focus-visible:ring-1 focus-visible:ring-ring";
const TEXTAREA = "flex min-h-[96px] w-full rounded-md border border-input bg-background px-3 py-2 text-sm shadow-sm placeholder:text-muted-foreground focus-visible:outline-none focus-visible:ring-1 focus-visible:ring-ring";

function toInputDate(iso?: string) {
  if (!iso) return "";
  const date = new Date(iso);
  const pad = (n: number) => String(n).padStart(2, "0");
  return `${date.getFullYear()}-${pad(date.getMonth() + 1)}-${pad(date.getDate())}T${pad(date.getHours())}:${pad(date.getMinutes())}`;
}

export function PostManager({ posts, companies }: { posts: PostItem[]; companies: CompanyOption[] }) {
  const router = useRouter();
  const searchParams = useSearchParams();
  const [form, setForm] = useState(EMPTY);
  const [query, setQuery] = useState("");
  const [busy, setBusy] = useState(false);
  const [summarizing, setSummarizing] = useState(false);
  const [message, setMessage] = useState<string | null>(null);

  useEffect(() => {
    const url = searchParams.get("url") ?? "";
    const content = searchParams.get("content") ?? "";
    if (url || content) setForm((current) => ({ ...current, url: current.url || url, content: current.content || content }));
  }, [searchParams]);

  const filtered = useMemo(() => {
    const needle = query.toLowerCase();
    if (!needle) return posts;
    return posts.filter((post) => `${post.content} ${post.summary} ${post.memo} ${post.author} ${post.account} ${post.companyName} ${post.tags.join(" ")}`.toLowerCase().includes(needle));
  }, [posts, query]);

  function edit(post: PostItem) {
    setForm({ id: post.id, url: post.url, author: post.author ?? "", account: post.account ?? "", content: post.content, summary: post.summary ?? "", memo: post.memo ?? "", tags: post.tags.join(", "), postedAt: toInputDate(post.postedAt), companyId: post.companyId ?? "" });
    window.scrollTo({ top: 0, behavior: "smooth" });
  }

  async function save(event: React.FormEvent) {
    event.preventDefault(); setBusy(true); setMessage(null);
    const response = await fetch("/api/posts", { method: "POST", headers: { "content-type": "application/json" }, body: JSON.stringify({ ...form, postedAt: form.postedAt ? new Date(form.postedAt).toISOString() : "" }) }).catch(() => null);
    const data = response ? await response.json().catch(() => ({})) : {};
    if (!response?.ok) setMessage(data.error ?? "保存できませんでした");
    else { setForm(EMPTY); setMessage("保存しました"); router.replace("/posts"); router.refresh(); }
    setBusy(false);
  }

  async function summarize() {
    if (!form.content.trim()) return setMessage("先に投稿本文を入力してください");
    setSummarizing(true); setMessage(null);
    const response = await fetch("/api/posts/summarize", { method: "POST", headers: { "content-type": "application/json" }, body: JSON.stringify({ content: form.content }) }).catch(() => null);
    const data = response ? await response.json().catch(() => ({})) : {};
    if (!response?.ok) setMessage(data.error ?? "要約できませんでした");
    else setForm((current) => ({ ...current, summary: data.summary }));
    setSummarizing(false);
  }

  async function remove(post: PostItem) {
    if (!window.confirm("この投稿を削除しますか？")) return;
    await fetch(`/api/posts?id=${encodeURIComponent(post.id)}`, { method: "DELETE" });
    router.refresh();
  }

  return (
    <div className="grid gap-6 xl:grid-cols-[390px_1fr]">
      <form onSubmit={save} className="h-fit rounded-2xl border border-border bg-background p-5 xl:sticky xl:top-6">
        <div className="flex items-center justify-between"><h2 className="font-semibold">{form.id ? "X投稿を修正" : "X投稿を保存"}</h2>{form.id && <button type="button" onClick={() => setForm(EMPTY)} className="text-xs text-muted-foreground hover:text-foreground">新規入力に戻す</button>}</div>
        <p className="mt-1 text-xs text-muted-foreground">URLと本文だけで保存できます。要約・企業・タグは後から編集できます。</p>
        {message && <p className="mt-3 rounded-xl bg-muted px-3 py-2 text-xs">{message}</p>}
        <div className="mt-4 space-y-3">
          <Input type="url" required placeholder="https://x.com/.../status/..." value={form.url} onChange={(e) => setForm({ ...form, url: e.target.value })} />
          <textarea required className={TEXTAREA} placeholder="投稿本文" value={form.content} onChange={(e) => setForm({ ...form, content: e.target.value })} />
          <div className="grid grid-cols-2 gap-2"><Input placeholder="投稿者名" value={form.author} onChange={(e) => setForm({ ...form, author: e.target.value })} /><Input placeholder="@account" value={form.account} onChange={(e) => setForm({ ...form, account: e.target.value })} /></div>
          <select className={SELECT} value={form.companyId} onChange={(e) => setForm({ ...form, companyId: e.target.value })}><option value="">企業に紐付けない</option>{companies.map((company) => <option key={company.id} value={company.id}>{company.name}</option>)}</select>
          <div><textarea className={TEXTAREA} placeholder="要約（手入力、またはAIで作成）" value={form.summary} onChange={(e) => setForm({ ...form, summary: e.target.value })} /><Button type="button" variant="outline" size="sm" className="mt-2 gap-1.5" onClick={summarize} disabled={summarizing}><Sparkles className="h-3.5 w-3.5" />{summarizing ? "要約中..." : "AIで要約"}</Button></div>
          <Input placeholder="タグ（カンマ区切り）" value={form.tags} onChange={(e) => setForm({ ...form, tags: e.target.value })} />
          <textarea className={TEXTAREA} placeholder="自分用メモ・次に確認すること" value={form.memo} onChange={(e) => setForm({ ...form, memo: e.target.value })} />
          <Input type="datetime-local" value={form.postedAt} onChange={(e) => setForm({ ...form, postedAt: e.target.value })} />
          <div className="flex gap-2"><Button type="submit" disabled={busy}>{busy ? "保存中..." : form.id ? "更新する" : "保存する"}</Button>{form.id && <Button type="button" variant="ghost" onClick={() => setForm(EMPTY)}>キャンセル</Button>}</div>
        </div>
      </form>

      <section>
        <div className="relative"><Search className="absolute left-3 top-2.5 h-4 w-4 text-muted-foreground" /><Input className="pl-9" placeholder="本文・要約・企業・タグから検索" value={query} onChange={(e) => setQuery(e.target.value)} /></div>
        <div className="mt-4 space-y-3">
          {filtered.length === 0 ? <div className="rounded-2xl border border-dashed border-border p-8 text-center text-sm text-muted-foreground">保存した投稿はありません。</div> : filtered.map((post) => (
            <article key={post.id} className="rounded-2xl border border-border bg-background p-5">
              <div className="flex items-start gap-3"><div className="min-w-0 flex-1"><div className="text-xs text-muted-foreground">{post.account || post.author || "X投稿"}{post.companyName ? ` · ${post.companyName}` : ""}</div><p className="mt-2 whitespace-pre-line text-sm leading-relaxed">{post.content}</p></div><a href={post.url} target="_blank" rel="noreferrer" className="text-muted-foreground hover:text-foreground"><ExternalLink className="h-4 w-4" /></a></div>
              {post.summary && <div className="mt-3 rounded-xl bg-[hsl(var(--accent-soft))]/50 px-3 py-2 text-sm"><span className="mr-2 text-[10px] font-semibold uppercase text-[hsl(var(--accent))]">Summary</span>{post.summary}</div>}
              {post.memo && <p className="mt-3 text-xs text-muted-foreground">メモ: {post.memo}</p>}
              <div className="mt-3 flex flex-wrap items-center gap-1.5">{post.tags.map((tag) => <span key={tag} className="yui-pill bg-muted px-2 py-0.5 text-[10px]">#{tag}</span>)}<span className="ml-auto text-[10px] text-muted-foreground">{new Date(post.savedAt).toLocaleDateString("ja-JP")}</span></div>
              <div className="mt-3 flex gap-2 border-t border-border pt-3"><Button type="button" variant="outline" size="sm" className="gap-1" onClick={() => edit(post)}><Edit3 className="h-3.5 w-3.5" />編集</Button><Button type="button" variant="ghost" size="sm" className="gap-1 text-rose-600" onClick={() => remove(post)}><Trash2 className="h-3.5 w-3.5" />削除</Button></div>
            </article>
          ))}
        </div>
      </section>
    </div>
  );
}
