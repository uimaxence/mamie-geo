"use client";

import Link from "next/link";
import { useRouter } from "next/navigation";
import { useEffect, useState } from "react";
import { CheckCircle2, Loader2, Sparkles, X } from "lucide-react";
import { toast } from "@/components/ui";
import { useRunEvents, type RunEventSnapshot } from "./use-run-events";

// Bannière sticky en haut du dashboard (et autres pages app) qui suit
// l'état des runs en temps réel via SSE. 3 états :
//   1. running : "Premier run en cours sur Claude…" + spinner pulsé
//   2. some done : "1/5 runs terminés (Claude ✓, ChatGPT en cours…)"
//   3. all done : "Tracking actif ✓", auto-fade après 5s
//
// + à chaque transition success, déclenche un toast informatif.
//
// Dismissable manuellement via le bouton x ; ré-affichée si nouveaux
// runs apparaissent ensuite.

const AUTO_HIDE_AFTER_ALL_DONE_MS = 6_000;

const LLM_LABELS: Record<string, string> = {
  claude: "Claude",
  chatgpt: "ChatGPT",
  perplexity: "Perplexity",
  gemini: "Gemini",
  lechat: "Le Chat",
};

export function RunActivityBar() {
  const router = useRouter();
  const [dismissedSnapshot, setDismissedSnapshot] = useState<{ totalAtDismiss: number } | null>(
    null,
  );
  const [autoHidden, setAutoHidden] = useState(false);

  const { pendingOrRunning, succeeded, runs } = useRunEvents({
    onSuccess: (run) => {
      const llm = LLM_LABELS[run.llm] ?? run.llm;
      toast.success(`Run terminé sur ${llm}`, {
        description: truncate(run.promptText, 80),
        duration: 5_000,
      });
      // Refresh la page server-side : les empty states disparaissent
      // automatiquement, le graph se met à jour, les recent runs aussi.
      router.refresh();
    },
    onFailed: (run) => {
      const llm = LLM_LABELS[run.llm] ?? run.llm;
      toast.error(`Run échoué sur ${llm}`, {
        description: truncate(run.promptText, 80),
        duration: 4_000,
      });
      router.refresh();
    },
  });

  const total = runs.length;
  const isAllDone = total > 0 && pendingOrRunning.length === 0;
  const hasAnyActivity = total > 0;

  // Auto-hide quand tous les runs sont done depuis qq sec. Quand de
  // nouveaux runs apparaissent, isAllDone repasse à false → l'effet
  // re-cleanup et la bar se re-affiche.
  useEffect(() => {
    if (!isAllDone) return;
    const timer = setTimeout(() => setAutoHidden(true), AUTO_HIDE_AFTER_ALL_DONE_MS);
    return () => {
      clearTimeout(timer);
      setAutoHidden(false);
    };
  }, [isAllDone]);

  // Dismiss : on note le total au moment du dismiss. Si de nouveaux runs
  // arrivent (total augmente), on ré-affiche. Dérivé synchroniquement,
  // pas via useEffect (évite "set-state-in-effect").
  const dismissed = dismissedSnapshot !== null && total <= dismissedSnapshot.totalAtDismiss;

  if (dismissed || autoHidden || !hasAnyActivity) return null;

  return (
    <div className="border-b border-[color:var(--color-border)] bg-[color:var(--color-gray-50)]">
      <div className="mx-auto flex max-w-6xl items-center justify-between gap-3 px-4 py-2 text-sm">
        <div className="flex min-w-0 flex-1 items-center gap-3">
          {pendingOrRunning.length > 0 ? (
            <RunningState pendingOrRunning={pendingOrRunning} succeeded={succeeded} total={total} />
          ) : (
            <DoneState total={total} />
          )}
        </div>
        <button
          type="button"
          aria-label="Masquer"
          onClick={() => setDismissedSnapshot({ totalAtDismiss: total })}
          className="shrink-0 rounded-full p-1 text-[color:var(--color-muted)] hover:bg-white hover:text-[color:var(--color-ink)]"
        >
          <X size={14} />
        </button>
      </div>
    </div>
  );
}

function RunningState({
  pendingOrRunning,
  succeeded,
  total,
}: {
  pendingOrRunning: RunEventSnapshot[];
  succeeded: RunEventSnapshot[];
  total: number;
}) {
  const next = pendingOrRunning[0];
  const llm = next ? (LLM_LABELS[next.llm] ?? next.llm) : "";
  return (
    <>
      <span className="flex items-center gap-2 text-[color:var(--color-ink)]">
        <Sparkles size={14} className="text-[color:var(--color-accent)]" />
        <span className="font-medium">
          {succeeded.length} / {total} runs terminés
        </span>
      </span>
      <span className="hidden items-center gap-1.5 text-[color:var(--color-ink-soft)] sm:flex">
        <Loader2 size={12} className="animate-spin" />
        Run en cours sur <strong className="font-medium">{llm}</strong>
        <span className="type-meta truncate max-w-[200px]">
          {truncate(next?.promptText ?? "", 50)}
        </span>
      </span>
    </>
  );
}

function DoneState({ total }: { total: number }) {
  return (
    <Link
      href="/app/dashboard"
      className="flex items-center gap-2 text-[color:var(--color-success)] hover:underline"
    >
      <CheckCircle2 size={14} />
      <span className="font-medium">
        {total} run{total > 1 ? "s" : ""} terminé{total > 1 ? "s" : ""} ✓, voir les résultats
      </span>
    </Link>
  );
}

function truncate(s: string, max: number): string {
  if (s.length <= max) return s;
  return `${s.slice(0, max - 1)}…`;
}
