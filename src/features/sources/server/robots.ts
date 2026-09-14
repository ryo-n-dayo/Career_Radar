import { EVENT_GATHERING_USER_AGENT, assertPublicUrl, readCapped } from "../../../lib/metadata/fetchPageMeta";

export const ROBOT_TOKEN = "DailyNewsBot";

type Rule = { allow: boolean; pattern: string };
type Group = { agents: string[]; rules: Rule[] };

function groupsFrom(text: string): Group[] {
  const groups: Group[] = [];
  let current: Group | undefined;

  for (const raw of text.split(/\r?\n/)) {
    const line = raw.replace(/#.*$/, "").trim();
    if (!line) continue;
    const separator = line.indexOf(":");
    if (separator < 0) continue;
    const key = line.slice(0, separator).trim().toLowerCase();
    const value = line.slice(separator + 1).trim();

    if (key === "user-agent") {
      if (!current || current.rules.length > 0) {
        current = { agents: [], rules: [] };
        groups.push(current);
      }
      current.agents.push(value.toLowerCase());
    } else if ((key === "allow" || key === "disallow") && current) {
      if (key === "disallow" && value === "") continue;
      current.rules.push({ allow: key === "allow", pattern: value });
    }
  }
  return groups;
}

function matches(pattern: string, path: string): boolean {
  const anchored = pattern.endsWith("$");
  const value = anchored ? pattern.slice(0, -1) : pattern;
  const expression = value
    .replace(/[.+?^${}()|[\]\\]/g, "\\$&")
    .replace(/\*/g, ".*");
  return new RegExp(`^${expression}${anchored ? "$" : ""}`).test(path);
}

export function evaluateRobots(text: string, target: URL): { allowed: boolean; matchedRule?: string } {
  const groups = groupsFrom(text);
  const exact = groups.filter((group) => group.agents.includes(ROBOT_TOKEN.toLowerCase()));
  const selected = exact.length > 0 ? exact : groups.filter((group) => group.agents.includes("*"));
  const path = `${target.pathname}${target.search}` || "/";
  const matching = selected.flatMap((group) => group.rules).filter((rule) => matches(rule.pattern, path));
  if (matching.length === 0) return { allowed: true };
  matching.sort((a, b) => b.pattern.length - a.pattern.length || Number(b.allow) - Number(a.allow));
  return { allowed: matching[0].allow, matchedRule: matching[0].pattern };
}

export async function checkRobots(target: URL): Promise<{ allowed: boolean; detail: string }> {
  const robotsUrl = new URL("/robots.txt", target);
  await assertPublicUrl(robotsUrl);

  let response: Response;
  try {
    response = await fetch(robotsUrl, {
      redirect: "error",
      signal: AbortSignal.timeout(10_000),
      headers: { "User-Agent": EVENT_GATHERING_USER_AGENT, Accept: "text/plain" }
    });
  } catch {
    return { allowed: false, detail: "robots.txtを安全に確認できなかったため停止しました" };
  }

  if (response.status === 404 || response.status === 410) return { allowed: true, detail: "robots.txtなし" };
  if (!response.ok) return { allowed: false, detail: `robots.txt確認失敗 (${response.status})` };
  const decision = evaluateRobots(await readCapped(response), target);
  return decision.allowed
    ? { allowed: true, detail: "robots.txt許可" }
    : { allowed: false, detail: `robots.txtで禁止 (${decision.matchedRule ?? "該当ルール"})` };
}
