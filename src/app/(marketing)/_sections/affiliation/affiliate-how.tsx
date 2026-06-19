import { Link2, Megaphone, Wallet } from "lucide-react";
import { Section } from "@/components/ui";

// "Comment ça marche" du programme d'affiliation, 3 étapes (même
// langage visuel que la section home HowItWorks : eyebrow + h1 + 3 cards).
// Pas de mockups ici : c'est une page d'offre, pas une démo produit.

const STEPS = [
  {
    Icon: Link2,
    title: "Récupère ton lien",
    description:
      "Tu candidates en un email. On valide ton profil et on te donne un lien de parrainage unique et un code promo.",
  },
  {
    Icon: Megaphone,
    title: "Partage à ton audience",
    description:
      "Newsletter, LinkedIn, YouTube, formation, contenu SEO : tu en parles là où ton audience te suit déjà.",
  },
  {
    Icon: Wallet,
    title: "Touche 40 % à vie",
    description:
      "Chaque abonnement Solo généré te rapporte 40 % chaque mois, tant que le client reste. Versé chaque mois.",
  },
];

export function AffiliateHow() {
  return (
    <Section variant="tinted" pad="xl" id="comment-ca-marche">
      <div className="mx-auto max-w-3xl text-center">
        <span className="type-eyebrow">Processus</span>
        <h2 className="type-h1 mt-3">Comment ça marche ?</h2>
      </div>

      <ol className="mt-14 grid grid-cols-1 gap-6 lg:grid-cols-3">
        {STEPS.map((step) => (
          <li
            key={step.title}
            className="card-hover-warm relative flex flex-col rounded-[var(--radius-xl)] border border-[color:var(--color-border)] bg-white p-6"
          >
            <span className="flex size-11 items-center justify-center rounded-full bg-[color:var(--color-gray-100)] text-[color:var(--color-ink)]">
              <step.Icon size={20} strokeWidth={2.2} />
            </span>
            <h3 className="type-h3 mt-4">{step.title}</h3>
            <p className="type-body mt-2 text-sm">{step.description}</p>
          </li>
        ))}
      </ol>
    </Section>
  );
}
