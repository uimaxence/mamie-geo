import { Plus } from "lucide-react";
import { Section } from "@/components/ui";

// FAQ — 12 questions du doc 10 § Composants obligatoires. Implémenté
// avec <details> natif HTML : accessible, fonctionne sans JS, et tient
// dans la direction minimaliste (pas de framework accordeon).

const QUESTIONS = [
  {
    q: "Quels LLMs sont trackés ?",
    a: "ChatGPT, Claude, Perplexity, Gemini et Le Chat de Mistral — les 5 IA grand public francophones. On utilise les APIs natives de chaque fournisseur, pas un proxy comme OpenRouter, pour mesurer ce que les utilisateurs voient réellement.",
  },
  {
    q: "Le Chat de Mistral est inclus dans tous les plans ?",
    a: "Oui, sans condition, dès le plan Starter à 49 €/mois. C'est notre différenciateur n°1 face aux outils anglo-saxons qui ne le trackent pas.",
  },
  {
    q: "Vous trackez les AI Overviews de Google ?",
    a: "Les AI Overviews font partie de Gemini, qu'on tracke via l'API Google AI. Le rendu peut différer du SERP exact mais la donnée source est la même.",
  },
  {
    q: "Comment vous comparez aux outils américains comme Profound ?",
    a: "Profound vise les grandes entreprises US à 500 $/mois avec SOC 2 et 8 LLMs. Mamie GEO vise les freelances et PME francophones à 49 €/mois avec 5 LLMs dont Le Chat. On n'est pas concurrents directs — on cible deux marchés différents.",
  },
  {
    q: "Mes données sont stockées où ?",
    a: "100 % en Europe : Vercel région Paris (cdg1) pour l'app, Neon Frankfurt pour la base de données, Cloudflare R2 EU pour les fichiers. Aucune donnée ne quitte l'UE.",
  },
  {
    q: "RGPD et conformité ?",
    a: "Oui, Mamie GEO est RGPD-compliant by design : hébergement EU, droit à l'effacement implémenté, registre de traitements à jour. Pas de tracking publicitaire, pas de revente de données.",
  },
  {
    q: "Je peux annuler à tout moment ?",
    a: "Oui. Annulation en 1 clic depuis ton compte, sans appel commercial. Tu gardes l'accès jusqu'à la fin de ta période en cours, puis tes données sont conservées 30 jours au cas où tu reviendrais.",
  },
  {
    q: "Vous proposez de la marque blanche ?",
    a: "Oui, sur le plan Agence. Rapports PDF avec ton logo et tes couleurs, envoi automatique hebdomadaire à tes clients, jusqu'à 25 marques trackées.",
  },
  {
    q: "Et si je ne suis pas satisfait ?",
    a: "Garantie 30 jours satisfait ou remboursé sans question. Tu envoies un email à hello@mamie-geo.fr et on procède au remboursement intégral sous 5 jours ouvrés.",
  },
  {
    q: "Vous proposez des essais gratuits ?",
    a: "14 jours d'essai gratuit sans carte bancaire. Tu testes l'outil complet, on ne te facture que si tu choisis de continuer.",
  },
  {
    q: "C'est compliqué à utiliser ?",
    a: "5 minutes pour s'inscrire. Tu donnes ton domaine, 1 à 5 concurrents, et Mamie GEO génère les prompts automatiquement. Premier rapport dans les 10 minutes suivantes.",
  },
  {
    q: "Pour qui c'est fait ?",
    a: "Freelances SEO, équipes marketing PME et agences SEO/marketing francophones. Si tu fais du B2B SaaS, e-commerce ou éducation et que tes prospects posent des questions sur les IA, c'est pour toi.",
  },
];

export function FAQ() {
  return (
    <Section pad="xl" id="faq">
      <div className="mx-auto max-w-3xl text-center">
        <span className="type-eyebrow">FAQ</span>
        <h2 className="type-h1 mt-3">Questions fréquentes.</h2>
        <p className="type-body mt-4">
          Si la tienne n&apos;est pas listée,{" "}
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
            <summary className="flex cursor-pointer items-center justify-between gap-4 list-none">
              <span className="text-base font-medium text-[color:var(--color-ink)]">{item.q}</span>
              <span className="flex shrink-0 size-7 items-center justify-center rounded-full bg-[color:var(--color-gray-100)] text-[color:var(--color-ink-soft)] transition-transform group-open:rotate-45">
                <Plus size={14} strokeWidth={2.4} />
              </span>
            </summary>
            <p className="type-body mt-3 text-sm max-w-prose">{item.a}</p>
          </details>
        ))}
      </div>
    </Section>
  );
}
