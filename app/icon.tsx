import { ImageResponse } from "next/og";

export const size = { width: 32, height: 32 };
export const contentType = "image/png";

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
          background: "linear-gradient(135deg, #06B6D4, #C084FC)",
          color: "#08080F",
          fontSize: 22,
          fontWeight: "bold",
          borderRadius: 6,
        }}
      >
        O
      </div>
    ),
    { ...size }
  );
}
