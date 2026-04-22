import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Separator } from "@/components/ui/separator";

import type { Company } from "../types/company";

type Props = {
  company?: Company;
};

export function CompanyDetail({ company }: Props) {
  return (
    <aside className="flex h-full flex-col">
      <div className="flex items-center gap-2 px-4 py-3">
        <div className="text-sm font-semibold">詳細パネル</div>
        <div className="ml-auto flex items-center gap-2">
          <Button variant="outline" size="sm" disabled={!company}>
            ESに引用
          </Button>
          <Button variant="secondary" size="sm" disabled={!company}>
            AI分析
          </Button>
        </div>
      </div>

      <Separator />

      <div className="min-h-0 flex-1 overflow-auto p-4">
        {!company ? (
          <div className="rounded-lg border border-border bg-muted/40 p-4 text-sm text-muted-foreground">
            中央のリストから企業を選択してください。
          </div>
        ) : (
          <div className="flex flex-col gap-4">
            <div>
              <div className="text-lg font-semibold tracking-tight">{company.name}</div>
              <div className="mt-2 flex flex-wrap items-center gap-2">
                <Badge>信頼度 {company.confidence}%</Badge>
                {company.industry ? <Badge variant="secondary">{company.industry}</Badge> : null}
              </div>
            </div>

            <Card>
              <CardHeader>
                <CardTitle>AI分析（ダミー）</CardTitle>
              </CardHeader>
              <CardContent className="text-sm text-muted-foreground">
                強み/リスク/話題のトピックなどをここに要約表示します。
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <CardTitle>Wiki（ダミー）</CardTitle>
              </CardHeader>
              <CardContent className="text-sm text-muted-foreground">
                会社概要、選考メモ、参考リンクなどを蓄積します。
              </CardContent>
            </Card>
          </div>
        )}
      </div>
    </aside>
  );
}

