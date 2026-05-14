"use client";

import { useRouter } from "next/navigation";
import { useState, useTransition } from "react";
import { EllipsisVertical, Pencil, Plus, Trash2, Users } from "lucide-react";
import {
  Badge,
  Button,
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
  EmptyState,
  toast,
} from "@/components/ui";
import { createCompetitor, deleteCompetitor, updateCompetitor } from "./actions";
import { CompetitorFormDialog } from "./competitor-form-dialog";
import type { CompetitorRow } from "@/lib/competitors/queries";

// Liste des concurrents en cards. CRUD via dialog + dropdown menus.

interface CompetitorsListProps {
  initialCompetitors: CompetitorRow[];
  plan: string;
  maxCompetitors: number;
}

export function CompetitorsList({
  initialCompetitors,
  plan,
  maxCompetitors,
}: CompetitorsListProps) {
  const router = useRouter();
  const [pending, startTransition] = useTransition();
  const [createOpen, setCreateOpen] = useState(false);
  const [editCompetitor, setEditCompetitor] = useState<CompetitorRow | null>(null);
  const [deleteCompetitorRow, setDeleteCompetitorRow] = useState<CompetitorRow | null>(null);

  const quotaText =
    maxCompetitors === Number.POSITIVE_INFINITY
      ? `${initialCompetitors.length} concurrent${initialCompetitors.length > 1 ? "s" : ""}`
      : `${initialCompetitors.length} / ${maxCompetitors}`;

  function handleDelete() {
    if (!deleteCompetitorRow) return;
    startTransition(async () => {
      const result = await deleteCompetitor(deleteCompetitorRow.id);
      if (result.ok) {
        toast.success("Concurrent supprimé");
        setDeleteCompetitorRow(null);
        router.refresh();
      } else {
        toast.error(result.error);
      }
    });
  }

  return (
    <>
      <header className="flex flex-wrap items-end justify-between gap-6">
        <div>
          <h1 className="type-h1">Concurrents trackés</h1>
          <p className="type-meta mt-2">
            Plan {plan} · {quotaText}
          </p>
        </div>
        <Button variant="primary" onClick={() => setCreateOpen(true)}>
          <Plus size={14} strokeWidth={2.2} />
          Ajouter un concurrent
        </Button>
      </header>

      {initialCompetitors.length === 0 ? (
        <div className="mt-10">
          <EmptyState
            icon={Users}
            title="Aucun concurrent pour l'instant"
            description="Ajoute tes concurrents pour les tracker en parallèle. Les mêmes prompts seront exécutés sur eux."
            action={
              <Button variant="primary" onClick={() => setCreateOpen(true)}>
                <Plus size={14} strokeWidth={2.2} />
                Ajouter un concurrent
              </Button>
            }
          />
        </div>
      ) : (
        <ul className="mt-10 grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-3">
          {initialCompetitors.map((c) => (
            <li
              key={c.id}
              className="flex flex-col gap-3 rounded-[var(--radius-xl)] border border-[color:var(--color-border)] bg-white p-5"
            >
              <div className="flex items-start justify-between gap-3">
                <div className="flex-1 min-w-0">
                  <h3 className="type-h3 truncate" title={c.name}>
                    {c.name}
                  </h3>
                  {c.domain && (
                    <p className="type-meta mt-1 truncate" title={c.domain}>
                      {c.domain}
                    </p>
                  )}
                </div>
                <DropdownMenu>
                  <DropdownMenuTrigger
                    aria-label="Actions"
                    className="inline-flex size-8 shrink-0 items-center justify-center rounded-[var(--radius-md)] text-[color:var(--color-muted)] hover:bg-[color:var(--color-gray-100)] hover:text-[color:var(--color-ink)] focus:outline-none focus-visible:ring-2 focus-visible:ring-[color:var(--color-ink)]"
                  >
                    <EllipsisVertical size={16} strokeWidth={2} />
                  </DropdownMenuTrigger>
                  <DropdownMenuContent align="end">
                    <DropdownMenuItem onSelect={() => setEditCompetitor(c)}>
                      <Pencil size={14} strokeWidth={2} />
                      Éditer
                    </DropdownMenuItem>
                    <DropdownMenuItem danger onSelect={() => setDeleteCompetitorRow(c)}>
                      <Trash2 size={14} strokeWidth={2} />
                      Supprimer
                    </DropdownMenuItem>
                  </DropdownMenuContent>
                </DropdownMenu>
              </div>

              {c.aliases.length > 0 && (
                <div className="flex flex-wrap gap-1.5">
                  {c.aliases.map((a) => (
                    <Badge key={a} tone="neutral" className="text-[11px]">
                      {a}
                    </Badge>
                  ))}
                </div>
              )}

              {c.aliases.length === 0 && <p className="type-meta text-xs">Aucun alias configuré</p>}
            </li>
          ))}
        </ul>
      )}

      <CompetitorFormDialog
        mode="create"
        open={createOpen}
        onOpenChange={setCreateOpen}
        onSubmit={async (data) => {
          const result = await createCompetitor(data);
          if (result.ok) {
            toast.success("Concurrent ajouté");
            setCreateOpen(false);
            router.refresh();
            return { ok: true };
          }
          toast.error(result.error);
          return { ok: false, error: result.error };
        }}
      />

      {editCompetitor && (
        <CompetitorFormDialog
          mode="edit"
          initial={editCompetitor}
          open
          onOpenChange={(o) => !o && setEditCompetitor(null)}
          onSubmit={async (data) => {
            const result = await updateCompetitor(editCompetitor.id, data);
            if (result.ok) {
              toast.success("Concurrent mis à jour");
              setEditCompetitor(null);
              router.refresh();
              return { ok: true };
            }
            toast.error(result.error);
            return { ok: false, error: result.error };
          }}
        />
      )}

      <Dialog
        open={deleteCompetitorRow !== null}
        onOpenChange={(o) => !o && setDeleteCompetitorRow(null)}
      >
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Supprimer ce concurrent ?</DialogTitle>
            <DialogDescription>
              {deleteCompetitorRow?.name} ne sera plus tracké. Les runs passés restent en
              historique. Cette action est irréversible.
            </DialogDescription>
          </DialogHeader>
          <DialogFooter>
            <Button variant="ghost" onClick={() => setDeleteCompetitorRow(null)} disabled={pending}>
              Annuler
            </Button>
            <Button variant="accent" onClick={handleDelete} disabled={pending}>
              {pending ? "Suppression…" : "Supprimer"}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </>
  );
}
