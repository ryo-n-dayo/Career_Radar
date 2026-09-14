"use client";

import { useId, useState } from "react";
import { ArrowUpRight, Bookmark, BrainCircuit, CalendarDays, Check, ChevronDown, Clock3, Cloud, Code2, Database, MapPin, MessageCircle, Monitor, Palette, ShieldCheck, Trophy, UsersRound, type LucideIcon } from "lucide-react";
import { EVENT_TOPIC_OPTIONS } from "@/features/sources/preferences";
import { FORMAT_LABELS, REGION_LABELS, type DescribedMeetup, type MeetupPlan } from "./model";
import styles from "./meetups.module.css";

export const TOPIC_ICONS: Record<string, LucideIcon> = {
  ai: BrainCircuit, cloud: Cloud, hackathon: Trophy, data: Database,
  design: Palette, oss: ShieldCheck, meetup: UsersRound
};

export function MeetupCard({ entry, draft, onDraft, onSaved }: {
  entry: DescribedMeetup;
  draft: Pick<MeetupPlan, "people" | "talks">;
  onDraft: (draft: Pick<MeetupPlan, "people" | "talks">) => void;
  onSaved: (plan: MeetupPlan, clearDraft: boolean) => void;
}) {
  const { item, topics, format, region, matchedTopics, matchedPeople, matchedTalks } = entry;
  const [pending, setPending] = useState<"bookmark" | "notes" | null>(null);
  const [message, setMessage] = useState("");
  const [error, setError] = useState(false);
  const titleId = useId();
  const topic = topics.find((value) => value.id === "hackathon") ?? topics[0];
  const Icon = topic ? TOPIC_ICONS[topic.id] : Code2;
  const PlaceIcon = format === "online" ? Monitor : MapPin;
  const dirty = draft.people !== item.plan.people || draft.talks !== item.plan.talks;
  const hasNotes = Boolean(item.plan.people || item.plan.talks);
  const matchLabels = [
    ...EVENT_TOPIC_OPTIONS.filter((value) => matchedTopics.includes(value.id)).map((value) => value.label),
    ...matchedPeople.map((value) => `交流: ${value}`), ...matchedTalks.map((value) => `話題: ${value}`)
  ];
  const safeUrl = /^https?:\/\//i.test(item.url) ? item.url : undefined;
  const collectedAt = new Intl.DateTimeFormat("ja-JP", { month: "numeric", day: "numeric", hour: "2-digit", minute: "2-digit" }).format(new Date(item.detectedAt));
  const sourceLabel = item.sourceKind === "X_ALGO_TECH_EVENT" ? "X APIの公式告知" : "公式イベントページ";

  async function save(patch: Partial<MeetupPlan>, kind: "bookmark" | "notes") {
    if (pending) return;
    setPending(kind);
    setMessage("");
    setError(false);
    try {
      const response = await fetch("/api/meetup-plans", { method: "PATCH", headers: { "content-type": "application/json" }, body: JSON.stringify({ url: item.url, ...patch }) });
      const data = await response.json();
      if (!response.ok) throw new Error(data.error ?? "保存できませんでした");
      onSaved(data, kind === "notes");
      setMessage(kind === "notes" ? "参加メモを保存しました" : data.saved ? "「気になる」に保存しました" : "「気になる」を解除しました。メモは残ります。");
    } catch (cause) {
      setError(true);
      setMessage(cause instanceof Error ? cause.message : "通信に失敗しました。もう一度お試しください。");
    } finally { setPending(null); }
  }

  return <article className={styles.card} aria-labelledby={titleId}>
    <div className={styles.cardTop}>
      <div className={styles.categoryIcon} data-topic={topic?.id}><Icon size={27} strokeWidth={1.7} aria-hidden /></div>
      <div className={styles.cardOrigin}>
        <span>{item.sourceKind === "X_ALGO_TECH_EVENT" ? "Xの告知" : "イベントページ"}</span>
        <p>{item.sourceName}</p>
      </div>
      <button type="button" className={styles.bookmark} aria-pressed={item.plan.saved} aria-label={`${item.title}を${item.plan.saved ? "気になるから解除" : "気になるに保存"}`} disabled={pending !== null} onClick={() => void save({ saved: !item.plan.saved }, "bookmark")}>
        <Bookmark size={18} fill={item.plan.saved ? "currentColor" : "none"} aria-hidden /><span>{pending === "bookmark" ? "保存中" : item.plan.saved ? "保存済み" : "気になる"}</span>
      </button>
    </div>
    <h2 id={titleId} className={styles.cardTitle}><a href={safeUrl} target="_blank" rel="noreferrer">{item.title}</a></h2>
    <div className={styles.tags}><span className={styles.regionTag} data-region={region}>{REGION_LABELS[region]}</span>{topics.length > 0 ? topics.map((value) => <span key={value.id}>{value.label}</span>) : <span>技術イベント</span>}</div>
    <dl className={styles.eventFacts}>
      <div><dt><CalendarDays size={18} aria-hidden /><span className="sr-only">開催日程</span></dt><dd>{item.schedule || "日程は告知ページで確認"}</dd></div>
      <div><dt><PlaceIcon size={18} aria-hidden /><span className="sr-only">開催形式・会場</span></dt><dd><span>{FORMAT_LABELS[format]}</span>{item.place && <span className={styles.muted}> · {item.place}</span>}</dd></div>
    </dl>
    {matchLabels.length > 0 && <p className={styles.matchReason}><Check size={15} aria-hidden /><span>関心と一致：{matchLabels.slice(0, 3).join(" · ")}{matchLabels.length > 3 ? ` ほか${matchLabels.length - 3}件` : ""}</span></p>}
    {item.summary && <p className={styles.preview}>{item.summary}</p>}
    <div className={styles.collectionMeta}><span><Clock3 size={14} aria-hidden />初回取得 {collectedAt}</span><span title={item.sourceName}><Database size={14} aria-hidden />収集元: {sourceLabel} · {item.sourceName}</span></div>
    <div className={styles.cardBottom}>
      <a className={styles.officialLink} href={safeUrl} target="_blank" rel="noreferrer">告知・申込ページ <ArrowUpRight size={17} aria-hidden /><span className="sr-only">（新しいタブで開く）</span></a>
      <details className={styles.eventDetails}>
        <summary><MessageCircle size={16} aria-hidden /><span>詳細・参加メモ{hasNotes && "あり"}</span>{dirty && <span className={styles.unsaved}>未保存</span>}<ChevronDown size={16} className={styles.chevron} aria-hidden /></summary>
        <div className={styles.detailsBody}>
          {item.summary && <div><h3>告知の概要</h3><p className={styles.fullSummary}>{item.summary}</p></div>}
          {matchLabels.length > 0 && <p className={styles.hint}>告知の記載との一致：{matchLabels.join(" / ")}。交流できる相手や内容を保証するものではありません。</p>}
          <form onSubmit={(event) => { event.preventDefault(); void save({ people: draft.people, talks: draft.talks }, "notes"); }}>
            <fieldset disabled={pending !== null}>
              <legend>このイベントでやりたいこと</legend>
              <label>会いたい人<textarea maxLength={1000} rows={2} placeholder="例：実際にLLMを運用しているエンジニア" value={draft.people} onChange={(event) => onDraft({ ...draft, people: event.target.value })} /></label>
              <label>聞きたい話<textarea maxLength={1000} rows={2} placeholder="例：プロトタイプから本番運用に進めるときの工夫" value={draft.talks} onChange={(event) => onDraft({ ...draft, talks: event.target.value })} /></label>
              <p className={styles.hint}>自分だけの参加メモです。主催者への送信や、全体の興味設定の変更はしません。</p>
              <div className={styles.preferenceActions}>
                <button type="submit" className={styles.primaryButton} disabled={!dirty || pending !== null}>{pending === "notes" ? "保存中…" : "メモを保存"}</button>
                {dirty && <button type="button" className={styles.textButton} onClick={() => onDraft({ people: item.plan.people, talks: item.plan.talks })}>元に戻す</button>}
              </div>
            </fieldset>
          </form>
        </div>
      </details>
    </div>
    {message && <p role={error ? "alert" : "status"} className={error ? styles.error : styles.cardNotice}>{message}</p>}
  </article>;
}
