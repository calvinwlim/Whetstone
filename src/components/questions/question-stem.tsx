import type { Question } from "@/content/types";

/** The question itself: its scenario and its ask, rendered as one unit.
 *
 *  These are not a note and a heading. Roughly one question in eight opens
 *  with a scenario, and where it does the prompt is usually a short pointer
 *  into it -- "Which approach fits best?", "What is this called?" -- which
 *  means nothing on its own. The context is the question.
 *
 *  It used to be set smaller, in the secondary text colour, inside a tinted
 *  strip. That is the page's vocabulary for chrome, and it sat directly under
 *  a real chrome bar of the same shape, so the eye learned to jump past it to
 *  the one bold line and answer a question it had only half read. Both halves
 *  are now full-contrast body text at a single size, and weight alone marks
 *  which half is the ask. */
export function QuestionStem({
  question,
  as: Heading = "h1",
  className = "",
}: {
  question: Question;
  /** h1 on the drill, where the question is the page; h2 where it is not. */
  as?: "h1" | "h2";
  className?: string;
}) {
  return (
    <div className={className}>
      {question.context ? (
        <p className="mb-2 text-base leading-relaxed">{question.context}</p>
      ) : null}
      <Heading className="text-base font-semibold leading-relaxed">
        {question.prompt}
      </Heading>
    </div>
  );
}
