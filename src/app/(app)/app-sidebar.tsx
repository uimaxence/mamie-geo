"use client";

import Link from "next/link";
import { usePathname, useRouter } from "next/navigation";
import {
  Cog,
  Globe,
  LayoutDashboard,
  ListChecks,
  LogOut,
  MessageSquareQuote,
  Receipt,
  Users,
  Wrench,
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
} from "@/components/ui";
import { Logo } from "@/components/marketing/logo";
import type { SidebarData } from "./app-sidebar-data";

// Sidebar app : logo Mamie GEO (top), nav sections (middle), user menu
// (bottom). Le sélecteur workspace + brand est sorti dans la top bar
// horizontale (cf. AppTopBar, itération 2026-05-20 pattern Vercel).
//
// État actif via usePathname() + barre verticale 2px noir à gauche du
// lien actif.
//
// Mobile : la sidebar est rendue dans un Sheet drawer déclenché par
// AppTopBar (mode="drawer"). En desktop, sidebar latérale fixed.

interface NavItem {
  href: string;
  label: string;
  icon: LucideIcon;
}

const NAV: NavItem[] = [
  { href: "/app/dashboard", label: "Dashboard", icon: LayoutDashboard },
  { href: "/app/prompts", label: "Prompts", icon: MessageSquareQuote },
  { href: "/app/sources", label: "Sources", icon: Globe },
  { href: "/app/competitors", label: "Concurrents", icon: Users },
  { href: "/app/audits", label: "Audits techniques", icon: Wrench },
  { href: "/app/runs", label: "Runs", icon: ListChecks },
  { href: "/app/settings", label: "Réglages", icon: Cog },
];

export interface AppSidebarProps {
  data: SidebarData;
  /**
   * `desktop` (default), rend l'aside latérale visible ≥ md.
   * `drawer`, rend uniquement le contenu interne (pour utilisation dans
   * un Sheet mobile depuis AppTopBar).
   */
  mode?: "desktop" | "drawer";
  onNavigate?: () => void;
}

export function AppSidebar({ data, mode = "desktop", onNavigate }: AppSidebarProps) {
  if (mode === "drawer") {
    return <SidebarInner data={data} onNavigate={onNavigate} />;
  }
  return (
    <aside className="hidden md:flex md:flex-col md:w-56 md:shrink-0 md:border-r md:border-[color:var(--color-border)] md:bg-white md:h-screen md:sticky md:top-0">
      <SidebarInner data={data} onNavigate={onNavigate} />
    </aside>
  );
}

function SidebarInner({ data, onNavigate }: { data: SidebarData; onNavigate?: () => void }) {
  return (
    <div className="flex h-full flex-col">
      {/* Top, logo Mamie GEO icon-only, clic dashboard. Le wordmark
       *  et le sélecteur workspace/brand vivent dans AppTopBar. */}
      <div className="flex items-center px-3 py-3">
        <Link
          href="/app/dashboard"
          onClick={onNavigate}
          aria-label="Mamie GEO, accueil"
          className="flex size-8 items-center justify-center rounded-[var(--radius-sm)] transition hover:opacity-80 focus:outline-none focus-visible:ring-2 focus-visible:ring-[color:var(--color-ink)]"
        >
          <Logo size={26} />
        </Link>
      </div>

      {/* Middle, nav sections */}
      <nav className="flex-1 overflow-y-auto px-2 py-2">
        <SidebarNav
          onNavigate={onNavigate}
          criticalIssuesCount={data.criticalIssuesCount}
        />
      </nav>

      {/* Bottom, user menu */}
      <div className="border-t border-[color:var(--color-border)] p-3">
        <UserMenu email={data.user.email} plan={data.workspace.plan} />
      </div>
    </div>
  );
}

function SidebarNav({
  onNavigate,
  criticalIssuesCount,
}: {
  onNavigate?: () => void;
  criticalIssuesCount: number;
}) {
  const pathname = usePathname();
  return (
    <ul className="flex flex-col gap-0.5">
      {NAV.map((item) => {
        const active = pathname === item.href || (pathname?.startsWith(item.href + "/") ?? false);
        const showCriticalBadge =
          item.href === "/app/audits" && criticalIssuesCount > 0;
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
              <span className="flex-1">{item.label}</span>
              {showCriticalBadge && (
                <Badge
                  tone="error"
                  aria-label={`${criticalIssuesCount} problème${criticalIssuesCount > 1 ? "s" : ""} critique${criticalIssuesCount > 1 ? "s" : ""} à corriger`}
                >
                  {criticalIssuesCount}
                </Badge>
              )}
            </Link>
          </li>
        );
      })}
    </ul>
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
