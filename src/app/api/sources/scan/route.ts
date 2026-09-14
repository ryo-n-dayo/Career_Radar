import { revalidatePath } from "next/cache";
import { NextRequest, NextResponse } from "next/server";

import { scanAllSources } from "@/features/sources/server/runScan";

export const runtime = "nodejs";

export async function POST(request: NextRequest) {
  const body = await request.json().catch(() => ({})) as Record<string, unknown>;
  const sourceId = typeof body.sourceId === "string" ? body.sourceId : undefined;
  const results = await scanAllSources(sourceId);
  revalidatePath("/"); revalidatePath("/sources");
  return NextResponse.json({ results, created: results.reduce((sum, result) => sum + result.created, 0) });
}
