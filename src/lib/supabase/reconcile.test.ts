import { describe, expect, test } from "vitest";
import { reconcileProgress } from "@/lib/supabase/reconcile";
import { emptyProgress, recordAnswer, type ProgressState } from "@/lib/progress";
import type { McqQuestion } from "@/content/types";

const NOW = new Date("2026-07-01T09:00:00.000Z");

function question(id: string): McqQuestion {
  return {
    id,
    type: "mcq",
    track: "system-design",
    topic: "caching",
    difficulty: 2,
    prompt: "p",
    explanation: "e",
    options: [{ id: "a", text: "a" }],
    answer: "a",
  };
}

function withAttempts(count: number): ProgressState {
  let state = emptyProgress();
  for (let i = 0; i < count; i++) {
    state = recordAnswer(state, question(`q${i}`), true, NOW);
  }
  return state;
}

describe("reconcileProgress", () => {
  test("uses local and asks for a push when there is no remote state", () => {
    const local = withAttempts(3);
    const result = reconcileProgress(local, null);
    expect(result.state).toBe(local);
    expect(result.shouldPush).toBe(true);
  });

  test("adopts remote when local has no history at all", () => {
    const remote = withAttempts(5);
    const result = reconcileProgress(emptyProgress(), remote);
    expect(result.state).toBe(remote);
    expect(result.shouldPush).toBe(false);
  });

  test("keeps the side with more answered questions", () => {
    const local = withAttempts(9);
    const remote = withAttempts(4);
    expect(reconcileProgress(local, remote).state).toBe(local);
    expect(reconcileProgress(withAttempts(2), withAttempts(8)).state.attempts)
      .toHaveLength(8);
  });

  test("pushes when local is ahead of remote", () => {
    expect(reconcileProgress(withAttempts(9), withAttempts(4)).shouldPush).toBe(
      true,
    );
  });

  test("does not push when remote is ahead", () => {
    expect(reconcileProgress(withAttempts(2), withAttempts(8)).shouldPush).toBe(
      false,
    );
  });

  test("prefers local on an exact tie, without pushing", () => {
    const local = withAttempts(4);
    const result = reconcileProgress(local, withAttempts(4));
    expect(result.state).toBe(local);
    expect(result.shouldPush).toBe(false);
  });

  test("treats two empty states as nothing to do", () => {
    const result = reconcileProgress(emptyProgress(), emptyProgress());
    expect(result.state.attempts).toHaveLength(0);
    expect(result.shouldPush).toBe(false);
  });
});
