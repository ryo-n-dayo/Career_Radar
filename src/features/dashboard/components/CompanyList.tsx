import { Badge } from "@/components/ui/badge";
import { Input } from "@/components/ui/input";
import { cn } from "@/lib/utils";

import type { Company } from "../types/company";

type Props = {
  companies: Company[];
  selectedCompanyId?: string;
  onSelectCompany: (id: string) => void;
};

function confidenceVariant(confidence: number): Parameters<typeof Badge>[0]["variant"] {
  if (confidence >= 80) return "success";
  if (confidence >= 50) return "warning";
  return "danger";
}

export function CompanyList({ companies, selectedCompanyId, onSelectCompany }: Props) {
  return (
    <section className="flex h-full flex-col">
      <div className="flex items-center gap-3 px-4 py-3">
        <div className="text-sm font-semibold">メインDB</div>
        <div className="ml-auto w-64">
          <Input placeholder="企業名で検索（ダミー）" />
        </div>
      </div>

      <div className="min-h-0 flex-1 overflow-auto">
        <div className="grid grid-cols-1">
          {companies.map((c) => (
            <button
              key={c.id}
              type="button"
              onClick={() => onSelectCompany(c.id)}
              className={cn(
                "flex items-start gap-3 border-t border-border px-4 py-3 text-left hover:bg-muted/60",
                c.id === selectedCompanyId && "bg-muted"
              )}
            >
              <div className="mt-0.5 h-3 w-3 shrink-0 rounded-sm bg-neutral-300" />
              <div className="min-w-0 flex-1">
                <div className="flex items-center gap-2">
                  <div className="truncate text-sm font-medium">{c.name}</div>
                  {c.label ? <Badge>{c.label}</Badge> : null}
                </div>
                <div className="mt-1 flex flex-wrap items-center gap-2 text-xs text-muted-foreground">
                  <Badge variant={confidenceVariant(c.confidence)}>
                    信頼度 {c.confidence}%
                  </Badge>
                  <span>更新: {new Date(c.updatedAt).toLocaleDateString("ja-JP")}</span>
                </div>
              </div>
              <div className="text-xs text-muted-foreground">{c.sources.length} sources</div>
            </button>
          ))}
        </div>
      </div>
    </section>
  );
}

