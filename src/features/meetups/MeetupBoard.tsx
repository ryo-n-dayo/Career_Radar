"use client";

import { useMemo, useState } from "react";
import Link from "next/link";
import { Bookmark, Check, ChevronDown, Globe2, MapPin, Monitor, Search, SlidersHorizontal, Sparkles, X } from "lucide-react";
import { EVENT_TOPIC_OPTIONS, normalizeKeywords } from "@/features/sources/preferences";
import { MeetupCard, TOPIC_ICONS } from "./MeetupCard";
import { describeMeetup, filterMeetups, FORMAT_LABELS, REGION_LABELS, type EventPreference, type EventRegion, type MeetupFilters, type MeetupItem, type MeetupPlan } from "./model";
import styles from "./meetups.module.css";

const INITIAL_FILTERS: MeetupFilters = { query: "", topics: [], format: "all", region: "all", view: "all", sort: "recommended" };

const REGION_FILTERS: { id: EventRegion; Icon: typeof MapPin }[] = [
  { id: "japan", Icon: MapPin }, { id: "malaysia", Icon: MapPin }, { id: "overseas", Icon: Globe2 }, { id: "online", Icon: Monitor }
];

export function MeetupBoard({ events, preference }: { events: MeetupItem[]; preference: EventPreference }) {
  const [filters, setFilters] = useState(INITIAL_FILTERS);
  const [savedPreference, setSavedPreference] = useState(preference);
  const [topics, setTopics] = useState(preference.eventTopics);
  const [peopleText, setPeopleText] = useState(preference.eventPeople.join(", "));
  const [talksText, setTalksText] = useState(preference.eventTalks.join(", "));
  const [saving, setSaving] = useState(false);
  const [message, setMessage] = useState("");
  const [saveError, setSaveError] = useState(false);
  const [plans, setPlans] = useState<Record<string, MeetupPlan>>({});
  // Keep unsaved event notes when switching topics or moving between views.
  const [drafts, setDrafts] = useState<Record<string, Pick<MeetupPlan, "people" | "talks">>>({});
  const nextPreference = { eventTopics: topics, eventPeople: normalizeKeywords(peopleText), eventTalks: normalizeKeywords(talksText) };
  const dirty = JSON.stringify(nextPreference) !== JSON.stringify(savedPreference);
  const entries = useMemo(() => events.map((item) => describeMeetup({ ...item, plan: plans[item.url] ?? item.plan }, savedPreference)), [events, plans, savedPreference]);
  const visible = useMemo(() => filterMeetups(entries, filters), [entries, filters]);
  const viewCounts = { all: entries.length, matches: entries.filter((entry) => entry.score > 0).length, saved: entries.filter((entry) => entry.item.plan.saved).length };
  const topicCounts = new Map(EVENT_TOPIC_OPTIONS.map((topic) => [topic.id, filterMeetups(entries, { ...filters, topics: [topic.id] }).length]));
  const regionCounts = new Map(REGION_FILTERS.map(({ id }) => [id, filterMeetups(entries, { ...filters, region: id }).length]));
  const hasPreference = savedPreference.eventTopics.length + savedPreference.eventPeople.length + savedPreference.eventTalks.length > 0;
  const hasFilters = filters.query !== "" || filters.topics.length > 0 || filters.format !== "all" || filters.region !== "all";
  const updateFilters = (patch: Partial<MeetupFilters>) => setFilters((current) => ({ ...current, ...patch }));

  async function savePreference() {
    setSaving(true);
    setMessage("");
    setSaveError(false);
    try {
      const response = await fetch("/api/event-preferences", { method: "PATCH", headers: { "content-type": "application/json" }, body: JSON.stringify(nextPreference) });
      const data = await response.json();
      if (!response.ok) throw new Error(data.error ?? "条件を保存できませんでした");
      setSavedPreference(data);
      setTopics(data.eventTopics);
      setPeopleText(data.eventPeople.join(", "));
      setTalksText(data.eventTalks.join(", "));
      setMessage("保存しました。一覧のおすすめ順と次回のXイベント収集に反映します。");
    } catch (error) {
      setSaveError(true);
      setMessage(error instanceof Error ? error.message : "通信に失敗しました。もう一度お試しください。");
    } finally { setSaving(false); }
  }

  return (
    <div className={styles.board}>
      <header className={styles.header}>
        <div>
          <p className={styles.eyebrow}>見つける・学ぶ・つながる</p>
          <h1>技術イベント</h1>
          <p className={styles.muted}>日本・マレーシア・オンライン。次に参加したい体験を探そう。</p>
        </div>
        <Link href="/sources" className={styles.subtleLink}>収集を管理 <span aria-hidden>↗</span></Link>
      </header>

      <details className={styles.preferences}>
        <summary>
          <span className={styles.preferenceHeading}><SlidersHorizontal size={18} aria-hidden /><strong>興味・目的を編集</strong></span>
          <span className={styles.preferenceSummary}>
            {savedPreference.eventTopics.length > 0 ? EVENT_TOPIC_OPTIONS.filter((topic) => savedPreference.eventTopics.includes(topic.id)).map((topic) => topic.label).join(" · ") : hasPreference ? "交流したい人・聞きたい話を設定済み" : "気になる分野を選んで、自分向けに"}
            {dirty && <span className={styles.unsaved}>未保存</span>}
          </span>
          <ChevronDown size={18} className={styles.chevron} aria-hidden />
        </summary>
        <form className={styles.preferenceBody} onSubmit={(event) => { event.preventDefault(); void savePreference(); }}>
          <fieldset disabled={saving}>
            <legend>興味のある分野</legend>
            <div className={styles.chips}>
              {EVENT_TOPIC_OPTIONS.map((topic) => {
                const selected = topics.includes(topic.id);
                const Icon = TOPIC_ICONS[topic.id];
                return <button key={topic.id} type="button" className={styles.chip} aria-pressed={selected} onClick={() => setTopics((current) => selected ? current.filter((id) => id !== topic.id) : [...current, topic.id])}>
                  {selected ? <Check size={16} aria-hidden /> : <Icon size={16} aria-hidden />}{topic.label}
                </button>;
              })}
            </div>
            <div className={styles.twoColumns}>
              <label>交流したい人<input value={peopleText} onChange={(event) => setPeopleText(event.target.value)} maxLength={2400} placeholder="例：AIエンジニア, PM, 起業家" /></label>
              <label>聞きたい話<input value={talksText} onChange={(event) => setTalksText(event.target.value)} maxLength={2400} placeholder="例：LLM実装, アイデア創出" /></label>
            </div>
            <p className={styles.hint}>カンマ区切りで指定。告知に言葉が含まれる候補を優先します。実際の参加者・講演内容は主催者の案内で確認してください。</p>
            <div className={styles.preferenceActions}>
              <button className={styles.primaryButton} type="submit" disabled={!dirty || saving}>{saving ? "保存中…" : "興味・目的を保存"}</button>
              {dirty && <button type="button" className={styles.textButton} onClick={() => { setTopics(savedPreference.eventTopics); setPeopleText(savedPreference.eventPeople.join(", ")); setTalksText(savedPreference.eventTalks.join(", ")); setMessage(""); }}>編集を取り消す</button>}
            </div>
          </fieldset>
        </form>
      </details>
      {message && <p role={saveError ? "alert" : "status"} className={saveError ? styles.error : styles.notice}>{message}</p>}

      <section className={styles.discovery} aria-label="イベントの絞り込み">
        <div className={styles.viewRow} role="group" aria-label="表示するイベント">
          {([
            { id: "all", label: "すべて", Icon: Search },
            { id: "matches", label: "あなた向け", Icon: Sparkles },
            { id: "saved", label: "気になる", Icon: Bookmark }
          ] as const).map(({ id, label, Icon }) => <button key={id} type="button" aria-pressed={filters.view === id} onClick={() => updateFilters({ view: id })} className={styles.viewButton}>
            <Icon size={17} aria-hidden /><span>{label}</span><span className={styles.count}>{viewCounts[id]}</span>
          </button>)}
        </div>
        <div className={styles.searchRow}>
          <label className={styles.search}>
            <Search size={19} aria-hidden />
            <span className="sr-only">イベント名・企業・キーワードで検索</span>
            <input type="search" value={filters.query} onChange={(event) => updateFilters({ query: event.target.value })} placeholder="イベント名・企業・キーワードで探す" />
          </label>
          <label className={styles.selectLabel}>開催形式
            <select value={filters.format} onChange={(event) => updateFilters({ format: event.target.value as MeetupFilters["format"] })}>
              <option value="all">すべての形式</option>
              {Object.entries(FORMAT_LABELS).map(([id, label]) => <option key={id} value={id}>{label}</option>)}
            </select>
          </label>
        </div>
        <div className={styles.regionRow} role="group" aria-label="参加場所・形式で絞り込む">
          <span className={styles.filterCaption}>参加場所</span>
          <button type="button" className={styles.regionButton} aria-pressed={filters.region === "all"} onClick={() => updateFilters({ region: "all" })}>すべて <span className={styles.count}>{entries.length}</span></button>
          {REGION_FILTERS.map(({ id, Icon }) => <button key={id} type="button" className={styles.regionButton} aria-pressed={filters.region === id} onClick={() => updateFilters({ region: id })}><Icon size={16} aria-hidden />{REGION_LABELS[id]} <span className={styles.count}>{regionCounts.get(id)}</span></button>)}
        </div>
        <div className={styles.chips} role="group" aria-label="分野で絞り込む（複数選択可）">
          {EVENT_TOPIC_OPTIONS.map((topic) => {
            const selected = filters.topics.includes(topic.id);
            const Icon = TOPIC_ICONS[topic.id];
            return <button key={topic.id} type="button" className={styles.chip} aria-pressed={selected} onClick={() => updateFilters({ topics: selected ? filters.topics.filter((id) => id !== topic.id) : [...filters.topics, topic.id] })}>
              {selected ? <Check size={16} aria-hidden /> : <Icon size={16} aria-hidden />}{topic.label}<span className={styles.count}>{topicCounts.get(topic.id)}</span>
            </button>;
          })}
        </div>
        <div className={styles.resultsBar}>
          <p role="status" aria-live="polite"><strong>{visible.length}</strong> 件を表示{filters.topics.length > 1 && <span className={styles.hint}> · 選んだ分野のいずれか</span>}</p>
          {hasFilters && <button className={styles.textButton} type="button" onClick={() => updateFilters({ query: "", topics: [], format: "all", region: "all" })}><X size={15} aria-hidden />絞り込みを解除</button>}
          <label className={styles.sortLabel}><span className="sr-only">並び順</span><select value={filters.sort} onChange={(event) => updateFilters({ sort: event.target.value as MeetupFilters["sort"] })}><option value="recommended">おすすめ順</option><option value="newest">新しく見つかった順</option></select></label>
        </div>
      </section>

      <section aria-label="イベント一覧">
        {visible.length === 0 ? <div className={styles.empty}>
          {filters.view === "saved" ? <Bookmark size={32} aria-hidden /> : <Search size={32} aria-hidden />}
          <h2>{hasFilters ? "条件に合うイベントがありません" : filters.view === "saved" ? "気になるイベントを残しておこう" : filters.view === "matches" && !hasPreference ? "まずは興味のある分野を選ぼう" : "イベントはまだ見つかっていません"}</h2>
          <p>{hasFilters ? "分野や開催形式を広げると、ほかの候補が見つかります。" : filters.view === "saved" ? "カードの「気になる」を押すと、あとでここから見返せます。" : filters.view === "matches" ? "上の「興味・目的を編集」から条件を保存してください。条件に合う告知を優先します。" : "収集設定で登録先や直近の収集結果を確認できます。"}</p>
          {events.length > 0 ? <button type="button" className={styles.primaryButton} onClick={() => setFilters(INITIAL_FILTERS)}>すべてのイベントを見る</button> : <Link className={styles.primaryButton} href="/sources">収集設定を開く</Link>}
        </div> : <div className={styles.grid}>{visible.map((entry) => <MeetupCard key={entry.item.url} entry={entry} draft={drafts[entry.item.url] ?? entry.item.plan}
          onDraft={(draft) => setDrafts((current) => ({ ...current, [entry.item.url]: draft }))}
          onSaved={(plan, clearDraft) => {
            setPlans((current) => ({ ...current, [entry.item.url]: plan }));
            if (clearDraft) setDrafts((current) => { const next = { ...current }; delete next[entry.item.url]; return next; });
          }} />)}</div>}
      </section>
      <p className={styles.footerNote}>「気になる」と参加メモはこのPCに保存されます。参加申し込みは行いません。日程・募集状況はリンク先の最新情報をご確認ください。</p>
    </div>
  );
}
