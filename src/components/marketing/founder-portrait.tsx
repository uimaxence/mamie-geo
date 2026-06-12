import Image from "next/image";
import { cn } from "@/lib/utils";

// Portrait de Max (fondateur) — humanise les sections « parler avec
// moi » : /contact, offre accompagnement /pricing, upsells des scans.
// Image dans public/marketing/ (src/assets est gitignored), 800×800,
// optimisée par next/image au serve.

const PORTRAIT_SRC = "/marketing/maxence-cailleau.jpg";

export function FounderPortrait({
  size = 96,
  className,
}: {
  /** Diamètre en px. */
  size?: number;
  className?: string;
}) {
  return (
    <Image
      src={PORTRAIT_SRC}
      alt="Maxence Cailleau, fondateur de Mamie GEO"
      width={size}
      height={size}
      className={cn(
        "shrink-0 rounded-full border border-[color:var(--color-border)] object-cover shadow-[var(--shadow-sm)]",
        className,
      )}
    />
  );
}
