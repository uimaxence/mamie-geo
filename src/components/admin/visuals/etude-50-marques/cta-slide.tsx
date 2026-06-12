import { SlideShell } from "../_primitives/slide-shell";
import { COLORS, FONTS } from "../_primitives/tokens";

// Slide 06 — CTA finale : lire l'étude complète sur le blog.
// Gabarit 🤝 « On en parle ? » — la seule slide du carrousel autorisée
// en full-bleed terracotta (linkedindesign.md § 2 règles v2).

interface Props {
  index: number;
  total: number;
}

const PERKS = [
  { title: "50", subtitle: "Le classement complet des marques" },
  { title: "5", subtitle: "Les scores détaillés par IA" },
  { title: "100 %", subtitle: "Méthodo publique et vérifiable" },
] as const;

export function CtaSlide({ index, total }: Props) {
  return (
    <SlideShell index={index} total={total} background="terracotta">
      <div style={{ flex: 1, display: "flex", flexDirection: "column", justifyContent: "center" }}>
        <p
          style={{
            fontFamily: FONTS.hanken,
            fontSize: 24,
            fontWeight: 700,
            letterSpacing: "0.16em",
            textTransform: "uppercase",
            color: "rgba(251, 244, 233, 0.78)",
            marginBottom: 28,
          }}
        >
          Et votre marque, elle en est où&nbsp;?
        </p>

        <h1
          style={{
            fontFamily: FONTS.fraunces,
            fontSize: 96,
            fontWeight: 900,
            lineHeight: 0.98,
            letterSpacing: "-0.035em",
            color: COLORS.cream,
            margin: 0,
            maxWidth: 900,
          }}
        >
          L&apos;étude complète est en{" "}
          <span style={{ fontStyle: "italic", color: COLORS.honey }}>libre accès.</span>
        </h1>

        <div style={{ display: "flex", flexDirection: "column", gap: 20, marginTop: 56 }}>
          {PERKS.map(({ title, subtitle }) => (
            <div key={subtitle} style={{ display: "flex", alignItems: "center", gap: 22 }}>
              <span
                style={{
                  display: "inline-flex",
                  alignItems: "center",
                  justifyContent: "center",
                  minWidth: 110,
                  height: 64,
                  padding: "0 20px",
                  borderRadius: 9999,
                  background: "rgba(251, 244, 233, 0.16)",
                  color: COLORS.honey,
                  fontFamily: FONTS.fraunces,
                  fontSize: 36,
                  fontWeight: 900,
                  letterSpacing: "-0.02em",
                  fontVariantNumeric: "tabular-nums",
                  flexShrink: 0,
                }}
              >
                {title}
              </span>
              <span
                style={{
                  fontFamily: FONTS.hanken,
                  fontSize: 34,
                  fontWeight: 600,
                  color: COLORS.cream,
                }}
              >
                {subtitle}
              </span>
            </div>
          ))}
        </div>

        <div
          style={{
            marginTop: 64,
            background: COLORS.cream,
            borderRadius: 28,
            padding: "32px 36px",
            display: "flex",
            alignItems: "center",
            gap: 20,
            boxShadow: "0 24px 48px -16px rgba(46, 38, 32, 0.3)",
          }}
        >
          <span
            style={{
              width: 64,
              height: 64,
              borderRadius: 9999,
              background: COLORS.terracotta,
              color: COLORS.cream,
              display: "inline-flex",
              alignItems: "center",
              justifyContent: "center",
              fontSize: 34,
              fontWeight: 700,
              fontFamily: FONTS.fraunces,
              flexShrink: 0,
            }}
          >
            →
          </span>
          <div style={{ minWidth: 0, flex: 1 }}>
            <p
              style={{
                fontFamily: FONTS.hanken,
                fontSize: 22,
                fontWeight: 700,
                letterSpacing: "0.14em",
                textTransform: "uppercase",
                color: COLORS.inkSoft,
                margin: 0,
              }}
            >
              Lien en commentaire — ou direct&nbsp;:
            </p>
            <p
              style={{
                fontFamily: FONTS.fraunces,
                fontSize: 33,
                fontWeight: 700,
                color: COLORS.ink,
                margin: 0,
                marginTop: 6,
                letterSpacing: "-0.015em",
                wordBreak: "break-all",
                lineHeight: 1.15,
              }}
            >
              mamie-geo.fr/blog/etude-visibilite-ia-50-marques-francaises
            </p>
          </div>
        </div>
      </div>
    </SlideShell>
  );
}
