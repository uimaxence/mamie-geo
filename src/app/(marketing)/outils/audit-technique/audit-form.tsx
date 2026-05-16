"use client";

import { useState, useTransition } from "react";
import { Button, Input, Skeleton } from "@/components/ui";
import type { AuditResult } from "@/lib/audit/types";
import { runAuditAction } from "./actions";
import { AuditResults } from "./audit-results";

// Form principal /outils/audit-technique — input URL + soumission.
// Switche entre 3 états : idle (form visible) / loading (skeleton) /
// results (résultats teaser).

export function AuditForm() {
  const [url, setUrl] = useState("");
  const [result, setResult] = useState<AuditResult | null>(null);
  const [pending, startTransition] = useTransition();
  const [error, setError] = useState<string | null>(null);

  function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setError(null);
    setResult(null);
    if (!url.trim()) {
      setError("Entre une URL pour lancer l'audit.");
      return;
    }
    startTransition(async () => {
      const r = await runAuditAction(url.trim());
      if (!r.ok) {
        setError(r.message);
        return;
      }
      setResult(r);
    });
  }

  function handleReset() {
    setResult(null);
    setUrl("");
    setError(null);
  }

  if (pending) {
    return <AuditLoadingSkeleton />;
  }

  if (result && result.ok) {
    return <AuditResults report={result.report} onReset={handleReset} />;
  }

  return (
    <form
      onSubmit={handleSubmit}
      className="mx-auto max-w-2xl rounded-[var(--radius-xl)] border border-[color:var(--color-border)] bg-white p-6 shadow-[var(--shadow-sm)]"
    >
      <label htmlFor="audit-url" className="type-eyebrow block mb-2">
        URL à auditer
      </label>
      <div className="flex flex-col gap-3 sm:flex-row">
        <Input
          id="audit-url"
          type="text"
          placeholder="https://ton-site.fr"
          value={url}
          onChange={(e) => setUrl(e.target.value)}
          className="flex-1"
          required
          autoFocus
        />
        <Button type="submit" size="lg" disabled={pending}>
          Lancer l&apos;audit
        </Button>
      </div>
      {error && (
        <p className="mt-3 rounded-[var(--radius-md)] bg-[color:var(--color-error-bg)] px-3 py-2 text-sm text-[color:var(--color-error)]">
          {error}
        </p>
      )}
      <p className="type-meta mt-4">
        ~10 secondes d&apos;analyse · gratuit · aucun appel LLM · pas d&apos;inscription requise
      </p>
    </form>
  );
}

function AuditLoadingSkeleton() {
  return (
    <div className="mx-auto max-w-3xl">
      <p className="type-meta mb-4 text-center">
        Analyse en cours… On vérifie 30+ signaux SEO + GEO + Core Web Vitals.
      </p>
      <div className="rounded-[var(--radius-xl)] border border-[color:var(--color-border)] bg-white p-6">
        <Skeleton className="h-20 w-full" />
        <div className="mt-4 grid grid-cols-2 gap-3 sm:grid-cols-4">
          <Skeleton className="h-24" />
          <Skeleton className="h-24" />
          <Skeleton className="h-24" />
          <Skeleton className="h-24" />
        </div>
        <Skeleton className="mt-6 h-16" />
        <Skeleton className="mt-3 h-16" />
        <Skeleton className="mt-3 h-16" />
      </div>
    </div>
  );
}
