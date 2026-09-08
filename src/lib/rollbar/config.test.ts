import { describe, it, expect } from "vitest";
import { reportServerError, isRollbarConfigured, isRollbarServerConfigured } from "./config";

/** No Rollbar token is set in the test environment -- CI never configures
 *  one, on purpose, the same way it never configures Supabase -- so every
 *  case here exercises the "reporting is unavailable" path deliberately,
 *  rather than the network round-trip already verified by hand in a browser.
 *  What matters for a route handler is that this promise settles quickly and
 *  never rejects; if it hung, a slow or unreachable Rollbar could delay every
 *  response that reports through it. */
describe("reportServerError", () => {
  it("resolves rather than hanging when Rollbar is not configured", async () => {
    expect(isRollbarConfigured()).toBe(false);
    expect(isRollbarServerConfigured()).toBe(false);

    const start = Date.now();
    await reportServerError(new Error("test failure"));
    // Well under the 3s timeout: Rollbar's own client short-circuits
    // synchronously when disabled, so this should not be waiting on it.
    expect(Date.now() - start).toBeLessThan(500);
  });

  it("never rejects, even given a non-Error value", async () => {
    await expect(reportServerError("a plain string, not an Error")).resolves.toBeUndefined();
    await expect(reportServerError(undefined)).resolves.toBeUndefined();
    await expect(reportServerError({ weird: "shape" })).resolves.toBeUndefined();
  });
});
