import { ImageResponse } from "next/og";

// OG image site-wide (home, pricing, outils, légales…). Les articles de
// blog gardent leur image dynamique colocalisée qui override celle-ci.
// Format standard 1200×630, system-ui (pas de webfont, cf. blog).
//
// Sans cette image, LinkedIn/Twitter rendaient une carte texte nue avec
// le H1 scrapé en guise de titre (rotator SSR inclus, illisible).

export const alt = "Mamie GEO, mesure la visibilité de ta marque dans les IA";
export const size = { width: 1200, height: 630 };
export const contentType = "image/png";

const LLMS = ["ChatGPT", "Claude", "Perplexity", "Gemini", "Le Chat"];

export default function Image() {
  return new ImageResponse(
    <div
      style={{
        width: "100%",
        height: "100%",
        display: "flex",
        flexDirection: "column",
        justifyContent: "space-between",
        padding: "72px 80px",
        background: "#fafafa",
        fontFamily: "system-ui, -apple-system, sans-serif",
        position: "relative",
      }}
    >
      {/* Halo bleu brand, même ambiance que l'OG blog */}
      <div
        style={{
          position: "absolute",
          top: -160,
          right: -160,
          width: 640,
          height: 640,
          borderRadius: "50%",
          background: "radial-gradient(circle at center, #329cff2e 0%, transparent 60%)",
        }}
      />

      {/* Header : logo + nom */}
      <div
        style={{
          display: "flex",
          alignItems: "center",
          gap: 14,
          fontSize: 28,
          fontWeight: 600,
          color: "#171717",
        }}
      >
        <span
          style={{
            display: "flex",
            width: 44,
            height: 44,
            borderRadius: 12,
            background: "#329cff",
            color: "#fff",
            alignItems: "center",
            justifyContent: "center",
            fontSize: 26,
            fontWeight: 700,
          }}
        >
          M
        </span>
        Mamie GEO
      </div>

      {/* Message principal */}
      <div style={{ display: "flex", flexDirection: "column", gap: 28 }}>
        <div
          style={{
            display: "flex",
            fontSize: 72,
            fontWeight: 700,
            color: "#0a0a0a",
            lineHeight: 1.08,
            letterSpacing: "-0.02em",
            maxWidth: 940,
          }}
        >
          Sache enfin si les IA parlent de toi.
        </div>
        <div style={{ display: "flex", fontSize: 30, color: "#525252", maxWidth: 880 }}>
          Visibilité de ta marque mesurée chaque jour dans les 5 IA grand public.
        </div>
      </div>

      {/* Footer : pills des 5 IA + domaine */}
      <div
        style={{
          display: "flex",
          justifyContent: "space-between",
          alignItems: "center",
        }}
      >
        <div style={{ display: "flex", gap: 12 }}>
          {LLMS.map((name) => (
            <div
              key={name}
              style={{
                display: "flex",
                padding: "10px 22px",
                borderRadius: 999,
                background: "#ffffff",
                border: "1px solid #e5e5e5",
                color: "#171717",
                fontSize: 22,
                fontWeight: 500,
              }}
            >
              {name}
            </div>
          ))}
        </div>
        <span style={{ color: "#737373", fontSize: 22 }}>mamie-geo.fr</span>
      </div>
    </div>,
    { ...size },
  );
}
