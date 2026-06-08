import { TrackedLinkButton } from "@/components/marketing/tracked-link-button";

// CTA final en bas de /demo. Récap court "tu viens de voir une démo,
// voici ce que tu obtiens en payant" + double CTA pricing / audit gratuit.

export function DemoFinalCta() {
  return (
    <section className="border-t border-[color:var(--color-border)] bg-[color:var(--color-gray-50)]">
      <div className="mx-auto max-w-3xl px-6 py-16 text-center sm:py-20 lg:px-10">
        <span className="type-eyebrow">C&apos;est tout ce que tu as vu, mais avec ta marque</span>
        <h2 className="type-h1 mt-4">Tu peux avoir le même rapport pour ta propre marque.</h2>
        <p className="type-body-lg mt-6 max-w-xl mx-auto">
          Setup en 3 minutes (nom + domaine + concurrents). Premier batch de runs disponible sous
          24 h. Garantie remboursement 14 jours.
        </p>
        <div className="mt-10 flex flex-wrap items-center justify-center gap-3">
          <TrackedLinkButton
            href="/pricing"
            variant="primary"
            size="lg"
            trackEvent="demo_cta_clicked"
            trackProperties={{ cta_label: "Démarrer 9,99 €/mois", section: "final" }}
          >
            Démarrer — 9,99&nbsp;€/mois
          </TrackedLinkButton>
          <TrackedLinkButton
            href="/outils/audit-technique"
            variant="ai"
            size="lg"
            trackEvent="demo_cta_clicked"
            trackProperties={{ cta_label: "Audit gratuit", section: "final" }}
          >
            Audit gratuit d&apos;abord
          </TrackedLinkButton>
        </div>
        <p className="type-meta mt-6">
          Garantie remboursement 14&nbsp;jours · Sans engagement · Hébergé EU
        </p>
      </div>
    </section>
  );
}
