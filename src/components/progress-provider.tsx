"use client";

import {
  createContext,
  useCallback,
  useContext,
  useMemo,
  useSyncExternalStore,
} from "react";
import type { Question, TrackId } from "@/content/types";
import {
  emptyProgress,
  overallAccuracy,
  recordAnswer as applyAnswer,
  topicAccuracy,
  trackAccuracy,
  type ProgressState,
} from "@/lib/progress";
import {
  getServerSnapshot,
  getSnapshot,
  setProgress,
  subscribe,
  updateProgress,
} from "@/lib/progress-store";
import { ProgressSync } from "@/components/progress-sync";
import { levelForXp, streakAsOf, type LevelProgress } from "@/lib/xp";

interface ProgressContextValue {
  state: ProgressState;
  /** False while rendering the server snapshot, true once real progress is in.
   *  Screens use it to hold back progress-dependent UI for one render. */
  hydrated: boolean;
  /** Today as YYYY-MM-DD, read through the store so render stays pure. */
  today: string;
  accuracy: number | undefined;
  byTopic: Record<string, number>;
  byTrack: Record<string, number>;
  level: LevelProgress;
  streak: number;
  answeredToday: number;
  recordAnswer: (question: Question, correct: boolean) => void;
  setDailyGoal: (goal: number) => void;
  setEnabledTracks: (tracks: TrackId[]) => void;
  setIncludeDepth: (include: boolean) => void;
  resetProgress: () => void;
}

const ProgressContext = createContext<ProgressContextValue | null>(null);

const noopSubscribe = () => () => {};
const clientTrue = () => true;
const serverFalse = () => false;
/** Same string for the whole calendar day, so Object.is sees no change. */
const currentDay = () => new Date().toISOString().slice(0, 10);
const noDay = () => "";

export function ProgressProvider({ children }: { children: React.ReactNode }) {
  const state = useSyncExternalStore(
    subscribe,
    getSnapshot,
    getServerSnapshot,
  );
  const hydrated = useSyncExternalStore(noopSubscribe, clientTrue, serverFalse);
  const today = useSyncExternalStore(noopSubscribe, currentDay, noDay);

  const recordAnswer = useCallback((question: Question, correct: boolean) => {
    updateProgress((current) =>
      applyAnswer(current, question, correct, new Date()),
    );
  }, []);

  const setDailyGoal = useCallback((goal: number) => {
    updateProgress((current) => ({ ...current, dailyGoal: goal }));
  }, []);

  const setEnabledTracks = useCallback((tracks: TrackId[]) => {
    updateProgress((current) => ({ ...current, enabledTracks: tracks }));
  }, []);

  const setIncludeDepth = useCallback((include: boolean) => {
    updateProgress((current) => ({ ...current, includeDepth: include }));
  }, []);

  const resetProgress = useCallback(() => {
    setProgress(emptyProgress());
  }, []);

  const value = useMemo<ProgressContextValue>(
    () => ({
      state,
      hydrated,
      today,
      accuracy: overallAccuracy(state),
      byTopic: topicAccuracy(state),
      byTrack: trackAccuracy(state),
      level: levelForXp(state.totalXp),
      streak: streakAsOf(state.streak, today),
      answeredToday: state.dailyStats[today]?.answered ?? 0,
      recordAnswer,
      setDailyGoal,
      setEnabledTracks,
      setIncludeDepth,
      resetProgress,
    }),
    [
      state,
      hydrated,
      today,
      recordAnswer,
      setDailyGoal,
      setEnabledTracks,
      setIncludeDepth,
      resetProgress,
    ],
  );

  return (
    <ProgressContext value={value}>
      <ProgressSync />
      {children}
    </ProgressContext>
  );
}

export function useProgress(): ProgressContextValue {
  const context = useContext(ProgressContext);
  if (!context) {
    throw new Error("useProgress must be used inside a ProgressProvider");
  }
  return context;
}
