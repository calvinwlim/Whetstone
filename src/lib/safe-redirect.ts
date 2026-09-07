/** Where to send someone after a successful sign-in.
 *
 *  Only a path on this site is acceptable, and the check has to be explicit
 *  because neither obvious way of building the destination is safe on its own:
 *
 *    origin + next          sends "@evil.com" to https://evil.com, because
 *                           WHATWG parsing reads what precedes the "@" as
 *                           userinfo and what follows it as the host.
 *    new URL(next, origin)  sends "//evil.com" and "https://evil.com"
 *                           straight off the origin.
 *
 *  Their holes do not overlap, so both checks are applied: the value must be
 *  rooted at "/" AND must still resolve to this origin. What comes back is the
 *  reparsed path, so the caller concatenates something already normalised.
 *
 *  Nothing sets `next` today -- the sign-in page always asks for a bare
 *  /auth/callback -- so this closes the hole before something starts relying
 *  on it, rather than after. */
export function safeNext(raw: string | null | undefined, origin: string): string {
  if (!raw || !raw.startsWith("/")) return "/";
  try {
    const target = new URL(raw, origin);
    if (target.origin !== origin) return "/";
    return `${target.pathname}${target.search}${target.hash}`;
  } catch {
    return "/";
  }
}
