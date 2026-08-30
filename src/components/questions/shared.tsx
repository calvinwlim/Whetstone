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

const STATE_CLASSES: Record<ChoiceState, string> = {
  idle: "border-rule bg-raised hover:border-amber",
  selected: "border-amber bg-amber-wash",
  correct: "border-verdigris bg-verdigris-wash",
  wrong: "border-rust bg-rust-wash",
  // The right answer the learner did not pick: marked, but not as their error.
  missed: "border-verdigris border-dashed bg-transparent",
};

const STATE_MARK: Record<ChoiceState, string | null> = {
  idle: null,
  selected: null,
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
  const mark = STATE_MARK[state];

  return (
    <button
      type="button"
      onClick={onClick}
      disabled={disabled}
      aria-pressed={state === "selected" || state === "correct" || state === "wrong"}
      className={`flex w-full items-start gap-3 rounded-lg border px-4 py-3 text-left text-[0.9375rem] leading-snug transition-colors disabled:cursor-default ${STATE_CLASSES[state]}`}
    >
      <span
        aria-hidden
        className={`mt-0.5 flex h-5 w-5 shrink-0 items-center justify-center border text-xs ${
          multi ? "rounded-[4px]" : "rounded-full"
        } ${
          state === "correct" || state === "missed"
            ? "border-verdigris text-verdigris"
            : state === "wrong"
              ? "border-rust text-rust"
              : state === "selected"
                ? "border-amber bg-amber"
                : "border-rule"
        }`}
      >
        {mark}
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
