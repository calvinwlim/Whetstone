import { ImageResponse } from "next/og";
import { ALL_QUESTIONS, ALL_TOPICS, TRACKS } from "@/content";
import { SITE_DESCRIPTION } from "@/lib/site";

export const alt = "Whetstone — daily practice for engineers";
export const size = { width: 1200, height: 630 };
export const contentType = "image/png";

/** Rendered on the app's dark chrome so a shared link looks like the product
 *  rather than a generic card. Satori has no access to next/font, so this
 *  leans on weight and scale rather than a loaded typeface. */
export default function Image() {
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
        <div style={{ display: "flex", alignItems: "center", gap: "18px" }}>
          <div
            style={{
              display: "flex",
              alignItems: "center",
              justifyContent: "center",
              width: "56px",
              height: "56px",
              borderRadius: "14px",
              background: "#e9edf1",
              color: "#0a0c0e",
              fontSize: "34px",
              fontWeight: 700,
            }}
          >
            W
          </div>
          <div style={{ fontSize: "36px", fontWeight: 600 }}>Whetstone</div>
        </div>

        <div style={{ display: "flex", flexDirection: "column" }}>
          <div
            style={{
              fontSize: "68px",
              fontWeight: 700,
              lineHeight: 1.1,
              letterSpacing: "-0.02em",
            }}
          >
            Daily practice for engineers
          </div>
          <div
            style={{
              marginTop: "24px",
              fontSize: "28px",
              lineHeight: 1.4,
              color: "#949fab",
              maxWidth: "900px",
            }}
          >
            {SITE_DESCRIPTION}
          </div>
        </div>

        <div
          style={{
            display: "flex",
            gap: "48px",
            paddingTop: "28px",
            borderTop: "1px solid #23292f",
            fontSize: "24px",
            color: "#949fab",
          }}
        >
          <div style={{ display: "flex", gap: "10px" }}>
            <span style={{ color: "#e9edf1", fontWeight: 600 }}>
              {ALL_QUESTIONS.length}
            </span>
            <span>questions</span>
          </div>
          <div style={{ display: "flex", gap: "10px" }}>
            <span style={{ color: "#e9edf1", fontWeight: 600 }}>
              {ALL_TOPICS.length}
            </span>
            <span>topics</span>
          </div>
          <div style={{ display: "flex", gap: "10px" }}>
            <span style={{ color: "#e9edf1", fontWeight: 600 }}>
              {TRACKS.length}
            </span>
            <span>tracks</span>
          </div>
        </div>
      </div>
    ),
    size,
  );
}
