import { describe, expect, it } from "vitest";

import { isPrivateAddress } from "../fetchPageMeta";

describe("isPrivateAddress", () => {
  it("プライベート・ループバック・メタデータ用のアドレスを弾く", () => {
    for (const address of [
      "127.0.0.1",
      "0.0.0.0",
      "10.1.2.3",
      "172.16.0.1",
      "172.31.255.255",
      "192.168.1.1",
      "169.254.169.254",
      "100.64.0.1",
      "224.0.0.1",
      "::1",
      "::",
      "fd00::1",
      "fe80::1",
      "::ffff:10.0.0.1"
    ]) {
      expect(isPrivateAddress(address), address).toBe(true);
    }
  });

  it("公開アドレスは通す", () => {
    for (const address of ["1.1.1.1", "8.8.8.8", "172.15.0.1", "172.32.0.1", "203.0.113.10", "2606:4700::1111"]) {
      expect(isPrivateAddress(address), address).toBe(false);
    }
  });

  it("解釈できない文字列は安全側に倒して弾く", () => {
    expect(isPrivateAddress("not-an-ip")).toBe(true);
    expect(isPrivateAddress("999.999.999.999")).toBe(true);
  });
});
