"use client";

import Link from "next/link";
import { Check, ChevronDown, Menu, Plus } from "lucide-react";
import { useState } from "react";
import {
  Badge,
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
  Sheet,
  SheetContent,
  SheetTrigger,
} from "@/components/ui";
import { BrandFavicon } from "@/components/app/brand-favicon";
import { cn } from "@/lib/utils";
import { AddBrandDialog } from "./add-brand-dialog";
import { AppSidebar } from "./app-sidebar";
import type { SidebarData } from "./app-sidebar-data";

// Top bar app, pattern Vercel : sticky en haut, full width.
// Affiche en ligne : [workspace avatar + nom + plan] · [favicon brand
// + domaine + chevron switcher]. Détaché du menu de navigation (qui
// reste dans la sidebar verticale à gauche).
//
// Mobile : on remplace le hamburger qui était dans la sidebar par un
// trigger en bout gauche de la top bar. La sidebar reste un drawer.

function getInitial(label: string): string {
  const match = label.match(/[\p{L}\p{N}]/u);
  return (match?.[0] ?? "?").toUpperCase();
}

export function AppTopBar({ data }: { data: SidebarData }) {
  return (
    <header className="sticky top-0 z-30 flex h-12 items-center gap-2 border-b border-[color:var(--color-border)] bg-white px-3 md:px-4">
      <MobileMenuTrigger data={data} />

      <WorkspacePill workspace={data.workspace} />

      <Separator />

      <BrandSwitcher
        brands={data.brands}
        currentBrandId={data.currentBrandId}
        currentBrandsCount={data.currentBrandsCount}
        plan={data.workspace.plan}
      />
    </header>
  );
}

function Separator() {
  return (
    <span
      aria-hidden
      className="select-none text-base font-light text-[color:var(--color-border-strong)]"
    >
      /
    </span>
  );
}

function WorkspacePill({ workspace }: { workspace: SidebarData["workspace"] }) {
  return (
    <Link
      href="/app/dashboard"
      title={workspace.name}
      className="flex max-w-[200px] items-center gap-2 rounded-[var(--radius-md)] px-2 py-1.5 transition hover:bg-[color:var(--color-gray-50)] focus:outline-none focus-visible:ring-2 focus-visible:ring-[color:var(--color-ink)]"
    >
      <span
        aria-hidden
        className="flex size-5 shrink-0 items-center justify-center rounded-full bg-gradient-to-br from-[color:var(--color-accent)] to-[color:var(--color-accent-dim)] text-[9px] font-semibold text-white"
      >
        {getInitial(workspace.name)}
      </span>
      <span className="hidden min-w-0 truncate text-sm font-medium text-[color:var(--color-ink)] sm:block">
        {workspace.name}
      </span>
      <Badge tone={workspace.plan === "trialing" ? "accent" : "neutral"} className="shrink-0">
        {workspace.plan}
      </Badge>
    </Link>
  );
}

function BrandSwitcher({
  brands,
  currentBrandId,
  currentBrandsCount,
  plan,
}: {
  brands: SidebarData["brands"];
  currentBrandId: string;
  currentBrandsCount: number;
  plan: string;
}) {
  const current = brands.find((b) => b.id === currentBrandId) ?? brands[0];
  if (!current) return null;

  return (
    <DropdownMenu>
      <DropdownMenuTrigger
        className={cn(
          "flex max-w-[260px] items-center gap-2 rounded-[var(--radius-md)] px-2 py-1.5 text-left transition hover:bg-[color:var(--color-gray-50)] focus:outline-none focus-visible:ring-2 focus-visible:ring-[color:var(--color-ink)]",
        )}
        title={`${current.name} · ${current.domain}`}
      >
        <BrandFavicon domain={current.domain} name={current.name} size={18} />
        <span className="min-w-0 truncate text-sm font-medium text-[color:var(--color-ink)]">
          {current.domain}
        </span>
        <ChevronDown
          size={14}
          strokeWidth={2}
          className="shrink-0 text-[color:var(--color-muted)]"
        />
      </DropdownMenuTrigger>
      <DropdownMenuContent align="start" className="w-64">
        <DropdownMenuLabel>Marques trackées</DropdownMenuLabel>
        <DropdownMenuSeparator />
        {brands.map((b) => (
          <DropdownMenuItem key={b.id} className="justify-between gap-3">
            <div className="flex flex-1 min-w-0 items-center gap-2.5">
              <BrandFavicon domain={b.domain} name={b.name} size={20} />
              <div className="flex-1 min-w-0">
                <p className="truncate text-sm font-medium text-[color:var(--color-ink)]">
                  {b.name}
                </p>
                <p className="type-meta truncate">{b.domain}</p>
              </div>
            </div>
            {b.id === currentBrandId && (
              <Check
                size={14}
                strokeWidth={2.5}
                className="shrink-0 text-[color:var(--color-ink)]"
              />
            )}
          </DropdownMenuItem>
        ))}
        <DropdownMenuSeparator />
        <AddBrandDialog currentBrandsCount={currentBrandsCount} plan={plan}>
          <DropdownMenuItem
            // Empêche Radix de fermer le menu avant que la dialog
            // s'ouvre, sinon le focus est perdu et la dialog peut ne
            // pas s'afficher correctement.
            onSelect={(e) => e.preventDefault()}
            className="text-[color:var(--color-ink-soft)]"
          >
            <Plus size={14} strokeWidth={2} />
            Ajouter une marque
          </DropdownMenuItem>
        </AddBrandDialog>
      </DropdownMenuContent>
    </DropdownMenu>
  );
}

function MobileMenuTrigger({ data }: { data: SidebarData }) {
  const [open, setOpen] = useState(false);
  return (
    <div className="md:hidden">
      <Sheet open={open} onOpenChange={setOpen}>
        <SheetTrigger
          aria-label="Ouvrir le menu"
          className="inline-flex size-8 shrink-0 items-center justify-center rounded-[var(--radius-md)] border border-[color:var(--color-border)] bg-white text-[color:var(--color-ink)] transition hover:bg-[color:var(--color-gray-50)] focus:outline-none focus-visible:ring-2 focus-visible:ring-[color:var(--color-ink)]"
        >
          <Menu size={15} strokeWidth={2} />
        </SheetTrigger>
        <SheetContent>
          <AppSidebar data={data} mode="drawer" onNavigate={() => setOpen(false)} />
        </SheetContent>
      </Sheet>
    </div>
  );
}
