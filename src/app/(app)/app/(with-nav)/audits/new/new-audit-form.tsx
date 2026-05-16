"use client";

import Link from "next/link";
import { useRouter } from "next/navigation";
import { useState, type FormEvent } from "react";
import { Loader2 } from "lucide-react";
import { Banner, Button } from "@/components/ui";
import { runCompetitorsBatch, runWorkspaceAudit } from "../actions";

// Formulaire client de /app/audits/new. Server action `runWorkspaceAudit`
// synchrone (~10s) → loading state pendant l'attente.

export function NewAuditForm({
  defaultUrl,
  remainingAudits,
  canBatchCompetitors,
}: {
  defaultUrl: string;
  remainingAudits: number | null;
  canBatchCompetitors: boolean;
}) {
  const router = useRouter();
  const [url, setUrl] = useState(defaultUrl);
  const [alsoBatch, setAlsoBatch] = useState(false);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  async function onSubmit(e: FormEvent<HTMLFormElement>) {
    e.preventDefault();
    setLoading(true);
    setError(null);
    try {
      const result = await runWorkspaceAudit({ url, isCompetitor: false });
      if (!result.ok) {
        if ("resource" in result) {
          setError(
            `Quota ${result.resource} atteint : ${result.current}/${result.max} sur le plan ${result.plan}.`,
          );
        } else {
          setError(result.error);
        }
        return;
      }

      // Si l'option batch concurrents est cochée, on déclenche l'enqueue
      // async — l'utilisateur sera redirigé vers la page compare.
      if (alsoBatch && canBatchCompetitors) {
        const batch = await runCompetitorsBatch();
        if (!batch.ok) {
          // Audit owned a réussi, mais le batch a échoué — on redirige
          // quand même vers le détail + on note l'erreur.
          router.push(`/app/audits/${result.id}?batchError=${encodeURIComponent(batch.error)}`);
          return;
        }
        router.push("/app/audits/compare?batchStarted=1");
        return;
      }

      router.push(`/app/audits/${result.id}`);
    } catch (err) {
      setError(err instanceof Error ? err.message : "Erreur inconnue");
    } finally {
      setLoading(false);
    }
  }

  const noQuotaLeft = remainingAudits !== null && remainingAudits <= 0;

  return (
    <form onSubmit={onSubmit} className="flex flex-col gap-6">
      <div>
        <label htmlFor="audit-url" className="type-eyebrow block">
          URL à auditer
        </label>
        <input
          id="audit-url"
          type="url"
          value={url}
          onChange={(e) => setUrl(e.target.value)}
          required
          autoFocus
          disabled={loading}
          placeholder="https://exemple.com"
          className="mt-2 w-full rounded-[var(--radius-lg)] border border-[color:var(--color-border)] bg-white px-4 py-3 text-sm font-mono outline-none focus:border-[color:var(--color-ink)] disabled:opacity-60"
        />
        <p className="type-meta mt-2">
          Page d&apos;accueil par défaut. Tu peux auditer n&apos;importe quelle URL publique (page
          produit, blog post, etc.).
        </p>
      </div>

      {canBatchCompetitors && (
        <label className="flex items-start gap-3 rounded-[var(--radius-lg)] border border-[color:var(--color-border)] bg-white p-4 cursor-pointer hover:border-[color:var(--color-border-strong)]">
          <input
            type="checkbox"
            checked={alsoBatch}
            onChange={(e) => setAlsoBatch(e.target.checked)}
            disabled={loading}
            className="mt-1"
          />
          <div>
            <p className="text-sm font-medium text-[color:var(--color-ink)]">
              Lancer aussi sur mes concurrents
            </p>
            <p className="type-meta mt-1">
              Audite en parallèle les domaines de tes concurrents trackés. Affiche une matrice
              comparative dans /app/audits/compare. Consomme des unités du quota concurrents
              (séparé).
            </p>
          </div>
        </label>
      )}

      {error && <Banner tone="error">{error}</Banner>}

      {noQuotaLeft && (
        <Banner tone="warning">
          Quota mensuel d&apos;audits atteint. Tu peux passer à un plan supérieur via /app/settings,
          ou attendre le 1ᵉʳ du mois prochain.
        </Banner>
      )}

      <div className="flex items-center gap-3">
        <Button type="submit" variant="primary" size="lg" disabled={loading || noQuotaLeft}>
          {loading ? (
            <>
              <Loader2 size={14} className="mr-2 animate-spin" />
              Analyse en cours… (~10 s)
            </>
          ) : (
            "Lancer l'audit →"
          )}
        </Button>
        {!loading && (
          <Link
            href="/app/audits"
            className="text-sm text-[color:var(--color-ink-soft)] underline-offset-2 hover:underline"
          >
            Annuler
          </Link>
        )}
      </div>
    </form>
  );
}
