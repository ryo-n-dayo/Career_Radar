import { describe, expect, it } from "vitest";

import { internshipRegion, isFullRemoteEligible } from "../model";

describe("internshipRegion", () => {
  it("separates domestic, Malaysia, overseas and remote internships", () => {
    expect(internshipRegion("東京でのソフトウェア開発インターン")).toBe("japan");
    expect(internshipRegion("Software internship in Kuala Lumpur")).toBe("malaysia");
    expect(internshipRegion("Engineering internship in Berlin")).toBe("overseas");
    expect(internshipRegion("Backend internship", "フルリモート勤務可")).toBe("online");
  });

  it("matches full remote only and excludes partial remote", () => {
    expect(isFullRemoteEligible("フルリモート可 ソフトウェアエンジニアインターン")).toBe(true);
    expect(isFullRemoteEligible("Backend intern", "Fully remote within Japan")).toBe(true);
    expect(isFullRemoteEligible("エンジニアインターン", "一部リモート可")).toBe(false);
  });
});
