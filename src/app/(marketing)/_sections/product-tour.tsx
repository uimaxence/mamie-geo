import Image from "next/image";
import { CornerFrame, Section } from "@/components/ui";

// Section "Product tour" avec captures réelles du dashboard (cf. plan
// V0 P0.5 belle home, 2026-05-26).
//
// ⚠️ EN ATTENTE DES CAPTURES MAX ⚠️
// Pour activer ce composant :
//   1. pnpm seed:demo (crée "La Maison Verte" + 30j de metrics)
//   2. pnpm dev → login demo@mamie-geo.fr → capturer 1440×900 :
//        - /app/dashboard           → dashboard.webp
//        - /app/prompts             → prompts.webp
//        - /app/competitors         → competitors.webp
//        - /app/prompts/[id]        → run-detail.webp
//   3. Compresser : cwebp -q 85 in.png -o out.webp
//   4. Déposer dans public/marketing/dashboard/
//   5. Ajouter <ProductTour /> dans src/app/(marketing)/page.tsx
//      entre <TesOutils /> et <PourQui />
//
// Layout : split 2 cols sur md. À gauche : copy + 3 mini-captures
// empilées. À droite : grande capture dashboard avec CornerFrame.

const SCREENSHOTS = {
  dashboard: { src: "/marketing/dashboard/dashboard.webp", alt: "Dashboard Mamie GEO : score visibilité, évolution 30 jours, breakdown par LLM" },
  prompts: { src: "/marketing/dashboard/prompts.webp", alt: "Liste des prompts trackés avec statut par LLM" },
  competitors: { src: "/marketing/dashboard/competitors.webp", alt: "Page concurrents avec part de voix comparative" },
  runDetail: { src: "/marketing/dashboard/run-detail.webp", alt: "Détail d'un run : réponse LLM, citations détectées, sentiment" },
} as const;

export function ProductTour() {
  return (
    <Section pad="xl" aria-label="Aperçu du produit">
      <div className="mx-auto max-w-3xl text-center">
        <span className="type-eyebrow">Aperçu produit</span>
        <h2 className="type-h1 mt-3">Voici à quoi ressemble ton dashboard.</h2>
        <p className="type-body-lg mt-4">
          Capturé en condition réelle sur une boutique e-commerce de démo. Pas un mockup, pas un
          Figma — c&apos;est l&apos;app que tu utiliseras dès ton premier login.
        </p>
      </div>

      {/* Grande capture principale, CornerFrame signature pour rappeler
       * le hero. Aspect 16:10 (1440×900). */}
      <div className="mx-auto mt-12 max-w-5xl">
        <CornerFrame className="relative">
          <div className="relative aspect-[1440/900] overflow-hidden rounded-[var(--radius-xl)] border border-[color:var(--color-border)] bg-[color:var(--color-gray-50)] shadow-[var(--shadow-lg)]">
            <Image
              src={SCREENSHOTS.dashboard.src}
              alt={SCREENSHOTS.dashboard.alt}
              fill
              sizes="(min-width: 1024px) 960px, 100vw"
              className="object-cover"
              priority={false}
            />
          </div>
        </CornerFrame>
      </div>

      {/* Grille 3 mini-captures (prompts / competitors / run detail) */}
      <div className="mx-auto mt-8 grid max-w-5xl grid-cols-1 gap-4 md:grid-cols-3">
        {(["prompts", "competitors", "runDetail"] as const).map((key) => {
          const s = SCREENSHOTS[key];
          return (
            <div
              key={key}
              className="relative aspect-[16/10] overflow-hidden rounded-[var(--radius-lg)] border border-[color:var(--color-border)] bg-[color:var(--color-gray-50)] shadow-[var(--shadow-md)]"
            >
              <Image
                src={s.src}
                alt={s.alt}
                fill
                sizes="(min-width: 768px) 320px, 100vw"
                className="object-cover"
              />
            </div>
          );
        })}
      </div>
    </Section>
  );
}
