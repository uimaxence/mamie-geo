"use client";

import { useEffect, useState } from "react";

// Table of Contents sticky desktop, extraction des h2/h3 directement
// depuis le DOM rendu (les ids sont posés par `rehype-slug`).
//
// Le scan DOM se fait dans un useEffect APRÈS mount, pas dans un lazy
// initializer useState : sinon le serveur rend `null` (pas de `document`)
// pendant que le client trouve les headings, ce qui crée un mismatch
// d'hydratation et React conserve la sortie serveur vide (TOC invisible).
// Avec l'effet, le 1er render SSR et le 1er render client sont identiques
// (vides), puis l'état se remplit. Le 2e effet gère l'IntersectionObserver
// pour le highlight actif.

interface Heading {
  id: string;
  text: string;
  level: 2 | 3;
}

function parseHeadings(): Heading[] {
  if (typeof document === "undefined") return [];
  const container = document.querySelector<HTMLElement>("[data-blog-content]");
  if (!container) return [];
  const nodes = container.querySelectorAll<HTMLHeadingElement>("h2[id], h3[id]");
  return Array.from(nodes).map((n) => ({
    id: n.id,
    text: n.textContent ?? "",
    level: n.tagName === "H2" ? 2 : 3,
  }));
}

export function TOC() {
  const [headings, setHeadings] = useState<Heading[]>([]);
  const [activeId, setActiveId] = useState<string | null>(null);

  // Parse le DOM après mount (le contenu MDX est déjà rendu côté serveur,
  // donc présent dès le 1er render client). C'est un cas légitime de
  // synchronisation depuis un système externe (le DOM), d'où le disable.
  useEffect(() => {
    const parsed = parseHeadings();
    // eslint-disable-next-line react-hooks/set-state-in-effect -- lecture DOM post-mount, voir commentaire d'en-tête
    setHeadings(parsed);
    setActiveId(parsed[0]?.id ?? null);
  }, []);

  useEffect(() => {
    if (headings.length === 0) return;
    const container = document.querySelector<HTMLElement>("[data-blog-content]");
    if (!container) return;
    const nodes = container.querySelectorAll<HTMLHeadingElement>("h2[id], h3[id]");

    const observer = new IntersectionObserver(
      (entries) => {
        const visible = entries
          .filter((e) => e.isIntersecting)
          .sort((a, b) => a.boundingClientRect.top - b.boundingClientRect.top);
        const top = visible[0];
        if (top) setActiveId(top.target.id);
      },
      { rootMargin: "-20% 0px -70% 0px", threshold: 0 },
    );
    nodes.forEach((n) => observer.observe(n));
    return () => observer.disconnect();
  }, [headings]);

  if (headings.length === 0) return null;

  return (
    <nav aria-label="Sommaire de l'article" className="sticky top-24 hidden self-start lg:block">
      <p className="type-eyebrow mb-3">Sommaire</p>
      <ul className="flex flex-col gap-1.5 border-l border-[color:var(--color-border)]">
        {headings.map((h) => (
          <li key={h.id} className={h.level === 3 ? "ml-3" : ""}>
            <a
              href={`#${h.id}`}
              className={`-ml-px block border-l-2 py-1 pl-3 text-sm transition-colors ${
                activeId === h.id
                  ? "border-[color:var(--color-ink)] text-[color:var(--color-ink)]"
                  : "border-transparent text-[color:var(--color-muted)] hover:text-[color:var(--color-ink)]"
              }`}
            >
              {h.text}
            </a>
          </li>
        ))}
      </ul>
    </nav>
  );
}
