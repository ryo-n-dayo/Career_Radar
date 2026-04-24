"use client";

import { useEffect } from "react";

import { Button } from "@/components/ui/button";
import { cn } from "@/lib/utils";

import type { RadarItem } from "../types/radarItem";

type Props = {
  items: RadarItem[];
  onClose: () => void;
  onRemove: (id: string) => void;
};

export function CompareDialog({ items, onClose, onRemove }: Props) {
  useEffect(() => {
    const onKey = (e: KeyboardEvent) => {
      if (e.key === "Escape") onClose();
    };
    window.addEventListener("keydown", onKey);
    document.body.style.overflow = "hidden";
    return () => {
      window.removeEventListener("keydown", onKey);
      document.body.style.overflow = "";
    };
  }, [onClose]);

  return (
    <div
      className="fixed inset-0 z-50 flex items-center justify-center bg-black/40 p-4"
      onClick={onClose}
    >
      <div
        className="flex max-h-[90vh] w-full max-w-6xl flex-col overflow-hidden rounded-2xl border border-border bg-background shadow-xl"
        onClick={(e) => e.stopPropagation()}
      >
        <div className="flex items-center gap-3 border-b border-border px-5 py-3">
          <div>
            <div className="text-sm font-semibold tracking-tight">企業比較</div>
            <div className="text-xs text-muted-foreground">{items.length}社を並べて比較</div>
          </div>
          <Button
            variant="ghost"
            size="sm"
            className="yui-pill ml-auto"
            onClick={onClose}
          >
            閉じる
          </Button>
        </div>

        <div className="min-h-0 flex-1 overflow-auto p-4">
          {items.length === 0 ? (
            <div className="p-12 text-center text-sm text-muted-foreground">
              比較対象を選択してください
            </div>
          ) : (
            <div className="overflow-x-auto">
              <table className="w-full min-w-[720px] border-collapse text-sm">
                <thead>
                  <tr className="border-b border-border">
                    <th className="sticky left-0 z-10 bg-background px-3 py-2 text-left text-xs font-semibold text-muted-foreground">
                      項目
                    </th>
                    {items.map((it) => (
                      <th
                        key={it.id}
                        className="px-3 py-2 text-left align-top"
                        style={{ minWidth: 220 }}
                      >
                        <div className="flex items-start justify-between gap-2">
                          <div>
                            <div className="text-sm font-semibold tracking-tight">
                              {it.companyName}
                            </div>
                            <div className="text-[10px] text-muted-foreground">
                              {it.category} · {it.deadlineLabel}
                            </div>
                          </div>
                          <button
                            type="button"
                            onClick={() => onRemove(it.id)}
                            className="shrink-0 text-[10px] text-muted-foreground hover:text-foreground"
                            aria-label="比較から除外"
                          >
                            ×
                          </button>
                        </div>
                      </th>
                    ))}
                  </tr>
                </thead>
                <tbody className="[&>tr:nth-child(even)]:bg-muted/20">
                  <Row label="概要" items={items} render={(it) => it.companyProfile?.overview ?? it.content} />
                  <Row label="業種" items={items} render={(it) => it.companyProfile?.industry} />
                  <Row label="設立" items={items} render={(it) => it.companyProfile?.founded} />
                  <Row label="本社" items={items} render={(it) => it.companyProfile?.headquarters} />
                  <Row label="従業員数" items={items} render={(it) => it.companyProfile?.employees} />
                  <Row label="売上" items={items} render={(it) => it.companyProfile?.revenue} />
                  <Row label="採用人数" items={items} render={(it) => it.companyProfile?.hiringCount} />
                  <Row
                    label="募集職種"
                    items={items}
                    render={(it) =>
                      it.companyProfile?.hiringRoles?.length ? (
                        <div className="flex flex-wrap gap-1">
                          {it.companyProfile.hiringRoles.map((r) => (
                            <span
                              key={r}
                              className="yui-pill bg-foreground/[0.04] px-2 py-0.5 text-[11px] text-foreground/80"
                            >
                              {r}
                            </span>
                          ))}
                        </div>
                      ) : null
                    }
                  />
                  <Row
                    label="選考フロー"
                    items={items}
                    render={(it) =>
                      it.companyProfile?.selectionFlow?.length
                        ? it.companyProfile.selectionFlow.join(" → ")
                        : null
                    }
                  />
                  <Row label="締切日" items={items} render={(it) => it.date} />
                  <Row
                    label="信頼度"
                    items={items}
                    render={(it) => (
                      <span
                        className={cn(
                          "yui-pill px-2 py-0.5 text-[10px] font-medium",
                          it.trust === "official"
                            ? "bg-foreground/5 text-foreground/70"
                            : "bg-amber-100/60 text-amber-800 dark:bg-amber-950/40 dark:text-amber-200"
                        )}
                      >
                        {it.trust === "official" ? "公式認証" : "要確認"}
                      </span>
                    )}
                  />
                  <Row
                    label="社風キーワード"
                    items={items}
                    render={(it) =>
                      it.keywords.length > 0 ? (
                        <div className="flex flex-wrap gap-1">
                          {it.keywords.map((k) => (
                            <span
                              key={k}
                              className="yui-pill bg-foreground/[0.04] px-2 py-0.5 text-[11px] text-foreground/80"
                            >
                              {k}
                            </span>
                          ))}
                        </div>
                      ) : null
                    }
                  />
                  <Row
                    label="サイト"
                    items={items}
                    render={(it) =>
                      it.companyProfile?.website ? (
                        <a
                          href={it.companyProfile.website}
                          target="_blank"
                          rel="noopener noreferrer"
                          className="text-xs underline"
                        >
                          {it.companyProfile.website}
                        </a>
                      ) : null
                    }
                  />
                </tbody>
              </table>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}

function Row({
  label,
  items,
  render
}: {
  label: string;
  items: RadarItem[];
  render: (item: RadarItem) => React.ReactNode;
}) {
  return (
    <tr className="border-b border-border/60 align-top">
      <td className="sticky left-0 z-10 whitespace-nowrap bg-inherit px-3 py-2 text-xs font-medium text-muted-foreground">
        {label}
      </td>
      {items.map((it) => {
        const v = render(it);
        return (
          <td key={it.id} className="px-3 py-2 align-top text-sm">
            {v || <span className="text-muted-foreground">—</span>}
          </td>
        );
      })}
    </tr>
  );
}
