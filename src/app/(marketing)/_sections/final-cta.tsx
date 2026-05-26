import { LinkButton } from "@/components/ui";

// Section CTA finale, juste avant le footer. Dernière chance avant
// bounce. Réutilise le pattern fond noir + halo radial terracotta de
// <PourquoiMaintenant> pour rester cohérent visuellement (deux sections
// noires dans la home : narrative au début, action à la fin).
//
// Sur fond noir, le variant `primary` (bg-ink) deviendrait invisible.
// On utilise donc `secondary` (bg-white, text-ink) pour le CTA principal
// → effet "bouton blanc inversé" qui ressort sur le noir. Le variant
// `ai` (gradient) marche tel quel.
//
// Cf. plan V0 belle home P0.7 (2026-05-26).

export function FinalCTA() {
  return (
    <section className="relative overflow-hidden bg-[color:var(--color-ink)] text-white">
      {/* Halo terracotta diffus, identique à PourquoiMaintenant pour
       * créer un rappel visuel entre les deux sections noires. */}
      <div aria-hidden className="pointer-events-none absolute inset-0">
        <div
          className="absolute -bottom-32 -left-32 size-[640px] rounded-full"
          style={{
            background:
              "radial-gradient(circle at center, rgba(197, 83, 46, 0.22) 0%, rgba(197, 83, 46, 0.08) 35%, transparent 65%)",
            filter: "blur(40px)",
          }}
        />
      </div>

      <div className="relative mx-auto flex max-w-3xl flex-col items-center px-6 py-20 text-center sm:py-24">
        <span className="type-eyebrow text-[color:var(--color-gray-500)]">Prêt à voir ?</span>
        <h2 className="type-display mt-4 text-white">
          Sache enfin si les IA parlent de toi.
        </h2>
        <p className="type-body-lg mt-6 max-w-xl text-[color:var(--color-gray-300)]">
          Mesure ta visibilité dans les 5 IA grand public en moins de 10 minutes. En français,
          hébergé en Europe.
        </p>
        <div className="mt-10 flex flex-wrap items-center justify-center gap-3">
          <LinkButton href="/pricing" variant="secondary" size="lg">
            Démarrer — 9,99&nbsp;€/mois
          </LinkButton>
          <LinkButton href="/outils/audit-technique" variant="ai" size="lg">
            Audit gratuit
          </LinkButton>
        </div>
        <p className="type-meta mt-6 text-[color:var(--color-gray-500)]">
          Garantie remboursement 14&nbsp;jours · Sans engagement · Hébergé EU
        </p>
      </div>
    </section>
  );
}
