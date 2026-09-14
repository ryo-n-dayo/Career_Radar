"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { AlertTriangle, Play, Radio, ShieldCheck, Sparkles, Trash2 } from "lucide-react";

import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { TOPIC_OPTIONS } from "./preferences";
import type { CandidateItem, FeedbackStats, InterestProfileItem, SourceCompany, SourceItem, XApiBudgetStatus } from "./types";

const SELECT = "flex h-9 w-full rounded-md border border-input bg-background px-3 py-1 text-sm shadow-sm focus-visible:outline-none focus-visible:ring-1 focus-visible:ring-ring";
const TEXTAREA = "flex min-h-[72px] w-full rounded-md border border-input bg-background px-3 py-2 text-sm shadow-sm placeholder:text-muted-foreground focus-visible:outline-none focus-visible:ring-1 focus-visible:ring-ring";

const KIND_LABEL: Record<string, string> = { PAGE: "Webページ", CAREERS: "公式・公開求人", NEW_GRAD: "公式・新卒採用", TECH_EVENTS: "公式技術イベント", TECH_BENEFITS: "公式ITニュース（特典）", TECH_NEWS: "公式ITニュース", RSS: "RSS / Atom", SITEMAP: "サイトマップ", X_MANUAL: "X（手動確認）", X_API: "X API", X_ALGO: "企業の新着フィード", X_ALGO_TECH_EVENT: "技術イベント発見", X_ALGO_LEARNING_BENEFIT: "ITニュース発見" };
const STATUS_LABEL: Record<string, string> = {
  PENDING: "未実行", CHANGED: "新着あり", UNCHANGED: "変更なし", ROBOTS_BLOCKED: "robots.txtで停止",
  TERMS_REQUIRED: "条件確認が必要", SCOPE_PAUSED: "地域条件で停止", X_MANUAL: "手動確認", X_API_DISABLED: "X API未設定", X_BUDGET_LIMIT: "X API上限", X_CHANGED: "X新着あり", ERROR: "取得エラー"
};
type FormState = { name: string; url: string; kind: string; companyId: string; termsUrl: string; notes: string; confirmed: boolean };
const EMPTY: FormState = { name: "", url: "", kind: "CAREERS", companyId: "", termsUrl: "", notes: "", confirmed: false };
export function SourceManager({ sources, candidates, companies, xApi, interestProfile, feedbackStats }: { sources: SourceItem[]; candidates: CandidateItem[]; companies: SourceCompany[]; xApi: XApiBudgetStatus; interestProfile: InterestProfileItem; feedbackStats: FeedbackStats }) {
  const router = useRouter();
  const [form, setForm] = useState(EMPTY);
  const [busy, setBusy] = useState(false);
  const [message, setMessage] = useState<string | null>(null);
  const [includeKeywords, setIncludeKeywords] = useState(interestProfile.includeKeywords.join(", "));
  const [excludeKeywords, setExcludeKeywords] = useState(interestProfile.excludeKeywords.join(", "));
  const [selectedTopics, setSelectedTopics] = useState(interestProfile.selectedTopics);
  const [preferenceBusy, setPreferenceBusy] = useState(false);
  const [sampleBusy, setSampleBusy] = useState(false);
  const [preferenceMessage, setPreferenceMessage] = useState<string | null>(null);

  async function addSource(event: React.FormEvent) {
    event.preventDefault(); setBusy(true); setMessage(null);
    const response = await fetch("/api/sources", { method: "POST", headers: { "content-type": "application/json" }, body: JSON.stringify(form) }).catch(() => null);
    const data = response ? await response.json().catch(() => ({})) : {};
    if (!response?.ok) setMessage(data.error ?? "登録できませんでした");
    else { setForm(EMPTY); setMessage("監視先を登録しました"); router.refresh(); }
    setBusy(false);
  }

  async function scan(sourceId?: string) {
    setBusy(true); setMessage("安全条件を確認して収集中です…");
    const response = await fetch("/api/sources/scan", { method: "POST", headers: { "content-type": "application/json" }, body: JSON.stringify({ sourceId }) }).catch(() => null);
    const data = response ? await response.json().catch(() => ({})) : {};
    setMessage(response?.ok ? `収集完了：新しい候補 ${data.created ?? 0}件` : "収集できませんでした");
    router.refresh(); setBusy(false);
  }

  function collectNow() {
    if (sources.some((source) => ["X_ALGO", "X_ALGO_TECH_EVENT", "X_ALGO_LEARNING_BENEFIT"].includes(source.kind))) {
      void startPersonalizedFeed();
      return;
    }
    if (sources.some((source) => source.kind !== "X_MANUAL")) {
      void scan();
      return;
    }
    void startPersonalizedFeed();
  }

  async function startPersonalizedFeed() {
    setBusy(true); setMessage("あなたの判定履歴から、X検索条件を組み立てています…");
    const response = await fetch("/api/sources/auto", { method: "POST" }).catch(() => null);
    const data = response ? await response.json().catch(() => ({})) : {};
    if (!response?.ok) setMessage(data.error ?? "あなた向けフィードを作成できませんでした");
    else setMessage(`あなた向けXフィードで収集しました。新しい候補 ${data.created ?? 0}件`);
    router.refresh(); setBusy(false);
  }

  async function savePreferences() {
    setPreferenceBusy(true); setPreferenceMessage(null);
    const response = await fetch("/api/preferences", {
      method: "PATCH",
      headers: { "content-type": "application/json" },
      body: JSON.stringify({ includeKeywords, excludeKeywords, selectedTopics })
    }).catch(() => null);
    const data = response ? await response.json().catch(() => ({})) : {};
    if (!response?.ok) setPreferenceMessage(data.error ?? "条件を保存できませんでした");
    else { setPreferenceMessage("収集条件を保存しました。次の収集から反映します。"); router.refresh(); }
    setPreferenceBusy(false);
  }

  function toggleTopic(topicId: string) {
    setSelectedTopics((current) => current.includes(topicId)
      ? current.filter((id) => id !== topicId)
      : current.length < 6 ? [...current, topicId] : current);
  }

  async function addPracticeSamples() {
    setSampleBusy(true); setPreferenceMessage(null);
    const response = await fetch("/api/samples", { method: "POST" }).catch(() => null);
    const data = response ? await response.json().catch(() => ({})) : {};
    if (!response?.ok) setPreferenceMessage(data.error ?? "練習用サンプルを追加できませんでした");
    else setPreferenceMessage(data.created > 0 ? `練習用サンプルを${data.created}件追加しました。興味度を付けてください。` : "練習用サンプルは追加済みです。興味度を付けてください。");
    router.refresh();
    setSampleBusy(false);
  }

  async function removeSource(id: string, name: string) {
    if (!window.confirm(`「${name}」を監視対象から削除しますか？\nこの監視先から見つけた候補も削除されます。`)) return;
    await fetch(`/api/sources?id=${encodeURIComponent(id)}`, { method: "DELETE" }); router.refresh();
  }

  const webSources = sources.filter((source) => !["X_MANUAL", "X_API", "X_ALGO", "X_ALGO_TECH_EVENT", "X_ALGO_LEARNING_BENEFIT"].includes(source.kind));
  const xSources = sources.filter((source) => ["X_MANUAL", "X_API", "X_ALGO", "X_ALGO_TECH_EVENT", "X_ALGO_LEARNING_BENEFIT"].includes(source.kind));
  const newCandidates = candidates.filter((candidate) => candidate.status === "NEW");
  const topicLabels: Map<string, string> = new Map(TOPIC_OPTIONS.map((topic) => [topic.id, topic.label]));

  return <div className="space-y-7">
    <section className="grid gap-4 lg:grid-cols-[1fr_320px]">
      <div className="rounded-[28px] border border-border bg-background/80 p-5 shadow-sm backdrop-blur-sm sm:p-6">
        <div className="flex flex-wrap items-center justify-between gap-3">
          <div><p className="text-xs font-semibold uppercase tracking-[0.16em] text-[hsl(var(--accent))]">Daily brief</p><h2 className="mt-1 text-xl font-semibold tracking-tight">毎朝5:00に収集、9:00に確認</h2><p className="mt-1 text-sm text-muted-foreground">企業の新着と、学生向けの小さなイベント告知を自動で探します。</p></div>
          <Button onClick={collectNow} disabled={busy} className="min-w-32"><Play className="mr-2 h-4 w-4" />今すぐ収集</Button>
        </div>
        <div className="mt-5 grid gap-3 sm:grid-cols-3">
          <div className="rounded-xl bg-muted/50 p-3"><div className="text-2xl font-bold tabular-nums">{webSources.length}</div><div className="text-xs text-muted-foreground">自動監視ページ</div></div>
          <div className="rounded-xl bg-muted/50 p-3"><div className="text-2xl font-bold tabular-nums">{xSources.length}</div><div className="text-xs text-muted-foreground">Xウォッチ</div></div>
          <div className="rounded-xl bg-[hsl(var(--accent-soft))] p-3"><div className="text-2xl font-bold tabular-nums">{newCandidates.length}</div><div className="text-xs text-muted-foreground">未確認の候補</div></div>
        </div>
        {message && <p aria-live="polite" className="mt-4 rounded-2xl border border-border bg-muted/50 px-4 py-3 text-sm">{message}</p>}
      </div>
      <aside className="rounded-[28px] border border-emerald-200 bg-emerald-50/60 p-5 text-emerald-950 shadow-sm dark:border-emerald-900 dark:bg-emerald-950/30 dark:text-emerald-100">
        <div className="flex items-center gap-2 font-semibold"><ShieldCheck className="h-5 w-5" />安全優先モード</div>
        <p className="mt-3 text-sm leading-6 opacity-80">公開ページだけを低頻度で確認します。禁止ページやログインが必要なページは収集しません。</p>
      </aside>
    </section>

    <section className="rounded-[28px] border border-border bg-background/80 p-5 shadow-sm backdrop-blur-sm sm:p-6">
      <div className="flex flex-wrap items-start justify-between gap-4"><div><p className="text-xs font-semibold uppercase tracking-[0.16em] text-[hsl(var(--accent))]">Your filter</p><h2 className="mt-1 text-lg font-semibold">最初に、興味のある話題を選ぶ</h2><p className="mt-1 text-sm text-muted-foreground">マッチングアプリのように、気になる話題を選ぶだけで検索と順位に強く反映します。</p></div><div className="flex flex-wrap items-center gap-3"><div className="rounded-2xl bg-muted/60 px-3 py-2 text-right"><div className="text-sm font-semibold tabular-nums">{feedbackStats.ratedCount}件</div><div className="text-[11px] text-muted-foreground">評価済み・平均 {feedbackStats.averageValue >= 0 ? "+" : ""}{feedbackStats.averageValue.toFixed(1)}</div></div><Button type="button" variant="outline" onClick={() => void addPracticeSamples()} disabled={sampleBusy}><Sparkles className="mr-2 h-4 w-4" />練習用10件を追加</Button><Button type="button" variant="outline" onClick={() => void savePreferences()} disabled={preferenceBusy}>選択を保存</Button></div></div>
      <div className="mt-5"><div className="mb-3 flex items-center justify-between"><span className="text-sm font-medium">興味のある話題</span><span className="text-xs text-muted-foreground">{selectedTopics.length} / 6 選択</span></div><div className="flex flex-wrap gap-2">{TOPIC_OPTIONS.map((topic) => { const selected = selectedTopics.includes(topic.id); return <button key={topic.id} type="button" aria-pressed={selected} onClick={() => toggleTopic(topic.id)} className={`rounded-full border px-3.5 py-2 text-sm font-medium transition ${selected ? "border-[hsl(var(--accent))] bg-[hsl(var(--accent))] text-white shadow-sm" : "border-border bg-background text-muted-foreground hover:border-[hsl(var(--accent))]/50 hover:text-foreground"}`}>{topic.label}</button>; })}</div><p className="mt-3 text-xs leading-relaxed text-muted-foreground">「学生向けキャリアイベント」は、企業公式だけでなく、主催・共催者による一次告知も対象にします。参加者の感想投稿は除外します。</p></div>
      <div className="mt-5 grid gap-3 md:grid-cols-2"><label className="space-y-1.5"><span className="text-sm font-medium">さらに具体的に探す</span><Input value={includeKeywords} onChange={(event) => setIncludeKeywords(event.target.value)} placeholder="例：長期インターン, AI, 海外, マレーシア" /><span className="block text-xs text-muted-foreground">チップにない条件をカンマか改行で追加できます。</span></label><label className="space-y-1.5"><span className="text-sm font-medium">避けたい情報</span><Input value={excludeKeywords} onChange={(event) => setExcludeKeywords(event.target.value)} placeholder="例：新卒一括, 営業職, オンラインのみ" /><span className="block text-xs text-muted-foreground">該当する候補は強く優先度を下げます。</span></label></div>
      <div className="mt-6 border-t border-border pt-5"><div className="flex items-baseline justify-between gap-3"><div><h3 className="text-sm font-semibold">過去に選んだ話題</h3><p className="mt-1 text-xs text-muted-foreground">直近20回の保存時点の組み合わせです。</p></div><span className="text-xs text-muted-foreground">{interestProfile.topicHistory.length} 件</span></div>{interestProfile.topicHistory.length === 0 ? <p className="mt-3 rounded-xl bg-muted/40 px-3 py-3 text-sm text-muted-foreground">まだ保存履歴はありません。話題を選んで「選択を保存」を押すと、ここに残ります。</p> : <div className="mt-3 space-y-2">{[...interestProfile.topicHistory].reverse().map((entry) => <div key={`${entry.selectedAt}-${entry.topicIds.join("-")}`} className="flex flex-wrap items-center gap-2 rounded-xl bg-muted/40 px-3 py-2.5"><time className="mr-1 text-xs text-muted-foreground">{new Date(entry.selectedAt).toLocaleString("ja-JP", { month: "numeric", day: "numeric", hour: "2-digit", minute: "2-digit" })}</time>{entry.topicIds.map((topicId) => <span key={topicId} className="rounded-full border border-border bg-background px-2.5 py-1 text-xs font-medium">{topicLabels.get(topicId) ?? topicId}</span>)}</div>)}</div>}</div>
      {preferenceMessage && <p aria-live="polite" className="mt-4 text-sm text-muted-foreground">{preferenceMessage}</p>}
    </section>

    <section className="rounded-[28px] border border-border bg-background/80 p-5 shadow-sm backdrop-blur-sm sm:p-6">
      <div className="flex flex-wrap items-start justify-between gap-4"><div><p className="text-xs font-semibold uppercase tracking-[0.16em] text-[hsl(var(--accent))]">X API budget</p><h2 className="mt-1 text-lg font-semibold">X APIは上限を越えずに使う</h2><p className="mt-1 text-xs text-muted-foreground">投稿の取得は1件 $0.005 として概算します。X API監視先は、確認間隔が長い順に1日最大{ xApi.dailyPostLimit }件まで処理します。</p></div><span className={`rounded-full px-3 py-1 text-xs font-medium ${xApi.enabled && xApi.configured ? "bg-emerald-100 text-emerald-800" : "bg-muted text-muted-foreground"}`}>{xApi.enabled && xApi.configured ? "有効" : "未設定"}</span></div>
      <div className="mt-4 grid gap-3 sm:grid-cols-3"><div className="rounded-xl bg-muted/50 p-3"><div className="text-lg font-bold">{xApi.postsReadToday} / {xApi.dailyPostLimit}</div><div className="text-xs text-muted-foreground">今日の投稿取得</div></div><div className="rounded-xl bg-muted/50 p-3"><div className="text-lg font-bold">${xApi.estimatedCostMonthUsd.toFixed(2)} / ${xApi.monthlyBudgetUsd.toFixed(2)}</div><div className="text-xs text-muted-foreground">今月の概算費用</div></div><div className="rounded-xl bg-muted/50 p-3"><div className="text-lg font-bold">${xApi.estimatedCostTodayUsd.toFixed(2)}</div><div className="text-xs text-muted-foreground">今日の概算費用</div></div></div>
      {!xApi.configured && <p className="mt-4 rounded-xl border border-dashed border-border px-3 py-2 text-xs leading-relaxed text-muted-foreground">有効化するには <code className="rounded bg-muted px-1">.env.local</code> にX APIのBearer Tokenを保存し、<code className="rounded bg-muted px-1">X_API_ENABLED=&quot;true&quot;</code> を設定してください。トークンは画面やSQLiteには保存されません。</p>}
    </section>

    <section className="grid items-start gap-6 xl:grid-cols-[minmax(360px,440px)_1fr]">
      <form onSubmit={addSource} className="h-fit rounded-[28px] border border-border bg-background/80 p-5 shadow-sm backdrop-blur-sm xl:sticky xl:top-6">
        <h2 className="font-semibold">収集ページを追加</h2>
        <p className="mt-1 text-sm leading-relaxed text-muted-foreground">企業公式の採用サイト、技術イベントページ、または企業が直接公開しているHERP Careersなどの求人ページから、技術インターン・新卒採用・技術イベントを蓄積します。</p>
        <div className="mt-4 space-y-3">
          <Input required placeholder="表示名（例：〇〇社 採用情報）" value={form.name} onChange={(event) => setForm({ ...form, name: event.target.value })} />
          <Input required type="url" placeholder="https://example.com/careers または /events" value={form.url} onChange={(event) => setForm({ ...form, url: event.target.value })} />
          <select className={SELECT} value={form.kind} onChange={(event) => setForm({ ...form, kind: event.target.value })}>
            <option value="CAREERS">IT・エンジニアインターン（公式・公開求人）</option><option value="NEW_GRAD">技術職の新卒・第二新卒（公式ページ）</option><option value="TECH_EVENTS">技術イベント（公式ページ）</option><option value="TECH_NEWS">ITニュース（公式の開発者・製品情報）</option><option value="TECH_BENEFITS">ITニュース（公式の資格・特典）</option><option value="PAGE">Webページ</option><option value="RSS">RSS / Atom</option><option value="SITEMAP">サイトマップ</option><option value="X_MANUAL">X（手動確認）</option><option value="X_API">X API（上限付き）</option>
          </select>
          <select className={SELECT} value={form.companyId} onChange={(event) => setForm({ ...form, companyId: event.target.value })}>
            <option value="">企業との紐付けなし</option>{companies.map((company) => <option key={company.id} value={company.id}>{company.name}</option>)}
          </select>
          <Input type="url" placeholder="利用規約URL（見つかる場合）" value={form.termsUrl} onChange={(event) => setForm({ ...form, termsUrl: event.target.value })} />
          <textarea className={TEXTAREA} placeholder="確認メモ（公開ページ、公式RSSなど）" value={form.notes} onChange={(event) => setForm({ ...form, notes: event.target.value })} />
          <label className="flex cursor-pointer items-start gap-2 rounded-xl border border-border bg-muted/30 p-3 text-xs leading-relaxed">
            <input className="mt-0.5" type="checkbox" checked={form.confirmed} onChange={(event) => setForm({ ...form, confirmed: event.target.checked })} />
            <span>公開ページであり、サイトの利用規約等に自動取得の禁止がないことを確認しました。robots.txtの判定にも従います。</span>
          </label>
          <Button type="submit" disabled={busy} className="w-full">監視先に追加</Button>
        </div>
      </form>

      <div className="space-y-4">
        <div className="flex items-center gap-2"><Radio className="h-4 w-4 text-[hsl(var(--accent))]" /><h2 className="font-semibold">監視中</h2></div>
        {sources.length === 0 ? <div className="rounded-[28px] border border-dashed border-border bg-background/50 p-10 text-center"><p className="text-sm font-medium">あなた向けのXフィードをまだ作っていません</p><p className="mt-2 text-sm text-muted-foreground">興味あり・なしの履歴と希望語から、公式X APIの検索条件を自動で組み立てます。</p><Button type="button" variant="outline" className="mt-5" onClick={() => void startPersonalizedFeed()} disabled={busy}><Sparkles className="mr-2 h-4 w-4" />あなた向けに収集を始める</Button></div> : sources.map((source) => <article key={source.id} className="rounded-[24px] border border-border bg-background/80 p-4 shadow-sm">
          <div className="flex items-start justify-between gap-3">
            <div className="min-w-0"><div className="flex flex-wrap items-center gap-2"><h3 className="font-medium">{source.name}</h3><span className="rounded-full bg-muted px-2 py-0.5 text-[10px]">{KIND_LABEL[source.kind] ?? source.kind}</span></div><a href={source.url} target="_blank" rel="noreferrer" className="mt-1 block truncate text-xs text-muted-foreground hover:text-foreground">{source.url}</a></div>
            <div className="flex shrink-0 gap-1">{source.kind !== "X_MANUAL" && <Button type="button" size="sm" variant="outline" onClick={() => scan(source.id)} disabled={busy}><Play className="h-3.5 w-3.5" /></Button>}<Button type="button" size="sm" variant="ghost" className="text-rose-600" onClick={() => removeSource(source.id, source.name)}><Trash2 className="h-3.5 w-3.5" /></Button></div>
          </div>
          <div className="mt-3 flex flex-wrap items-center gap-2 text-[11px] text-muted-foreground"><span className={source.lastStatus === "CHANGED" ? "text-emerald-700" : source.lastStatus.includes("BLOCKED") || source.lastStatus === "ERROR" ? "text-rose-700" : ""}>{STATUS_LABEL[source.lastStatus] ?? source.lastStatus}</span>{source.companyName && <span>· {source.companyName}</span>}{source.lastCheckedAt && <span>· 最終確認 {new Date(source.lastCheckedAt).toLocaleString("ja-JP")}</span>}</div>
          {source.lastError && <p className="mt-2 flex items-start gap-1.5 rounded-lg bg-amber-50 px-2.5 py-2 text-[11px] leading-relaxed text-amber-900 dark:bg-amber-950/30 dark:text-amber-100"><AlertTriangle className="mt-0.5 h-3.5 w-3.5 shrink-0" />{source.lastError}</p>}
        </article>)}
      </div>
    </section>

    <section className="rounded-[28px] border border-border bg-background/80 p-5 text-center shadow-sm">
      <p className="font-medium">新着の判断はフィードで行います。</p>
      <p className="mt-1 text-sm text-muted-foreground">興味あり・なしを付けるほど、次に出す投稿があなた向けになります。</p>
      <Button type="button" variant="outline" className="mt-4" onClick={() => router.push("/feed")}>フィードを開く</Button>
    </section>
  </div>;
}
