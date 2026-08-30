import { ImageResponse } from "next/og";

export const size = { width: 1200, height: 630 };
export const contentType = "image/png";
export const alt = "Sundusk — tops for the Indian market, sizes XS–XL";

// Shared across every page that doesn't define its own — Next.js falls
// back to the nearest opengraph-image up the route tree. Deliberately
// text-only (brand colours + wordmark) rather than fetching a custom
// font file for satori: keeps this dependency-free and fast to generate,
// and the palette alone is already distinctly Sundusk against a link
// preview full of generic white-background storefronts.
export default function OpengraphImage() {
  return new ImageResponse(
    (
      <div
        style={{
          width: "100%",
          height: "100%",
          display: "flex",
          flexDirection: "column",
          alignItems: "center",
          justifyContent: "center",
          backgroundColor: "#FBF2E4",
          color: "#3C1800",
        }}
      >
        <div
          style={{
            fontSize: 120,
            fontWeight: 700,
            letterSpacing: "-0.02em",
          }}
        >
          Sundusk
        </div>
        <div
          style={{
            marginTop: 24,
            fontSize: 32,
            color: "#B5622F",
            letterSpacing: "0.2em",
            textTransform: "uppercase",
          }}
        >
          Tops · Sizes XS–XL
        </div>
      </div>
    ),
    { ...size },
  );
}
