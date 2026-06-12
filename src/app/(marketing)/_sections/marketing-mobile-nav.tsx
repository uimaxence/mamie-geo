"use client";

import Link from "next/link";
import { useState } from "react";
import { Menu } from "lucide-react";
import { Sheet, SheetTrigger, SheetContent, LinkButton } from "@/components/ui";
import { Logo } from "@/components/marketing/logo";

// Burger menu pour le header marketing < sm. La nav desktop est cachée
// sur mobile via `hidden sm:flex` ; ce composant prend le relais et
// affiche les liens + CTAs auth dans une Sheet slide-in.

const NAV_LINKS: { href: string; label: string; isNew?: boolean }[] = [
  { href: "/#how-it-works", label: "Fonctionnalités" },
  { href: "/demo", label: "Démo" },
  // Pastille à retirer quelques semaines après le lancement du scan
  // comparateurs (2026-06-12), comme côté desktop.
  { href: "/outils", label: "Outils gratuits", isNew: true },
  { href: "/pricing", label: "Tarif" },
  { href: "/blog", label: "Blog" },
  { href: "/#faq", label: "FAQ" },
];

export function MarketingMobileNav({ isLoggedIn = false }: { isLoggedIn?: boolean }) {
  const [open, setOpen] = useState(false);
  const close = () => setOpen(false);

  return (
    <div className="sm:hidden">
      <Sheet open={open} onOpenChange={setOpen}>
        <SheetTrigger
          aria-label="Ouvrir le menu"
          className="inline-flex size-9 shrink-0 items-center justify-center rounded-[var(--radius-md)] border border-[color:var(--color-border)] bg-white text-[color:var(--color-ink)] transition hover:bg-[color:var(--color-gray-50)] focus:outline-none focus-visible:ring-2 focus-visible:ring-[color:var(--color-ink)]"
        >
          <Menu size={18} strokeWidth={2} />
        </SheetTrigger>
        <SheetContent>
          <Link
            href="/"
            onClick={close}
            className="mb-6 flex items-center gap-2 text-base font-bold tracking-tight text-[color:var(--color-ink)]"
          >
            <Logo size={28} />
            <span>Mamie GEO</span>
          </Link>

          <nav className="flex flex-col gap-1">
            {NAV_LINKS.map((link) => (
              <Link
                key={link.href}
                href={link.href}
                onClick={close}
                className="flex items-center gap-2 rounded-[var(--radius-md)] px-3 py-2.5 text-[15px] font-medium text-[color:var(--color-ink-soft)] transition hover:bg-[color:var(--color-gray-50)] hover:text-[color:var(--color-ink)]"
              >
                {link.label}
                {link.isNew && (
                  <span className="rounded-[var(--radius-pill)] bg-[color:var(--color-accent)] px-1.5 py-0.5 text-[10px] font-semibold leading-none text-white">
                    Nouveau
                  </span>
                )}
              </Link>
            ))}
          </nav>

          <div className="mt-auto flex flex-col gap-3 border-t border-[color:var(--color-border)] pt-4">
            {isLoggedIn ? (
              <LinkButton href="/app/dashboard" variant="primary" size="md" onClick={close}>
                Tableau de bord
              </LinkButton>
            ) : (
              <>
                <Link
                  href="/login"
                  onClick={close}
                  className="rounded-[var(--radius-md)] px-3 py-2.5 text-[15px] font-medium text-[color:var(--color-ink-soft)] transition hover:bg-[color:var(--color-gray-50)] hover:text-[color:var(--color-ink)]"
                >
                  Connexion
                </Link>
                <LinkButton href="/login?mode=signup" variant="primary" size="md" onClick={close}>
                  Inscription
                </LinkButton>
              </>
            )}
          </div>
        </SheetContent>
      </Sheet>
    </div>
  );
}
