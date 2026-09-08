import { describe, it, expect } from "vitest";
import { isEmailConfigured, sendEmail } from "./config";

/** No Resend key is set in the test environment -- there isn't one at all
 *  yet, since whetstonehq.dev has not been verified in Resend's dashboard --
 *  so this exercises the same "service is unconfigured" path CI always runs
 *  Rollbar and Supabase through: sendEmail() must resolve false rather than
 *  throw, exactly like a clone of this repo with no Resend account at all
 *  would experience it. */
describe("sendEmail", () => {
  it("is unconfigured in this environment", () => {
    expect(isEmailConfigured()).toBe(false);
  });

  it("resolves false rather than throwing with no API key", async () => {
    await expect(
      sendEmail({ to: "nobody@example.com", subject: "test", text: "test" }),
    ).resolves.toBe(false);
  });
});
