"use client";

import { useEffect, useRef } from "react";
import { capture } from "@/lib/posthog-client";

// Tracker invisible monté sur chaque page article. Capte :
//   - blog_article_viewed (1 fois au mount)
//   - blog_article_scroll_depth (paliers 25/50/75/100, dédupliqués
//     via une Set ref → 1 event max par palier par session lecture)
// Aucun rendu visuel — la barre de progression vit toujours dans
// reading-progress.tsx pour ne pas mélanger UI et instrumentation.

interface Props {
  slug: string;
  category: string;
  readingTimeMin: number;
}

const DEPTH_THRESHOLDS = [25, 50, 75, 100] as const;

export function ArticleAnalytics({ slug, category, readingTimeMin }: Props) {
  const fired = useRef<Set<number>>(new Set());

  useEffect(() => {
    capture("blog_article_viewed", {
      slug,
      category,
      reading_time_min: readingTimeMin,
    });
  }, [slug, category, readingTimeMin]);

  useEffect(() => {
    let ticking = false;
    function onScroll() {
      if (ticking) return;
      ticking = true;
      requestAnimationFrame(() => {
        const doc = document.documentElement;
        const total = doc.scrollHeight - doc.clientHeight;
        if (total > 0) {
          const pct = Math.min(100, Math.max(0, (doc.scrollTop / total) * 100));
          for (const threshold of DEPTH_THRESHOLDS) {
            if (pct >= threshold && !fired.current.has(threshold)) {
              fired.current.add(threshold);
              capture("blog_article_scroll_depth", { slug, depth: threshold });
            }
          }
        }
        ticking = false;
      });
    }
    window.addEventListener("scroll", onScroll, { passive: true });
    return () => window.removeEventListener("scroll", onScroll);
  }, [slug]);

  return null;
}
