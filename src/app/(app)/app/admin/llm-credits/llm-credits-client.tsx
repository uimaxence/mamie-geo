"use client";

import { useState, useTransition } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import type { ProviderCredit } from "@/lib/admin/llm-credits";
import { deleteTopup, setBalance } from "@/lib/admin/llm-credits-actions";

function money(n: number, currency: string): string {
  return `${currency}${n.toFixed(2)}`;
}

function formatDate(iso: string | null): string {
  if (!iso) return "—";
  return new Date(iso).toLocaleDateString("fr-FR", {
    day: "2-digit",
    month: "short",
    year: "numeric",
  });
}

// Seuils d'alerte.
const LOW_BALANCE_USD = 10; // prepaid : recharge si solde estimé sous ce seuil
const LIMIT_WARN_RATIO = 0.8; // monthly_limit : alerte si dépensé ≥ 80 % du plafond

export function LlmCreditsClient({ providers }: { providers: ProviderCredit[] }) {
  return (
    <div className="grid gap-4 sm:grid-cols-2">
      {providers.map((p) => (
        <ProviderCard key={p.meta.key} p={p} />
      ))}
    </div>
  );
}

function ProviderCard({ p }: { p: ProviderCredit }) {
  const [value, setValue] = useState("");
  const [message, setMessage] = useState<{ tone: "ok" | "err"; text: string } | null>(null);
  const [isPending, startTransition] = useTransition();

  const cur = p.meta.currency;
  const isPrepaid = p.meta.kind === "prepaid";
  // Alerte : prepaid sous seuil bas, ou monthly_limit au-delà de 80 % du plafond.
  const low =
    p.remaining !== null &&
    (isPrepaid
      ? p.remaining <= LOW_BALANCE_USD
      : p.configuredAmount !== null &&
        p.configuredAmount > 0 &&
        p.spentThisMonth / p.configuredAmount >= LIMIT_WARN_RATIO);

  function onSet(e: React.FormEvent) {
    e.preventDefault();
    setMessage(null);
    startTransition(async () => {
      const res = await setBalance({ provider: p.meta.key, balanceUsd: Number(value) });
      if (res.ok) {
        setMessage({ tone: "ok", text: isPrepaid ? "Solde mis à jour." : "Plafond mis à jour." });
        setValue("");
      } else {
        setMessage({
          tone: "err",
          text: res.error === "validation" ? res.message : "Action non autorisée.",
        });
      }
    });
  }

  function onDelete(id: string) {
    if (!confirm("Supprimer cette saisie ?")) return;
    startTransition(async () => {
      await deleteTopup({ id });
    });
  }

  return (
    <div className="rounded-[var(--radius-lg)] border border-[color:var(--color-border)] bg-white p-5">
      <div className="flex items-center justify-between">
        <h3 className="text-sm font-semibold text-[color:var(--color-ink)]">{p.meta.label}</h3>
        <a
          href={p.meta.billingUrl}
          target="_blank"
          rel="noopener noreferrer"
          className="text-xs text-[color:var(--color-accent,#329CFF)] hover:underline"
        >
          Billing ↗
        </a>
      </div>

      {/* Bloc état : solde estimé (prepaid) ou dépensé/plafond (monthly_limit) */}
      {p.configuredAmount === null ? (
        <p className="mt-3 text-sm text-[color:var(--color-muted)]">
          {isPrepaid
            ? "Solde inconnu — saisis le montant actuel ci-dessous."
            : "Plafond non renseigné — saisis ta limite mensuelle ci-dessous."}
        </p>
      ) : isPrepaid ? (
        <div className="mt-3">
          <p
            className={`text-2xl font-bold tabular-nums ${low ? "text-red-600" : "text-[color:var(--color-ink)]"}`}
          >
            {money(p.remaining ?? 0, cur)}
            {low && <span className="ml-2 align-middle text-xs font-medium">⚠️ recharge</span>}
          </p>
          <p className="text-xs text-[color:var(--color-muted)]">
            solde estimé · {money(p.configuredAmount, cur)} saisi le {formatDate(p.configuredAt)} −{" "}
            {money(p.spentSinceLast, "$")} dépensés depuis
          </p>
        </div>
      ) : (
        <div className="mt-3">
          <p
            className={`text-2xl font-bold tabular-nums ${low ? "text-red-600" : "text-[color:var(--color-ink)]"}`}
          >
            {money(p.spentThisMonth, "$")}
            <span className="text-base font-normal text-[color:var(--color-muted)]">
              {" "}
              / {money(p.configuredAmount, cur)} ce mois
            </span>
            {low && (
              <span className="ml-2 align-middle text-xs font-medium">⚠️ proche du plafond</span>
            )}
          </p>
          {/* Jauge dépensé/plafond (approx : dépense USD vs plafond provider) */}
          <div className="mt-2 h-1.5 w-full overflow-hidden rounded-full bg-[color:var(--color-gray-100)]">
            <div
              className={`h-full ${low ? "bg-red-500" : "bg-[color:var(--color-ink)]"}`}
              style={{
                width: `${Math.min(100, (p.spentThisMonth / p.configuredAmount) * 100).toFixed(1)}%`,
              }}
            />
          </div>
          <p className="mt-1 text-xs text-[color:var(--color-muted)]">
            plafond mensuel · se réinitialise chaque mois
          </p>
        </div>
      )}

      {/* Champ de saisie : solde actuel (prepaid) ou limite mensuelle (monthly_limit) */}
      <form onSubmit={onSet} className="mt-4 flex items-end gap-2">
        <label className="flex-1">
          <span className="mb-1 block text-xs font-medium text-[color:var(--color-muted)]">
            {isPrepaid ? `Solde actuel (${cur})` : `Limite mensuelle (${cur})`}
          </span>
          <Input
            type="number"
            step="0.01"
            min="0"
            required
            placeholder={isPrepaid ? "ex: 3.79" : "ex: 150"}
            value={value}
            onChange={(e) => setValue(e.target.value)}
          />
        </label>
        <Button type="submit" size="sm" disabled={isPending}>
          {isPending ? "…" : "Mettre à jour"}
        </Button>
      </form>
      {message && (
        <p
          className={`mt-2 text-xs ${message.tone === "ok" ? "text-emerald-600" : "text-red-600"}`}
        >
          {message.text}
        </p>
      )}

      {/* Dépenses (notre tracking, USD) */}
      <dl className="mt-4 grid grid-cols-2 gap-2 border-t border-[color:var(--color-border)] pt-3 text-sm">
        <div>
          <dt className="text-xs text-[color:var(--color-muted)]">Dépensé 30 j</dt>
          <dd className="tabular-nums text-[color:var(--color-ink)]">{money(p.spent30d, "$")}</dd>
        </div>
        <div>
          <dt className="text-xs text-[color:var(--color-muted)]">Dépensé total</dt>
          <dd className="tabular-nums text-[color:var(--color-ink)]">
            {money(p.spentAllTime, "$")}
          </dd>
        </div>
      </dl>

      {/* Historique des saisies */}
      {p.snapshots.length > 0 && (
        <ul className="mt-4 space-y-1 border-t border-[color:var(--color-border)] pt-3">
          {p.snapshots.map((s) => (
            <li
              key={s.id}
              className="flex items-center justify-between text-xs text-[color:var(--color-muted)]"
            >
              <span>
                {money(s.amountUsd, cur)} · {formatDate(s.atIso)}
                {s.note ? ` · ${s.note}` : ""}
              </span>
              <button
                type="button"
                onClick={() => onDelete(s.id)}
                disabled={isPending}
                className="text-[color:var(--color-muted)] hover:text-red-600"
                aria-label="Supprimer la saisie"
              >
                ✕
              </button>
            </li>
          ))}
        </ul>
      )}
    </div>
  );
}
