"use client";

import Link from "next/link";
import { useRouter } from "next/navigation";
import { useMemo, useState, useTransition } from "react";
import {
  EllipsisVertical,
  MessageSquareQuote,
  Pencil,
  Pause,
  Play,
  Plus,
  Sparkles,
  Trash2,
} from "lucide-react";
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
  Pagination,
  SegmentedControl,
  Switch,
  toast,
} from "@/components/ui";
import {
  createPrompt,
  deletePrompt,
  suggestMorePrompts,
  togglePromptActive,
  updatePrompt,
} from "./actions";
import { PromptFormDialog } from "./prompt-form-dialog";
import type { PromptRow } from "@/lib/prompts/queries";

// Liste interactive des prompts : filtre par statut + pagination
// client-side + dialogs CRUD + toast feedback. Reçoit la liste full
// du server, slice client-side.

const PAGE_SIZE = 25;

type FilterMode = "all" | "active" | "paused";

const FILTER_OPTIONS = [
  { value: "all" as const, label: "Tous" },
  { value: "active" as const, label: "Actifs" },
  { value: "paused" as const, label: "En pause" },
];

interface PromptsListProps {
  initialPrompts: PromptRow[];
  plan: string;
  maxPrompts: number;
}

export function PromptsList({ initialPrompts, plan, maxPrompts }: PromptsListProps) {
  const router = useRouter();
  const [filter, setFilter] = useState<FilterMode>("all");
  const [page, setPage] = useState(1);
  const [pending, startTransition] = useTransition();
  const [createOpen, setCreateOpen] = useState(false);
  const [editPrompt, setEditPrompt] = useState<PromptRow | null>(null);
  const [deletePromptRow, setDeletePromptRow] = useState<PromptRow | null>(null);
  const [suggestions, setSuggestions] = useState<string[] | null>(null);
  const [suggesting, startSuggesting] = useTransition();

  const filtered = useMemo(() => {
    if (filter === "active") return initialPrompts.filter((p) => p.isActive);
    if (filter === "paused") return initialPrompts.filter((p) => !p.isActive);
    return initialPrompts;
  }, [initialPrompts, filter]);

  const totalPages = Math.max(1, Math.ceil(filtered.length / PAGE_SIZE));
  const paginated = filtered.slice((page - 1) * PAGE_SIZE, page * PAGE_SIZE);

  const quotaText =
    maxPrompts === Number.POSITIVE_INFINITY
      ? `${initialPrompts.length} prompt${initialPrompts.length > 1 ? "s" : ""}`
      : `${initialPrompts.length} / ${maxPrompts}`;

  function handleToggle(p: PromptRow) {
    startTransition(async () => {
      const result = await togglePromptActive(p.id);
      if (result.ok) {
        toast.success(p.isActive ? "Prompt mis en pause" : "Prompt activé");
        router.refresh();
      } else {
        toast.error(result.error);
      }
    });
  }

  function handleDelete() {
    if (!deletePromptRow) return;
    startTransition(async () => {
      const result = await deletePrompt(deletePromptRow.id);
      if (result.ok) {
        toast.success("Prompt supprimé");
        setDeletePromptRow(null);
        router.refresh();
      } else {
        toast.error(result.error);
      }
    });
  }

  function handleSuggest() {
    startSuggesting(async () => {
      const result = await suggestMorePrompts();
      if ("prompts" in result) {
        setSuggestions(result.prompts);
        toast.success(`${result.prompts.length} suggestions générées`);
      } else {
        toast.error(result.error);
      }
    });
  }

  async function addSuggested(text: string) {
    startTransition(async () => {
      const result = await createPrompt({ text, isActive: true });
      if (result.ok) {
        toast.success("Prompt ajouté");
        setSuggestions((prev) => prev?.filter((p) => p !== text) ?? null);
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
          <h1 className="type-h1">Prompts trackés</h1>
          <p className="type-meta mt-2">
            Plan {plan} · {quotaText}
          </p>
        </div>
        <div className="flex flex-wrap items-center gap-3">
          <Button variant="secondary" onClick={handleSuggest} disabled={suggesting}>
            <Sparkles size={14} strokeWidth={2} />
            {suggesting ? "Génération…" : "Suggérer via IA"}
          </Button>
          <Button variant="primary" onClick={() => setCreateOpen(true)}>
            <Plus size={14} strokeWidth={2.2} />
            Ajouter un prompt
          </Button>
        </div>
      </header>

      {/* Suggestions IA : liste éphémère, click pour ajouter */}
      {suggestions && suggestions.length > 0 && (
        <section className="mt-8 rounded-[var(--radius-xl)] border border-dashed border-[color:var(--color-border-strong)] bg-[color:var(--color-gray-50)] p-5">
          <div className="flex items-center justify-between">
            <p className="type-eyebrow">Suggestions IA</p>
            <button
              type="button"
              onClick={() => setSuggestions(null)}
              className="text-xs text-[color:var(--color-muted)] hover:text-[color:var(--color-ink)]"
            >
              Fermer
            </button>
          </div>
          <ul className="mt-4 flex flex-col gap-2">
            {suggestions.map((text) => (
              <li
                key={text}
                className="flex items-center gap-3 rounded-[var(--radius-md)] bg-white px-3 py-2 text-sm"
              >
                <span className="flex-1 text-[color:var(--color-ink-soft)]">{text}</span>
                <Button
                  variant="secondary"
                  size="sm"
                  onClick={() => addSuggested(text)}
                  disabled={pending}
                >
                  <Plus size={12} strokeWidth={2.2} />
                  Ajouter
                </Button>
              </li>
            ))}
          </ul>
        </section>
      )}

      {initialPrompts.length === 0 ? (
        <div className="mt-10">
          <EmptyState
            icon={MessageSquareQuote}
            title="Aucun prompt pour l'instant"
            description="Ajoute ton premier prompt manuellement, ou demande à Claude Haiku d'en suggérer 5 pour toi."
            action={
              <Button variant="primary" onClick={handleSuggest} disabled={suggesting}>
                <Sparkles size={14} strokeWidth={2} />
                {suggesting ? "Génération…" : "Suggérer 5 prompts via IA"}
              </Button>
            }
          />
        </div>
      ) : (
        <>
          <div className="mt-10 flex items-center justify-between gap-4">
            <SegmentedControl
              value={filter}
              onValueChange={(v) => {
                setFilter(v);
                setPage(1);
              }}
              options={FILTER_OPTIONS}
              ariaLabel="Filtrer les prompts"
              size="sm"
            />
            <span className="type-meta">
              {filtered.length} affiché{filtered.length > 1 ? "s" : ""}
            </span>
          </div>

          <div className="mt-4 overflow-x-auto">
            <table className="w-full border-collapse text-left">
              <thead>
                <tr className="border-b border-[color:var(--color-border)]">
                  <Th>Prompt</Th>
                  <Th>Catégorie</Th>
                  <Th>Actif</Th>
                  <Th>Runs success</Th>
                  <Th align="right">Dernier run</Th>
                  <Th align="right">Actions</Th>
                </tr>
              </thead>
              <tbody>
                {paginated.map((p) => (
                  <tr
                    key={p.id}
                    className="group border-b border-[color:var(--color-border)] last:border-b-0 hover:bg-[color:var(--color-gray-50)]"
                  >
                    <Td>
                      <Link
                        href={`/app/prompts/${p.id}`}
                        className="block max-w-md truncate text-[color:var(--color-ink)] hover:underline hover:underline-offset-2"
                        title={p.text}
                      >
                        {p.text}
                      </Link>
                    </Td>
                    <Td>
                      {p.category ? (
                        <Badge tone="neutral">{p.category}</Badge>
                      ) : (
                        <span className="type-meta">—</span>
                      )}
                    </Td>
                    <Td>
                      <Switch
                        checked={p.isActive}
                        onCheckedChange={() => handleToggle(p)}
                        disabled={pending}
                        aria-label={p.isActive ? "Mettre en pause" : "Activer"}
                      />
                    </Td>
                    <Td>
                      <span className="type-tabular text-sm">{p.successCount}</span>
                    </Td>
                    <Td align="right">
                      <span className="type-meta">
                        {p.lastRunAt ? formatRelative(p.lastRunAt) : "jamais"}
                      </span>
                    </Td>
                    <Td align="right">
                      <DropdownMenu>
                        <DropdownMenuTrigger
                          aria-label="Actions"
                          className="inline-flex size-8 items-center justify-center rounded-[var(--radius-md)] text-[color:var(--color-muted)] hover:bg-[color:var(--color-gray-100)] hover:text-[color:var(--color-ink)] focus:outline-none focus-visible:ring-2 focus-visible:ring-[color:var(--color-ink)]"
                        >
                          <EllipsisVertical size={16} strokeWidth={2} />
                        </DropdownMenuTrigger>
                        <DropdownMenuContent align="end">
                          <DropdownMenuItem onSelect={() => setEditPrompt(p)}>
                            <Pencil size={14} strokeWidth={2} />
                            Éditer
                          </DropdownMenuItem>
                          <DropdownMenuItem onSelect={() => handleToggle(p)}>
                            {p.isActive ? (
                              <>
                                <Pause size={14} strokeWidth={2} />
                                Mettre en pause
                              </>
                            ) : (
                              <>
                                <Play size={14} strokeWidth={2} />
                                Activer
                              </>
                            )}
                          </DropdownMenuItem>
                          <DropdownMenuItem danger onSelect={() => setDeletePromptRow(p)}>
                            <Trash2 size={14} strokeWidth={2} />
                            Supprimer
                          </DropdownMenuItem>
                        </DropdownMenuContent>
                      </DropdownMenu>
                    </Td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>

          {totalPages > 1 && (
            <div className="mt-8">
              <Pagination currentPage={page} totalPages={totalPages} hrefFor={() => "#"} />
              {/* Pagination component above is href-based ; on intercept clicks via wrapper below */}
              <div className="mt-2 flex justify-center gap-2">
                <Button
                  variant="ghost"
                  size="sm"
                  onClick={() => setPage((p) => Math.max(1, p - 1))}
                  disabled={page === 1}
                >
                  Précédent
                </Button>
                <span className="type-meta self-center">
                  Page {page} / {totalPages}
                </span>
                <Button
                  variant="ghost"
                  size="sm"
                  onClick={() => setPage((p) => Math.min(totalPages, p + 1))}
                  disabled={page === totalPages}
                >
                  Suivant
                </Button>
              </div>
            </div>
          )}
        </>
      )}

      {/* Create dialog */}
      <PromptFormDialog
        mode="create"
        open={createOpen}
        onOpenChange={setCreateOpen}
        onSubmit={async (data) => {
          const result = await createPrompt(data);
          if (result.ok) {
            toast.success("Prompt ajouté");
            setCreateOpen(false);
            router.refresh();
            return { ok: true };
          }
          toast.error(result.error);
          return { ok: false, error: result.error };
        }}
      />

      {/* Edit dialog */}
      {editPrompt && (
        <PromptFormDialog
          mode="edit"
          initial={editPrompt}
          open
          onOpenChange={(o) => !o && setEditPrompt(null)}
          onSubmit={async (data) => {
            const result = await updatePrompt(editPrompt.id, data);
            if (result.ok) {
              toast.success("Prompt mis à jour");
              setEditPrompt(null);
              router.refresh();
              return { ok: true };
            }
            toast.error(result.error);
            return { ok: false, error: result.error };
          }}
        />
      )}

      {/* Delete confirm dialog */}
      <Dialog open={deletePromptRow !== null} onOpenChange={(o) => !o && setDeletePromptRow(null)}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Supprimer ce prompt ?</DialogTitle>
            <DialogDescription>
              Cela supprimera également les {deletePromptRow?.successCount ?? 0} runs associés.
              Cette action est irréversible.
            </DialogDescription>
          </DialogHeader>
          <DialogFooter>
            <Button variant="ghost" onClick={() => setDeletePromptRow(null)} disabled={pending}>
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
