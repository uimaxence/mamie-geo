import { FONTS } from "../_primitives/tokens";
import { NIGHT, NightShell } from "./night-shell";

// Slide 02 — Schéma 2 blocs : Googlebot (accès + indexation, vert/coché)
// ≠ Google-Extended (usage IA / entraînement, orange). Légende :
// « Les confondre, c'est se supprimer de Google. »

interface Props {
  index: number;
  total: number;
}

export function BotsSlide({ index, total }: Props) {
  return (
    <NightShell index={index} total={total}>
      <div style={{ flex: 1, display: "flex", flexDirection: "column", justifyContent: "center" }}>
        <h2
          style={{
            fontFamily: FONTS.hanken,
            fontSize: 56,
            fontWeight: 700,
            lineHeight: 1.05,
            letterSpacing: "-0.03em",
            color: NIGHT.white,
            margin: "0 0 48px",
            maxWidth: 820,
          }}
        >
          Deux trousseaux de clés.
          <br />
          On les confond tout le temps.
        </h2>

        <div style={{ display: "flex", alignItems: "stretch", gap: 24 }}>
          <BotCard
            accent={NIGHT.green}
            accentSoft={NIGHT.greenSoft}
            badge="✓"
            name="Googlebot"
            role="Accès + indexation"
            note="Le canal Google Search que tu travailles depuis des années."
          />

          <div
            style={{
              display: "flex",
              flexDirection: "column",
              alignItems: "center",
              justifyContent: "center",
              flexShrink: 0,
            }}
          >
            <span
              style={{
                fontFamily: FONTS.hanken,
                fontSize: 64,
                fontWeight: 700,
                color: NIGHT.white,
              }}
            >
              ≠
            </span>
          </div>

          <BotCard
            accent={NIGHT.orange}
            accentSoft={NIGHT.orangeSoft}
            badge="AI"
            name="Google-Extended"
            role="Usage IA / entraînement"
            note="Le seul levier anti-entraînement. Ne touche ni ton rang, ni les AI Overviews."
          />
        </div>

        <p
          style={{
            fontFamily: FONTS.hanken,
            fontSize: 30,
            fontWeight: 600,
            color: NIGHT.whiteSoft,
            marginTop: 48,
            marginBottom: 0,
          }}
        >
          Les confondre, c&apos;est se{" "}
          <span style={{ color: NIGHT.red, fontWeight: 700 }}>
            supprimer de Google en entier
          </span>
          .
        </p>
      </div>
    </NightShell>
  );
}

function BotCard({
  accent,
  accentSoft,
  badge,
  name,
  role,
  note,
}: {
  accent: string;
  accentSoft: string;
  badge: string;
  name: string;
  role: string;
  note: string;
}) {
  return (
    <div
      style={{
        flex: 1,
        background: NIGHT.card,
        border: `1px solid ${accent}`,
        borderRadius: 20,
        padding: "32px 30px",
        display: "flex",
        flexDirection: "column",
        gap: 14,
      }}
    >
      <span
        style={{
          display: "inline-flex",
          alignItems: "center",
          justifyContent: "center",
          width: 56,
          height: 56,
          borderRadius: 14,
          background: accentSoft,
          color: accent,
          fontFamily: FONTS.hanken,
          fontSize: 26,
          fontWeight: 700,
        }}
      >
        {badge}
      </span>
      <span
        style={{
          fontFamily: FONTS.hanken,
          fontSize: 34,
          fontWeight: 700,
          color: NIGHT.white,
          letterSpacing: "-0.02em",
        }}
      >
        {name}
      </span>
      <span style={{ fontFamily: FONTS.hanken, fontSize: 24, fontWeight: 700, color: accent }}>
        {role}
      </span>
      <span
        style={{
          fontFamily: FONTS.hanken,
          fontSize: 21,
          fontWeight: 400,
          color: NIGHT.whiteSoft,
          lineHeight: 1.35,
        }}
      >
        {note}
      </span>
    </div>
  );
}
