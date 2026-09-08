"use client";

import { useEffect } from "react";
import Rollbar from "rollbar";
import { clientConfig } from "@/lib/rollbar/config";

/** The last resort: a failure in the root layout itself, where the shell and
 *  the stylesheet are both gone. Next replaces the whole document with this,
 *  and global styles do not reach it, so everything here is inline and it
 *  cannot rely on a single design token.
 *
 *  RollbarProvider lives inside the root layout, so a crash here means that
 *  context never mounted -- there is nothing to read with useRollbar(). A
 *  fresh instance is built from the same config instead. Constructing it
 *  inside the effect, not at module scope, matters more here than in most
 *  places: this component runs *because* something already went wrong, and a
 *  faulty client should not be able to take the crash page down with it. */
export default function GlobalError({
  error,
  retry,
}: {
  error: Error & { digest?: string };
  retry: () => void;
}) {
  useEffect(() => {
    try {
      new Rollbar(clientConfig).error(error);
    } catch {
      // The one thing this component must not do is throw.
    }
  }, [error]);

  return (
    <html lang="en">
      <body
        style={{
          margin: 0,
          minHeight: "100vh",
          display: "grid",
          placeItems: "center",
          padding: "1.5rem",
          background: "#14171a",
          color: "#e9edf1",
          fontFamily: "ui-sans-serif, system-ui, sans-serif",
          lineHeight: 1.6,
        }}
      >
        <title>Whetstone stopped working</title>
        <main style={{ maxWidth: "32rem" }}>
          <h1
            style={{
              margin: 0,
              fontSize: "1.375rem",
              fontWeight: 600,
              letterSpacing: "-0.01em",
            }}
          >
            Whetstone stopped working
          </h1>
          <p style={{ marginTop: "0.75rem", color: "#9aa5b1" }}>
            Something failed before the page could load. Your progress is saved
            in this browser and on your account if you are signed in, so
            nothing you have answered is lost.
          </p>
          {error.digest ? (
            <p
              style={{
                marginTop: "0.75rem",
                fontFamily: "ui-monospace, monospace",
                fontSize: "0.8125rem",
                color: "#767f8b",
              }}
            >
              Reference {error.digest}
            </p>
          ) : null}
          <button
            type="button"
            onClick={retry}
            style={{
              marginTop: "1.25rem",
              padding: "0.625rem 1rem",
              borderRadius: "8px",
              border: "none",
              background: "#e9edf1",
              color: "#14171a",
              fontSize: "0.9375rem",
              fontWeight: 600,
              cursor: "pointer",
            }}
          >
            Reload
          </button>
        </main>
      </body>
    </html>
  );
}
