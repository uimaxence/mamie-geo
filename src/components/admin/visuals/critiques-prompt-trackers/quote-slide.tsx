import { FONTS } from "../_primitives/tokens";
import { NIGHT, NightShell } from "../_primitives/night-shell";

// Image quote mono-slide (post 2026-06-16) — amplification de l'article
// « limites des prompt trackers ». Thèse : prompt tracking + analytics
// référent sont complémentaires (« + », pas « ou ») : l'un voit la
// citation, l'autre le clic. DA bleu nuit partagée (hors persona chaude).

interface Props {
  index: number;
  total: number;
}

export function QuoteSlide({ index, total }: Props) {
  return (
    <NightShell index={index} total={total} brandLockup="footer" eyebrow="GEO · LE DÉBAT">
      <div
        style={{
          flex: 1,
          display: "flex",
          flexDirection: "column",
          justifyContent: "center",
        }}
      >
        {/* Guillemet ouvrant décoratif */}
        <span
          style={{
            fontFamily: FONTS.fraunces,
            fontSize: 200,
            fontWeight: 900,
            lineHeight: 0.7,
            color: NIGHT.brandBlue,
            opacity: 0.85,
            marginBottom: 12,
          }}
        >
          &laquo;
        </span>

        <h1
          style={{
            fontFamily: FONTS.hanken,
            fontSize: 92,
            fontWeight: 700,
            lineHeight: 1.02,
            letterSpacing: "-0.03em",
            color: NIGHT.white,
            margin: 0,
            maxWidth: 900,
          }}
        >
          Les critiques des prompt trackers ont{" "}
          <span
            style={{
              borderBottom: `8px solid ${NIGHT.brandBlue}`,
              paddingBottom: 2,
            }}
          >
            raison
          </span>
          .
        </h1>

        <p
          style={{
            fontFamily: FONTS.hanken,
            fontSize: 46,
            fontWeight: 600,
            lineHeight: 1.22,
            color: NIGHT.green,
            margin: "44px 0 0",
            maxWidth: 840,
          }}
        >
          C&apos;est exactement pour ça qu&apos;on assume nos marges d&apos;erreur.
        </p>

        {/* Bande basse : complémentarité « + » (pas « ou »). */}
        <div
          style={{
            display: "flex",
            alignItems: "stretch",
            gap: 22,
            marginTop: 72,
          }}
        >
          <ComparisonCard
            label="Analytics référent"
            value="voit le clic"
            valueColor={NIGHT.white}
          />
          <div
            style={{
              display: "flex",
              alignItems: "center",
              justifyContent: "center",
              fontFamily: FONTS.hanken,
              fontSize: 64,
              fontWeight: 800,
              color: NIGHT.brandBlue,
              flexShrink: 0,
            }}
          >
            +
          </div>
          <ComparisonCard
            label="Prompt tracker"
            value="voit la citation"
            valueColor={NIGHT.green}
          />
        </div>
      </div>
    </NightShell>
  );
}

function ComparisonCard({
  label,
  value,
  valueColor,
}: {
  label: string;
  value: string;
  valueColor: string;
}) {
  return (
    <div
      style={{
        flex: 1,
        background: NIGHT.card,
        border: `1px solid ${NIGHT.cardBorder}`,
        borderRadius: 18,
        padding: "28px 32px",
        display: "flex",
        flexDirection: "column",
        gap: 12,
      }}
    >
      <span
        style={{
          fontSize: 22,
          fontWeight: 700,
          letterSpacing: "0.10em",
          textTransform: "uppercase",
          color: NIGHT.whiteFaint,
        }}
      >
        {label}
      </span>
      <span
        style={{
          display: "inline-flex",
          alignItems: "baseline",
          gap: 12,
          fontSize: 40,
          fontWeight: 700,
          color: valueColor,
          lineHeight: 1.05,
        }}
      >
        <span style={{ color: NIGHT.whiteFaint, fontWeight: 600 }}>&rarr;</span>
        {value}
      </span>
    </div>
  );
}
