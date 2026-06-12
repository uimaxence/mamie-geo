import { SlideShell } from "../_primitives/slide-shell";
import { COLORS, FONTS } from "../_primitives/tokens";
import { Highlight } from "../_primitives/highlight";

// Slide 04 — Résultat 3 : les IA citent les comparateurs, pas votre site.
// Fond blanc v2, barres horizontales comparées, surligneur miel sur le
// chiffre choc 2,3 % (unique technique d'emphase de la slide).

interface Props {
  index: number;
  total: number;
}

const SOURCES = [
  { label: "Comparateurs", pct: 32, color: COLORS.brandBlue },
  { label: "Presse spécialisée", pct: 6, color: COLORS.inkSoft },
  { label: "Site de la marque", pct: 2.3, color: COLORS.terracotta },
] as const;

// Largeur de barre normalisée sur la plus grande valeur (32 %) pour
// que l'écart visuel reste lisible sur la slide.
const MAX_PCT = 32;

export function SourcesSlide({ index, total }: Props) {
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
          Résultat 3 / 3
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
          Seulement{" "}
          <Highlight color={COLORS.honey} textColor={COLORS.ink} padX={20} padY={6}>
            2,3&nbsp;%
          </Highlight>{" "}
          des sources citées sont le site de la marque.
        </h1>

        <p
          style={{
            fontFamily: FONTS.hanken,
            fontSize: 32,
            fontWeight: 500,
            color: COLORS.inkSoft,
            marginTop: 36,
            maxWidth: 860,
            lineHeight: 1.35,
          }}
        >
          Qui les IA citent-elles vraiment quand elles recommandent une
          marque&nbsp;?
        </p>

        <div style={{ display: "flex", flexDirection: "column", gap: 28, marginTop: 48 }}>
          {SOURCES.map(({ label, pct, color }) => (
            <div key={label} style={{ display: "flex", flexDirection: "column", gap: 12 }}>
              <div
                style={{
                  display: "flex",
                  justifyContent: "space-between",
                  alignItems: "baseline",
                }}
              >
                <span
                  style={{
                    fontFamily: FONTS.hanken,
                    fontSize: 32,
                    fontWeight: 700,
                    color: COLORS.ink,
                  }}
                >
                  {label}
                </span>
                <span
                  style={{
                    fontFamily: FONTS.fraunces,
                    fontSize: 44,
                    fontWeight: 900,
                    color,
                    fontVariantNumeric: "tabular-nums",
                    letterSpacing: "-0.02em",
                  }}
                >
                  {pct.toLocaleString("fr-FR")}&nbsp;%
                </span>
              </div>
              <div
                style={{
                  height: 26,
                  borderRadius: 9999,
                  background: COLORS.grayLine,
                  overflow: "hidden",
                }}
              >
                <div
                  style={{
                    width: `${(pct / MAX_PCT) * 100}%`,
                    minWidth: 18,
                    height: "100%",
                    borderRadius: 9999,
                    background: color,
                  }}
                />
              </div>
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
          Votre SEO on-site ne suffit plus. La visibilité IA se gagne chez
          les comparateurs et la presse de votre secteur.
        </p>
      </div>
    </SlideShell>
  );
}
