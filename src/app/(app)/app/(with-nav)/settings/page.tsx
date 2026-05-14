import { eq } from "drizzle-orm";
import { headers } from "next/headers";
import { redirect } from "next/navigation";
import { db } from "@/db/client";
import { brands, workspaceMembers, workspaces } from "@/db/schema";
import { auth } from "@/lib/auth";
import { getDashboardData } from "@/lib/dashboard/queries";
import { Badge, Card, CardBody, CardHeader } from "@/components/ui";
import { BrandAliasesForm } from "./brand-aliases-form";
import { SignOutButton } from "./sign-out-button";
import { WorkspaceForm } from "./workspace-form";

// Page Réglages — édition workspace.name + brand.aliases activée
// (cf. PR App CRUD 2026-05-13). Le reste reste read-only en V0 :
//   - brand.name + brand.domain : changent l'identité = recréer
//   - email + role : changent l'auth = invitations system
//   - plan : géré par Stripe checkout
//   - slug + dates : techniques, non-éditables

export const dynamic = "force-dynamic";

export default async function SettingsPage() {
  const session = await auth.api.getSession({ headers: await headers() });
  if (!session) redirect("/login");

  const data = await getDashboardData(session.user.id);
  if (!data) redirect("/app/onboarding");

  const userRows = await db.query.user.findFirst({
    where: (u, { eq }) => eq(u.id, session.user.id),
  });
  const wsRow = await db
    .select({ slug: workspaces.slug })
    .from(workspaces)
    .where(eq(workspaces.id, data.workspace.id))
    .limit(1);
  const brandRow = await db
    .select({ aliases: brands.aliases })
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

        {/* Workspace — nom éditable, plan + slug read-only */}
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

        {/* Brand — aliases éditables, nom + domaine read-only */}
        <SectionCard
          title="Marque trackée"
          subtitle="Nom + domaine non éditables (changent l'identité). Aliases modifiables."
        >
          <dl className="grid grid-cols-1 gap-x-8 gap-y-4 sm:grid-cols-3">
            <Field label="Nom" value={data.brand.name} />
            <Field label="Domaine" value={data.brand.domain} mono />
            <div className="sm:col-span-3">
              <dt className="type-eyebrow">Aliases</dt>
              <dd className="mt-2">
                <BrandAliasesForm currentAliases={brandRow[0]?.aliases ?? []} />
              </dd>
            </div>
          </dl>
        </SectionCard>

        {/* Usage */}
        <SectionCard title="Plan & usage" subtitle={`Période en cours : ${data.usage.periodStart}`}>
          <dl className="grid grid-cols-2 gap-x-8 gap-y-4 sm:grid-cols-3">
            <Field label="Runs effectués" value={String(data.usage.runsCount)} />
            <Field label="Coût LLM cumulé" value={`$${data.usage.llmCostUsd.toFixed(4)}`} mono />
            <Field label="Prompts actifs" value={String(data.promptsCount)} />
          </dl>
        </SectionCard>

        {/* Danger zone — pas dans une Card pour ne pas la "normaliser" */}
        <section className="mt-4 rounded-[var(--radius-xl)] border border-[color:var(--color-error)]/20 bg-[color:var(--color-error-bg)] p-6">
          <h2 className="type-h3 text-[color:var(--color-error)]">Zone sensible</h2>
          <p className="type-body mt-2 text-sm">
            La déconnexion ne supprime rien. Tu pourras te reconnecter à tout moment via le
            magic-link envoyé sur <strong>{session.user.email}</strong>.
          </p>
          <div className="mt-5">
            <SignOutButton />
          </div>
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
