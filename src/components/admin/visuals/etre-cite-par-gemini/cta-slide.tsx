import { FONTS } from "../_primitives/tokens";
import { NIGHT, NightShell } from "./night-shell";

// Slide 05 — CTA. Rappel cas français (AI Overviews pas déployés) +
// « Structure tes pages maintenant » + bouton « Guide complet → lien
// en commentaire ». Logo Mamie GEO agrandi en footer.

interface Props {
  index: number;
  total: number;
}

export function CtaSlide({ index, total }: Props) {
  return (
    <NightShell index={index} total={total} brandLockup="footer">
      <div style={{ flex: 1, display: "flex", flexDirection: "column", justifyContent: "center" }}>
        <span
          style={{
            display: "inline-flex",
            alignSelf: "flex-start",
            alignItems: "center",
            gap: 10,
            background: NIGHT.orangeSoft,
            color: NIGHT.orange,
            fontFamily: FONTS.hanken,
            fontSize: 22,
            fontWeight: 700,
            letterSpacing: "0.04em",
            padding: "12px 20px",
            borderRadius: 9999,
            marginBottom: 36,
          }}
        >
          🇫🇷 Juin 2026
        </span>

        <h2
          style={{
            fontFamily: FONTS.hanken,
            fontSize: 62,
            fontWeight: 700,
            lineHeight: 1.04,
            letterSpacing: "-0.035em",
            color: NIGHT.white,
            margin: "0 0 28px",
            maxWidth: 860,
          }}
        >
          En France, les AI Overviews ne sont{" "}
          <span style={{ color: NIGHT.orange }}>pas encore là</span>.
        </h2>

        <p
          style={{
            fontFamily: FONTS.hanken,
            fontSize: 40,
            fontWeight: 600,
            color: NIGHT.whiteSoft,
            margin: "0 0 56px",
            maxWidth: 760,
            lineHeight: 1.2,
          }}
        >
          L&apos;app Gemini, elle, est déjà là.{" "}
          <span style={{ color: NIGHT.green, fontWeight: 700 }}>
            Structure tes pages maintenant.
          </span>
        </p>

        <div
          style={{
            display: "inline-flex",
            alignSelf: "flex-start",
            alignItems: "center",
            gap: 18,
            background: NIGHT.brandBlue,
            color: "#06182F",
            fontFamily: FONTS.hanken,
            fontSize: 30,
            fontWeight: 700,
            padding: "22px 34px",
            borderRadius: 9999,
          }}
        >
          Guide complet
          <span
            style={{
              display: "inline-flex",
              alignItems: "center",
              justifyContent: "center",
              width: 44,
              height: 44,
              borderRadius: 9999,
              background: "#06182F",
              color: NIGHT.brandBlue,
              fontSize: 26,
            }}
          >
            →
          </span>
        </div>

        <span
          style={{
            fontFamily: FONTS.hanken,
            fontSize: 24,
            fontWeight: 500,
            color: NIGHT.whiteFaint,
            marginTop: 24,
          }}
        >
          lien dans le 1er commentaire
        </span>
      </div>
    </NightShell>
  );
}
