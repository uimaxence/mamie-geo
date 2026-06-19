import { TrackedLinkButton } from "@/components/marketing/tracked-link-button";
import { AFFILIATE_CONTACT_HREF } from "./constants";

// CTA final (fond noir + halo bleu brand), même pattern que la FinalCTA
// de la home pour rester cohérent. Sur fond noir, le CTA principal passe
// en variant secondary (bouton blanc inversé).

export function AffiliateFinalCTA() {
  return (
    <section className="relative overflow-hidden bg-[color:var(--color-ink)] text-white">
      <div aria-hidden className="pointer-events-none absolute inset-0">
        <div
          className="absolute -bottom-32 -left-32 size-[640px] rounded-full"
          style={{
            background:
              "radial-gradient(circle at center, rgba(50, 156, 255, 0.22) 0%, rgba(50, 156, 255, 0.08) 35%, transparent 65%)",
            filter: "blur(40px)",
          }}
        />
      </div>

      <div className="relative mx-auto flex max-w-3xl flex-col items-center px-6 py-20 text-center sm:py-24">
        <span className="type-eyebrow text-[color:var(--color-gray-400)]">Prêt à monétiser ton audience ?</span>
        <h2 className="type-display mt-4 text-white">Deviens affilié Mamie GEO.</h2>
        <p className="type-body-lg mt-6 max-w-xl text-[color:var(--color-gray-100)]">
          40 % à vie sur chaque abonnement Solo. Validation à la main, en français, paiement chaque
          mois.
        </p>
        <div className="mt-10">
          <TrackedLinkButton
            href={AFFILIATE_CONTACT_HREF}
            variant="secondary"
            size="lg"
            trackEvent="affiliate_cta_clicked"
            trackProperties={{ section: "final" }}
          >
            Envoyer ma candidature
          </TrackedLinkButton>
        </div>
      </div>
    </section>
  );
}
