import Rollbar from "rollbar";

/** Error reporting is optional, the same way Supabase is: with no environment
 *  variables the app still builds and runs, it just has nowhere to send a
 *  crash but the browser console.
 *
 *  The two env var names below look wrong on purpose. Provisioning Rollbar
 *  through the Vercel Marketplace names its variables
 *  `ROLLBAR_WHETSTONE_SERVER_TOKEN_<installation timestamp>` rather than the
 *  plain `ROLLBAR_SERVER_TOKEN` Rollbar's own docs assume -- Vercel suffixes
 *  every resource it provisions so a project can hold more than one of the
 *  same integration without their variables colliding. Isolating that name
 *  behind this one file, the same way config.ts does for Supabase, means
 *  nothing downstream has to know or care. If the resource is ever removed
 *  and reprovisioned, only the two lines below need to change. */
const RAW_CLIENT_TOKEN = process.env.NEXT_PUBLIC_ROLLBAR_WHETSTONE_CLIENT_TOKEN_1788905509;
const RAW_SERVER_TOKEN = process.env.ROLLBAR_WHETSTONE_SERVER_TOKEN_1788905509;

export function isRollbarConfigured(): boolean {
  return Boolean(RAW_CLIENT_TOKEN);
}

/** Passed to `@rollbar/react`'s <Provider> and to any client-only instance
 *  created outside it (global-error.tsx cannot reach the provider, since the
 *  root layout it would normally live in is itself what crashed).
 *
 *  captureUncaught and captureUnhandledRejections are Rollbar's own global
 *  handlers, on top of the two error boundaries that call rollbar.error()
 *  explicitly -- kept on so a failure outside React's tree (a rejected
 *  promise in an event handler, say) is not silently missed. No `person` is
 *  attached: crash reports get a stack trace and a URL, not who was signed
 *  in, which keeps this in the same category the privacy policy already
 *  discloses for server logs rather than opening a new one. */
export const clientConfig = {
  accessToken: RAW_CLIENT_TOKEN,
  enabled: Boolean(RAW_CLIENT_TOKEN),
  captureUncaught: true,
  captureUnhandledRejections: true,
  environment: process.env.NODE_ENV,
};

export function isRollbarServerConfigured(): boolean {
  return Boolean(RAW_SERVER_TOKEN);
}

/** One instance, reused across every route handler that imports it -- the
 *  guide's own recommendation, so a busy route cannot end up creating a new
 *  one per request. Safe to construct unconditionally even when unconfigured:
 *  `enabled: false` only gates the two methods below, not construction, so
 *  nothing here makes a network call by existing. */
const serverInstance = new Rollbar({
  accessToken: RAW_SERVER_TOKEN,
  enabled: Boolean(RAW_SERVER_TOKEN),
  captureUncaught: true,
  captureUnhandledRejections: true,
  environment: process.env.NODE_ENV,
});

/** A route handler's own catch already decides what the caller sees --
 *  Response.json with a safe message -- this only adds a side channel so a
 *  failure is not solely a line in Vercel's function logs, which nobody is
 *  watching in real time.
 *
 *  `.error()` itself is fire-and-forget: it queues the report and returns
 *  immediately, which is exactly wrong for a route handler about to return a
 *  response, since a serverless function is free to freeze the instant the
 *  response is sent -- there is no event loop left afterwards for a still-
 *  pending request to finish on. Awaiting the callback Rollbar's own client
 *  accepts as a second argument is what turns that into something the caller
 *  can actually wait on, capped at 3s so a slow or unreachable Rollbar can
 *  never hold up the response the user is actually waiting for.
 *
 *  Never throws or rejects itself: reporting a failure must never become a
 *  second failure. */
export function reportServerError(error: unknown): Promise<void> {
  return new Promise((resolve) => {
    const timer = setTimeout(resolve, 3000);
    try {
      serverInstance.error(error as Error, () => {
        clearTimeout(timer);
        resolve();
      });
    } catch {
      clearTimeout(timer);
      resolve();
    }
  });
}
