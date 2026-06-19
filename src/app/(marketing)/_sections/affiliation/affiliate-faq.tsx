import { Plus } from "lucide-react";
import { Section } from "@/components/ui";

// FAQ affiliation, même implémentation <details> natif que la FAQ home
// (accessible, sans JS). Contenu cadré sur le modèle acté 2026-06-19
// (doc 09) : 40 % Solo / 25 % Starter / Pro exclus.

const QUESTIONS = [
  {
    q: "Combien je gagne exactement ?",
    a: "40 % de chaque abonnement Solo (9,99 €) que tu génères, soit ~4 € par mois et par client, à vie tant qu'il reste abonné. Sur un abonnement Starter (49 €), tu touches 25 %, soit 12,25 €/mois. Les plans Pro et Agency sont gérés à part, via le programme partenaire agence.",
  },
  {
    q: "« À vie », c'est vraiment à vie ?",
    a: "Oui. Tant que le client que tu as parrainé reste abonné, tu touches ta commission chaque mois. Pas de fenêtre de 12 mois, pas de dégressivité.",
  },
  {
    q: "Sur quels plans porte la commission ?",
    a: "Solo (40 %) et Starter (25 %). Pro et Agency ne sont pas dans l'affiliation grand public : ce sont des contrats plus gros qui passent par le programme partenaire agence, avec un accompagnement dédié. Écris-nous si c'est ton cas.",
  },
  {
    q: "Quand et comment suis-je payé ?",
    a: "Mensuellement, une fois la période d'essai du client convertie en abonnement payant. Le détail des seuils et du moyen de versement t'est communiqué à la validation de ta candidature.",
  },
  {
    q: "Qui peut devenir affilié ?",
    a: "Consultants et freelances SEO, créateurs de contenu marketing, formateurs IA, newsletters, agences : toute personne avec une audience FR qui croise des marques soucieuses de leur visibilité dans les IA. On valide chaque candidature à la main.",
  },
  {
    q: "Qu'est-ce que je n'ai pas le droit de faire ?",
    a: "Pas d'enchères sur la marque « Mamie GEO » en publicité, pas de spam, pas de fausses promesses sur le produit, pas d'auto-parrainage. On veut une promotion honnête, alignée avec notre ton. Le détail est dans les conditions du programme.",
  },
];

export function AffiliateFAQ() {
  return (
    <Section pad="xl" id="faq-affiliation">
      <div className="mx-auto max-w-3xl text-center">
        <span className="type-eyebrow">FAQ</span>
        <h2 className="type-h1 mt-3">Questions sur l&apos;affiliation.</h2>
        <p className="type-body mt-4">
          Une question qui n&apos;est pas là ?{" "}
          <a href="mailto:hello@mamie-geo.fr" className="link">
            écris-nous
          </a>
          .
        </p>
      </div>

      <div className="mx-auto mt-12 max-w-3xl">
        {QUESTIONS.map((item, idx) => (
          <details
            key={item.q}
            className={`group py-5 ${idx > 0 ? "border-t border-[color:var(--color-border)]" : ""}`}
          >
            <summary className="flex cursor-pointer list-none items-center justify-between gap-4">
              <span className="text-base font-medium text-[color:var(--color-ink)]">{item.q}</span>
              <span className="flex size-7 shrink-0 items-center justify-center rounded-full bg-[color:var(--color-gray-100)] text-[color:var(--color-ink-soft)] transition-transform group-open:rotate-45">
                <Plus size={14} strokeWidth={2.4} />
              </span>
            </summary>
            <p className="type-body mt-3 max-w-prose text-sm">{item.a}</p>
          </details>
        ))}
      </div>
    </Section>
  );
}
