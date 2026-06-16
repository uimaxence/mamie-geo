import { FONTS } from "../_primitives/tokens";
import { MONO, NIGHT, NightShell } from "./night-shell";

// Slide 03 — « Ne bloque jamais Googlebot. » + bloc code monospace
// barré rouge + mention « te coupe de Google Search ET des AI Overviews ».

interface Props {
  index: number;
  total: number;
}

export function RobotsSlide({ index, total }: Props) {
  return (
    <NightShell index={index} total={total}>
      <div style={{ flex: 1, display: "flex", flexDirection: "column", justifyContent: "center" }}>
        <span
          style={{
            fontFamily: FONTS.hanken,
            fontSize: 22,
            fontWeight: 700,
            letterSpacing: "0.16em",
            textTransform: "uppercase",
            color: NIGHT.red,
            marginBottom: 22,
          }}
        >
          L&apos;erreur n°1
        </span>

        <h2
          style={{
            fontFamily: FONTS.hanken,
            fontSize: 68,
            fontWeight: 700,
            lineHeight: 1.0,
            letterSpacing: "-0.035em",
            color: NIGHT.white,
            margin: "0 0 44px",
            maxWidth: 820,
          }}
        >
          Ne bloque <span style={{ color: NIGHT.red }}>jamais</span> Googlebot pour « échapper à
          l&apos;IA ».
        </h2>

        <div
          style={{
            background: "#0A1428",
            border: `1px solid ${NIGHT.cardBorder}`,
            borderRadius: 18,
            overflow: "hidden",
          }}
        >
          <div
            style={{
              display: "flex",
              alignItems: "center",
              gap: 10,
              padding: "16px 24px",
              borderBottom: `1px solid ${NIGHT.cardBorder}`,
            }}
          >
            <Dot color="#FF5F56" />
            <Dot color="#FFBD2E" />
            <Dot color="#27C93F" />
            <span
              style={{
                marginLeft: 10,
                fontFamily: MONO,
                fontSize: 19,
                color: NIGHT.whiteFaint,
              }}
            >
              robots.txt
            </span>
          </div>

          <div style={{ padding: "32px 32px", position: "relative" }}>
            <pre
              style={{
                margin: 0,
                fontFamily: MONO,
                fontSize: 34,
                lineHeight: 1.6,
                color: NIGHT.red,
                position: "relative",
                display: "inline-block",
              }}
            >
              User-agent: Googlebot{"\n"}Disallow: /{/* barre rouge en travers du bloc bloqué */}
              <span
                style={{
                  position: "absolute",
                  left: -6,
                  right: -6,
                  top: "50%",
                  height: 4,
                  background: NIGHT.red,
                  transform: "translateY(-50%)",
                }}
              />
            </pre>
          </div>
        </div>

        <p
          style={{
            fontFamily: FONTS.hanken,
            fontSize: 28,
            fontWeight: 600,
            color: NIGHT.whiteSoft,
            marginTop: 36,
            marginBottom: 0,
            display: "flex",
            alignItems: "flex-start",
            gap: 12,
          }}
        >
          <span style={{ color: NIGHT.red, fontSize: 30, lineHeight: 1 }}>✕</span>
          <span>
            Te coupe de <strong style={{ color: NIGHT.white }}>Google Search</strong> ET des{" "}
            <strong style={{ color: NIGHT.white }}>AI Overviews</strong>.
          </span>
        </p>
      </div>
    </NightShell>
  );
}

function Dot({ color }: { color: string }) {
  return <span style={{ width: 14, height: 14, borderRadius: 9999, background: color }} />;
}
