"use client";

import { useState, useTransition } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import type { ProviderCredit } from "@/lib/admin/llm-credits";
import { deleteTopup, setBalance } from "@/lib/admin/llm-credits-actions";

function usd(n: number): string {
  return `$${n.toFixed(2)}`;
}

function formatDate(iso: string | null): string {
  if (!iso) return "—";
  return new Date(iso).toLocaleDateString("fr-FR", {
    day: "2-digit",
    month: "short",
    year: "numeric",
  });
}

// Seuil d'alerte « bientôt à sec » sur le solde estimé.
const LOW_BALANCE_USD = 10;

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

  const low = p.remaining !== null && p.remaining <= LOW_BALANCE_USD;

  function onSet(e: React.FormEvent) {
    e.preventDefault();
    setMessage(null);
    startTransition(async () => {
      const res = await setBalance({ provider: p.meta.key, balanceUsd: Number(value) });
      if (res.ok) {
        setMessage({ tone: "ok", text: "Solde mis à jour." });
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
    if (!confirm("Supprimer cette saisie de solde ?")) return;
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

      {/* Solde estimé (prépayé) ou mention pay-as-you-go */}
      {p.meta.prepaid ? (
        p.remaining !== null ? (
          <div className="mt-3">
            <p
              className={`text-2xl font-bold tabular-nums ${low ? "text-red-600" : "text-[color:var(--color-ink)]"}`}
            >
              {usd(p.remaining)}
              {low && <span className="ml-2 align-middle text-xs font-medium">⚠️ recharge</span>}
            </p>
            <p className="text-xs text-[color:var(--color-muted)]">
              solde estimé · {usd(p.lastBalanceUsd ?? 0)} saisi le {formatDate(p.lastBalanceAt)} −{" "}
              {usd(p.spentSinceLast)} dépensés depuis
            </p>
          </div>
        ) : (
          <p className="mt-3 text-sm text-[color:var(--color-muted)]">
            Solde inconnu — saisis le montant actuel ci-dessous.
          </p>
        )
      ) : (
        <p className="mt-3 text-sm text-[color:var(--color-muted)]">
          Pay-as-you-go (GCP) — pas de solde prépayé.
        </p>
      )}

      {/* Champ « solde actuel » (uniquement pour les comptes prépayés) */}
      {p.meta.prepaid && (
        <form onSubmit={onSet} className="mt-4 flex items-end gap-2">
          <label className="flex-1">
            <span className="mb-1 block text-xs font-medium text-[color:var(--color-muted)]">
              Solde actuel sur le compte ($)
            </span>
            <Input
              type="number"
              step="0.01"
              min="0"
              required
              placeholder="ex: 42.50"
              value={value}
              onChange={(e) => setValue(e.target.value)}
            />
          </label>
          <Button type="submit" size="sm" disabled={isPending}>
            {isPending ? "…" : "Mettre à jour"}
          </Button>
        </form>
      )}
      {message && (
        <p
          className={`mt-2 text-xs ${message.tone === "ok" ? "text-emerald-600" : "text-red-600"}`}
        >
          {message.text}
        </p>
      )}

      {/* Dépenses */}
      <dl className="mt-4 grid grid-cols-2 gap-2 border-t border-[color:var(--color-border)] pt-3 text-sm">
        <div>
          <dt className="text-xs text-[color:var(--color-muted)]">Dépensé 30 j</dt>
          <dd className="tabular-nums text-[color:var(--color-ink)]">{usd(p.spent30d)}</dd>
        </div>
        <div>
          <dt className="text-xs text-[color:var(--color-muted)]">Dépensé total</dt>
          <dd className="tabular-nums text-[color:var(--color-ink)]">{usd(p.spentAllTime)}</dd>
        </div>
      </dl>

      {/* Historique des soldes saisis */}
      {p.snapshots.length > 0 && (
        <ul className="mt-4 space-y-1 border-t border-[color:var(--color-border)] pt-3">
          {p.snapshots.map((s) => (
            <li
              key={s.id}
              className="flex items-center justify-between text-xs text-[color:var(--color-muted)]"
            >
              <span>
                {usd(s.amountUsd)} · {formatDate(s.atIso)}
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
