import { revalidatePath } from "next/cache";
import { NextResponse } from "next/server";

import { syncGoogleWorkspace } from "@/features/google/server/sync";

export const runtime = "nodejs";

export async function POST() {
  try {
    const result = await syncGoogleWorkspace();
    revalidatePath("/google");
    return NextResponse.json(result);
  } catch (error) {
    return NextResponse.json({ error: error instanceof Error ? error.message : "Google連携の同期に失敗しました" }, { status: 400 });
  }
}
