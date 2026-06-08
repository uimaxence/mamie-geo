import { eq } from "drizzle-orm";
import { headers } from "next/headers";
import { redirect } from "next/navigation";
import { db } from "@/db/client";
import { brands, workspaceMembers, workspaces } from "@/db/schema";
import { auth } from "@/lib/auth";
import { getDashboardData } from "@/lib/dashboard/queries";
import { Badge, Card, CardBody, CardHeader } from "@/components/ui";
import { AccountDangerZone } from "./account-danger-zone";
import { BillingSection } from "./billing-section";
import { BrandAliasesForm } from "./brand-aliases-form";
import { BrandPauseToggle } from "./brand-pause-toggle";
import { SignOutButton } from "./sign-out-button";
import { WorkspaceForm } from "./workspace-form";

// Page Réglages, édition workspace.name + brand.aliases activée
// (cf. PR App CRUD 2026-05-13). Le reste reste read-only en V0 :
//   - brand.name + brand.domain : changent l'identité = recréer
//   - email + role : changent l'auth = invitations system
//   - plan : géré par Stripe checkout
//   - slug + dates : techniques, non-éditables

export const dynamic = "force-dynamic";

interface PageProps {
  searchParams: Promise<{ checkout?: string }>;
}

export default async function SettingsPage({ searchParams }: PageProps) {
  const session = await auth.api.getSession({ headers: await headers() });
  if (!session) redirect("/login");

  const data = await getDashboardData(session.user.id);
  if (!data) redirect("/app/onboarding");

  const { checkout } = await searchParams;

  const userRows = await db.query.user.findFirst({
    where: (u, { eq }) => eq(u.id, session.user.id),
  });
  const wsRow = await db
    .select({
      slug: workspaces.slug,
      currentPeriodEnd: workspaces.currentPeriodEnd,
      stripeSubscriptionId: workspaces.stripeSubscriptionId,
    })
    .from(workspaces)
    .where(eq(workspaces.id, data.workspace.id))
    .limit(1);
  const brandRow = await db
    .select({ aliases: brands.aliases, pausedAt: brands.pausedAt })
    .from(brands)
    .where(eq(brands.id, data.brand.id))
    .limit(1);
  const memberRow = await db
    .select({ role: workspaceMembers.role })
    .from(workspaceMembers)
    .where(eq(workspaceMembers.workspaceId, data.workspace.id))
    .limit(1);

  return (
    <main className="mx-auto max-w-3xl px-6 py-12">
      <header>
        <span className="type-eyebrow">Réglages</span>
        <h1 className="type-h1 mt-2">Ton compte et ton workspace.</h1>
      </header>

      {checkout === "success" && (
        <div className="mt-6 rounded-[var(--radius-xl)] border border-[color:var(--color-success)]/20 bg-[color:var(--color-success-bg)] px-5 py-4">
          <p className="font-semibold text-[color:var(--color-success)]">
            ✓ Paiement validé, bienvenue !
          </p>
          <p className="type-body mt-1 text-sm text-[color:var(--color-ink-soft)]">
            Ton abonnement est actif. Le premier run est lancé sur les IA suivies, tu verras les
            résultats sur ton dashboard d&apos;ici quelques minutes.
          </p>
        </div>
      )}
      {checkout === "cancel" && (
        <div className="mt-6 rounded-[var(--radius-xl)] border border-[color:var(--color-warning)]/20 bg-[color:var(--color-warning-bg)] px-5 py-4">
          <p className="font-semibold text-[color:var(--color-warning)]">Checkout annulé</p>
          <p className="type-body mt-1 text-sm text-[color:var(--color-ink-soft)]">
            Rien n&apos;a été débité. Tu peux relancer un abonnement quand tu veux ci-dessous.
          </p>
        </div>
      )}

      <div className="mt-10 flex flex-col gap-6">
        {/* Compte */}
        <SectionCard title="Compte" subtitle="Informations personnelles">
          <dl className="grid grid-cols-2 gap-x-8 gap-y-4 sm:grid-cols-3">
            <Field label="Email" value={session.user.email} />
            <Field label="Rôle workspace" value={memberRow[0]?.role ?? "—"} />
            <Field
              label="Compte créé"
              value={userRows?.createdAt ? formatDate(userRows.createdAt) : "—"}
            />
          </dl>
        </SectionCard>

        {/* Workspace, nom éditable, plan + slug read-only */}
        <SectionCard title="Workspace" subtitle="Espace de travail">
          <dl className="grid grid-cols-2 gap-x-8 gap-y-4 sm:grid-cols-3">
            <div>
              <dt className="type-eyebrow">Nom</dt>
              <dd className="mt-1">
                <WorkspaceForm currentName={data.workspace.name} />
              </dd>
            </div>
            <Field
              label="Plan"
              value={
                <Badge tone={data.workspace.plan === "trialing" ? "accent" : "neutral"}>
                  {data.workspace.plan}
                </Badge>
              }
            />
            <Field label="Slug" value={wsRow[0]?.slug ?? "—"} mono />
          </dl>
        </SectionCard>

        {/* Brand, aliases éditables, nom + domaine read-only */}
        <SectionCard
          title="Marque trackée"
          subtitle="Nom + domaine non éditables (changent l'identité). Aliases modifiables."
        >
          <dl className="grid grid-cols-1 gap-x-8 gap-y-4 sm:grid-cols-3">
            <Field
              label="Nom"
              value={
                <span className="inline-flex items-center gap-2">
                  {data.brand.name}
                  {brandRow[0]?.pausedAt && (
                    <Badge tone="warning" className="shrink-0">
                      en pause
                    </Badge>
                  )}
                </span>
              }
            />
            <Field label="Domaine" value={data.brand.domain} mono />
            <div className="sm:col-span-3">
              <dt className="type-eyebrow">Aliases</dt>
              <dd className="mt-2">
                <BrandAliasesForm currentAliases={brandRow[0]?.aliases ?? []} />
              </dd>
            </div>
            <div className="sm:col-span-3">
              <dt className="type-eyebrow">Statut tracking</dt>
              <dd className="mt-2">
                <BrandPauseToggle
                  brandId={data.brand.id}
                  initialPausedAt={brandRow[0]?.pausedAt ?? null}
                />
              </dd>
            </div>
          </dl>
        </SectionCard>

        {/* Facturation, choix de plan + portal Stripe */}
        <section id="billing">
          <SectionCard
            title="Facturation"
            subtitle="Gère ton abonnement, ta carte et tes factures."
          >
            <BillingSection
              plan={data.workspace.plan}
              currentPeriodEnd={wsRow[0]?.currentPeriodEnd ?? null}
              hasSubscription={Boolean(wsRow[0]?.stripeSubscriptionId)}
            />
          </SectionCard>
        </section>

        {/* Usage */}
        <SectionCard title="Plan & usage" subtitle={`Période en cours : ${data.usage.periodStart}`}>
          <dl className="grid grid-cols-2 gap-x-8 gap-y-4 sm:grid-cols-3">
            <Field label="Runs effectués" value={String(data.usage.runsCount)} />
            <Field label="Coût LLM cumulé" value={`$${data.usage.llmCostUsd.toFixed(4)}`} mono />
            <Field label="Prompts actifs" value={String(data.promptsCount)} />
          </dl>
        </SectionCard>

        {/* Exports CSV métier : runs bruts + métriques agrégées. Séparé
         * du flow RGPD (JSON full export) qui vit dans la danger zone. */}
        <SectionCard
          title="Exports CSV"
          subtitle="Télécharge tes données pour les analyser dans Excel, Sheets ou un BI."
        >
          <div className="flex flex-col gap-3 sm:flex-row">
            <a
              href="/api/export/runs.csv"
              className="inline-flex items-center justify-center rounded-[var(--radius-md)] border border-[color:var(--color-border)] bg-white px-4 py-2 text-sm font-medium text-[color:var(--color-ink)] transition hover:bg-[color:var(--color-gray-50)] focus:outline-none focus-visible:ring-2 focus-visible:ring-[color:var(--color-ink)]"
              download
            >
              Historique des runs (CSV)
            </a>
            <a
              href="/api/export/metrics.csv"
              className="inline-flex items-center justify-center rounded-[var(--radius-md)] border border-[color:var(--color-border)] bg-white px-4 py-2 text-sm font-medium text-[color:var(--color-ink)] transition hover:bg-[color:var(--color-gray-50)] focus:outline-none focus-visible:ring-2 focus-visible:ring-[color:var(--color-ink)]"
              download
            >
              Métriques quotidiennes (CSV)
            </a>
          </div>
          <p className="type-meta mt-3 text-xs">
            Plage par défaut : 90 derniers jours, toutes tes marques. Encodage UTF-8 avec BOM,
            compatible Excel.
          </p>
        </SectionCard>

        {/* Déconnexion : action douce, pas de Card pour rester distinct
         * de la danger zone RGPD (suppression / export). */}
        <section className="mt-4 rounded-[var(--radius-xl)] border border-[color:var(--color-border)] bg-white p-6">
          <h2 className="type-h3">Déconnexion</h2>
          <p className="type-body mt-2 text-sm">
            Te déconnecter ne supprime rien. Tu pourras te reconnecter à tout moment via le
            magic-link envoyé sur <strong>{session.user.email}</strong>.
          </p>
          <div className="mt-5">
            <SignOutButton />
          </div>
        </section>

        {/* Danger zone RGPD : export (article 20) + suppression (article 17).
         * Pas dans une Card pour ne pas la « normaliser », bordure error
         * et fond rouge clair pour signaler la sensibilité. */}
        <section className="mt-4 rounded-[var(--radius-xl)] border border-[color:var(--color-error)]/20 bg-[color:var(--color-error-bg)] p-6">
          <h2 className="type-h3 text-[color:var(--color-error)]">Zone sensible — RGPD</h2>
          <p className="type-body mt-2 mb-6 text-sm">
            Tes droits sur tes données personnelles. Export et suppression définitive.
          </p>
          <AccountDangerZone userEmail={session.user.email} />
        </section>
      </div>
    </main>
  );
}

function SectionCard({
  title,
  subtitle,
  children,
}: {
  title: string;
  subtitle?: string;
  children: React.ReactNode;
}) {
  return (
    <Card>
      <CardHeader>
        <h2 className="type-h3">{title}</h2>
        {subtitle && <p className="type-meta mt-1">{subtitle}</p>}
      </CardHeader>
      <CardBody>{children}</CardBody>
    </Card>
  );
}

function Field({ label, value, mono }: { label: string; value: React.ReactNode; mono?: boolean }) {
  return (
    <div>
      <dt className="type-eyebrow">{label}</dt>
      <dd
        className={`mt-1 text-sm font-medium text-[color:var(--color-ink)] ${
          mono ? "type-tabular" : ""
        }`}
      >
        {value}
      </dd>
    </div>
  );
}

function formatDate(date: Date): string {
  return new Date(date).toLocaleDateString("fr-FR", {
    day: "numeric",
    month: "long",
    year: "numeric",
  });
}
