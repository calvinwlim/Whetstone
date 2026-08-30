import { describe, expect, test } from "vitest";
import { composeSession, targetBand } from "@/lib/session";
import { initialSrsState, scheduleNext } from "@/lib/srs";
import type { Difficulty, McqQuestion, TrackId } from "@/content/types";
import type { SrsState } from "@/lib/srs";

const NOW = new Date("2026-05-01T09:00:00.000Z");
const day = (n: number) => new Date(NOW.getTime() + n * 86_400_000);

function q(
  id: string,
  opts: Partial<{ track: TrackId; topic: string; difficulty: Difficulty }> = {},
): McqQuestion {
  return {
    id,
    type: "mcq",
    track: opts.track ?? "system-design",
    topic: opts.topic ?? "caching",
    difficulty: opts.difficulty ?? 3,
    prompt: id,
    explanation: "e",
    options: [
      { id: "a", text: "a" },
      { id: "b", text: "b" },
    ],
    answer: "a",
  };
}

/** An item reviewed successfully at T0, so it is not due again for a day. */
function reviewed(at: Date): SrsState {
  return scheduleNext(initialSrsState(at), true, at);
}

describe("session size", () => {
  test("returns no more than the daily goal", () => {
    const questions = Array.from({ length: 20 }, (_, i) => q(`q${i}`));
    const session = composeSession({ questions, srs: {}, goal: 5, now: NOW });
    expect(session).toHaveLength(5);
  });

  test("returns everything available when the bank is smaller than the goal", () => {
    const questions = [q("q1"), q("q2")];
    const session = composeSession({ questions, srs: {}, goal: 10, now: NOW });
    expect(session).toHaveLength(2);
  });

  test("returns an empty session for an empty bank", () => {
    expect(composeSession({ questions: [], srs: {}, goal: 10, now: NOW })).toEqual(
      [],
    );
  });

  test("never repeats a question within a session", () => {
    const questions = Array.from({ length: 10 }, (_, i) => q(`q${i}`));
    const session = composeSession({ questions, srs: {}, goal: 10, now: NOW });
    expect(new Set(session.map((s) => s.id)).size).toBe(session.length);
  });
});

describe("review scheduling", () => {
  test("puts a due review ahead of new material", () => {
    const questions = [q("new"), q("due")];
    const srs = { due: reviewed(day(-5)) };
    const session = composeSession({ questions, srs, goal: 2, now: NOW });
    expect(session[0].id).toBe("due");
  });

  test("excludes an item that is not due yet", () => {
    const questions = [q("fresh")];
    const srs = { fresh: reviewed(NOW) };
    const session = composeSession({ questions, srs, goal: 5, now: NOW });
    expect(session).toHaveLength(0);
  });

  test("includes an item once it comes due", () => {
    const questions = [q("fresh")];
    const srs = { fresh: reviewed(NOW) };
    const session = composeSession({ questions, srs, goal: 5, now: day(1) });
    expect(session.map((s) => s.id)).toEqual(["fresh"]);
  });

  test("fills the remainder of the session with new material", () => {
    const questions = [q("due"), q("new1"), q("new2")];
    const srs = { due: reviewed(day(-5)) };
    const session = composeSession({ questions, srs, goal: 3, now: NOW });
    expect(session).toHaveLength(3);
    expect(session[0].id).toBe("due");
  });
});

describe("track filtering", () => {
  test("excludes questions from tracks that are turned off", () => {
    const questions = [
      q("sd", { track: "system-design" }),
      q("wk", { track: "workplace" }),
    ];
    const session = composeSession({
      questions,
      srs: {},
      goal: 10,
      now: NOW,
      enabledTracks: ["system-design"],
    });
    expect(session.map((s) => s.id)).toEqual(["sd"]);
  });

  test("includes every track when none are specified", () => {
    const questions = [
      q("sd", { track: "system-design" }),
      q("wk", { track: "workplace" }),
    ];
    const session = composeSession({ questions, srs: {}, goal: 10, now: NOW });
    expect(session).toHaveLength(2);
  });
});

describe("difficulty banding", () => {
  test("bands a struggling learner to the easiest questions", () => {
    const [min, max] = targetBand(0.3);
    expect(min).toBe(1);
    expect(max).toBeLessThanOrEqual(2);
  });

  test("bands a confident learner to the hardest questions", () => {
    const [min, max] = targetBand(0.95);
    expect(max).toBe(5);
    expect(min).toBeGreaterThanOrEqual(3);
  });

  test("widens as accuracy improves", () => {
    expect(targetBand(0.9)[1]).toBeGreaterThan(targetBand(0.4)[1]);
  });

  test("serves easy questions to a struggling learner", () => {
    const questions = [
      q("easy", { difficulty: 1 }),
      q("hard", { difficulty: 5 }),
    ];
    const session = composeSession({
      questions,
      srs: {},
      goal: 1,
      now: NOW,
      accuracy: 0.2,
    });
    expect(session[0].id).toBe("easy");
  });

  test("serves hard questions to a confident learner", () => {
    const questions = [
      q("easy", { difficulty: 1 }),
      q("hard", { difficulty: 5 }),
    ];
    const session = composeSession({
      questions,
      srs: {},
      goal: 1,
      now: NOW,
      accuracy: 0.97,
    });
    expect(session[0].id).toBe("hard");
  });

  test("falls back outside the band rather than returning a short session", () => {
    const questions = [q("only", { difficulty: 5 })];
    const session = composeSession({
      questions,
      srs: {},
      goal: 3,
      now: NOW,
      accuracy: 0.1,
    });
    expect(session.map((s) => s.id)).toEqual(["only"]);
  });
});

describe("weak topic weighting", () => {
  test("favours the topic with the worse accuracy", () => {
    const questions = [
      ...Array.from({ length: 5 }, (_, i) => q(`weak${i}`, { topic: "sharding" })),
      ...Array.from({ length: 5 }, (_, i) => q(`strong${i}`, { topic: "caching" })),
    ];
    const session = composeSession({
      questions,
      srs: {},
      goal: 4,
      now: NOW,
      topicAccuracy: { sharding: 0.2, caching: 0.95 },
    });
    const weak = session.filter((s) => s.topic === "sharding").length;
    expect(weak).toBeGreaterThan(session.length - weak);
  });
});

describe("determinism", () => {
  test("produces the same session for the same seed", () => {
    const questions = Array.from({ length: 20 }, (_, i) => q(`q${i}`));
    const a = composeSession({ questions, srs: {}, goal: 5, now: NOW, seed: 42 });
    const b = composeSession({ questions, srs: {}, goal: 5, now: NOW, seed: 42 });
    expect(a.map((s) => s.id)).toEqual(b.map((s) => s.id));
  });

  test("produces a different session for a different seed", () => {
    const questions = Array.from({ length: 20 }, (_, i) => q(`q${i}`));
    const a = composeSession({ questions, srs: {}, goal: 5, now: NOW, seed: 1 });
    const b = composeSession({ questions, srs: {}, goal: 5, now: NOW, seed: 2 });
    expect(a.map((s) => s.id)).not.toEqual(b.map((s) => s.id));
  });
});
