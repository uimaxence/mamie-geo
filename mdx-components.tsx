import type { MDXComponents } from "mdx/types";
import type { ReactNode } from "react";
import { BlogFAQ } from "@/components/blog/blog-faq";
import {
  EtudeClassement,
  EtudeMoyennesPlateforme,
  EtudePositions,
  EtudeProfilMarque,
  EtudeSources,
} from "@/components/blog/etude-50-marques-charts";

// MDX components — mapping global pour que les .mdx rendent avec notre
// design system (cf. doc 10 § Direction). Tous les `<h1>` MDX appliquent
// la classe `.type-h1`, etc. Layout prose tenu sur une largeur lisible.
//
// Composants métier exposés globalement (cf. doc 09 § 2026-05-16) :
//   - <BlogFAQ items=[{q,a},…]/> — bloc FAQ accessible + JSON-LD auto
//   - <Etude*/> — charts CSS-only de l'étude 50 marques (doc 09 § 2026-06-11)
//
// Fichier au root (next to package.json) selon convention @next/mdx :
// https://nextjs.org/docs/app/building-your-application/configuring/mdx

export function useMDXComponents(components: MDXComponents): MDXComponents {
  return {
    h1: ({ children }) => <h1 className="type-h1 mt-12 mb-4">{children}</h1>,
    h2: ({ children, id }) => (
      <h2 id={id} className="type-h2 mt-12 mb-3">
        {children}
      </h2>
    ),
    h3: ({ children, id }) => (
      <h3 id={id} className="type-h3 mt-8 mb-2">
        {children}
      </h3>
    ),
    p: ({ children }) => <p className="type-body mt-4 max-w-prose">{children}</p>,
    ul: ({ children }) => (
      <ul className="mt-4 max-w-prose list-disc pl-6 text-[color:var(--color-ink-soft)] flex flex-col gap-1.5">
        {children}
      </ul>
    ),
    ol: ({ children }) => (
      <ol className="mt-4 max-w-prose list-decimal pl-6 text-[color:var(--color-ink-soft)] flex flex-col gap-1.5">
        {children}
      </ol>
    ),
    li: ({ children }) => <li className="leading-relaxed">{children}</li>,
    a: ({ href, children }) => (
      <a href={href} className="link">
        {children}
      </a>
    ),
    blockquote: ({ children }) => (
      <blockquote className="mt-6 max-w-prose border-l-2 border-[color:var(--color-ink)] pl-5 text-[color:var(--color-ink-soft)]">
        {children}
      </blockquote>
    ),
    code: ({ children }) => (
      <code className="rounded bg-[color:var(--color-gray-100)] px-1.5 py-0.5 text-[0.875em] text-[color:var(--color-ink)]">
        {children}
      </code>
    ),
    pre: ({ children }) => (
      <pre className="mt-4 max-w-prose overflow-x-auto rounded-[var(--radius-lg)] border border-[color:var(--color-border)] bg-[color:var(--color-gray-50)] p-4 text-sm">
        {children}
      </pre>
    ),
    table: ({ children }) => (
      <div className="mt-6 overflow-x-auto rounded-[var(--radius-lg)] border border-[color:var(--color-border)]">
        <table className="w-full border-collapse text-sm">{children}</table>
      </div>
    ),
    thead: ({ children }) => (
      <thead className="border-b border-[color:var(--color-border)] bg-[color:var(--color-gray-50)]">
        {children}
      </thead>
    ),
    th: ({ children }) => (
      <th className="px-3 py-2 text-left text-xs font-semibold text-[color:var(--color-ink)]">
        {children}
      </th>
    ),
    tr: ({ children }) => (
      <tr className="border-b border-[color:var(--color-border)] last:border-b-0">{children}</tr>
    ),
    td: ({ children }) => (
      <td className="px-3 py-2 align-top text-[color:var(--color-ink-soft)]">{children}</td>
    ),
    hr: () => <hr className="rule my-12 max-w-prose" />,
    strong: ({ children }: { children?: ReactNode }) => (
      <strong className="font-semibold text-[color:var(--color-ink)]">{children}</strong>
    ),
    // Composants métier blog exposés sans import explicite dans les .mdx.
    BlogFAQ,
    EtudeClassement,
    EtudeMoyennesPlateforme,
    EtudePositions,
    EtudeProfilMarque,
    EtudeSources,
    ...components,
  };
}
