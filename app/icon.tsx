import { ImageResponse } from "next/og";

export const size = { width: 32, height: 32 };
export const contentType = "image/png";

/**
 * Favicon generated from the app logo: play icon inside a rounded rectangle.
 */
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
          background: "darkred",
          borderRadius: 6,
        }}
      >
        <svg
          width="24"
          height="24"
          viewBox="0 0 40 40"
          fill="none"
          xmlns="http://www.w3.org/2000/svg"
        >
          <rect
            x="2"
            y="6"
            width="36"
            height="28"
            rx="4"
            stroke="white"
            strokeWidth="2"
            fill="none"
          />
          <path d="M16 12v16l12-8L16 12z" fill="white" />
        </svg>
      </div>
    ),
    { ...size }
  );
}
