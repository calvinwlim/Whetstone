import { parseInline, splitParagraphs } from "@/lib/lesson-text";

export function LessonProse({ text }: { text: string }) {
  return (
    <div className="lesson max-w-[62ch]">
      {splitParagraphs(text).map((paragraph, index) => (
        <p key={index}>
          {parseInline(paragraph).map((segment, segmentIndex) => {
            if (segment.type === "bold") {
              return <strong key={segmentIndex}>{segment.value}</strong>;
            }
            if (segment.type === "italic") {
              return <em key={segmentIndex}>{segment.value}</em>;
            }
            return <span key={segmentIndex}>{segment.value}</span>;
          })}
        </p>
      ))}
    </div>
  );
}
