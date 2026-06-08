import { headers } from "next/headers";
import Link from "next/link";
import { redirect } from "next/navigation";
import { Globe, ChevronRight } from "lucide-react";
import { auth } from "@/lib/auth";
import { getUserContext } from "@/lib/auth/user-context";
import { Badge, EmptyState } from "@/components/ui";
import { LLM_LABELS } from "@/components/charts/llm-colors";
import { encodeSourceSlug, listCitedSources } from "@/lib/sources/queries";

// Page /app/sources — V0+ URL drill-down. Liste toutes les URLs citées
// au moins une fois par un LLM dans les runs success de la brand
// courante, classées par citation_count desc. Click → /app/sources/[id]
// pour le détail (runs où l'URL apparaît, prompts, LLMs).

export const dynamic = "force-dynamic";

export default async function SourcesPage() {
  const session = await auth.api.getSession({ headers: await headers() });
  if (!session) redirect("/login");

  const ctx = await getUserContext(session.user.id);
  if (!ctx) redirect("/app/onboarding");

  const sources = await listCitedSources(ctx.brand.id);

  return (
    <div className="mx-auto max-w-6xl px-6 py-12 lg:px-10">
      <header>
        <h1 className="type-h1">Sources citées</h1>
        <p className="type-meta mt-2">
          URLs que les LLMs ont récupérées dans leurs réponses sur {ctx.brand.name}.
        </p>
      </header>

      {sources.length === 0 ? (
        <div className="mt-10">
          <EmptyState
            icon={Globe}
            title="Aucune source pour l'instant"
            description="Les sources apparaîtront après les premiers runs avec web_search activé. Lance un run depuis le dashboard pour amorcer la collecte."
          />
        </div>
      ) : (
        <ul className="mt-10 flex flex-col gap-2">
          {sources.map((s) => {
            const slug = encodeSourceSlug(s.url);
            let host: string;
            try {
              host = new URL(s.url).host.replace(/^www\./, "");
            } catch {
              host = s.url;
            }
            return (
              <li key={s.url}>
                <Link
                  href={`/app/sources/${slug}`}
                  className="group flex items-center gap-4 rounded-[var(--radius-xl)] border border-[color:var(--color-border)] bg-white p-4 transition hover:border-[color:var(--color-border-strong)] hover:bg-[color:var(--color-gray-50)]"
                >
                  <div className="min-w-0 flex-1">
                    <div className="flex items-center gap-2">
                      <span className="type-eyebrow truncate text-[color:var(--color-ink-soft)]">
                        {host}
                      </span>
                      <Badge tone="neutral">{s.citationCount}×</Badge>
                    </div>
                    <p className="mt-1 truncate text-sm font-medium text-[color:var(--color-ink)]">
                      {s.title ?? s.url}
                    </p>
                    <div className="mt-2 flex flex-wrap items-center gap-1.5">
                      {s.llms.map((llm) => (
                        <Badge key={llm} tone="neutral">
                          {LLM_LABELS[llm] ?? llm}
                        </Badge>
                      ))}
                      <span className="type-meta ml-2">
                        dernière citation {formatRelative(s.lastCitedAt)}
                      </span>
                    </div>
                  </div>
                  <ChevronRight
                    size={18}
                    className="shrink-0 text-[color:var(--color-muted)] transition group-hover:translate-x-0.5 group-hover:text-[color:var(--color-ink)]"
                  />
                </Link>
              </li>
            );
          })}
        </ul>
      )}
    </div>
  );
}

function formatRelative(iso: string): string {
  const diffMs = Date.now() - new Date(iso).getTime();
  const diffMin = Math.floor(diffMs / 60_000);
  if (diffMin < 1) return "à l'instant";
  if (diffMin < 60) return `il y a ${diffMin} min`;
  const diffH = Math.floor(diffMin / 60);
  if (diffH < 24) return `il y a ${diffH} h`;
  const diffD = Math.floor(diffH / 24);
  return `il y a ${diffD} j`;
}
