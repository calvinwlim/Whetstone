import type { Question, Response } from "@/content/types";

export interface QuestionInputProps<
  Q extends Question = Question,
  R extends Response = Response,
> {
  question: Q;
  value: R | null;
  onChange: (value: R) => void;
  /** True once the answer is submitted: inputs freeze and marking appears. */
  locked: boolean;
}

type ChoiceState = "idle" | "selected" | "correct" | "wrong" | "missed";

const TILE_CLASS: Record<ChoiceState, string> = {
  idle: "tile",
  selected: "tile tile-on",
  correct: "tile tile-right",
  wrong: "tile tile-wrong",
  // The right answer the learner did not pick: marked, but not as their error.
  missed: "tile tile-missed",
};

const MARK_CLASS: Record<ChoiceState, string> = {
  idle: "border-border-strong",
  selected: "border-green bg-green text-white",
  correct: "border-green bg-green text-white",
  wrong: "border-red bg-red text-white",
  missed: "border-green text-green",
};

const MARK: Record<ChoiceState, string> = {
  idle: "",
  selected: "",
  correct: "✓",
  wrong: "✕",
  missed: "✓",
};

export function Choice({
  state,
  onClick,
  disabled,
  children,
  multi = false,
}: {
  state: ChoiceState;
  onClick: () => void;
  disabled: boolean;
  children: React.ReactNode;
  multi?: boolean;
}) {
  return (
    <button
      type="button"
      onClick={onClick}
      disabled={disabled}
      aria-pressed={state !== "idle" && state !== "missed"}
      className={`${TILE_CLASS[state]} flex w-full items-start gap-3 px-3.5 py-3 text-left text-[0.9375rem] leading-snug disabled:cursor-default`}
    >
      <span
        aria-hidden
        className={`mt-px grid h-5 w-5 shrink-0 place-items-center border-[1.5px] text-[11px] font-bold ${
          multi ? "rounded-[5px]" : "rounded-full"
        } ${MARK_CLASS[state]}`}
      >
        {MARK[state]}
      </span>
      <span className="flex-1">{children}</span>
    </button>
  );
}

export function choiceState(
  isSelected: boolean,
  isCorrect: boolean,
  locked: boolean,
): ChoiceState {
  if (!locked) return isSelected ? "selected" : "idle";
  if (isSelected && isCorrect) return "correct";
  if (isSelected && !isCorrect) return "wrong";
  if (!isSelected && isCorrect) return "missed";
  return "idle";
}
