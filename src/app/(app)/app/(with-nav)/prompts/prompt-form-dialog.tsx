"use client";

import { useState, useTransition } from "react";
import {
  Button,
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
  Field,
  Switch,
} from "@/components/ui";
import { PROMPT_CATEGORIES, type CreatePromptInput } from "@/lib/prompts/schemas";

// Form Dialog réutilisé pour create / edit prompts.
// Le state initial est calé sur les props au 1er mount via useState.
// Pour forcer un reset (passer d'un prompt à un autre en édition),
// l'appelant doit utiliser `key={prompt.id}` pour remount l'instance.
// Cf. https://react.dev/learn/you-might-not-need-an-effect

interface PromptFormDialogProps {
  mode: "create" | "edit";
  initial?: { text: string; category: string | null; isActive: boolean };
  open: boolean;
  onOpenChange: (open: boolean) => void;
  onSubmit: (data: CreatePromptInput) => Promise<{ ok: boolean; error?: string }>;
}

export function PromptFormDialog({
  mode,
  initial,
  open,
  onOpenChange,
  onSubmit,
}: PromptFormDialogProps) {
  const [text, setText] = useState(initial?.text ?? "");
  const [category, setCategory] = useState<string>(initial?.category ?? "");
  const [isActive, setIsActive] = useState<boolean>(initial?.isActive ?? true);
  const [pending, startTransition] = useTransition();
  const [error, setError] = useState<string | null>(null);

  function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setError(null);
    startTransition(async () => {
      const result = await onSubmit({
        text,
        category: category ? (category as (typeof PROMPT_CATEGORIES)[number]) : null,
        isActive,
      });
      if (!result.ok) setError(result.error ?? "Erreur inconnue");
    });
  }

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent>
        <DialogHeader>
          <DialogTitle>{mode === "create" ? "Ajouter un prompt" : "Éditer le prompt"}</DialogTitle>
          <DialogDescription>
            Le prompt sera exécuté sur les 5 IA trackées au prochain cron quotidien.
          </DialogDescription>
        </DialogHeader>

        <form onSubmit={handleSubmit} className="mt-4 flex flex-col gap-5">
          <Field
            label="Texte du prompt"
            hint="Question réelle que tes prospects posent aux IA. Entre 5 et 500 caractères."
          >
            <textarea
              value={text}
              onChange={(e) => setText(e.target.value)}
              placeholder="Ex : meilleur logiciel CRM pour PME française"
              maxLength={500}
              rows={3}
              required
              className="w-full resize-none rounded-[var(--radius-md)] border border-[color:var(--color-border-strong)] bg-white px-3 py-2 text-sm text-[color:var(--color-ink)] focus:outline-none focus-visible:ring-2 focus-visible:ring-[color:var(--color-ink)] focus-visible:ring-offset-1"
            />
          </Field>

          <Field label="Catégorie" hint="Optionnelle, pour grouper / filtrer.">
            <select
              value={category}
              onChange={(e) => setCategory(e.target.value)}
              className="w-full rounded-[var(--radius-md)] border border-[color:var(--color-border-strong)] bg-white px-3 py-2 text-sm text-[color:var(--color-ink)] focus:outline-none focus-visible:ring-2 focus-visible:ring-[color:var(--color-ink)] focus-visible:ring-offset-1"
            >
              <option value="">Aucune</option>
              <option value="commercial">Commercial</option>
              <option value="informational">Informationnel</option>
              <option value="comparison">Comparaison</option>
            </select>
          </Field>

          <div className="flex items-center justify-between gap-3 rounded-[var(--radius-md)] bg-[color:var(--color-gray-50)] px-3 py-2.5">
            <div>
              <p className="text-sm font-medium text-[color:var(--color-ink)]">Actif</p>
              <p className="type-meta">Désactiver met le prompt en pause sans le supprimer.</p>
            </div>
            <Switch checked={isActive} onCheckedChange={setIsActive} />
          </div>

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
            <Button type="submit" variant="primary" disabled={pending || text.trim().length < 5}>
              {pending ? "Enregistrement…" : mode === "create" ? "Ajouter" : "Enregistrer"}
            </Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  );
}
