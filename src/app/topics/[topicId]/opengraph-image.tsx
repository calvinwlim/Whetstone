import { ImageResponse } from "next/og";
import { ALL_TOPICS, getTopic, getTrack, questionsForTopic } from "@/content";

/** Generic on purpose: the page supplies a per-topic alt through its own
 *  openGraph.images, which is the only way to get one while still
 *  prerendering all 79 cards. */
export const alt = "Whetstone topic card";
export const size = { width: 1200, height: 630 };
export const contentType = "image/png";

/** All 79 are known at build time, so the cards are prerendered alongside
 *  the pages rather than generated on a crawler's first request. */
export function generateStaticParams() {
  return ALL_TOPICS.map((topic) => ({ topicId: topic.id }));
}

export default async function Image({
  params,
}: {
  params: Promise<{ topicId: string }>;
}) {
  const { topicId } = await params;
  const topic = getTopic(topicId);

  // The page itself calls notFound() for an unknown id; the image just falls
  // back to the wordmark rather than throwing during a build.
  const title = topic?.title ?? "Whetstone";
  const blurb = topic?.blurb ?? "";
  const track = topic ? getTrack(topic.track)?.title : undefined;
  const count = topic ? questionsForTopic(topic.id).length : 0;

  return new ImageResponse(
    (
      <div
        style={{
          width: "100%",
          height: "100%",
          display: "flex",
          flexDirection: "column",
          justifyContent: "space-between",
          background: "#0a0c0e",
          color: "#e9edf1",
          padding: "72px",
        }}
      >
        <div
          style={{
            display: "flex",
            fontSize: "24px",
            fontWeight: 600,
            letterSpacing: "0.12em",
            textTransform: "uppercase",
            color: "#949fab",
          }}
        >
          {track ?? "Whetstone"}
        </div>

        <div style={{ display: "flex", flexDirection: "column" }}>
          <div
            style={{
              fontSize: title.length > 26 ? "62px" : "76px",
              fontWeight: 700,
              lineHeight: 1.08,
              letterSpacing: "-0.02em",
            }}
          >
            {title}
          </div>
          {blurb ? (
            <div
              style={{
                marginTop: "22px",
                fontSize: "30px",
                lineHeight: 1.4,
                color: "#949fab",
                maxWidth: "940px",
              }}
            >
              {blurb}
            </div>
          ) : null}
        </div>

        <div
          style={{
            display: "flex",
            alignItems: "center",
            justifyContent: "space-between",
            paddingTop: "28px",
            borderTop: "1px solid #23292f",
            fontSize: "24px",
            color: "#949fab",
          }}
        >
          <div style={{ display: "flex", alignItems: "center", gap: "14px" }}>
            <div
              style={{
                display: "flex",
                alignItems: "center",
                justifyContent: "center",
                width: "40px",
                height: "40px",
                borderRadius: "10px",
                background: "#e9edf1",
                color: "#0a0c0e",
                fontSize: "24px",
                fontWeight: 700,
              }}
            >
              W
            </div>
            <span style={{ color: "#e9edf1", fontWeight: 600 }}>Whetstone</span>
          </div>
          <div style={{ display: "flex", gap: "10px" }}>
            <span style={{ color: "#e9edf1", fontWeight: 600 }}>{count}</span>
            <span>questions</span>
          </div>
        </div>
      </div>
    ),
    size,
  );
}
