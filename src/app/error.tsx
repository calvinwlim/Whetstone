"use client";

import Link from "next/link";
import { useEffect } from "react";
import { useRollbar } from "@rollbar/react";

/** Catches a render failure in any page without taking the shell with it, so
 *  navigation still works and a drill in progress is one click away.
 *
 *  Next 16 names the recovery callback `retry`; older versions called it
 *  `reset`. */
export default function PageError({
  error,
  retry,
}: {
  error: Error & { digest?: string };
  retry: () => void;
}) {
  const rollbar = useRollbar();

  useEffect(() => {
    // console.error is kept alongside Rollbar rather than replaced by it --
    // it is still what shows up in a local dev session or a screen-shared
    // debugging call, and costs nothing extra to leave in.
    console.error("[whetstone] page error:", error);
    rollbar.error(error);
  }, [error, rollbar]);

  return (
    <div className="rounded-card border-[1.5px] border-red bg-red-wash p-5">
      <h1 className="text-lg font-semibold">This page stopped working</h1>
      <p className="mt-1.5 max-w-prose text-sm">
        Your progress is safe — it is saved in this browser and, if you are
        signed in, on your account. Nothing you have answered is lost.
      </p>
      {error.digest ? (
        <p className="mt-2 font-mono text-xs text-text-2">
          Reference {error.digest}
        </p>
      ) : null}
      <div className="mt-4 flex flex-wrap gap-2">
        <button
          type="button"
          onClick={retry}
          className="btn btn-primary px-3.5 py-2 text-sm"
        >
          Try again
        </button>
        <Link href="/" className="btn btn-quiet px-3.5 py-2 text-sm">
          Back to today
        </Link>
      </div>
    </div>
  );
}
