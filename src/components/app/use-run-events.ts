"use client";

import { useEffect, useRef, useState } from "react";

// Hook React qui s'abonne à /api/runs/events (SSE) et expose les runs
// récents du workspace + un état de connexion. Auto-reconnect quand le
// serveur ferme la connexion (Vercel limite ~28s par function).
//
// La consommation est :
//   const { runs, hasNewSuccess } = useRunEvents();
//
// hasNewSuccess est un callback ref qui notifie quand un nouveau run
// passe en `success`, utilisé pour déclencher un toast.

export interface RunEventSnapshot {
  id: string;
  status: "pending" | "running" | "success" | "failed" | "skipped" | string;
  llm: string;
  promptText: string;
  scheduledAt: string;
  executedAt: string | null;
}

export interface UseRunEventsOptions {
  /** Désactive l'abonnement (ex: page où on n'en a pas besoin). */
  enabled?: boolean;
  /** Appelée à chaque run qui passe en success (pas re-déclenché si déjà émis). */
  onSuccess?: (run: RunEventSnapshot) => void;
  /** Appelée à chaque run qui passe en failed. */
  onFailed?: (run: RunEventSnapshot) => void;
}

export function useRunEvents({ enabled = true, onSuccess, onFailed }: UseRunEventsOptions = {}) {
  const [runs, setRuns] = useState<Map<string, RunEventSnapshot>>(() => new Map());
  const [isConnected, setIsConnected] = useState(false);
  const reconnectTimer = useRef<ReturnType<typeof setTimeout> | null>(null);
  // Pour éviter de re-firer onSuccess sur les snapshots déjà vus au boot.
  const knownSuccess = useRef<Set<string>>(new Set());
  const knownFailed = useRef<Set<string>>(new Set());

  // Stocke onSuccess/onFailed dans des refs pour éviter de re-créer
  // l'EventSource à chaque changement de callback.
  const onSuccessRef = useRef(onSuccess);
  const onFailedRef = useRef(onFailed);
  useEffect(() => {
    onSuccessRef.current = onSuccess;
    onFailedRef.current = onFailed;
  }, [onSuccess, onFailed]);

  useEffect(() => {
    if (!enabled) return;

    let source: EventSource | null = null;
    let isMounted = true;

    const connect = () => {
      if (!isMounted) return;
      source = new EventSource("/api/runs/events");

      source.addEventListener("snapshot", (e) => {
        const payload = JSON.parse((e as MessageEvent).data) as { runs: RunEventSnapshot[] };
        setRuns(() => {
          const next = new Map<string, RunEventSnapshot>();
          for (const r of payload.runs) {
            next.set(r.id, r);
            if (r.status === "success") knownSuccess.current.add(r.id);
            if (r.status === "failed") knownFailed.current.add(r.id);
          }
          return next;
        });
        setIsConnected(true);
      });

      source.addEventListener("update", (e) => {
        const payload = JSON.parse((e as MessageEvent).data) as { runs: RunEventSnapshot[] };
        setRuns((prev) => {
          const next = new Map(prev);
          for (const r of payload.runs) {
            next.set(r.id, r);
            if (r.status === "success" && !knownSuccess.current.has(r.id)) {
              knownSuccess.current.add(r.id);
              onSuccessRef.current?.(r);
            }
            if (r.status === "failed" && !knownFailed.current.has(r.id)) {
              knownFailed.current.add(r.id);
              onFailedRef.current?.(r);
            }
          }
          return next;
        });
      });

      source.addEventListener("close", () => {
        // Le serveur ferme proprement après 28s. On reconnect immédiatement.
        source?.close();
        source = null;
        setIsConnected(false);
        if (isMounted) {
          reconnectTimer.current = setTimeout(connect, 200);
        }
      });

      source.onerror = () => {
        // Erreur réseau / connexion fermée. Backoff 1s puis reconnect.
        source?.close();
        source = null;
        setIsConnected(false);
        if (isMounted) {
          reconnectTimer.current = setTimeout(connect, 1_000);
        }
      };
    };

    connect();

    return () => {
      isMounted = false;
      if (reconnectTimer.current) clearTimeout(reconnectTimer.current);
      source?.close();
    };
  }, [enabled]);

  // Statistiques agrégées utiles pour la bannière.
  const runsArray = Array.from(runs.values());
  const pendingOrRunning = runsArray.filter(
    (r) => r.status === "pending" || r.status === "running",
  );
  const succeeded = runsArray.filter((r) => r.status === "success");
  const failed = runsArray.filter((r) => r.status === "failed");

  return {
    runs: runsArray,
    isConnected,
    /** Runs en cours (pending + running). */
    pendingOrRunning,
    /** Runs success. */
    succeeded,
    /** Runs failed. */
    failed,
  };
}
