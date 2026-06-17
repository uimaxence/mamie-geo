"use client";

import Link from "next/link";
import { usePathname, useRouter } from "next/navigation";
import {
  BookOpen,
  Cog,
  LayoutDashboard,
  LifeBuoy,
  Lightbulb,
  ListChecks,
  LogOut,
  MessageSquareQuote,
  Radar,
  Receipt,
  Shield,
  Wrench,
  type LucideIcon,
} from "lucide-react";
import { useEffect, useState } from "react";
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
import { SidebarSubscribeCard } from "@/components/app/sidebar-subscribe-card";
import { PromptsCoachmark } from "@/components/app/prompts-coachmark";
import { FeedbackDialog } from "@/components/app/feedback-dialog";
import {
  CAL_SUPPORT_CONFIG,
  CAL_SUPPORT_LINK,
  CAL_SUPPORT_NAMESPACE,
} from "@/components/app/cal-support-embed";
import { capture } from "@/lib/posthog-client";
import { planLabel } from "@/lib/plans/quotas";
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
  // 2026-06-08 (cf. doc 09) : fusion Sources + Concurrents dans une
  // seule entrée « Citations » avec deux tabs internes.
  { href: "/app/citations", label: "Citations", icon: BookOpen },
  // Trafic IA réel (pixel cookieless) — preuve de ROI, surface dédiée
  // déplacée du dashboard (2026-06-15, cf. doc 09).
  { href: "/app/traffic", label: "Trafic IA", icon: Radar },
  { href: "/app/audits", label: "Audits techniques", icon: Wrench },
  // Contenu éducatif evergreen (10 leviers GEO), distinct de l'audit
  // par-URL : la plupart des leviers sont off-page (branding, avis…).
  { href: "/app/conseils", label: "Conseils GEO", icon: Lightbulb },
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
    return <SidebarInner data={data} mode="drawer" onNavigate={onNavigate} />;
  }
  return (
    <aside className="hidden md:flex md:flex-col md:w-56 md:shrink-0 md:border-r md:border-[color:var(--color-border)] md:bg-white md:h-[calc(100vh-3rem)] md:sticky md:top-12">
      <SidebarInner data={data} mode="desktop" onNavigate={onNavigate} />
    </aside>
  );
}

function SidebarInner({
  data,
  mode,
  onNavigate,
}: {
  data: SidebarData;
  mode: "desktop" | "drawer";
  onNavigate?: () => void;
}) {
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
          needsPromptSetup={data.needsPromptSetup}
          mode={mode}
        />
      </nav>

      {/* Subscribe card pour plans non-actifs (trialing/expired/canceled) */}
      <SidebarSubscribeCard
        plan={data.workspace.plan}
        trialEndsAt={data.workspace.trialEndsAt?.toISOString() ?? null}
      />

      {/* Bottom, feedback + user menu */}
      <div className="border-t border-[color:var(--color-border)] p-3">
        <FeedbackDialog />
        <UserMenu email={data.user.email} plan={data.workspace.plan} isAdmin={data.isAdmin} />
      </div>
    </div>
  );
}

const PROMPTS_COACHMARK_DISMISS_KEY = "mamie:prompts-coachmark:dismissed";

function SidebarNav({
  onNavigate,
  criticalIssuesCount,
  needsPromptSetup,
  mode,
}: {
  onNavigate?: () => void;
  criticalIssuesCount: number;
  needsPromptSetup: boolean;
  mode: "desktop" | "drawer";
}) {
  const pathname = usePathname();
  const [promptsEl, setPromptsEl] = useState<HTMLAnchorElement | null>(null);
  // Coachmark masquée après dismiss (persistant). On part masqué pour éviter
  // un flash avant lecture du localStorage (SSR/hydratation).
  const [coachDismissed, setCoachDismissed] = useState(true);
  useEffect(() => {
    // Synchro avec localStorage (système externe) au montage.
    // eslint-disable-next-line react-hooks/set-state-in-effect
    setCoachDismissed(localStorage.getItem(PROMPTS_COACHMARK_DISMISS_KEY) === "1");
  }, []);

  const onPromptsPage = pathname?.startsWith("/app/prompts") ?? false;
  // Desktop only : en drawer mobile, un popover `fixed` à droite sortirait
  // de l'écran. La coachmark guide la première config, pas un usage récurrent.
  const showCoachmark = needsPromptSetup && mode === "desktop" && !onPromptsPage && !coachDismissed;

  function dismissCoachmark() {
    localStorage.setItem(PROMPTS_COACHMARK_DISMISS_KEY, "1");
    setCoachDismissed(true);
  }

  return (
    <>
      <ul className="flex flex-col gap-0.5">
        {NAV.map((item) => {
          const active = pathname === item.href || (pathname?.startsWith(item.href + "/") ?? false);
          const showCriticalBadge = item.href === "/app/audits" && criticalIssuesCount > 0;
          const isPromptsItem = item.href === "/app/prompts";
          const highlight = isPromptsItem && showCoachmark && !active;
          return (
            <li key={item.href}>
              <Link
                ref={isPromptsItem ? setPromptsEl : undefined}
                href={item.href}
                onClick={onNavigate}
                aria-current={active ? "page" : undefined}
                className={cn(
                  "relative flex items-center gap-2.5 rounded-[var(--radius-md)] px-3 py-2 text-sm font-medium transition-colors",
                  active
                    ? "bg-[color:var(--color-gray-100)] text-[color:var(--color-ink)]"
                    : "text-[color:var(--color-ink-soft)] hover:bg-[color:var(--color-gray-50)] hover:text-[color:var(--color-ink)]",
                  // Met l'onglet « en gros » tant que la coachmark est active.
                  highlight &&
                    "bg-[color:var(--color-accent)]/[0.08] text-[color:var(--color-ink)] ring-1 ring-inset ring-[color:var(--color-accent)]/40",
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
                  className={cn(
                    active ? "text-[color:var(--color-ink)]" : "text-[color:var(--color-muted)]",
                    highlight && "text-[color:var(--color-accent)]",
                  )}
                />
                <span className="flex-1 truncate whitespace-nowrap">{item.label}</span>
                {showCriticalBadge && (
                  <Badge
                    tone="error"
                    aria-label={`${criticalIssuesCount} problème${criticalIssuesCount > 1 ? "s" : ""} critique${criticalIssuesCount > 1 ? "s" : ""} à corriger`}
                  >
                    {criticalIssuesCount}
                  </Badge>
                )}
                {/* Pastille accent sur l'onglet Prompts à configurer. */}
                {highlight && (
                  <span
                    aria-hidden
                    className="size-2 shrink-0 rounded-full bg-[color:var(--color-accent)]"
                  />
                )}
              </Link>
            </li>
          );
        })}
      </ul>
      {showCoachmark && <PromptsCoachmark anchor={promptsEl} onDismiss={dismissCoachmark} />}
    </>
  );
}

function UserMenu({ email, plan, isAdmin }: { email: string; plan: string; isAdmin: boolean }) {
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
            <Badge tone={plan === "trialing" ? "accent" : "neutral"}>{planLabel(plan)}</Badge>
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
        {/* Support : ouvre la modal Cal.com (réservation d'un créneau).
            Les attributs data-cal-* sont captés par le listener délégué
            posé par <CalSupportEmbed> dans le layout (app). */}
        <DropdownMenuItem asChild>
          <button
            type="button"
            data-cal-namespace={CAL_SUPPORT_NAMESPACE}
            data-cal-link={CAL_SUPPORT_LINK}
            data-cal-config={CAL_SUPPORT_CONFIG}
            onClick={() => capture("support_cal_opened", { source: "user_menu" })}
          >
            <LifeBuoy size={14} strokeWidth={2} />
            Contacter le support
          </button>
        </DropdownMenuItem>
        {/* Raccourci Admin — affiché seulement aux admins. L'accès réel
            est gardé côté serveur par le layout /app/admin/*. */}
        {isAdmin && (
          <>
            <DropdownMenuSeparator />
            <DropdownMenuItem asChild>
              <Link href="/app/admin/visuals">
                <Shield size={14} strokeWidth={2} />
                Admin
              </Link>
            </DropdownMenuItem>
          </>
        )}
        <DropdownMenuSeparator />
        <DropdownMenuItem danger onSelect={handleSignOut} disabled={pending}>
          <LogOut size={14} strokeWidth={2} />
          {pending ? "Déconnexion…" : "Se déconnecter"}
        </DropdownMenuItem>
      </DropdownMenuContent>
    </DropdownMenu>
  );
}
