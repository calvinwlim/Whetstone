import { ImageResponse } from "next/og";

export const size = { width: 32, height: 32 };
export const contentType = "image/png";

/** The same mark used in the header and og-image -- a rounded square with
 *  "W" -- so the browser tab matches the rest of the chrome instead of the
 *  Next.js starter's default icon. */
export default function Icon() {
  return new ImageResponse(
    (
      <div
        style={{
          width: "100%",
          height: "100%",
          display: "flex",
          alignItems: "center",
          justifyContent: "center",
          background: "#e9edf1",
          color: "#0a0c0e",
          fontSize: 20,
          fontWeight: 700,
          borderRadius: 7,
        }}
      >
        W
      </div>
    ),
    size,
  );
}
