import { revalidatePath } from "next/cache";
import { NextResponse } from "next/server";

import { prisma } from "@/lib/prisma";

export const runtime = "nodejs";

export async function DELETE() {
  await prisma.googleConnection.delete({ where: { id: "google" } }).catch(() => null);
  revalidatePath("/google");
  return NextResponse.json({ disconnected: true });
}
