import { eq } from "drizzle-orm";
import { headers } from "next/headers";
import { redirect } from "next/navigation";
import { db } from "@/db/client";
import { brands, workspaceMembers, workspaces } from "@/db/schema";
import { auth } from "@/lib/auth";
import { getDashboardData } from "@/lib/dashboard/queries";
import { Badge } from "@/components/ui";
import { SignOutButton } from "./sign-out-button";

// Page Réglages (V0) — read-only pour la plupart des champs.
// Affiche :
//   - Compte : email du user, créé le
//   - Workspace : nom + plan + slug
//   - Brand : nom + domaine
//   - Usage : runs ce mois + coût LLM cumulé
//   - Danger zone : déconnexion
//
// Édition des champs (changer email, renommer workspace…) arrive en
// PR ultérieure quand on aura un vrai besoin user.

export const dynamic = "force-dynamic";

export default async function SettingsPage() {
  const session = await auth.api.getSession({ headers: await headers() });
  if (!session) redirect("/login");

  const data = await getDashboardData(session.user.id);
  if (!data) redirect("/app/onboarding");

  // Charger created_at pour le user + slug workspace (pas dans
  // getDashboardData, donc query directe)
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

      <hr className="rule mt-8" />

      {/* Compte */}
      <section className="mt-10">
        <h2 className="type-h3">Compte</h2>
        <dl className="mt-5 grid grid-cols-2 gap-x-8 gap-y-4 sm:grid-cols-3">
          <Field label="Email" value={session.user.email} />
          <Field label="Rôle workspace" value={memberRow[0]?.role ?? "—"} />
          <Field
            label="Compte créé"
            value={userRows?.createdAt ? formatDate(userRows.createdAt) : "—"}
          />
        </dl>
      </section>

      {/* Workspace */}
      <section className="mt-12">
        <h2 className="type-h3">Workspace</h2>
        <dl className="mt-5 grid grid-cols-2 gap-x-8 gap-y-4 sm:grid-cols-3">
          <Field label="Nom" value={data.workspace.name} />
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
      </section>

      {/* Brand */}
      <section className="mt-12">
        <h2 className="type-h3">Marque trackée</h2>
        <dl className="mt-5 grid grid-cols-2 gap-x-8 gap-y-4 sm:grid-cols-3">
          <Field label="Nom" value={data.brand.name} />
          <Field label="Domaine" value={data.brand.domain} mono />
          <Field
            label="Aliases"
            value={
              brandRow[0]?.aliases && brandRow[0].aliases.length > 0
                ? brandRow[0].aliases.join(", ")
                : "aucun"
            }
          />
        </dl>
      </section>

      {/* Usage */}
      <section className="mt-12">
        <h2 className="type-h3">Usage du mois</h2>
        <p className="type-meta mt-1">Période en cours : {data.usage.periodStart}</p>
        <dl className="mt-5 grid grid-cols-2 gap-x-8 gap-y-4 sm:grid-cols-3">
          <Field label="Runs effectués" value={String(data.usage.runsCount)} />
          <Field label="Coût LLM cumulé" value={`$${data.usage.llmCostUsd.toFixed(4)}`} mono />
          <Field label="Prompts actifs" value={String(data.promptsCount)} />
        </dl>
      </section>

      <hr className="rule mt-12" />

      {/* Danger zone */}
      <section className="mt-10">
        <h2 className="type-h3 text-[color:var(--color-error)]">Zone sensible</h2>
        <p className="type-body mt-2 text-sm">
          La déconnexion ne supprime rien. Tu pourras te reconnecter à tout moment via le magic-link
          envoyé sur <strong>{session.user.email}</strong>.
        </p>
        <div className="mt-5">
          <SignOutButton />
        </div>
      </section>
    </main>
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
