"use client";

import { useRouter } from "next/navigation";
import { useState, useTransition } from "react";
import { Pencil, X } from "lucide-react";
import { Button, toast } from "@/components/ui";
import { updateBrandAliases } from "./actions";

// Toggle view/edit pour les aliases brand. Tag input multi-valeurs.
// Inline dans la section Marque de /app/settings.

export function BrandAliasesForm({ currentAliases }: { currentAliases: string[] }) {
  const router = useRouter();
  const [editing, setEditing] = useState(false);
  const [aliases, setAliases] = useState<string[]>(currentAliases);
  const [input, setInput] = useState("");
  const [pending, startTransition] = useTransition();

  function addAlias() {
    const trimmed = input.trim();
    if (!trimmed) return;
    if (aliases.length >= 10) return;
    if (aliases.some((a) => a.toLowerCase() === trimmed.toLowerCase())) return;
    setAliases([...aliases, trimmed]);
    setInput("");
  }

  function removeAlias(idx: number) {
    setAliases(aliases.filter((_, i) => i !== idx));
  }

  function handleKeyDown(e: React.KeyboardEvent<HTMLInputElement>) {
    if (e.key === "Enter" || e.key === ",") {
      e.preventDefault();
      addAlias();
    } else if (e.key === "Backspace" && input === "" && aliases.length > 0) {
      setAliases(aliases.slice(0, -1));
    }
  }

  function handleSave() {
    startTransition(async () => {
      const result = await updateBrandAliases({ aliases });
      if (result.ok) {
        toast.success("Aliases mis à jour");
        setEditing(false);
        router.refresh();
      } else {
        toast.error(result.error);
      }
    });
  }

  function handleCancel() {
    setAliases(currentAliases);
    setInput("");
    setEditing(false);
  }

  if (!editing) {
    return (
      <div className="flex items-center gap-3">
        <span className="text-sm font-medium text-[color:var(--color-ink)]">
          {currentAliases.length > 0 ? currentAliases.join(", ") : "aucun"}
        </span>
        <button
          type="button"
          onClick={() => setEditing(true)}
          aria-label="Modifier les aliases"
          className="inline-flex items-center gap-1 text-xs text-[color:var(--color-muted)] hover:text-[color:var(--color-ink)]"
        >
          <Pencil size={11} strokeWidth={2} />
          Modifier
        </button>
      </div>
    );
  }

  return (
    <div className="flex flex-col gap-2">
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
          value={input}
          onChange={(e) => setInput(e.target.value)}
          onKeyDown={handleKeyDown}
          onBlur={() => input && addAlias()}
          placeholder={aliases.length === 0 ? "Tape puis Entrée…" : ""}
          disabled={aliases.length >= 10}
          maxLength={80}
          className="flex-1 min-w-[120px] border-0 bg-transparent text-sm outline-none placeholder:text-[color:var(--color-faint)]"
          autoFocus
        />
      </div>
      <p className="type-meta text-xs">
        {aliases.length} / 10 aliases · Entrée ou virgule pour ajouter
      </p>
      <div className="flex gap-2">
        <Button variant="primary" size="sm" onClick={handleSave} disabled={pending}>
          {pending ? "Enregistrement…" : "Enregistrer"}
        </Button>
        <Button variant="ghost" size="sm" onClick={handleCancel} disabled={pending}>
          Annuler
        </Button>
      </div>
    </div>
  );
}
