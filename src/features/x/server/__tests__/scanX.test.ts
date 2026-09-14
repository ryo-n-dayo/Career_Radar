import { describe, expect, it } from "vitest";

import { directCareerUrl } from "../publicCareerLink";

describe("directCareerUrl", () => {
  it("returns an expanded public ATS job URL", () => {
    expect(directCareerUrl({ urls: [{ expanded_url: "https://herp.careers/v1/example/job-123" }] }))
      .toBe("https://herp.careers/v1/example/job-123");
  });

  it("does not treat an unrelated external URL as a job page", () => {
    expect(directCareerUrl({ urls: [{ unwound_url: "https://example.com/careers" }] })).toBeUndefined();
  });
});
