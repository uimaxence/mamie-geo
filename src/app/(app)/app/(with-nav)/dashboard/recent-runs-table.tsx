"use client";

import Link from "next/link";
import { useRouter } from "next/navigation";
import { useState } from "react";
import { ArrowRight } from "lucide-react";
import { Badge } from "@/components/ui";
import { RunStatusBadge } from "@/components/app/run-status-badge";
import { cn } from "@/lib/utils";
import type { RecentRun } from "@/lib/dashboard/queries";

// Table « 10 derniers runs » du dashboard. Extraite en client component
// pour gérer un badge « Ouvrir le détail » qui suit le curseur sur
// survol de ligne, et pour rendre toute la ligne cliquable (pas
// seulement la cellule prompt).
//
// Le badge est rendu une seule fois (en `fixed`) et sa position est
// mise à jour via state sur mouseMove. Pour 10 lignes, c'est large-
// ment acceptable côté perf (pas de framerate visible).
//
// Le `<Link>` inner reste pour a11y + Cmd-click open-in-new-tab —
// le `useRouter` sur la `<tr>` ne se déclenche que sur clic souris
// hors du Link (cf. event bubbling), donc pas de double navigation.

interface HoverState {
  x: number;
  y: number;
}

export function RecentRunsTable({ rows }: { rows: RecentRun[] }) {
  const [hover, setHover] = useState<HoverState | null>(null);

  return (
    <div className="mt-4 overflow-x-auto">
      <table className="w-full border-collapse text-left">
        <thead>
          <tr className="border-b border-[color:var(--color-border)]">
            <Th>Prompt</Th>
            <Th>LLM</Th>
            <Th>Statut</Th>
            <Th>Citée</Th>
            <Th align="right">Coût</Th>
            <Th align="right">Durée</Th>
            <Th align="right">Exécuté</Th>
          </tr>
        </thead>
        <tbody>
          {rows.map((run) => (
            <Row
              key={run.id}
              run={run}
              onCursorEnter={(x, y) => setHover({ x, y })}
              onCursorMove={(x, y) => setHover({ x, y })}
              onCursorLeave={() => setHover(null)}
            />
          ))}
        </tbody>
      </table>

      {/* Badge follow-cursor — toujours monté pour permettre la
       * transition d'opacité, caché en `< md` (pas de hover tactile). */}
      <div
        aria-hidden
        className={cn(
          "pointer-events-none fixed z-50 hidden items-center gap-1.5 rounded-[var(--radius-pill)] bg-[color:var(--color-ink)] px-3 py-1.5 text-xs font-medium text-white shadow-[var(--shadow-md)] transition-opacity duration-150 md:inline-flex",
          hover ? "opacity-100" : "opacity-0",
        )}
        style={{
          left: hover ? hover.x + 16 : 0,
          top: hover ? hover.y + 14 : 0,
        }}
      >
        <ArrowRight size={12} strokeWidth={2.25} />
        Ouvrir le détail
      </div>
    </div>
  );
}

interface RowProps {
  run: RecentRun;
  onCursorEnter: (x: number, y: number) => void;
  onCursorMove: (x: number, y: number) => void;
  onCursorLeave: () => void;
}

function Row({ run, onCursorEnter, onCursorMove, onCursorLeave }: RowProps) {
  const router = useRouter();
  const href = `/app/runs/${run.id}`;

  return (
    <tr
      onClick={() => router.push(href)}
      onMouseEnter={(e) => onCursorEnter(e.clientX, e.clientY)}
      onMouseMove={(e) => onCursorMove(e.clientX, e.clientY)}
      onMouseLeave={onCursorLeave}
      className="group cursor-pointer border-b border-[color:var(--color-border)] last:border-b-0 hover:bg-[color:var(--color-gray-50)]"
    >
      <Td>
        <Link
          href={href}
          // stopPropagation pour éviter une double-navigation
          // (Link gère déjà, useRouter sur tr le ferait en plus).
          onClick={(e) => e.stopPropagation()}
          className="block max-w-md truncate text-[color:var(--color-ink)] group-hover:underline group-hover:underline-offset-2"
          title={run.promptText}
        >
          {run.promptText}
        </Link>
      </Td>
      <Td>
        <span className="text-sm">{run.llm}</span>
      </Td>
      <Td>
        <StatusBadge status={run.status} />
      </Td>
      <Td>
        <BrandSignal value={run.brandMentioned} />
      </Td>
      <Td align="right">
        <span className="type-tabular text-sm">
          {run.costUsd !== null ? `$${run.costUsd.toFixed(4)}` : "—"}
        </span>
      </Td>
      <Td align="right">
        <span className="type-tabular text-sm">
          {run.durationMs !== null ? `${(run.durationMs / 1000).toFixed(1)}s` : "—"}
        </span>
      </Td>
      <Td align="right">
        <span className="type-meta">
          {run.executedAt ? formatRelative(run.executedAt) : "en attente"}
        </span>
      </Td>
    </tr>
  );
}

function Th({ children, align = "left" }: { children: React.ReactNode; align?: "left" | "right" }) {
  return (
    <th
      className={`type-eyebrow py-2.5 px-3 ${align === "right" ? "text-right" : "text-left"}`}
      scope="col"
    >
      {children}
    </th>
  );
}

function Td({ children, align = "left" }: { children: React.ReactNode; align?: "left" | "right" }) {
  return (
    <td className={`py-3 px-3 align-middle ${align === "right" ? "text-right" : "text-left"}`}>
      {children}
    </td>
  );
}

function StatusBadge({ status }: { status: string }) {
  return <RunStatusBadge status={status} />;
}

function BrandSignal({ value }: { value: RecentRun["brandMentioned"] }) {
  if (value === true) return <Badge tone="success">citée</Badge>;
  if (value === false) return <span className="type-meta">non</span>;
  if (value === "skipped") return <span className="type-meta">regex 0</span>;
  return <span className="type-meta">—</span>;
}

function formatRelative(date: Date): string {
  const diffMs = Date.now() - new Date(date).getTime();
  const diffMin = Math.floor(diffMs / 60_000);
  if (diffMin < 1) return "à l'instant";
  if (diffMin < 60) return `il y a ${diffMin} min`;
  const diffH = Math.floor(diffMin / 60);
  if (diffH < 24) return `il y a ${diffH} h`;
  const diffD = Math.floor(diffH / 24);
  return `il y a ${diffD} j`;
}
