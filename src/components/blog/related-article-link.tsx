"use client";

import Link from "next/link";
import type { ReactNode } from "react";
import { capture } from "@/lib/posthog-client";

// Wrapper client autour du Link pour capter blog_related_article_clicked
// (maillage interne entre articles). Le parent RelatedArticles reste
// server component pour minimiser le JS expédié sur la page article.

interface Props {
  fromSlug: string;
  toSlug: string;
  children: ReactNode;
}

export function RelatedArticleLink({ fromSlug, toSlug, children }: Props) {
  return (
    <Link
      href={`/blog/${toSlug}`}
      className="group flex h-full flex-col rounded-[var(--radius-lg)] border border-[color:var(--color-border)] bg-white p-5 transition hover:border-[color:var(--color-border-strong)]"
      onClick={() =>
        capture("blog_related_article_clicked", { from_slug: fromSlug, to_slug: toSlug })
      }
    >
      {children}
    </Link>
  );
}
