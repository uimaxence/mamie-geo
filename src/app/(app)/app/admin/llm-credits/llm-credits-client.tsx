"use client";

import { useState, useTransition } from "react";
import { Button } from "@/components/ui/button";
import { Input, Field } from "@/components/ui/input";
import { SegmentedControl } from "@/components/ui/segmented-control";
import type { ProviderCredit } from "@/lib/admin/llm-credits";
import { deleteTopup, recordTopup } from "@/lib/admin/llm-credits-actions";

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

export function LlmCreditsClient({
  providers,
  today,
}: {
  providers: ProviderCredit[];
  today: string;
}) {
  const [provider, setProvider] = useState(providers[0]?.meta.key ?? "claude");
  const [amount, setAmount] = useState("");
  const [date, setDate] = useState(today);
  const [note, setNote] = useState("");
  const [message, setMessage] = useState<{ tone: "ok" | "err"; text: string } | null>(null);
  const [isPending, startTransition] = useTransition();

  function onRecord(e: React.FormEvent) {
    e.preventDefault();
    setMessage(null);
    startTransition(async () => {
      const res = await recordTopup({
        provider,
        amountUsd: Number(amount),
        toppedUpAt: date,
        note,
      });
      if (res.ok) {
        setMessage({ tone: "ok", text: "Recharge enregistrée." });
        setAmount("");
        setNote("");
      } else {
        setMessage({
          tone: "err",
          text: res.error === "validation" ? res.message : "Action non autorisée.",
        });
      }
    });
  }

  function onDelete(id: string) {
    if (!confirm("Supprimer cette recharge ?")) return;
    startTransition(async () => {
      await deleteTopup({ id });
    });
  }

  return (
    <div className="space-y-8">
      {/* Formulaire de recharge */}
      <form
        onSubmit={onRecord}
        className="rounded-[var(--radius-lg)] border border-[color:var(--color-border)] bg-white p-5"
      >
        <h2 className="text-sm font-semibold text-[color:var(--color-ink)]">
          Enregistrer une recharge
        </h2>
        <div className="mt-4 flex flex-wrap items-end gap-3">
          <Field label="Provider" className="min-w-[180px]">
            <SegmentedControl
              options={providers.map((p) => ({
                value: p.meta.key,
                label: p.meta.label.split(" ")[0]!,
              }))}
              value={provider}
              onValueChange={setProvider}
              size="sm"
              ariaLabel="Provider"
            />
          </Field>
          <Field label="Montant ($)" className="w-32">
            <Input
              type="number"
              step="0.01"
              min="0"
              required
              placeholder="50"
              value={amount}
              onChange={(e) => setAmount(e.target.value)}
            />
          </Field>
          <Field label="Date" className="w-44">
            <Input type="date" required value={date} onChange={(e) => setDate(e.target.value)} />
          </Field>
          <Field label="Note (option)" className="min-w-[160px] flex-1">
            <Input
              type="text"
              placeholder="ex: auto-recharge"
              value={note}
              onChange={(e) => setNote(e.target.value)}
            />
          </Field>
          <Button type="submit" disabled={isPending}>
            {isPending ? "…" : "Enregistrer"}
          </Button>
        </div>
        {message && (
          <p
            className={`mt-3 text-sm ${message.tone === "ok" ? "text-emerald-600" : "text-red-600"}`}
          >
            {message.text}
          </p>
        )}
      </form>

      {/* Cartes par provider */}
      <div className="grid gap-4 sm:grid-cols-2">
        {providers.map((p) => {
          const low = p.remaining !== null && p.remaining <= LOW_BALANCE_USD;
          return (
            <div
              key={p.meta.key}
              className="rounded-[var(--radius-lg)] border border-[color:var(--color-border)] bg-white p-5"
            >
              <div className="flex items-center justify-between">
                <h3 className="text-sm font-semibold text-[color:var(--color-ink)]">
                  {p.meta.label}
                </h3>
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
                      {low && (
                        <span className="ml-2 align-middle text-xs font-medium">⚠️ recharge</span>
                      )}
                    </p>
                    <p className="text-xs text-[color:var(--color-muted)]">
                      solde estimé · rechargé {usd(p.totalToppedUp)} depuis{" "}
                      {formatDate(p.baselineDate)}
                    </p>
                  </div>
                ) : (
                  <p className="mt-3 text-sm text-[color:var(--color-muted)]">
                    Aucune recharge enregistrée — saisis ton solde actuel pour initialiser.
                  </p>
                )
              ) : (
                <p className="mt-3 text-sm text-[color:var(--color-muted)]">
                  Pay-as-you-go (GCP) — pas de solde prépayé.
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
                  <dd className="tabular-nums text-[color:var(--color-ink)]">
                    {usd(p.spentAllTime)}
                  </dd>
                </div>
              </dl>

              {/* Historique des recharges */}
              {p.topups.length > 0 && (
                <ul className="mt-4 space-y-1 border-t border-[color:var(--color-border)] pt-3">
                  {p.topups.map((t) => (
                    <li
                      key={t.id}
                      className="flex items-center justify-between text-xs text-[color:var(--color-muted)]"
                    >
                      <span>
                        {usd(t.amountUsd)} · {formatDate(t.toppedUpAt)}
                        {t.note ? ` · ${t.note}` : ""}
                      </span>
                      <button
                        type="button"
                        onClick={() => onDelete(t.id)}
                        disabled={isPending}
                        className="text-[color:var(--color-muted)] hover:text-red-600"
                        aria-label="Supprimer la recharge"
                      >
                        ✕
                      </button>
                    </li>
                  ))}
                </ul>
              )}
            </div>
          );
        })}
      </div>
    </div>
  );
}
