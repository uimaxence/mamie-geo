"use client";

import { useState, useTransition } from "react";
import { Button } from "@/components/ui/button";
import { Input, Field } from "@/components/ui/input";
import { grantBeta, revokeBeta } from "@/lib/admin/beta-actions";

export interface BetaWorkspaceRow {
  workspaceId: string;
  workspaceName: string;
  email: string | null;
  expiresAt: string | null;
  runsThisMonth: number;
  costThisMonthUsd: number;
}

function formatDate(iso: string | null): string {
  if (!iso) return "-";
  return new Date(iso).toLocaleDateString("fr-FR", {
    day: "2-digit",
    month: "short",
    year: "numeric",
  });
}

function daysLeft(iso: string | null): number | null {
  if (!iso) return null;
  return Math.ceil((new Date(iso).getTime() - Date.now()) / (24 * 60 * 60 * 1000));
}

export function BetaAdminClient({
  rows,
  totalCostThisMonthUsd,
}: {
  rows: BetaWorkspaceRow[];
  totalCostThisMonthUsd: number;
}) {
  const [email, setEmail] = useState("");
  const [days, setDays] = useState("90");
  const [message, setMessage] = useState<{ tone: "ok" | "err"; text: string } | null>(null);
  const [isPending, startTransition] = useTransition();

  function onGrant(e: React.FormEvent) {
    e.preventDefault();
    setMessage(null);
    startTransition(async () => {
      const res = await grantBeta({ email, days: Number(days) });
      if (res.ok) {
        setMessage({
          tone: "ok",
          text: `Accès beta accordé à « ${res.workspaceName} » jusqu'au ${formatDate(res.expiresAt)}.`,
        });
        setEmail("");
      } else {
        const text =
          res.error === "user_not_found"
            ? "Aucun compte avec cet email (le testeur doit d'abord se connecter une fois)."
            : res.error === "no_workspace"
              ? "Ce compte existe mais n'a pas encore de workspace."
              : res.error === "validation"
                ? res.message
                : "Action non autorisée.";
        setMessage({ tone: "err", text });
      }
    });
  }

  function onRevoke(workspaceId: string, name: string) {
    if (!confirm(`Révoquer l'accès beta de « ${name} » ? Le workspace repasse en expired.`)) return;
    setMessage(null);
    startTransition(async () => {
      const res = await revokeBeta({ workspaceId });
      if (res.ok) setMessage({ tone: "ok", text: `Accès beta révoqué pour « ${name} ».` });
      else setMessage({ tone: "err", text: "Révocation impossible (déjà non-beta ?)." });
    });
  }

  return (
    <div className="space-y-8">
      {/* Formulaire d'octroi */}
      <form
        onSubmit={onGrant}
        className="rounded-[var(--radius-lg)] border border-[color:var(--color-border)] bg-white p-5"
      >
        <h2 className="text-sm font-semibold text-[color:var(--color-ink)]">Accorder un accès</h2>
        <div className="mt-4 flex flex-wrap items-end gap-3">
          <Field label="Email du testeur" className="min-w-[260px] flex-1">
            <Input
              type="email"
              required
              placeholder="testeur@agence.fr"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
            />
          </Field>
          <Field label="Durée (jours)" className="w-28">
            <Input
              type="number"
              min={1}
              max={365}
              value={days}
              onChange={(e) => setDays(e.target.value)}
            />
          </Field>
          <Button type="submit" disabled={isPending}>
            {isPending ? "…" : "Accorder"}
          </Button>
        </div>
        <p className="mt-3 text-xs text-[color:var(--color-muted)]">
          Le testeur doit s&apos;être connecté au moins une fois (compte + workspace créés) avant
          l&apos;octroi.
        </p>
        {message && (
          <p
            className={`mt-3 text-sm ${message.tone === "ok" ? "text-emerald-600" : "text-red-600"}`}
          >
            {message.text}
          </p>
        )}
      </form>

      {/* Liste des comptes beta */}
      <div className="rounded-[var(--radius-lg)] border border-[color:var(--color-border)] bg-white">
        <div className="flex items-center justify-between border-b border-[color:var(--color-border)] px-5 py-3">
          <h2 className="text-sm font-semibold text-[color:var(--color-ink)]">
            Comptes beta actifs ({rows.length})
          </h2>
          <span className="text-xs text-[color:var(--color-muted)]">
            Coût LLM cumulé ce mois : <strong>${totalCostThisMonthUsd.toFixed(2)}</strong>
          </span>
        </div>
        {rows.length === 0 ? (
          <p className="px-5 py-8 text-center text-sm text-[color:var(--color-muted)]">
            Aucun accès beta actif.
          </p>
        ) : (
          <table className="w-full text-sm">
            <thead>
              <tr className="border-b border-[color:var(--color-border)] text-left text-xs uppercase tracking-wide text-[color:var(--color-muted)]">
                <th className="px-5 py-2 font-medium">Workspace</th>
                <th className="px-5 py-2 font-medium">Email</th>
                <th className="px-5 py-2 font-medium">Expire</th>
                <th className="px-5 py-2 text-right font-medium">Runs / mois</th>
                <th className="px-5 py-2 text-right font-medium">Coût / mois</th>
                <th className="px-5 py-2"></th>
              </tr>
            </thead>
            <tbody>
              {rows.map((r) => {
                const left = daysLeft(r.expiresAt);
                return (
                  <tr
                    key={r.workspaceId}
                    className="border-b border-[color:var(--color-border)] last:border-0"
                  >
                    <td className="px-5 py-3 font-medium text-[color:var(--color-ink)]">
                      {r.workspaceName}
                    </td>
                    <td className="px-5 py-3 text-[color:var(--color-muted)]">{r.email ?? "-"}</td>
                    <td className="px-5 py-3">
                      {formatDate(r.expiresAt)}
                      {left !== null && (
                        <span
                          className={`ml-2 text-xs ${left <= 7 ? "text-red-600" : "text-[color:var(--color-muted)]"}`}
                        >
                          ({left} j)
                        </span>
                      )}
                    </td>
                    <td className="px-5 py-3 text-right tabular-nums">{r.runsThisMonth}</td>
                    <td className="px-5 py-3 text-right tabular-nums">
                      ${r.costThisMonthUsd.toFixed(2)}
                    </td>
                    <td className="px-5 py-3 text-right">
                      <Button
                        variant="ghost"
                        size="sm"
                        disabled={isPending}
                        onClick={() => onRevoke(r.workspaceId, r.workspaceName)}
                      >
                        Révoquer
                      </Button>
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        )}
      </div>
    </div>
  );
}
