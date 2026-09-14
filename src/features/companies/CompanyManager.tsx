"use client";

import { useMemo, useState } from "react";
import { useRouter } from "next/navigation";
import { Edit3, ExternalLink, Search, Trash2 } from "lucide-react";

import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import type { CompanyItem } from "./types";

type Form = { id: string; name: string; website: string; careersUrl: string; xHandle: string; industry: string; summary: string; memo: string; tags: string };
const EMPTY: Form = { id: "", name: "", website: "", careersUrl: "", xHandle: "", industry: "", summary: "", memo: "", tags: "" };
const TEXTAREA = "flex min-h-[92px] w-full rounded-md border border-input bg-background px-3 py-2 text-sm shadow-sm placeholder:text-muted-foreground focus-visible:outline-none focus-visible:ring-1 focus-visible:ring-ring";

export function CompanyManager({ companies }: { companies: CompanyItem[] }) {
  const router = useRouter();
  const [form, setForm] = useState(EMPTY);
  const [query, setQuery] = useState("");
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const filtered = useMemo(() => companies.filter((company) => `${company.name} ${company.industry} ${company.summary} ${company.memo} ${company.xHandle} ${company.tags.join(" ")}`.toLowerCase().includes(query.toLowerCase())), [companies, query]);

  function edit(company: CompanyItem) {
    setForm({ id: company.id, name: company.name, website: company.website ?? "", careersUrl: company.careersUrl ?? "", xHandle: company.xHandle ?? "", industry: company.industry ?? "", summary: company.summary ?? "", memo: company.memo ?? "", tags: company.tags.join(", ") });
    window.scrollTo({ top: 0, behavior: "smooth" });
  }

  async function save(event: React.FormEvent) {
    event.preventDefault(); setBusy(true); setError(null);
    const response = await fetch("/api/companies", { method: "POST", headers: { "content-type": "application/json" }, body: JSON.stringify(form) }).catch(() => null);
    const data = response ? await response.json().catch(() => ({})) : {};
    if (!response?.ok) setError(data.error ?? "保存できませんでした");
    else { setForm(EMPTY); router.refresh(); }
    setBusy(false);
  }

  async function remove(company: CompanyItem) {
    if (!window.confirm(`「${company.name}」を削除しますか？\n紐付いた投稿とイベント自体は残ります。`)) return;
    await fetch(`/api/companies?id=${encodeURIComponent(company.id)}`, { method: "DELETE" });
    router.refresh();
  }

  return <div className="grid gap-6 xl:grid-cols-[360px_1fr]">
    <form onSubmit={save} className="h-fit rounded-2xl border border-border bg-background p-5 xl:sticky xl:top-6">
      <div className="flex items-center justify-between"><h2 className="font-semibold">{form.id ? "企業情報を修正" : "企業を追加"}</h2>{form.id && <button type="button" onClick={() => setForm(EMPTY)} className="text-xs text-muted-foreground">新規入力</button>}</div>
      {error && <p className="mt-3 rounded-xl bg-rose-50 px-3 py-2 text-xs text-rose-700">{error}</p>}
      <div className="mt-4 space-y-3"><Input required placeholder="企業名" value={form.name} onChange={(e) => setForm({ ...form, name: e.target.value })} /><Input type="url" placeholder="公式Webサイト" value={form.website} onChange={(e) => setForm({ ...form, website: e.target.value })} /><Input type="url" placeholder="採用・インターンページ" value={form.careersUrl} onChange={(e) => setForm({ ...form, careersUrl: e.target.value })} /><Input placeholder="Xアカウント（@なしでも可）" value={form.xHandle} onChange={(e) => setForm({ ...form, xHandle: e.target.value })} /><Input placeholder="業界・カテゴリ" value={form.industry} onChange={(e) => setForm({ ...form, industry: e.target.value })} /><textarea className={TEXTAREA} placeholder="企業の概要" value={form.summary} onChange={(e) => setForm({ ...form, summary: e.target.value })} /><textarea className={TEXTAREA} placeholder="自分用メモ・確認事項" value={form.memo} onChange={(e) => setForm({ ...form, memo: e.target.value })} /><Input placeholder="タグ（カンマ区切り）" value={form.tags} onChange={(e) => setForm({ ...form, tags: e.target.value })} /><div className="flex gap-2"><Button type="submit" disabled={busy}>{busy ? "保存中..." : form.id ? "更新する" : "追加する"}</Button>{form.id && <Button type="button" variant="ghost" onClick={() => setForm(EMPTY)}>キャンセル</Button>}</div></div>
    </form>
    <section><div className="relative"><Search className="absolute left-3 top-2.5 h-4 w-4 text-muted-foreground" /><Input className="pl-9" placeholder="企業名・業界・メモから検索" value={query} onChange={(e) => setQuery(e.target.value)} /></div><div className="mt-4 grid gap-3 md:grid-cols-2">{filtered.length === 0 ? <div className="rounded-2xl border border-dashed border-border p-8 text-center text-sm text-muted-foreground md:col-span-2">企業情報はまだありません。</div> : filtered.map((company) => <article key={company.id} className="rounded-2xl border border-border bg-background p-5"><div className="flex items-start justify-between gap-2"><div><h3 className="font-semibold">{company.name}</h3><p className="mt-0.5 text-xs text-muted-foreground">{company.industry || "カテゴリ未設定"}</p></div>{company.website && <a href={company.website} target="_blank" rel="noreferrer" className="text-muted-foreground hover:text-foreground"><ExternalLink className="h-4 w-4" /></a>}</div>{company.xHandle && <a href={`https://x.com/${company.xHandle}`} target="_blank" rel="noreferrer" className="mt-2 inline-block text-xs text-[hsl(var(--accent))] hover:underline">@{company.xHandle}</a>}{company.summary && <p className="mt-3 text-sm leading-relaxed">{company.summary}</p>}{company.memo && <p className="mt-3 rounded-xl bg-muted/50 px-3 py-2 text-xs text-muted-foreground">{company.memo}</p>}<div className="mt-3 flex flex-wrap gap-1.5">{company.tags.map((tag) => <span key={tag} className="yui-pill bg-muted px-2 py-0.5 text-[10px]">#{tag}</span>)}</div><div className="mt-4 flex items-center gap-3 border-t border-border pt-3 text-xs text-muted-foreground"><span>X投稿 {company.postCount}</span><span>イベント {company.eventCount}</span><span>監視 {company.sourceCount}</span><span className="ml-auto flex gap-1"><Button type="button" variant="outline" size="sm" onClick={() => edit(company)}><Edit3 className="h-3.5 w-3.5" /></Button><Button type="button" variant="ghost" size="sm" className="text-rose-600" onClick={() => remove(company)}><Trash2 className="h-3.5 w-3.5" /></Button></span></div></article>)}</div></section>
  </div>;
}
