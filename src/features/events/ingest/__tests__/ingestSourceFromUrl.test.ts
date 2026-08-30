import { describe, expect, it } from "vitest";

import { ingestSourceFromUrl } from "../../types/eventItem";

describe("ingestSourceFromUrl", () => {
  it("マイナビを判定する", () => {
    expect(ingestSourceFromUrl("https://job.mynavi.jp/28/pc/corpinfo/x/index?corpId=2")).toBe("MYNAVI");
  });

  it("X / Twitter を判定する", () => {
    expect(ingestSourceFromUrl("https://x.com/foo/status/123")).toBe("X");
    expect(ingestSourceFromUrl("https://twitter.com/foo/status/123")).toBe("X");
  });

  it("connpass / Doorkeeper を判定する", () => {
    expect(ingestSourceFromUrl("https://bpstudy.connpass.com/event/1/")).toBe("CONNPASS");
    expect(ingestSourceFromUrl("https://foo.doorkeeper.jp/events/1")).toBe("DOORKEEPER");
  });

  it("似ているだけの別ドメインには釣られない", () => {
    expect(ingestSourceFromUrl("https://notmynavi.jp/a")).toBe("MANUAL");
    expect(ingestSourceFromUrl("https://evil-x.com/a")).toBe("MANUAL");
  });

  it("それ以外と不正な URL は MANUAL", () => {
    expect(ingestSourceFromUrl("https://example.com/a")).toBe("MANUAL");
    expect(ingestSourceFromUrl("not a url")).toBe("MANUAL");
  });
});
