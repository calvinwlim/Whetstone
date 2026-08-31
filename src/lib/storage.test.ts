import { beforeEach, describe, expect, test } from "vitest";
import { createLocalStore, STORAGE_KEY } from "@/lib/storage";
import { emptyProgress, recordAnswer } from "@/lib/progress";
import type { McqQuestion } from "@/content/types";

const question: McqQuestion = {
  id: "q1",
  type: "mcq",
  track: "system-design",
  topic: "caching",
  difficulty: 2,
  prompt: "p",
  explanation: "e",
    concepts: ["Example concept"],
  options: [{ id: "a", text: "a" }],
  answer: "a",
};

/** A Storage that throws on every access, like a browser with site data blocked. */
const hostileStorage: Storage = {
  get length(): number {
    throw new Error("denied");
  },
  clear() {
    throw new Error("denied");
  },
  getItem() {
    throw new Error("denied");
  },
  key() {
    throw new Error("denied");
  },
  removeItem() {
    throw new Error("denied");
  },
  setItem() {
    throw new Error("denied");
  },
};

beforeEach(() => {
  window.localStorage.clear();
});

describe("loading", () => {
  test("returns empty progress when nothing is stored", () => {
    const store = createLocalStore(window.localStorage);
    expect(store.load()).toEqual(emptyProgress());
  });

  test("round-trips a saved state", () => {
    const store = createLocalStore(window.localStorage);
    const saved = recordAnswer(emptyProgress(), question, true, new Date());
    store.save(saved);
    expect(store.load()).toEqual(saved);
  });

  test("falls back to empty progress on corrupt json", () => {
    window.localStorage.setItem(STORAGE_KEY, "{not json");
    const store = createLocalStore(window.localStorage);
    expect(store.load()).toEqual(emptyProgress());
  });

  test("falls back to empty progress when the stored shape is wrong", () => {
    window.localStorage.setItem(STORAGE_KEY, JSON.stringify({ hello: "world" }));
    const store = createLocalStore(window.localStorage);
    expect(store.load()).toEqual(emptyProgress());
  });

  test("falls back to empty progress on a version it does not understand", () => {
    window.localStorage.setItem(
      STORAGE_KEY,
      JSON.stringify({ ...emptyProgress(), version: 99 }),
    );
    const store = createLocalStore(window.localStorage);
    expect(store.load()).toEqual(emptyProgress());
  });
});

describe("hostile storage", () => {
  test("load returns empty progress instead of throwing", () => {
    const store = createLocalStore(hostileStorage);
    expect(store.load()).toEqual(emptyProgress());
  });

  test("save swallows the failure instead of throwing", () => {
    const store = createLocalStore(hostileStorage);
    expect(() => store.save(emptyProgress())).not.toThrow();
  });
});

describe("no storage available", () => {
  test("load returns empty progress when there is no storage at all", () => {
    const store = createLocalStore(undefined);
    expect(store.load()).toEqual(emptyProgress());
  });

  test("save is a no-op when there is no storage at all", () => {
    const store = createLocalStore(undefined);
    expect(() => store.save(emptyProgress())).not.toThrow();
  });
});
