/** A value over a tiny uppercase key. The metadata pattern used wherever a few
 *  facts sit under a page title, so they read as a strip rather than a run of
 *  "Label: value" sentences. */
export function Field({
  label,
  value,
  tone,
  children,
}: {
  label: string;
  /** Omit when passing richer content as children. */
  value?: string;
  tone?: "good" | "bad";
  children?: React.ReactNode;
}) {
  return (
    <div>
      <div
        className={`font-mono text-base tabular-nums ${
          tone === "good" ? "text-green" : tone === "bad" ? "text-red" : ""
        }`}
      >
        {children ?? value}
      </div>
      <p className="label">{label}</p>
    </div>
  );
}
