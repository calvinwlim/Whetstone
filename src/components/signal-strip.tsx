/** A run of recent answers, chunky enough to read at a glance: green solid for
 *  correct, red for wrong, hollow for not yet reached. */

export type Signal = boolean | null;

interface SignalStripProps {
  signals: Signal[];
  /** Index currently being answered, drawn taller and in amber. */
  activeIndex?: number;
  className?: string;
}

export function SignalStrip({
  signals,
  activeIndex,
  className = "",
}: SignalStripProps) {
  if (signals.length === 0) return null;

  const answered = signals.filter((s) => s !== null).length;
  const correct = signals.filter(Boolean).length;

  return (
    <div
      className={`flex items-center gap-1 ${className}`}
      role="img"
      aria-label={`${correct} correct of ${answered} answered`}
    >
      {signals.map((signal, index) => {
        const active = index === activeIndex;
        return (
          <span
            key={index}
            className={`h-5 w-[7px] rounded-[3px] transition-colors ${
              active
                ? "bg-amber"
                : signal === true
                  ? "bg-green"
                  : signal === false
                    ? "bg-red"
                    : "bg-surface-2"
            }`}
          />
        );
      })}
    </div>
  );
}
