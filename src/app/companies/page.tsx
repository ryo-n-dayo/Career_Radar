import { WorkspaceShell } from "@/components/workspace/WorkspaceShell";
import { CompanyManager } from "@/features/companies/CompanyManager";
import type { CompanyItem } from "@/features/companies/types";
import { prisma } from "@/lib/prisma";

export const dynamic = "force-dynamic";

export default async function CompaniesPage() {
  const rows = await prisma.company.findMany({ orderBy: { name: "asc" }, include: { _count: { select: { posts: true, events: true, sources: true } } } });
  const companies: CompanyItem[] = rows.map((company) => ({ id: company.id, name: company.name, website: company.website ?? undefined, industry: company.industry ?? undefined, summary: company.summary ?? undefined, memo: company.memo ?? undefined, xHandle: company.xHandle ?? undefined, careersUrl: company.careersUrl ?? undefined, tags: Array.isArray(company.tags) ? company.tags as string[] : [], postCount: company._count.posts, eventCount: company._count.events, sourceCount: company._count.sources }));
  return <WorkspaceShell><div className="mx-auto max-w-7xl px-5 py-8 lg:px-8"><h1 className="text-2xl font-bold tracking-tight">企業</h1><p className="mt-1 text-sm text-muted-foreground">企業ごとにX投稿、イベント、自分用メモをつなげます。</p><div className="mt-6"><CompanyManager companies={companies} /></div></div></WorkspaceShell>;
}
