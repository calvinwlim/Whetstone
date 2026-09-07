import { describe, it, expect } from "vitest";
import { safeNext } from "./safe-redirect";

const ORIGIN = "https://www.whetstonehq.dev";

/** Written from the outside in: the point is not that the function returns a
 *  string, it is that no input can make the browser leave this origin. */
describe("safeNext", () => {
  it("keeps an ordinary path, with its query and hash", () => {
    expect(safeNext("/topics", ORIGIN)).toBe("/topics");
    expect(safeNext("/drill?mode=review", ORIGIN)).toBe("/drill?mode=review");
    expect(safeNext("/path#stage-2", ORIGIN)).toBe("/path#stage-2");
  });

  it("falls back to the root when nothing is asked for", () => {
    expect(safeNext(null, ORIGIN)).toBe("/");
    expect(safeNext(undefined, ORIGIN)).toBe("/");
    expect(safeNext("", ORIGIN)).toBe("/");
    expect(safeNext("/", ORIGIN)).toBe("/");
  });

  // The backslash is built rather than written so no shell or editor step can
  // quietly halve it and turn this into a test that passes for the wrong
  // reason. Each case below sends a real browser off-origin through one of the
  // two naive implementations; none may survive this one.
  const BACKSLASH = String.fromCharCode(92);

  it.each([
    ["protocol-relative", "//evil.example"],
    ["backslash-relative", BACKSLASH + BACKSLASH + "evil.example"],
    ["userinfo confusion", "@evil.example"],
    ["absolute https", "https://evil.example"],
    ["absolute http", "http://evil.example"],
    ["javascript scheme", "javascript:alert(1)"],
    ["slash then backslash", "/" + BACKSLASH + "evil.example"],
    ["tab smuggled in", "\t//evil.example"],
    ["newline smuggled in", "\n//evil.example"],
  ])("refuses to leave the origin: %s", (_label, hostile) => {
    const next = safeNext(hostile, ORIGIN);
    expect(next).toBe("/");
    // The guarantee the caller actually depends on.
    expect(new URL(ORIGIN + next).origin).toBe(ORIGIN);
  });

  it("leaves the origin intact for every value it does allow through", () => {
    const allowed = ["/topics", "/@handle", "/a?b=@c", "/x#@y", "/topics/sql"];
    for (const raw of allowed) {
      const next = safeNext(raw, ORIGIN);
      expect(new URL(ORIGIN + next).origin).toBe(ORIGIN);
    }
  });
});
