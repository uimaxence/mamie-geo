"use client";

import { useEffect, useState } from "react";

// Barre fixe en haut de page qui suit le scroll de l'article. Bon
// boost UX, ~30 lignes, n'impacte pas le LCP (rendue après mount).
// Couleur accent terracotta pour rester dans le langage Mamie GEO.

export function ReadingProgress() {
  const [progress, setProgress] = useState(0);

  useEffect(() => {
    function compute() {
      const doc = document.documentElement;
      const total = doc.scrollHeight - doc.clientHeight;
      if (total <= 0) {
        setProgress(0);
        return;
      }
      const pct = Math.min(100, Math.max(0, (doc.scrollTop / total) * 100));
      setProgress(pct);
    }
    compute();
    window.addEventListener("scroll", compute, { passive: true });
    window.addEventListener("resize", compute);
    return () => {
      window.removeEventListener("scroll", compute);
      window.removeEventListener("resize", compute);
    };
  }, []);

  return (
    <div
      aria-hidden
      className="pointer-events-none fixed inset-x-0 top-0 z-50 h-[3px] bg-transparent"
    >
      <div
        className="h-full bg-[color:var(--color-accent)] transition-[width] duration-150 ease-out"
        style={{ width: `${progress}%` }}
      />
    </div>
  );
}
