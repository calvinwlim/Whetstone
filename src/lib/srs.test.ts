import { describe, expect, test } from "vitest";
import { initialSrsState, scheduleNext, isDue, type SrsState } from "@/lib/srs";

const T0 = new Date("2026-01-01T09:00:00.000Z");
const day = (n: number) => new Date(T0.getTime() + n * 86_400_000);

describe("initial state", () => {
  test("starts unseen, due immediately, at the default ease", () => {
    const s = initialSrsState(T0);
    expect(s.reps).toBe(0);
    expect(s.lapses).toBe(0);
    expect(s.ease).toBeCloseTo(2.5);
    expect(s.intervalDays).toBe(0);
    expect(new Date(s.dueAt).getTime()).toBe(T0.getTime());
  });
});

describe("successful reviews", () => {
  test("schedules the first success one day out", () => {
    const s = scheduleNext(initialSrsState(T0), true, T0);
    expect(s.intervalDays).toBe(1);
    expect(s.reps).toBe(1);
    expect(new Date(s.dueAt).getTime()).toBe(day(1).getTime());
  });

  test("schedules the second success six days out", () => {
    let s = scheduleNext(initialSrsState(T0), true, T0);
    s = scheduleNext(s, true, day(1));
    expect(s.intervalDays).toBe(6);
    expect(s.reps).toBe(2);
    expect(new Date(s.dueAt).getTime()).toBe(day(7).getTime());
  });

  test("multiplies the interval by ease from the third success on", () => {
    let s = scheduleNext(initialSrsState(T0), true, T0);
    s = scheduleNext(s, true, day(1));
    const easeAtThird = s.ease;
    s = scheduleNext(s, true, day(7));
    expect(s.intervalDays).toBe(Math.round(6 * easeAtThird));
    expect(s.reps).toBe(3);
  });

  test("raises ease on a correct answer", () => {
    const s = scheduleNext(initialSrsState(T0), true, T0);
    expect(s.ease).toBeGreaterThan(2.5);
  });
});

describe("lapses", () => {
  test("resets the interval and counts a lapse on a wrong answer", () => {
    let s = scheduleNext(initialSrsState(T0), true, T0);
    s = scheduleNext(s, true, day(1));
    s = scheduleNext(s, false, day(7));
    expect(s.intervalDays).toBe(1);
    expect(s.reps).toBe(0);
    expect(s.lapses).toBe(1);
  });

  test("lowers ease on a wrong answer", () => {
    const s = scheduleNext(initialSrsState(T0), false, T0);
    expect(s.ease).toBeLessThan(2.5);
  });

  test("never lets ease fall below 1.3", () => {
    let s: SrsState = initialSrsState(T0);
    for (let i = 0; i < 30; i++) s = scheduleNext(s, false, day(i));
    expect(s.ease).toBeGreaterThanOrEqual(1.3);
  });

  test("reschedules a lapsed item for the next day, not the same moment", () => {
    const s = scheduleNext(initialSrsState(T0), false, T0);
    expect(new Date(s.dueAt).getTime()).toBe(day(1).getTime());
  });
});

describe("due checks", () => {
  test("an item is due at exactly its due time", () => {
    const s = scheduleNext(initialSrsState(T0), true, T0);
    expect(isDue(s, day(1))).toBe(true);
  });

  test("an item is not due before its due time", () => {
    const s = scheduleNext(initialSrsState(T0), true, T0);
    expect(isDue(s, T0)).toBe(false);
  });

  test("an overdue item is still due", () => {
    const s = scheduleNext(initialSrsState(T0), true, T0);
    expect(isDue(s, day(9))).toBe(true);
  });

  test("a brand new item is due immediately", () => {
    expect(isDue(initialSrsState(T0), T0)).toBe(true);
  });
});
