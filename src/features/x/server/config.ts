import { prisma } from "@/lib/prisma";

const POST_READ_COST_USD = 0.005;

function positiveInt(value: string | undefined, fallback: number): number {
  const parsed = Number.parseInt(value ?? "", 10);
  return Number.isFinite(parsed) && parsed > 0 ? parsed : fallback;
}

function positiveNumber(value: string | undefined, fallback: number): number {
  const parsed = Number.parseFloat(value ?? "");
  return Number.isFinite(parsed) && parsed > 0 ? parsed : fallback;
}

function tokyoDateKey(date = new Date()): string {
  const parts = new Intl.DateTimeFormat("en-CA", { timeZone: "Asia/Tokyo", year: "numeric", month: "2-digit", day: "2-digit" }).formatToParts(date);
  const get = (type: string) => parts.find((part) => part.type === type)?.value ?? "";
  return `${get("year")}-${get("month")}-${get("day")}`;
}

export function getXApiConfig() {
  const keywords = (process.env.X_API_KEYWORDS ?? "インターン,採用,募集,説明会,イベント,エントリー")
    .split(",").map((value) => value.trim()).filter(Boolean).slice(0, 20);
  return {
    enabled: process.env.X_API_ENABLED === "true",
    configured: Boolean(process.env.X_API_BEARER_TOKEN),
    bearerToken: process.env.X_API_BEARER_TOKEN,
    dailyPostLimit: positiveInt(process.env.X_API_DAILY_POST_LIMIT, 20),
    monthlyBudgetUsd: positiveNumber(process.env.X_API_MONTHLY_BUDGET_USD, 5),
    keywords: keywords.length > 0 ? keywords : ["インターン", "採用", "募集", "説明会", "イベント", "エントリー"],
    postReadCostUsd: POST_READ_COST_USD
  };
}

export async function getXApiBudgetStatus() {
  const config = getXApiConfig();
  const dateKey = tokyoDateKey();
  const monthKey = dateKey.slice(0, 7);
  const [today, month] = await Promise.all([
    prisma.xUsageDaily.findUnique({ where: { dateKey } }),
    prisma.xUsageDaily.aggregate({ where: { dateKey: { startsWith: monthKey } }, _sum: { postsRead: true, estimatedCostUsd: true } })
  ]);
  return {
    enabled: config.enabled,
    configured: config.configured,
    dailyPostLimit: config.dailyPostLimit,
    monthlyBudgetUsd: config.monthlyBudgetUsd,
    postsReadToday: today?.postsRead ?? 0,
    estimatedCostTodayUsd: today?.estimatedCostUsd ?? 0,
    postsReadMonth: month._sum.postsRead ?? 0,
    estimatedCostMonthUsd: month._sum.estimatedCostUsd ?? 0,
    postReadCostUsd: config.postReadCostUsd
  };
}

export { POST_READ_COST_USD, tokyoDateKey };
