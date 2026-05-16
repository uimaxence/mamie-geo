import { Plus } from "lucide-react";
import { FaqJsonLd, type FaqItem } from "./json-ld";

// Composant <BlogFAQ> à utiliser dans le MDX d'un article :
//
//   <BlogFAQ items={[
//     { q: "Le GEO remplace-t-il le SEO ?", a: "Non, il s'ajoute." },
//     { q: "Combien ça coûte ?", a: "Dès 9,99 €/mois." },
//   ]} />
//
// Rend (1) une liste accessible de questions/réponses dépliables et
// (2) le JSON-LD FAQPage inline juste à côté. Boost GEO majeur :
// Google et les LLM citent en priorité les FAQ structured data.
//
// Server component — pas d'état interactif (HTML <details> natif gère
// l'ouverture/fermeture, clavier-friendly out-of-the-box).

export interface BlogFAQProps {
  items: FaqItem[];
}

export function BlogFAQ({ items }: BlogFAQProps) {
  if (items.length === 0) return null;

  return (
    <section
      aria-labelledby="blog-faq-heading"
      className="not-prose mt-12 rounded-[var(--radius-xl)] border border-[color:var(--color-border)] bg-[color:var(--color-gray-50)] p-6"
    >
      <h2 id="blog-faq-heading" className="type-h2 mb-2">
        Questions fréquentes
      </h2>
      <p className="type-meta">Réponses rapides aux questions reçues sur ce sujet.</p>

      <div className="mt-6 flex flex-col">
        {items.map((item, idx) => (
          <details
            key={item.q}
            className={`group py-4 ${idx > 0 ? "border-t border-[color:var(--color-border)]" : ""}`}
          >
            <summary className="flex cursor-pointer list-none items-center justify-between gap-4 text-base font-medium text-[color:var(--color-ink)]">
              <span>{item.q}</span>
              <span className="flex size-7 shrink-0 items-center justify-center rounded-full bg-white text-[color:var(--color-ink-soft)] shadow-[var(--shadow-sm)] transition-transform group-open:rotate-45">
                <Plus size={14} strokeWidth={2.4} />
              </span>
            </summary>
            <div className="type-body mt-3 max-w-prose text-sm">{item.a}</div>
          </details>
        ))}
      </div>

      <FaqJsonLd items={items} />
    </section>
  );
}
