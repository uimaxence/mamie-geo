import { ImageResponse } from "next/og";

// OG image site-wide (home, pricing, outils, légales…). Les articles de
// blog gardent leur image dynamique colocalisée qui override celle-ci.
//
// Réplique du hero de la home dans la DA app/marketing (doc 10) : fond
// blanc, cross-hairs CornerFrame, headline avec pastille ChatGPT (1ʳᵉ
// position du rotator, comme l'état prefers-reduced-motion), CTA noir
// pill + secondaire, microcopy garantie. Inter vendorisée dans
// `src/app/_og/` : satori ne résout pas les polices système, sans elle
// le titre tombait sur une serif.

// Edge obligatoire : le fetch d'asset local (`new URL(..., import.meta.url)`)
// n'est pas implémenté dans le runtime Node de next/og.
export const runtime = "edge";

export const alt = "Mamie GEO, mesure la visibilité de ta marque dans les IA";
export const size = { width: 1200, height: 630 };
export const contentType = "image/png";

// Tokens copiés de globals.css (satori ne lit pas le CSS du site)
const INK = "#0a0a0a";
const INK_SOFT = "#404040";
const MUTED = "#737373";
const BORDER_STRONG = "#d4d4d4";
const CHATGPT_GREEN = "#16a34a";
const CHATGPT_GREEN_BG = "#f0fdf4";

// URLs en littéraux statiques obligatoires : le bundler n'inline les
// assets `new URL(..., import.meta.url)` que s'il peut les résoudre au build.
async function loadFont(url: URL): Promise<ArrayBuffer> {
  const res = await fetch(url);
  return res.arrayBuffer();
}

function CornerMark({ top, left }: { top: number; left: number }) {
  return (
    <div style={{ position: "absolute", top, left, width: 20, height: 20, display: "flex" }}>
      <div
        style={{
          position: "absolute",
          top: 9,
          left: 0,
          width: 20,
          height: 1,
          background: BORDER_STRONG,
        }}
      />
      <div
        style={{
          position: "absolute",
          top: 0,
          left: 9,
          width: 1,
          height: 20,
          background: BORDER_STRONG,
        }}
      />
    </div>
  );
}

export default async function Image() {
  const [inter400, inter500, inter600, inter700] = await Promise.all([
    loadFont(new URL("./_og/inter-latin-400.woff", import.meta.url)),
    loadFont(new URL("./_og/inter-latin-500.woff", import.meta.url)),
    loadFont(new URL("./_og/inter-latin-600.woff", import.meta.url)),
    loadFont(new URL("./_og/inter-latin-700.woff", import.meta.url)),
  ]);

  return new ImageResponse(
    <div
      style={{
        width: "100%",
        height: "100%",
        display: "flex",
        flexDirection: "column",
        alignItems: "center",
        justifyContent: "center",
        background: "#ffffff",
        fontFamily: "Inter",
        position: "relative",
      }}
    >
      {/* Cross-hairs CornerFrame, cadre virtuel inset 64px */}
      <CornerMark top={54} left={54} />
      <CornerMark top={54} left={1126} />
      <CornerMark top={556} left={54} />
      <CornerMark top={556} left={1126} />

      {/* Logo + nom, comme la nav */}
      <div
        style={{
          display: "flex",
          alignItems: "center",
          gap: 13,
          fontSize: 27,
          fontWeight: 600,
          color: "#171717",
          marginBottom: 44,
        }}
      >
        <div
          style={{
            display: "flex",
            width: 42,
            height: 42,
            borderRadius: 12,
            background: "#329cff",
            color: "#fff",
            alignItems: "center",
            justifyContent: "center",
            fontSize: 25,
            fontWeight: 700,
          }}
        >
          M
        </div>
        Mamie GEO
      </div>

      {/* Headline du hero, pastille ChatGPT inline (1ʳᵉ du rotator) */}
      <div
        style={{
          display: "flex",
          alignItems: "center",
          gap: 20,
          fontSize: 72,
          fontWeight: 700,
          color: INK,
          letterSpacing: "-0.03em",
          lineHeight: 1.05,
        }}
      >
        Sache enfin si
        <div
          style={{
            display: "flex",
            alignItems: "center",
            gap: 12,
            padding: "8px 28px",
            borderRadius: 999,
            background: CHATGPT_GREEN_BG,
            color: CHATGPT_GREEN,
            fontSize: 44,
            fontWeight: 600,
            letterSpacing: "-0.02em",
          }}
        >
          <svg
            width="34"
            height="34"
            viewBox="0 0 24 24"
            fill="none"
            stroke={CHATGPT_GREEN}
            strokeWidth="2.2"
            strokeLinecap="round"
            strokeLinejoin="round"
          >
            <path d="M7.9 20A9 9 0 1 0 4 16.1L2 22Z" />
          </svg>
          ChatGPT
        </div>
      </div>
      <div
        style={{
          display: "flex",
          fontSize: 72,
          fontWeight: 700,
          color: INK,
          letterSpacing: "-0.03em",
          lineHeight: 1.15,
        }}
      >
        parle de toi.
      </div>

      {/* Sous-titre du hero */}
      <div
        style={{
          display: "flex",
          marginTop: 28,
          maxWidth: 820,
          fontSize: 27,
          color: INK_SOFT,
          textAlign: "center",
          justifyContent: "center",
          lineHeight: 1.45,
        }}
      >
        Mamie GEO mesure quotidiennement la visibilité de ta marque dans les 5 IA grand public. En
        français, hébergé en Europe.
      </div>

      {/* CTAs : primaire noir pill + secondaire blanc bordé */}
      <div style={{ display: "flex", gap: 16, marginTop: 40 }}>
        <div
          style={{
            display: "flex",
            alignItems: "center",
            padding: "17px 36px",
            borderRadius: 999,
            background: INK,
            color: "#ffffff",
            fontSize: 25,
            fontWeight: 500,
          }}
        >
          Démarrer — 9,99 €/mois
        </div>
        <div
          style={{
            display: "flex",
            alignItems: "center",
            padding: "17px 36px",
            borderRadius: 999,
            background: "#ffffff",
            border: `1px solid ${BORDER_STRONG}`,
            color: INK,
            fontSize: 25,
            fontWeight: 500,
          }}
        >
          Voir la démo →
        </div>
      </div>

      {/* Microcopy garantie, comme sous les CTAs du hero */}
      <div style={{ display: "flex", marginTop: 30, fontSize: 20, color: MUTED }}>
        Garantie remboursement 14 jours · Sans engagement · Hébergé EU
      </div>
    </div>,
    {
      ...size,
      fonts: [
        { name: "Inter", data: inter400, weight: 400, style: "normal" },
        { name: "Inter", data: inter500, weight: 500, style: "normal" },
        { name: "Inter", data: inter600, weight: 600, style: "normal" },
        { name: "Inter", data: inter700, weight: 700, style: "normal" },
      ],
    },
  );
}
