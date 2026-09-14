import { describe, expect, it } from "vitest";

import { evaluateRobots } from "../server/robots";

describe("evaluateRobots", () => {
  it("最長一致のAllowを優先する", () => {
    const text = "User-agent: *\nDisallow: /jobs\nAllow: /jobs/public";
    expect(evaluateRobots(text, new URL("https://example.com/jobs/public/1")).allowed).toBe(true);
    expect(evaluateRobots(text, new URL("https://example.com/jobs/private")).allowed).toBe(false);
  });

  it("DailyNewsBot固有ルールを優先する", () => {
    const text = "User-agent: *\nAllow: /\n\nUser-agent: DailyNewsBot\nDisallow: /";
    expect(evaluateRobots(text, new URL("https://example.com/news")).allowed).toBe(false);
  });
});
