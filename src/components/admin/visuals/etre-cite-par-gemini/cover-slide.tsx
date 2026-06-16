import { FONTS } from "../_primitives/tokens";
import { NIGHT, NightShell } from "./night-shell";

// Slide 01 — Couverture. Gros titre blanc sans-serif + sous-titre
// « Ton SEO = ta porte d'entrée » + logo Mamie GEO agrandi en bas.

interface Props {
  index: number;
  total: number;
}

export function CoverSlide({ index, total }: Props) {
  return (
    <NightShell index={index} total={total} brandLockup="footer">
      <div
        style={{
          flex: 1,
          display: "flex",
          flexDirection: "column",
          justifyContent: "center",
        }}
      >
        <span
          style={{
            fontFamily: FONTS.hanken,
            fontSize: 22,
            fontWeight: 700,
            letterSpacing: "0.16em",
            textTransform: "uppercase",
            color: NIGHT.brandBlue,
            marginBottom: 30,
          }}
        >
          La checklist robots.txt
        </span>

        <h1
          style={{
            fontFamily: FONTS.hanken,
            fontSize: 104,
            fontWeight: 700,
            lineHeight: 0.98,
            letterSpacing: "-0.035em",
            color: NIGHT.white,
            margin: 0,
            maxWidth: 880,
          }}
        >
          Être cité par <span style={{ color: NIGHT.brandBlue }}>Gemini</span>
        </h1>

        <p
          style={{
            fontFamily: FONTS.hanken,
            fontSize: 40,
            fontWeight: 500,
            color: NIGHT.whiteSoft,
            marginTop: 40,
            marginBottom: 0,
            maxWidth: 760,
            lineHeight: 1.25,
          }}
        >
          Ton SEO n&apos;est pas un canal à part.
          <br />
          C&apos;est ta{" "}
          <span
            style={{
              color: NIGHT.green,
              fontWeight: 700,
              borderBottom: `4px solid ${NIGHT.green}`,
              paddingBottom: 2,
            }}
          >
            porte d&apos;entrée
          </span>
          .
        </p>
      </div>
    </NightShell>
  );
}
