import { prisma } from "@/lib/prisma";

export const DEFAULT_USER_ID = "user_seed";
export const DEFAULT_USER_EMAIL = "seed@example.com";

export async function ensureDefaultUser() {
  await prisma.user.upsert({
    where: { email: DEFAULT_USER_EMAIL },
    update: {},
    create: {
      id: DEFAULT_USER_ID,
      email: DEFAULT_USER_EMAIL,
      name: "Seed User"
    }
  });
}
