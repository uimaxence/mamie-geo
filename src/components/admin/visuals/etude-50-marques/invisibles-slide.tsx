import { SlideShell } from "../_primitives/slide-shell";
import { COLORS, FONTS } from "../_primitives/tokens";

// Slide 02 — Résultat 1 : les géants quasi invisibles.
// Fond blanc v2, mot-clé « invisibles » en bleu brand (unique technique
// d'emphase), 4 cartes marque + score avec barre de progression.

interface Props {
  index: number;
  total: number;
}

const BRANDS = [
  { name: "CIC", score: 3.1 },
  { name: "TotalEnergies", score: 3.8 },
  { name: "Carrefour", score: 4.1 },
  { name: "La Banque Postale", score: 6.3 },
] as const;

export function InvisiblesSlide({ index, total }: Props) {
  return (
    <SlideShell index={index} total={total} background="white">
      <div style={{ flex: 1, display: "flex", flexDirection: "column", justifyContent: "center" }}>
        <p
          style={{
            fontFamily: FONTS.hanken,
            fontSize: 24,
            fontWeight: 700,
            letterSpacing: "0.16em",
            textTransform: "uppercase",
            color: COLORS.inkSoft,
            marginBottom: 28,
          }}
        >
          Résultat 1 / 3
        </p>

        <h1
          style={{
            fontFamily: FONTS.fraunces,
            fontSize: 88,
            fontWeight: 900,
            lineHeight: 1.0,
            letterSpacing: "-0.03em",
            color: COLORS.ink,
            margin: 0,
            maxWidth: 920,
          }}
        >
          Connues de tous. <span style={{ color: COLORS.brandBlue }}>Invisibles</span> pour les IA.
        </h1>

        <div style={{ display: "flex", flexDirection: "column", gap: 20, marginTop: 56 }}>
          {BRANDS.map(({ name, score }) => (
            <div
              key={name}
              style={{
                background: COLORS.white,
                border: `1px solid ${COLORS.sand}`,
                borderRadius: 28,
                padding: "26px 34px",
                display: "flex",
                alignItems: "center",
                gap: 28,
                boxShadow: "0 12px 28px -18px rgba(46, 38, 32, 0.22)",
              }}
            >
              <span
                style={{
                  fontFamily: FONTS.fraunces,
                  fontSize: 38,
                  fontWeight: 700,
                  color: COLORS.ink,
                  letterSpacing: "-0.02em",
                  width: 420,
                  flexShrink: 0,
                }}
              >
                {name}
              </span>
              <div
                style={{
                  flex: 1,
                  height: 18,
                  borderRadius: 9999,
                  background: COLORS.grayLine,
                  overflow: "hidden",
                }}
              >
                <div
                  style={{
                    // Échelle /100 : ces scores sont si bas que la barre
                    // vide EST le message.
                    width: `${score}%`,
                    minWidth: 14,
                    height: "100%",
                    borderRadius: 9999,
                    background: COLORS.terracotta,
                  }}
                />
              </div>
              <span
                style={{
                  fontFamily: FONTS.fraunces,
                  fontSize: 38,
                  fontWeight: 900,
                  color: COLORS.terracotta,
                  fontVariantNumeric: "tabular-nums",
                  width: 150,
                  textAlign: "right",
                  flexShrink: 0,
                }}
              >
                {score.toLocaleString("fr-FR")}
                <span style={{ fontSize: 26, fontWeight: 600, color: COLORS.inkSoft }}> /100</span>
              </span>
            </div>
          ))}
        </div>

        <p
          style={{
            fontFamily: FONTS.hanken,
            fontSize: 34,
            fontWeight: 500,
            lineHeight: 1.35,
            color: COLORS.inkSoft,
            marginTop: 52,
            maxWidth: 880,
          }}
        >
          11 marques sur 50 sont sous les 10/100. Quand on demande à une IA « quelle enseigne
          choisir », elles n&apos;existent pas. La notoriété TV ne sert à rien ici.
        </p>
      </div>
    </SlideShell>
  );
}
