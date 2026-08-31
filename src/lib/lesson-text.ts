/** A deliberately tiny subset of markdown -- paragraphs, bold, italic, and
 *  inline code -- which is all the authored lessons use. Small enough to test
 *  exhaustively and avoids a dependency plus its sanitisation surface. */

export type Segment =
  | { type: "text"; value: string }
  | { type: "bold"; value: string }
  | { type: "italic"; value: string }
  | { type: "code"; value: string };

export function splitParagraphs(text: string): string[] {
  return text
    .split(/\n\s*\n/)
    .map((paragraph) => paragraph.trim())
    .filter((paragraph) => paragraph !== "");
}

// Code first, so asterisks inside a code span are never read as emphasis.
// Bold before italic, so ** is never treated as two italic markers. The
// italic branch requires a non-space after the opener, which keeps arithmetic
// like "2 * 3" from being swallowed as emphasis.
const INLINE = /`([^`\n]+)`|\*\*(.+?)\*\*|\*([^*\s][^*]*?)\*/g;

export function parseInline(text: string): Segment[] {
  if (text === "") return [];

  const segments: Segment[] = [];
  let cursor = 0;

  for (const match of text.matchAll(INLINE)) {
    const start = match.index;
    if (start > cursor) {
      segments.push({ type: "text", value: text.slice(cursor, start) });
    }

    if (match[1] !== undefined) {
      segments.push({ type: "code", value: match[1] });
    } else if (match[2] !== undefined) {
      segments.push({ type: "bold", value: match[2] });
    } else if (match[3] !== undefined) {
      segments.push({ type: "italic", value: match[3] });
    }

    cursor = start + match[0].length;
  }

  if (cursor < text.length) {
    segments.push({ type: "text", value: text.slice(cursor) });
  }

  return segments;
}
