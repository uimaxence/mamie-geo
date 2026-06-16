import { Logo } from "@/components/marketing/logo";
import { COLORS, FONTS } from "./tokens";

// Entête de slide : logo + wordmark « mamie-geo » en haut à gauche,
// discret (~36 px de haut). Le logo SVG reste en bleu brand `#329CFF`
// sur fonds clairs (cream/sand/sage) pour préserver l'identité brand —
// passe en crème sur fonds sombres (terracotta) pour le contraste.
//
// (cf. linkedindesign.md § 5 Constantes de marque +
//  cf. doc 09 § 2026-06-05 « garde bien le bleu actuel comme couleur
//  primaire » Max)

interface BrandHeaderProps {
  /** Couleur du logo et du wordmark. Fournie par le SlideShell selon
   *  le thème de fond. Défaut : bleu brand. */
  tint?: string;
  /** Couleur du wordmark texte. Défaut : ink (sur fond clair) ou
   *  cream (sur fond sombre). */
  textColor?: string;
}

export function BrandHeader({ tint = COLORS.brandBlue, textColor = COLORS.ink }: BrandHeaderProps) {
  return (
    <div style={{ display: "inline-flex", alignItems: "center", gap: 10 }}>
      <Logo size={36} color={tint} />
      <span
        style={{
          fontFamily: FONTS.fraunces,
          fontWeight: 700,
          fontSize: 24,
          letterSpacing: "-0.02em",
          color: textColor,
        }}
      >
        mamie-geo
      </span>
    </div>
  );
}
