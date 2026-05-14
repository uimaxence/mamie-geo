"use client";

import { useRouter } from "next/navigation";
import { useState, useTransition } from "react";
import { Pencil } from "lucide-react";
import { Button, Field, Input, toast } from "@/components/ui";
import { updateWorkspaceName } from "./actions";

// Toggle view/edit pour le nom du workspace. Inline dans la section
// Workspace de /app/settings. Optimistic display via router.refresh().

export function WorkspaceForm({ currentName }: { currentName: string }) {
  const router = useRouter();
  const [editing, setEditing] = useState(false);
  const [name, setName] = useState(currentName);
  const [pending, startTransition] = useTransition();

  function handleSave() {
    startTransition(async () => {
      const result = await updateWorkspaceName({ name });
      if (result.ok) {
        toast.success("Workspace renommé");
        setEditing(false);
        router.refresh();
      } else {
        toast.error(result.error);
      }
    });
  }

  function handleCancel() {
    setName(currentName);
    setEditing(false);
  }

  if (!editing) {
    return (
      <div className="flex items-center gap-3">
        <span className="text-sm font-medium text-[color:var(--color-ink)]">{currentName}</span>
        <button
          type="button"
          onClick={() => setEditing(true)}
          aria-label="Modifier le nom du workspace"
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
      <Field label="Nouveau nom" hint="Visible uniquement par toi et les membres du workspace.">
        <Input
          type="text"
          value={name}
          onChange={(e) => setName(e.target.value)}
          maxLength={80}
          required
          autoFocus
        />
      </Field>
      <div className="flex gap-2">
        <Button
          variant="primary"
          size="sm"
          onClick={handleSave}
          disabled={pending || name.trim().length === 0 || name === currentName}
        >
          {pending ? "Enregistrement…" : "Enregistrer"}
        </Button>
        <Button variant="ghost" size="sm" onClick={handleCancel} disabled={pending}>
          Annuler
        </Button>
      </div>
    </div>
  );
}
