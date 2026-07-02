import { ImageResponse } from "next/og";

export async function GET() {
  return new ImageResponse(
    (
      <div
        style={{
          width: "100%",
          height: "100%",
          display: "flex",
          alignItems: "center",
          justifyContent: "center",
          background: "#ea580c",
          fontSize: 112,
        }}
      >
        🌽
      </div>
    ),
    { width: 180, height: 180 }
  );
}
