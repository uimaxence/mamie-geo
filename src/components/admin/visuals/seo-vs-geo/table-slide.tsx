import { SlideShell } from "../_primitives/slide-shell";
import { COLORS, FONTS } from "../_primitives/tokens";
import { Daisy } from "../_primitives/daisy";

// Slide 02 — Avant / Après (gabarit ⚖️ cf. linkedindesign.md § 6).
// Fond crème, split visuel SEO (côté terne pâle) vs GEO (côté
// terracotta/sauge). 4 contrastes clés (versions condensées des 6
// lignes originales pour aérer en DA Mamie).
//
// Le mot « GEO » apparaît en bleu brand `#329CFF` pour garder
// l'identité brand (Max 2026-06-05).

interface Props {
  index: number;
  total: number;
}

interface Comparison {
  axis: string;
  seo: string;
  geo: string;
}

const COMPARISONS: Comparison[] = [
  { axis: "Tu optimises…", seo: "une URL", geo: "ta marque" },
  { axis: "Tu mesures…", seo: "ta position", geo: "ta part de citation" },
  { axis: "Ton levier…", seo: "backlinks + contenu", geo: "autorité + structure" },
  { axis: "Le délai…", seo: "3 à 6 mois", geo: "2 sem. à 18 mois" },
];

export function TableSlide({ index, total }: Props) {
  return (
    <SlideShell index={index} total={total} background="cream">
      <Daisy
        size={140}
        petalColor={COLORS.rose}
        centerColor={COLORS.honey}
        opacity={0.45}
        style={{ position: "absolute", top: 100, right: 60, pointerEvents: "none" }}
      />

      <div style={{ display: "flex", flexDirection: "column", gap: 28 }}>
        <h1
          style={{
            fontFamily: FONTS.fraunces,
            fontSize: 86,
            fontWeight: 900,
            lineHeight: 0.96,
            letterSpacing: "-0.03em",
            color: COLORS.ink,
            margin: 0,
            maxWidth: 760,
          }}
        >
          SEO et{" "}
          <span style={{ color: COLORS.brandBlue }}>GEO</span>{" "}
          <span style={{ fontStyle: "italic", fontWeight: 700 }}>
            ne se font pas la guerre.
          </span>
        </h1>

        <p
          style={{
            fontFamily: FONTS.hanken,
            fontSize: 26,
            fontWeight: 500,
            color: COLORS.inkSoft,
            margin: 0,
            maxWidth: 760,
            lineHeight: 1.4,
          }}
        >
          Ils se superposent. Voici ce qui change vraiment.
        </p>
      </div>

      <div
        style={{
          marginTop: 32,
          display: "grid",
          gridTemplateColumns: "1fr 1fr",
          gap: 18,
          flex: 1,
        }}
      >
        <ComparisonColumn
          title="SEO"
          subtitle="Google search"
          accent={COLORS.inkSoft}
          bg={COLORS.sand}
          textColor={COLORS.ink}
          axisColor={COLORS.inkSoft}
          items={COMPARISONS.map((c) => ({ axis: c.axis, value: c.seo }))}
        />
        <ComparisonColumn
          title="GEO"
          subtitle="Réponses IA"
          accent={COLORS.brandBlue}
          bg={COLORS.terracotta}
          textColor={COLORS.cream}
          axisColor="rgba(251, 244, 233, 0.78)"
          items={COMPARISONS.map((c) => ({ axis: c.axis, value: c.geo }))}
        />
      </div>

      <div
        style={{
          marginTop: 22,
          padding: "20px 24px",
          background: COLORS.honey,
          borderRadius: 22,
          display: "flex",
          alignItems: "center",
          gap: 16,
        }}
      >
        <span
          style={{
            fontFamily: FONTS.fraunces,
            fontSize: 44,
            fontWeight: 900,
            color: COLORS.ink,
            letterSpacing: "-0.03em",
            lineHeight: 1,
            flexShrink: 0,
          }}
        >
          ~80&nbsp;%
        </span>
        <span
          style={{
            fontFamily: FONTS.hanken,
            fontSize: 21,
            fontWeight: 600,
            color: COLORS.ink,
            lineHeight: 1.3,
          }}
        >
          des signaux d&apos;autorité sont communs aux deux.
          <span
            style={{
              display: "block",
              fontFamily: FONTS.fraunces,
              fontStyle: "italic",
              fontWeight: 500,
              color: COLORS.inkSoft,
              fontSize: 18,
              marginTop: 4,
            }}
          >
            Tu pars pas de zéro, tu ajoutes une couche.
          </span>
        </span>
      </div>
    </SlideShell>
  );
}

interface ComparisonColumnProps {
  title: string;
  subtitle: string;
  accent: string;
  bg: string;
  textColor: string;
  axisColor: string;
  items: { axis: string; value: string }[];
}

function ComparisonColumn({
  title,
  subtitle,
  accent,
  bg,
  textColor,
  axisColor,
  items,
}: ComparisonColumnProps) {
  return (
    <div
      style={{
        background: bg,
        borderRadius: 28,
        padding: "26px 26px 22px",
        display: "flex",
        flexDirection: "column",
        gap: 16,
      }}
    >
      <div style={{ display: "flex", alignItems: "baseline", gap: 10 }}>
        <span
          style={{
            fontFamily: FONTS.fraunces,
            fontSize: 44,
            fontWeight: 900,
            letterSpacing: "-0.03em",
            color: accent,
            lineHeight: 1,
          }}
        >
          {title}
        </span>
        <span
          style={{
            fontFamily: FONTS.hanken,
            fontSize: 13,
            fontWeight: 700,
            letterSpacing: "0.12em",
            textTransform: "uppercase",
            color: axisColor,
          }}
        >
          {subtitle}
        </span>
      </div>
      <div style={{ display: "flex", flexDirection: "column", gap: 12, flex: 1 }}>
        {items.map((it) => (
          <div
            key={it.axis}
            style={{
              display: "flex",
              flexDirection: "column",
              gap: 2,
              paddingTop: 10,
              borderTop: `1px solid ${axisColor === "rgba(251, 244, 233, 0.78)" ? "rgba(251, 244, 233, 0.22)" : "rgba(46, 38, 32, 0.10)"}`,
            }}
          >
            <span
              style={{
                fontFamily: FONTS.hanken,
                fontSize: 12,
                fontWeight: 700,
                letterSpacing: "0.1em",
                textTransform: "uppercase",
                color: axisColor,
              }}
            >
              {it.axis}
            </span>
            <span
              style={{
                fontFamily: FONTS.fraunces,
                fontSize: 24,
                fontWeight: 700,
                color: textColor,
                lineHeight: 1.2,
              }}
            >
              {it.value}
            </span>
          </div>
        ))}
      </div>
    </div>
  );
}
