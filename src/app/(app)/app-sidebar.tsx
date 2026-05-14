"use client";

import Link from "next/link";
import { usePathname, useRouter } from "next/navigation";
import {
  Check,
  ChevronsUpDown,
  Cog,
  LayoutDashboard,
  ListChecks,
  LogOut,
  Menu,
  MessageSquareQuote,
  Receipt,
  Users,
  type LucideIcon,
} from "lucide-react";
import { useState } from "react";
import { authClient } from "@/lib/auth-client";
import { cn } from "@/lib/utils";
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
import { Logo } from "@/components/marketing/logo";
import type { SidebarData } from "./app-sidebar-data";

// Sidebar app : logo + brand switcher (top), nav sections (middle),
// user menu (bottom). État actif via usePathname() + barre verticale 2px
// noir à gauche du lien actif.
//
// Mobile : drawer via <Sheet> (slide-in left), trigger hamburger en top.

interface NavItem {
  href: string;
  label: string;
  icon: LucideIcon;
}

const NAV: NavItem[] = [
  { href: "/app/dashboard", label: "Dashboard", icon: LayoutDashboard },
  { href: "/app/prompts", label: "Prompts", icon: MessageSquareQuote },
  { href: "/app/competitors", label: "Concurrents", icon: Users },
  { href: "/app/runs", label: "Runs", icon: ListChecks },
  { href: "/app/settings", label: "Réglages", icon: Cog },
];

export function AppSidebar({ data }: { data: SidebarData }) {
  return (
    <>
      {/* Desktop : sidebar fixed left ≥ md */}
      <aside className="hidden md:flex md:flex-col md:w-60 md:shrink-0 md:border-r md:border-[color:var(--color-border)] md:bg-white md:h-screen md:sticky md:top-0">
        <SidebarInner data={data} />
      </aside>

      {/* Mobile : hamburger en haut, drawer Sheet */}
      <MobileSidebar data={data} />
    </>
  );
}

function SidebarInner({ data, onNavigate }: { data: SidebarData; onNavigate?: () => void }) {
  return (
    <div className="flex h-full flex-col">
      {/* Brand mark Mamie GEO — discret, icon-only (pas de wordmark
       * pour rester aligné avec « moins de texte Mamie GEO dans l'app »).
       * Clic → /app/dashboard. */}
      <div className="flex items-center px-3 pt-3 pb-1.5">
        <Link
          href="/app/dashboard"
          onClick={onNavigate}
          aria-label="Mamie GEO — accueil"
          className="flex size-7 items-center justify-center rounded-[var(--radius-sm)] transition hover:opacity-80 focus:outline-none focus-visible:ring-2 focus-visible:ring-[color:var(--color-ink)]"
        >
          <Logo size={26} />
        </Link>
      </div>

      {/* Top : workspace pill + brand pill (pattern Vercel). Pas de
       * mention du nom produit ici — l'utilisateur sait où il est. */}
      <div className="flex flex-col gap-1.5 border-b border-[color:var(--color-border)] p-3">
        <WorkspacePill workspace={data.workspace} onNavigate={onNavigate} />
        <BrandSwitcher brands={data.brands} currentBrandId={data.currentBrandId} />
      </div>

      {/* Middle : nav sections */}
      <nav className="flex-1 overflow-y-auto px-2 py-3">
        <SidebarNav onNavigate={onNavigate} />
      </nav>

      {/* Bottom : user menu */}
      <div className="border-t border-[color:var(--color-border)] p-3">
        <UserMenu email={data.user.email} plan={data.workspace.plan} />
      </div>
    </div>
  );
}

function SidebarNav({ onNavigate }: { onNavigate?: () => void }) {
  const pathname = usePathname();
  return (
    <ul className="flex flex-col gap-0.5">
      {NAV.map((item) => {
        const active = pathname === item.href || (pathname?.startsWith(item.href + "/") ?? false);
        return (
          <li key={item.href}>
            <Link
              href={item.href}
              onClick={onNavigate}
              aria-current={active ? "page" : undefined}
              className={cn(
                "relative flex items-center gap-2.5 rounded-[var(--radius-md)] px-3 py-2 text-sm font-medium transition-colors",
                active
                  ? "bg-[color:var(--color-gray-100)] text-[color:var(--color-ink)]"
                  : "text-[color:var(--color-ink-soft)] hover:bg-[color:var(--color-gray-50)] hover:text-[color:var(--color-ink)]",
              )}
            >
              {active && (
                <span
                  aria-hidden
                  className="absolute left-0 top-1.5 bottom-1.5 w-0.5 rounded-full bg-[color:var(--color-ink)]"
                />
              )}
              <item.icon
                size={16}
                strokeWidth={2}
                className={
                  active ? "text-[color:var(--color-ink)]" : "text-[color:var(--color-muted)]"
                }
              />
              {item.label}
            </Link>
          </li>
        );
      })}
    </ul>
  );
}

// Initiale de fallback (1ʳᵉ lettre alpha trouvée, sinon "?").
function getInitial(label: string): string {
  const match = label.match(/[\p{L}\p{N}]/u);
  return (match?.[0] ?? "?").toUpperCase();
}

// Pill workspace — pattern Vercel : avatar coloré + nom + badge plan.
// V0 : un seul workspace par user → pas de switcher (pas de chevron).
// Quand le multi-workspace arrivera, on greffera un DropdownMenu ici.
function WorkspacePill({
  workspace,
  onNavigate,
}: {
  workspace: SidebarData["workspace"];
  onNavigate?: () => void;
}) {
  return (
    <Link
      href="/app/dashboard"
      onClick={onNavigate}
      title={workspace.name}
      className="flex items-center gap-2.5 rounded-[var(--radius-md)] px-2 py-1.5 transition hover:bg-[color:var(--color-gray-50)] focus:outline-none focus-visible:ring-2 focus-visible:ring-[color:var(--color-ink)]"
    >
      <span
        aria-hidden
        className="flex size-6 shrink-0 items-center justify-center rounded-full bg-gradient-to-br from-[color:var(--color-accent)] to-[color:var(--color-accent-dim)] text-[10px] font-semibold text-white"
      >
        {getInitial(workspace.name)}
      </span>
      <span className="flex-1 min-w-0 truncate text-sm font-medium text-[color:var(--color-ink)]">
        {workspace.name}
      </span>
      <Badge tone={workspace.plan === "trialing" ? "accent" : "neutral"} className="shrink-0">
        {workspace.plan}
      </Badge>
    </Link>
  );
}

// Pill brand — square noir avec initiale + domaine + chevron switcher.
// Le label affiche le DOMAINE (pas le nom de marque) — c'est ce qui
// identifie la marque trackée de manière non ambiguë côté GEO.
function BrandSwitcher({
  brands,
  currentBrandId,
  className,
}: {
  brands: SidebarData["brands"];
  currentBrandId: string;
  className?: string;
}) {
  const current = brands.find((b) => b.id === currentBrandId) ?? brands[0];
  if (!current) return null;

  return (
    <DropdownMenu>
      <DropdownMenuTrigger
        className={cn(
          "flex w-full items-center gap-2.5 rounded-[var(--radius-md)] px-2 py-1.5 text-left transition hover:bg-[color:var(--color-gray-50)] focus:outline-none focus-visible:ring-2 focus-visible:ring-[color:var(--color-ink)]",
          className,
        )}
        title={`${current.name} · ${current.domain}`}
      >
        <span
          aria-hidden
          className="flex size-6 shrink-0 items-center justify-center rounded-[var(--radius-sm)] bg-[color:var(--color-ink)] text-[10px] font-semibold text-white"
        >
          {getInitial(current.name)}
        </span>
        <span className="flex-1 min-w-0 truncate text-sm font-medium text-[color:var(--color-ink)]">
          {current.domain}
        </span>
        <ChevronsUpDown
          size={14}
          strokeWidth={2}
          className="shrink-0 text-[color:var(--color-muted)]"
        />
      </DropdownMenuTrigger>
      <DropdownMenuContent align="start" className="w-60">
        <DropdownMenuLabel>Marques trackées</DropdownMenuLabel>
        <DropdownMenuSeparator />
        {brands.map((b) => (
          <DropdownMenuItem key={b.id} className="justify-between gap-3">
            <div className="flex flex-1 min-w-0 items-center gap-2.5">
              <span
                aria-hidden
                className="flex size-6 shrink-0 items-center justify-center rounded-[var(--radius-sm)] bg-[color:var(--color-ink)] text-[10px] font-semibold text-white"
              >
                {getInitial(b.name)}
              </span>
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
      </DropdownMenuContent>
    </DropdownMenu>
  );
}

function UserMenu({ email, plan }: { email: string; plan: string }) {
  const router = useRouter();
  const [pending, setPending] = useState(false);

  async function handleSignOut() {
    setPending(true);
    await authClient.signOut({ fetchOptions: { onSuccess: () => router.push("/login") } });
  }

  const initial = email.charAt(0).toUpperCase();
  return (
    <DropdownMenu>
      <DropdownMenuTrigger className="flex w-full items-center gap-2.5 rounded-[var(--radius-md)] px-2 py-1.5 transition hover:bg-[color:var(--color-gray-50)] focus:outline-none focus-visible:ring-2 focus-visible:ring-[color:var(--color-ink)]">
        <span className="flex size-7 items-center justify-center rounded-full bg-[color:var(--color-ink)] text-xs font-semibold text-white">
          {initial}
        </span>
        <div className="flex-1 min-w-0 text-left">
          <p className="truncate text-sm font-medium text-[color:var(--color-ink)]">{email}</p>
          <p className="type-meta">
            <Badge tone={plan === "trialing" ? "accent" : "neutral"}>{plan}</Badge>
          </p>
        </div>
      </DropdownMenuTrigger>
      <DropdownMenuContent align="end" side="top" className="w-52">
        <DropdownMenuLabel>{email}</DropdownMenuLabel>
        <DropdownMenuSeparator />
        <DropdownMenuItem asChild>
          <Link href="/app/settings">
            <Cog size={14} strokeWidth={2} />
            Réglages
          </Link>
        </DropdownMenuItem>
        <DropdownMenuItem asChild>
          <Link href="/app/settings">
            <Receipt size={14} strokeWidth={2} />
            Facturation
          </Link>
        </DropdownMenuItem>
        <DropdownMenuSeparator />
        <DropdownMenuItem danger onSelect={handleSignOut} disabled={pending}>
          <LogOut size={14} strokeWidth={2} />
          {pending ? "Déconnexion…" : "Se déconnecter"}
        </DropdownMenuItem>
      </DropdownMenuContent>
    </DropdownMenu>
  );
}

function MobileSidebar({ data }: { data: SidebarData }) {
  const [open, setOpen] = useState(false);
  return (
    <div className="md:hidden">
      <div className="sticky top-0 z-30 flex items-center gap-3 border-b border-[color:var(--color-border)] bg-white px-4 py-3">
        <Sheet open={open} onOpenChange={setOpen}>
          <SheetTrigger
            aria-label="Ouvrir le menu"
            className="inline-flex size-9 shrink-0 items-center justify-center rounded-[var(--radius-md)] border border-[color:var(--color-border)] bg-white text-[color:var(--color-ink)] transition hover:bg-[color:var(--color-gray-50)] focus:outline-none focus-visible:ring-2 focus-visible:ring-[color:var(--color-ink)]"
          >
            <Menu size={16} strokeWidth={2} />
          </SheetTrigger>
          <SheetContent>
            <SidebarInner data={data} onNavigate={() => setOpen(false)} />
          </SheetContent>
        </Sheet>
        <Link
          href="/app/dashboard"
          className="min-w-0 truncate text-sm font-semibold text-[color:var(--color-ink)]"
          title={data.workspace.name}
        >
          {data.workspace.name}
        </Link>
      </div>
    </div>
  );
}
