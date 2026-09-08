"use client";

import type { ReactNode } from "react";
import { Provider as RollbarProvider } from "@rollbar/react";
import RollbarWithReplay from "rollbar/replay";
import { clientConfig } from "@/lib/rollbar/config";

/** A thin client wrapper, and the reason it exists rather than rendering
 *  <RollbarProvider> straight from the (server) root layout: `Rollbar` here
 *  is a class constructor, and passing a function as a prop across the
 *  server-to-client boundary is not allowed -- React serialises props
 *  crossing that boundary, and a function is not serialisable. The plain
 *  data in clientConfig was always fine; only the constructor needed to move
 *  server-side code can never see. Importing it here, inside a module that is
 *  itself client-only, means it never has to cross that boundary as a prop at
 *  all. */
export function AppRollbarProvider({ children }: { children: ReactNode }) {
  return (
    <RollbarProvider Rollbar={RollbarWithReplay} config={clientConfig}>
      {children}
    </RollbarProvider>
  );
}
