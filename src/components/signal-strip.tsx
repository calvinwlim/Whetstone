/** The signature element: a row of ticks reading like the uptime bar on a
 *  status page. Correct is verdigris, wrong is rust, not-yet-answered is faint.
 *  Reused at three scales -- recent history on Today, the live session on a
 *  drill, and per-topic history on Stats -- so one glance always means the
 *  same thing. */

export type Signal = boolean | null;

interface SignalStripProps {
  signals: Signal[];
  /** Index currently being answered, highlighted in amber. */
  activeIndex?: number;
  label?: string;
  className?: string;
}

export function SignalStrip({
  signals,
  activeIndex,
  label,
  className = "",
}: SignalStripProps) {
  if (signals.length === 0) return null;

  return (
    <div className={className}>
      <div
        className="flex items-end gap-[3px]"
        role="img"
        aria-label={
          label ??
          `${signals.filter(Boolean).length} correct of ${
            signals.filter((s) => s !== null).length
          } answered`
        }
      >
        {signals.map((signal, index) => {
          const active = index === activeIndex;
          return (
            <span
              key={index}
              className={`w-[3px] rounded-[1px] transition-all ${
                active
                  ? "h-5 bg-amber"
                  : signal === true
                    ? "h-4 bg-verdigris"
                    : signal === false
                      ? "h-4 bg-rust"
                      : "h-2.5 bg-rule"
              }`}
            />
          );
        })}
      </div>
      {label ? <p className="label mt-2">{label}</p> : null}
    </div>
  );
}
