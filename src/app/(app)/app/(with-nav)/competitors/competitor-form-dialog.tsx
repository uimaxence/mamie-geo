"use client";

import { useState, useTransition } from "react";
import { X } from "lucide-react";
import {
  Button,
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
  Field,
  Input,
} from "@/components/ui";
import type { CreateCompetitorInput } from "@/lib/competitors/schemas";

// Form Dialog pour créer / éditer un concurrent.
// Champs : name (input), domain (input optionnel), aliases (tag input).

interface CompetitorFormDialogProps {
  mode: "create" | "edit";
  initial?: { name: string; domain: string | null; aliases: string[] };
  open: boolean;
  onOpenChange: (open: boolean) => void;
  onSubmit: (data: CreateCompetitorInput) => Promise<{ ok: boolean; error?: string }>;
}

export function CompetitorFormDialog({
  mode,
  initial,
  open,
  onOpenChange,
  onSubmit,
}: CompetitorFormDialogProps) {
  // State initial calé au 1er mount. Pour reset entre concurrents en
  // édition, l'appelant doit `key={competitor.id}`.
  const [name, setName] = useState(initial?.name ?? "");
  const [domain, setDomain] = useState(initial?.domain ?? "");
  const [aliases, setAliases] = useState<string[]>(initial?.aliases ?? []);
  const [aliasInput, setAliasInput] = useState("");
  const [pending, startTransition] = useTransition();
  const [error, setError] = useState<string | null>(null);

  function addAlias() {
    const trimmed = aliasInput.trim();
    if (!trimmed) return;
    if (aliases.length >= 10) return;
    if (aliases.some((a) => a.toLowerCase() === trimmed.toLowerCase())) return;
    setAliases([...aliases, trimmed]);
    setAliasInput("");
  }

  function removeAlias(idx: number) {
    setAliases(aliases.filter((_, i) => i !== idx));
  }

  function handleAliasKeyDown(e: React.KeyboardEvent<HTMLInputElement>) {
    if (e.key === "Enter" || e.key === ",") {
      e.preventDefault();
      addAlias();
    } else if (e.key === "Backspace" && aliasInput === "" && aliases.length > 0) {
      // Backspace sur input vide → supprimer le dernier alias
      setAliases(aliases.slice(0, -1));
    }
  }

  function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setError(null);
    startTransition(async () => {
      const result = await onSubmit({
        name,
        domain: domain.trim() || null,
        aliases,
      });
      if (!result.ok) setError(result.error ?? "Erreur inconnue");
    });
  }

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent>
        <DialogHeader>
          <DialogTitle>
            {mode === "create" ? "Ajouter un concurrent" : "Éditer le concurrent"}
          </DialogTitle>
          <DialogDescription>
            Les mêmes prompts seront exécutés en parallèle pour comparer.
          </DialogDescription>
        </DialogHeader>

        <form onSubmit={handleSubmit} className="mt-4 flex flex-col gap-5">
          <Field label="Nom" hint="Le nom que les LLMs sont censés citer.">
            <Input
              type="text"
              value={name}
              onChange={(e) => setName(e.target.value)}
              placeholder="Profound"
              maxLength={80}
              required
              autoFocus
            />
          </Field>

          <Field label="Domaine" hint="Optionnel — utilisé pour le matching dans les sources web.">
            <Input
              type="text"
              value={domain}
              onChange={(e) => setDomain(e.target.value.toLowerCase())}
              placeholder="profound.so"
              maxLength={120}
              inputMode="url"
            />
          </Field>

          <Field
            label="Aliases"
            hint="Variantes du nom (ex: Tesla, Tesla Inc., Tesla Motors). Entrée ou virgule pour ajouter."
          >
            <div className="flex flex-wrap items-center gap-1.5 rounded-[var(--radius-md)] border border-[color:var(--color-border-strong)] bg-white px-2 py-1.5 focus-within:ring-2 focus-within:ring-[color:var(--color-ink)] focus-within:ring-offset-1">
              {aliases.map((a, idx) => (
                <span
                  key={a}
                  className="inline-flex items-center gap-1 rounded-[var(--radius-pill)] bg-[color:var(--color-gray-100)] px-2 py-0.5 text-xs font-medium text-[color:var(--color-ink-soft)]"
                >
                  {a}
                  <button
                    type="button"
                    onClick={() => removeAlias(idx)}
                    aria-label={`Retirer ${a}`}
                    className="inline-flex items-center justify-center rounded-full text-[color:var(--color-muted)] hover:text-[color:var(--color-ink)]"
                  >
                    <X size={11} strokeWidth={2.5} />
                  </button>
                </span>
              ))}
              <input
                type="text"
                value={aliasInput}
                onChange={(e) => setAliasInput(e.target.value)}
                onKeyDown={handleAliasKeyDown}
                onBlur={() => aliasInput && addAlias()}
                placeholder={aliases.length === 0 ? "Tape puis Entrée…" : ""}
                disabled={aliases.length >= 10}
                maxLength={80}
                className="flex-1 min-w-[120px] border-0 bg-transparent text-sm outline-none placeholder:text-[color:var(--color-faint)]"
              />
            </div>
            <p className="type-meta mt-1 text-xs">{aliases.length} / 10 aliases</p>
          </Field>

          {error && (
            <p className="rounded-[var(--radius-md)] bg-[color:var(--color-error-bg)] px-3 py-2 text-xs text-[color:var(--color-error)]">
              {error}
            </p>
          )}

          <DialogFooter>
            <Button
              type="button"
              variant="ghost"
              onClick={() => onOpenChange(false)}
              disabled={pending}
            >
              Annuler
            </Button>
            <Button type="submit" variant="primary" disabled={pending || name.trim().length === 0}>
              {pending ? "Enregistrement…" : mode === "create" ? "Ajouter" : "Enregistrer"}
            </Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  );
}
