"use client";

import { useRouter } from "next/navigation";
import { useState } from "react";
import { GitCompare, Loader2 } from "lucide-react";
import { Button } from "@/components/ui";
import { runCompetitorsBatch } from "../actions";

// Bouton lance-batch concurrents. Affiche un loading state puis refresh
// la page (les jobs enqueués apparaîtront dès qu'ils auront tourné via
// le dispatcher cron, ~5 min max).

export function CompetitorsBatchButton() {
  const router = useRouter();
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  async function onClick() {
    setLoading(true);
    setError(null);
    try {
      const result = await runCompetitorsBatch();
      if (!result.ok) {
        setError(result.error);
        return;
      }
      router.push("/app/audits/compare?batchStarted=1");
      router.refresh();
    } finally {
      setLoading(false);
    }
  }

  return (
    <div className="flex flex-col items-end gap-2">
      <Button onClick={onClick} variant="primary" size="md" disabled={loading}>
        {loading ? (
          <>
            <Loader2 size={14} className="mr-1.5 animate-spin" />
            Lancement…
          </>
        ) : (
          <>
            <GitCompare size={14} className="mr-1.5" />
            Auditer mes concurrents
          </>
        )}
      </Button>
      {error && <p className="type-meta text-[color:var(--color-error)]">{error}</p>}
    </div>
  );
}
