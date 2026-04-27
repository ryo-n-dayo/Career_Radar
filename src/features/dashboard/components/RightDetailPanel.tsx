"use client";

import { useEffect, useRef } from "react";

import { Button } from "@/components/ui/button";
import { Separator } from "@/components/ui/separator";
import { cn } from "@/lib/utils";

import type { CompanyProfile, JointParticipant, RadarItem } from "../types/radarItem";
import { CredentialsSection } from "./CredentialsSection";

function DeadlineRing({ date }: { date: string }) {
  const size = 72;
  const target = new Date(date);
  const today = new Date();
  today.setHours(0, 0, 0, 0);
  target.setHours(0, 0, 0, 0);
  const diff = Math.round((target.getTime() - today.getTime()) / 86400000);
  const max = 30;
  const clamped = Math.max(0, Math.min(diff, max));
  const pct = 1 - clamped / max;
  const r = (size - 8) / 2;
  const c = 2 * Math.PI * r;
  const dash = c * pct;
  const urgent = diff <= 3;
  const stroke = urgent ? "hsl(0 70% 55%)" : "hsl(var(--accent))";
  const label = diff === 0 ? "本日" : diff > 0 ? `あと${diff}日` : `${Math.abs(diff)}日経過`;

  return (
    <div className="flex items-center gap-3">
      <div className="relative" style={{ width: size, height: size }}>
        <svg width={size} height={size} className="-rotate-90">
          <circle cx={size / 2} cy={size / 2} r={r} stroke="hsl(var(--muted))" strokeWidth={4} fill="none" />
          <circle
            cx={size / 2}
            cy={size / 2}
            r={r}
            stroke={stroke}
            strokeWidth={4}
            fill="none"
            strokeLinecap="round"
            strokeDasharray={`${dash} ${c}`}
          />
        </svg>
        <div className="absolute inset-0 flex flex-col items-center justify-center leading-none">
          <span className="text-[9px] text-muted-foreground">締切まで</span>
          <span className="mt-0.5 text-lg font-bold tabular-nums" style={{ color: stroke }}>
            {Math.max(0, diff)}
          </span>
          <span className="text-[9px] text-muted-foreground">日</span>
        </div>
      </div>
      <div>
        <div className="text-[10px] text-muted-foreground">締切まで</div>
        <div className="text-base font-bold" style={{ color: stroke }}>{label}</div>
        <div className="mt-0.5 text-[11px] tabular-nums text-muted-foreground">{date}</div>
      </div>
    </div>
  );
}

/** Google Calendar の「イベント追加」URLを生成する（OAuth 不要） */
function buildGoogleCalendarUrl(item: RadarItem): string {
  const start = item.date.replace(/-/g, "");
  const nextDay = new Date(item.date);
  nextDay.setDate(nextDay.getDate() + 1);
  const end = nextDay.toISOString().split("T")[0].replace(/-/g, "");
  const title = encodeURIComponent(`${item.category}: ${item.companyName}`);
  const details = encodeURIComponent(item.content);
  return `https://calendar.google.com/calendar/render?action=TEMPLATE&text=${title}&dates=${start}%2F${end}&details=${details}`;
}

function DataRow({ label, value }: { label: string; value: string }) {
  return (
    <div className="flex items-start gap-3 py-1.5 text-sm">
      <div className="w-20 shrink-0 text-xs text-muted-foreground">{label}</div>
      <div className="min-w-0 flex-1 text-foreground/90">{value}</div>
    </div>
  );
}

const ROLE_STYLE: Record<string, string> = {
  "主催": "bg-violet-100 text-violet-700 dark:bg-violet-950/40 dark:text-violet-300",
  "協賛": "bg-blue-100 text-blue-700 dark:bg-blue-950/40 dark:text-blue-300",
  "参加": "bg-muted text-muted-foreground",
};

function ParticipantRow({ participant }: { participant: JointParticipant }) {
  return (
    <div className="flex items-center gap-2.5 rounded-xl border border-border bg-background px-3 py-2">
      <div className="grid h-8 w-8 shrink-0 place-items-center rounded-lg bg-muted text-sm font-bold text-muted-foreground">
        {participant.companyName.charAt(0)}
      </div>
      <span className="flex-1 truncate text-sm font-medium">{participant.companyName}</span>
      <span className={cn("yui-pill px-2 py-0.5 text-[10px] font-semibold", ROLE_STYLE[participant.role] ?? ROLE_STYLE["参加"])}>
        {participant.role}
      </span>
    </div>
  );
}

function CompanyInfo({ profile }: { profile: CompanyProfile }) {
  return (
    <div className="flex flex-col gap-3">
      <p className="text-sm leading-relaxed text-foreground/80">{profile.overview}</p>

      {profile.mission && (
        <div className="rounded-xl border border-border bg-foreground/[0.02] px-3 py-2">
          <div className="mb-0.5 text-[10px] font-semibold uppercase tracking-wider text-muted-foreground">
            Mission
          </div>
          <p className="text-sm italic leading-relaxed text-foreground/80">{profile.mission}</p>
        </div>
      )}

      <div className="divide-y divide-border rounded-xl border border-border bg-muted/30 px-3">
        <DataRow label="業種" value={profile.industry} />
        {profile.ceo && <DataRow label="代表者" value={profile.ceo} />}
        <DataRow label="設立" value={profile.founded} />
        <DataRow label="本社" value={profile.headquarters} />
        {profile.capital && <DataRow label="資本金" value={profile.capital} />}
        <DataRow label="従業員数" value={profile.employees} />
        {profile.revenue && <DataRow label="売上" value={profile.revenue} />}
        {profile.listed && (
          <DataRow
            label="上場"
            value={profile.ticker ? `${profile.listed}（${profile.ticker}）` : profile.listed}
          />
        )}
        <DataRow label="採用人数" value={profile.hiringCount} />
      </div>

      {profile.businessSegments && profile.businessSegments.length > 0 && (
        <div>
          <div className="mb-1.5 text-xs text-muted-foreground">事業内容</div>
          <ul className="space-y-1 text-sm text-foreground/85">
            {profile.businessSegments.map((seg) => (
              <li key={seg} className="flex gap-2">
                <span className="mt-1.5 inline-block h-1 w-1 shrink-0 rounded-full bg-foreground/40" />
                <span>{seg}</span>
              </li>
            ))}
          </ul>
        </div>
      )}

      <div>
        <div className="mb-1.5 text-xs text-muted-foreground">募集職種</div>
        <div className="flex flex-wrap gap-1.5">
          {profile.hiringRoles.map((r) => (
            <span
              key={r}
              className="yui-pill bg-foreground/[0.04] px-2.5 py-0.5 text-xs text-foreground/80"
            >
              {r}
            </span>
          ))}
        </div>
      </div>

      {profile.selectionFlow && profile.selectionFlow.length > 0 && (
        <div>
          <div className="mb-1.5 text-xs text-muted-foreground">選考フロー</div>
          <ol className="flex flex-wrap items-center gap-1.5 text-xs">
            {profile.selectionFlow.map((step, i) => (
              <li key={step} className="flex items-center gap-1.5">
                <span className="yui-pill bg-foreground/5 px-2 py-0.5 font-medium text-foreground/80">
                  {i + 1}. {step}
                </span>
                {i < profile.selectionFlow!.length - 1 && (
                  <span className="text-muted-foreground">→</span>
                )}
              </li>
            ))}
          </ol>
        </div>
      )}

      {profile.website && (
        <a
          href={profile.website}
          target="_blank"
          rel="noopener noreferrer"
          className="text-xs text-foreground/70 underline hover:text-foreground"
        >
          {profile.website}
        </a>
      )}
    </div>
  );
}

type Props = {
  item?: RadarItem;
  onClose: () => void;
  isSaved: boolean;
  onToggleSaved: (id: string) => void;
};

function Section({
  title,
  children,
  delay = 0
}: {
  title: string;
  children: React.ReactNode;
  delay?: number;
}) {
  return (
    <section
      className="yui-row rounded-2xl border border-border bg-background p-4"
      style={{ ["--yui-delay" as string]: `${delay}s` }}
    >
      <div className="mb-2 flex items-center gap-2">
        <div className="h-3 w-[3px] rounded-full bg-foreground/60" />
        <h4 className="yui-heading text-xs font-semibold uppercase tracking-wider text-muted-foreground">
          {title}
        </h4>
      </div>
      {children}
    </section>
  );
}

export function RightDetailPanel({
  item,
  onClose,
  isSaved,
  onToggleSaved,
}: Props) {
  const scrollRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    scrollRef.current?.scrollTo({ top: 0 });
  }, [item?.id]);

  return (
    <aside className="flex h-full flex-col bg-muted/20">
      <div className="flex items-center gap-2 px-4 py-3">
        <div className="text-sm font-semibold tracking-tight">詳細</div>
        <div className="ml-auto flex items-center gap-1.5">
          <Button variant="outline" size="sm" className="yui-pill" disabled={!item}>
            ESに引用
          </Button>
          <Button variant="ghost" size="sm" className="yui-pill" onClick={onClose}>
            閉じる
          </Button>
        </div>
      </div>

      <Separator />

      <div ref={scrollRef} className="min-h-0 flex-1 overflow-auto p-4">
        {!item ? (
          <div className="rounded-2xl border border-dashed border-border bg-background/40 p-6 text-center text-sm text-muted-foreground">
            左のカードから選択してください
          </div>
        ) : (
          <div className="flex flex-col gap-3">
            {/* Hero */}
            <div
              className="yui-row rounded-2xl border border-border bg-background p-4"
              style={{ ["--yui-delay" as string]: "0s" }}
            >
              <div className="flex items-start gap-3">
                <div className={cn(
                  "grid h-11 w-11 shrink-0 place-items-center rounded-xl text-base font-bold",
                  item.isJoint
                    ? "bg-violet-100 text-violet-700 dark:bg-violet-950/40 dark:text-violet-300"
                    : "bg-orange-100 text-orange-700"
                )}>
                  {item.isJoint ? "複" : item.companyName.charAt(0)}
                </div>
                <div className="min-w-0 flex-1">
                  <div className="mb-1 flex flex-wrap items-center gap-1.5">
                    <span className="yui-pill bg-muted px-2 py-0.5 text-[10px] font-medium text-muted-foreground">
                      {item.category}
                    </span>
                    <span
                      className={cn(
                        "yui-pill px-2 py-0.5 text-[10px] font-medium",
                        item.trust === "official"
                          ? "bg-foreground/5 text-foreground/70"
                          : "bg-amber-100/60 text-amber-800 dark:bg-amber-950/40 dark:text-amber-200"
                      )}
                    >
                      {item.trust === "official" ? "公式確認" : "要確認"}
                    </span>
                  </div>
                  <h2 className="text-lg font-semibold tracking-tight">{item.companyName}</h2>
                  <p className="mt-1 text-sm leading-relaxed text-foreground/70">{item.content}</p>
                </div>
              </div>

              {/* Deadline hero row: big ring + calendar button + save button */}
              <div className="mt-4 flex items-center gap-2">
                <DeadlineRing date={item.date} />

                <div className="ml-auto flex items-center gap-2">
                  {/* ── Googleカレンダーに追加 ── */}
                  <a
                    href={buildGoogleCalendarUrl(item)}
                    target="_blank"
                    rel="noopener noreferrer"
                    className={cn(
                      "inline-flex items-center gap-1.5 rounded-xl px-3 py-2.5 text-sm font-medium shadow-sm transition",
                      "border border-border bg-background text-foreground",
                      "hover:border-[hsl(var(--accent))]/60 hover:bg-[hsl(var(--accent))]/5"
                    )}
                  >
                    <span>📅</span>
                    <span>Googleカレンダーに追加</span>
                  </a>

                  {/* ── 保存ボタン ── */}
                  <button
                  type="button"
                  onClick={() => onToggleSaved(item.id)}
                  className={cn(
                    "inline-flex items-center gap-1.5 rounded-xl px-4 py-2.5 text-sm font-medium shadow-sm transition",
                    isSaved
                      ? "bg-[hsl(var(--accent))] text-white hover:bg-[hsl(var(--accent))]/90"
                      : "border border-border bg-background text-foreground hover:border-[hsl(var(--accent))]/50"
                  )}
                >
                  <span>{isSaved ? "★" : "☆"}</span>
                  <span>{isSaved ? "保存済み" : "保存する"}</span>
                </button>
                </div>{/* end ml-auto */}
              </div>{/* end mt-4 row */}
            </div>{/* end hero card */}

            {/* Keywords */}
            {item.keywords.length > 0 && (
              <Section title="社風キーワード" delay={0.05}>
                <div className="flex flex-wrap gap-1.5">
                  {item.keywords.map((k) => (
                    <span
                      key={k}
                      className="yui-pill bg-foreground/[0.04] px-2.5 py-0.5 text-xs text-foreground/80"
                    >
                      {k}
                    </span>
                  ))}
                </div>
              </Section>
            )}

            {/* Sources */}
            <Section title="ソース" delay={0.1}>
              <ul className="space-y-1.5">
                {item.sources.map((s) => (
                  <li key={s.url}>
                    <a
                      href={s.url}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="flex items-center gap-2 text-sm hover:underline"
                    >
                      <span className="yui-pill bg-foreground text-background px-2 py-0.5 text-[10px] font-medium">
                        {s.type}
                      </span>
                      <span className="truncate text-foreground/80">{s.url}</span>
                    </a>
                  </li>
                ))}
              </ul>
            </Section>

            {/* 参加企業一覧（合同イベントのみ） */}
            {item.isJoint && item.participants && item.participants.length > 0 && (
              <Section title="参加企業" delay={0.13}>
                <div className="flex flex-col gap-2">
                  {item.participants.map((p) => (
                    <ParticipantRow key={p.companyName} participant={p} />
                  ))}
                </div>
              </Section>
            )}

            {/* 会社情報（単一企業 or 合同の各社プロフィール） */}
            {item.isJoint && item.participants ? (
              item.participants
                .filter((p) => p.companyProfile)
                .map((p, i) => (
                  <Section
                    key={p.companyName}
                    title={`会社情報 — ${p.companyName}`}
                    delay={0.15 + i * 0.04}
                  >
                    <CompanyInfo profile={p.companyProfile!} />
                  </Section>
                ))
            ) : (
              item.companyProfile && (
                <Section title="会社情報" delay={0.15}>
                  <CompanyInfo profile={item.companyProfile} />
                </Section>
              )
            )}

            {/* 求める人物像 */}
            {!item.isJoint && item.companyProfile?.idealCandidate && (
              <Section title="求める人物像" delay={0.18}>
                <p className="text-sm leading-relaxed text-foreground/85 whitespace-pre-line">
                  {item.companyProfile.idealCandidate}
                </p>
              </Section>
            )}

            {/* 会社の雰囲気 */}
            {!item.isJoint && item.companyProfile?.cultureDescription && (
              <Section title="会社の雰囲気" delay={0.2}>
                <p className="text-sm leading-relaxed text-foreground/85 whitespace-pre-line">
                  {item.companyProfile.cultureDescription}
                </p>
                {item.companyProfile.cultureTags &&
                  item.companyProfile.cultureTags.length > 0 && (
                    <div className="mt-3 flex flex-wrap gap-1.5">
                      {item.companyProfile.cultureTags.map((t) => (
                        <span
                          key={t}
                          className="yui-pill bg-foreground/[0.04] px-2.5 py-0.5 text-xs text-foreground/80"
                        >
                          #{t}
                        </span>
                      ))}
                    </div>
                  )}
              </Section>
            )}

            {/* マイページ認証情報 */}
            <Section title="マイページ認証情報" delay={0.22}>
              <CredentialsSection companyId={item.id} companyName={item.companyName} />
            </Section>


            {/* X insights */}
            {item.xInsights && item.xInsights.length > 0 && (
              <Section title="Xからの社員口コミ" delay={0.28}>
                <div className="space-y-2">
                  {item.xInsights.map((insight) => (
                    <div
                      key={insight.date}
                      className="rounded-xl border border-border bg-muted/30 p-3"
                    >
                      <div className="flex items-center gap-2">
                        <span className="text-sm font-semibold">{insight.author}</span>
                        <span className="yui-pill bg-foreground/5 px-2 py-0.5 text-[10px] text-foreground/60">
                          {insight.role}
                        </span>
                        <span className="ml-auto text-xs tabular-nums text-muted-foreground">
                          {insight.date}
                        </span>
                      </div>
                      <p className="mt-2 text-sm leading-relaxed">{insight.message}</p>
                    </div>
                  ))}
                </div>
              </Section>
            )}
          </div>
        )}
      </div>
    </aside>
  );
}
