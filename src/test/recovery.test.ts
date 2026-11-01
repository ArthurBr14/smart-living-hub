import { describe, expect, it } from "vitest";
import { isRecoveryUrl } from "@/lib/recovery";

describe("isRecoveryUrl", () => {
  it("accepts an implicit-flow recovery link", () => {
    expect(isRecoveryUrl("", "#access_token=abc&refresh_token=def&type=recovery")).toBe(true);
  });

  it("accepts a PKCE-flow recovery link", () => {
    expect(isRecoveryUrl("?code=xyz123", "")).toBe(true);
  });

  it("rejects a plain visit to the page", () => {
    expect(isRecoveryUrl("", "")).toBe(false);
    expect(isRecoveryUrl("?utm_source=newsletter", "")).toBe(false);
  });

  it("rejects an unrelated hash", () => {
    expect(isRecoveryUrl("", "#section-produtos")).toBe(false);
  });
});
