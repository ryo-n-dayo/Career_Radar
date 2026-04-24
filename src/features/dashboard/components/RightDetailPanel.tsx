"use client";

import { useEffect, useState } from "react";

import { Button } from "@/components/ui/button";
import { Separator } from "@/components/ui/separator";
import { cn } from "@/lib/utils";

import type { CompanyProfile, RadarItem } from "../types/radarItem";
import { CredentialsSection } from "./CredentialsSection";

function DataRow({ label, value }: { label: string; value: string }) {
  return (
    <div className="flex items-start gap-3 py-1.5 text-sm">
      <div className="w-20 shrink-0 text-xs text-muted-foreground">{label}</div>
      <div className="min-w-0 flex-1 text-foreground/90">{value}</div>
    </div>
  );
}

function CompanyAnalysis({ profile }: { profile: CompanyProfile }) {
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
        <h4 className="text-xs font-semibold uppercase tracking-wider text-muted-foreground">
          {title}
        </h4>
      </div>
      {children}
    </section>
  );
}

export function RightDetailPanel({ item, onClose }: Props) {
  const [showAnalysis, setShowAnalysis] = useState(false);

  useEffect(() => {
    setShowAnalysis(false);
  }, [item?.id]);

  return (
    <aside className="flex h-full flex-col bg-muted/20">
      <div className="flex items-center gap-2 px-4 py-3">
        <div className="text-sm font-semibold tracking-tight">詳細</div>
        <div className="ml-auto flex items-center gap-1.5">
          <Button variant="outline" size="sm" className="yui-pill" disabled={!item}>
            ESに引用
          </Button>
          <Button
            variant={showAnalysis ? "default" : "secondary"}
            size="sm"
            className="yui-pill"
            disabled={!item}
            onClick={() => setShowAnalysis((v) => !v)}
          >
            AI分析
          </Button>
          <Button variant="ghost" size="sm" className="yui-pill" onClick={onClose}>
            閉じる
          </Button>
        </div>
      </div>

      <Separator />

      <div className="min-h-0 flex-1 overflow-auto p-4">
        {!item ? (
          <div className="rounded-2xl border border-dashed border-border bg-background/40 p-6 text-center text-sm text-muted-foreground">
            左のカードから選択してください
          </div>
        ) : (
          <div className="flex flex-col gap-3">
            {/* Hero */}
            <div
              className="yui-row rounded-2xl border border-border bg-background p-5"
              style={{ ["--yui-delay" as string]: "0s" }}
            >
              <div className="flex items-start justify-between gap-3">
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
                      {item.trust === "official" ? "公式認証" : "要確認"}
                    </span>
                  </div>
                  <h2 className="text-xl font-semibold tracking-tight">{item.companyName}</h2>
                  <p className="mt-2 text-sm leading-relaxed text-foreground/80">{item.content}</p>
                </div>
              </div>

              <div className="mt-4 flex items-center gap-3 border-t border-border pt-3 text-xs text-muted-foreground">
                <span className="tabular-nums">{item.date}</span>
                <span>·</span>
                <span className="yui-pill bg-foreground/5 px-2 py-0.5 font-medium text-foreground/70">
                  {item.deadlineLabel}
                </span>
              </div>
            </div>

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

            {/* AI分析 */}
            <Section title="AI分析" delay={0.15}>
              {!showAnalysis ? (
                <div className="flex flex-col items-start gap-2">
                  <p className="text-sm text-muted-foreground">
                    「AI分析」ボタンを押すと、会社概要・採用人数・選考フローなどを表示します。
                  </p>
                </div>
              ) : item.companyProfile ? (
                <CompanyAnalysis profile={item.companyProfile} />
              ) : (
                <p className="text-sm text-muted-foreground">
                  この企業の分析データはまだ登録されていません。
                </p>
              )}
            </Section>

            {/* マイページ認証情報 */}
            <Section title="マイページ認証情報" delay={0.18}>
              <CredentialsSection companyId={item.id} companyName={item.companyName} />
            </Section>

            {/* Wiki placeholder */}
            <Section title="Wiki" delay={0.2}>
              <p className="text-sm text-muted-foreground">
                会社概要、選考メモ、参考リンク、引用候補を蓄積します。
              </p>
            </Section>

            {/* X insights */}
            {item.xInsights && item.xInsights.length > 0 && (
              <Section title="Xからの社員口コミ" delay={0.25}>
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
