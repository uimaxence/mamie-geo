import Link from "next/link";
import { ChevronLeft, ChevronRight } from "lucide-react";
import { cn } from "@/lib/utils";

// Pagination simple côté server : précédent/suivant via Next Link.
// L'appelant fournit `hrefFor(page)` pour construire les URLs (typiq.
// `?page=2`). Affichage compact : « Page X sur Y ».

export interface PaginationProps {
  currentPage: number;
  totalPages: number;
  hrefFor: (page: number) => string;
  className?: string;
}

export function Pagination({ currentPage, totalPages, hrefFor, className }: PaginationProps) {
  if (totalPages <= 1) return null;
  const hasPrev = currentPage > 1;
  const hasNext = currentPage < totalPages;

  return (
    <nav
      aria-label="Pagination"
      className={cn("flex items-center justify-between gap-4", className)}
    >
      <PageLink
        href={hasPrev ? hrefFor(currentPage - 1) : null}
        label="Précédent"
        direction="prev"
      />
      <span className="type-meta">
        Page <span className="font-medium text-[color:var(--color-ink)]">{currentPage}</span> sur{" "}
        {totalPages}
      </span>
      <PageLink href={hasNext ? hrefFor(currentPage + 1) : null} label="Suivant" direction="next" />
    </nav>
  );
}

function PageLink({
  href,
  label,
  direction,
}: {
  href: string | null;
  label: string;
  direction: "prev" | "next";
}) {
  const Icon = direction === "prev" ? ChevronLeft : ChevronRight;
  const base =
    "inline-flex items-center gap-1.5 rounded-[var(--radius-pill)] border px-3 py-1.5 text-sm font-medium";
  if (!href) {
    return (
      <span
        aria-disabled="true"
        className={cn(base, "border-[color:var(--color-border)] text-[color:var(--color-faint)]")}
      >
        {direction === "prev" && <Icon size={14} strokeWidth={2} />}
        {label}
        {direction === "next" && <Icon size={14} strokeWidth={2} />}
      </span>
    );
  }
  return (
    <Link
      href={href}
      className={cn(
        base,
        "border-[color:var(--color-border-strong)] text-[color:var(--color-ink)] transition hover:bg-[color:var(--color-gray-50)]",
      )}
    >
      {direction === "prev" && <Icon size={14} strokeWidth={2} />}
      {label}
      {direction === "next" && <Icon size={14} strokeWidth={2} />}
    </Link>
  );
}
