import { Check, X } from "lucide-react";
import { Card, CardBody, Section } from "@/components/ui";

// Section "Sans Mamie GEO / Avec Mamie GEO" — pattern central doc 10
// § Composants obligatoires. Layout 2 colonnes, croix rouges à
// gauche, checks verts à droite. Sobre, pas de gradients, pas de
// fonds colorés — alignement strict avec direction Airbnb-like.

const SANS = [
  "Tu écris du contenu sans savoir si l'IA le voit",
  "Tes clients te demandent « et pour ChatGPT ? » et tu hausses les épaules",
  "Tu paies Profound 500 $/mois pour un outil 100 % anglais qui ne tracke pas Le Chat",
  "Tu fais des audits manuels prompt par prompt qui te prennent 4 h",
  "Tu découvres qu'un concurrent a percé dans les IA quand c'est trop tard",
  "Tu n'as aucun rapport pro à montrer à ton client ou ton boss",
];

const AVEC = [
  "Score de visibilité IA quotidien sur 5 moteurs dont Le Chat",
  "Comparaison directe avec tes 5 concurrents principaux",
  "Rapports automatiques en marque blanche pour tes clients (plan Agence)",
  "Recommandations actionnables : voilà ce qui manque pour être cité",
  "Alertes quand ton score chute ou qu'un concurrent te dépasse",
  "Le tout en français, hébergé en Europe, à 49 €/mois",
];

export function SansAvec() {
  return (
    <Section pad="xl" id="sans-avec">
      <div className="mx-auto max-w-3xl text-center">
        <span className="type-eyebrow">La différence</span>
        <h2 className="type-h1 mt-3">Avant Mamie GEO, après Mamie GEO.</h2>
        <p className="type-body mt-4 mx-auto max-w-2xl">
          Une fois que tu vois le score de visibilité de ta marque dans ChatGPT et Le Chat, tu ne
          peux plus revenir aux audits manuels.
        </p>
      </div>

      <div className="mt-14 grid grid-cols-1 gap-6 md:grid-cols-2">
        <Card>
          <CardBody>
            <h3 className="type-h3 flex items-center gap-2">
              <span className="text-[color:var(--color-error)]">Sans Mamie GEO</span>
            </h3>
            <ul className="mt-5 flex flex-col gap-3">
              {SANS.map((item) => (
                <li key={item} className="flex items-start gap-3 text-sm leading-relaxed">
                  <span className="mt-0.5 flex shrink-0 size-5 items-center justify-center rounded-full bg-[color:var(--color-error-bg)] text-[color:var(--color-error)]">
                    <X size={12} strokeWidth={3} />
                  </span>
                  <span className="text-[color:var(--color-ink-soft)]">{item}</span>
                </li>
              ))}
            </ul>
          </CardBody>
        </Card>

        <Card>
          <CardBody>
            <h3 className="type-h3 flex items-center gap-2">
              <span className="text-[color:var(--color-success)]">Avec Mamie GEO</span>
            </h3>
            <ul className="mt-5 flex flex-col gap-3">
              {AVEC.map((item) => (
                <li key={item} className="flex items-start gap-3 text-sm leading-relaxed">
                  <span className="mt-0.5 flex shrink-0 size-5 items-center justify-center rounded-full bg-[color:var(--color-success-bg)] text-[color:var(--color-success)]">
                    <Check size={12} strokeWidth={3} />
                  </span>
                  <span className="text-[color:var(--color-ink)]">{item}</span>
                </li>
              ))}
            </ul>
          </CardBody>
        </Card>
      </div>
    </Section>
  );
}
