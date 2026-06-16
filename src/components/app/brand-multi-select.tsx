"use client";

import { useState, useTransition } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import { Check, ChevronDown, Layers } from "lucide-react";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui";
import { BrandFavicon } from "@/components/app/brand-favicon";
import {
  parseBrandIdsFromSearchParam,
  serializeBrandIdsToSearchParam,
} from "@/lib/sources/brand-filter";

interface Brand {
  id: string;
  name: string;
  domain: string;
}

interface BrandMultiSelectProps {
  brands: Brand[];
  /** Nom du search param utilisé pour persister la sélection (default: "brands"). */
  paramName?: string;
}

// Multi-select brand filter UI — V0+ (cf. doc 02 § V0+). Lit/écrit la
// sélection dans l'URL search param `?brands=id1,id2`. Pas de cookie :
// l'URL est partageable et la state survit aux refresh sans coupler la
// préférence à l'utilisateur. Utilisé en V0 sur /app/sources où
// l'agrégation cross-brand a un sens métier (vue Agency).
//
// Si le workspace n'a qu'une seule brand → composant retourne null (rien
// à filtrer, la BrandSwitcher du AppTopBar suffit).

export function BrandMultiSelect({ brands, paramName = "brands" }: BrandMultiSelectProps) {
  const router = useRouter();
  const searchParams = useSearchParams();
  const [pending, startTransition] = useTransition();

  const allIds = brands.map((b) => b.id);
  const selectedIds = parseBrandIdsFromSearchParam(
    searchParams.get(paramName) ?? undefined,
    allIds,
  );
  const selectedSet = new Set(selectedIds);

  // Selection optimiste côté UI : on mute pendant pendant qu'on est en
  // train de naviguer (router.replace est async).
  const [localSelection, setLocalSelection] = useState<Set<string>>(selectedSet);
  const effective = pending ? localSelection : selectedSet;

  if (brands.length <= 1) return null;

  function applySelection(next: Set<string>) {
    setLocalSelection(next);
    const ordered = allIds.filter((id) => next.has(id));
    const serialized = serializeBrandIdsToSearchParam(ordered, allIds);

    const params = new URLSearchParams(searchParams.toString());
    if (serialized === null) {
      params.delete(paramName);
    } else {
      params.set(paramName, serialized);
    }
    const qs = params.toString();
    startTransition(() => {
      router.replace(qs ? `?${qs}` : "?", { scroll: false });
    });
  }

  function toggle(id: string) {
    const next = new Set(effective);
    if (next.has(id)) {
      // Empêche de tout dé-sélectionner (état vide = page sans données).
      if (next.size === 1) return;
      next.delete(id);
    } else {
      next.add(id);
    }
    applySelection(next);
  }

  function selectAll() {
    applySelection(new Set(allIds));
  }

  const allSelected = effective.size === brands.length;
  const triggerLabel = allSelected
    ? `Toutes les marques (${brands.length})`
    : `${effective.size}/${brands.length} marque${effective.size > 1 ? "s" : ""}`;

  return (
    <DropdownMenu>
      <DropdownMenuTrigger className="inline-flex items-center gap-2 rounded-[var(--radius-pill)] border border-[color:var(--color-border)] bg-white px-3 py-1.5 text-sm font-medium text-[color:var(--color-ink)] transition hover:bg-[color:var(--color-gray-50)] focus:outline-none focus-visible:ring-2 focus-visible:ring-[color:var(--color-ink)]">
        <Layers size={14} strokeWidth={2} className="text-[color:var(--color-muted)]" />
        {triggerLabel}
        <ChevronDown size={14} strokeWidth={2} className="text-[color:var(--color-muted)]" />
      </DropdownMenuTrigger>
      <DropdownMenuContent align="start" className="w-72">
        <DropdownMenuLabel className="flex items-center justify-between">
          <span>Filtrer par marque</span>
          {!allSelected && (
            <button
              type="button"
              onClick={selectAll}
              className="text-xs font-normal text-[color:var(--color-muted)] hover:text-[color:var(--color-ink)]"
            >
              Tout sélectionner
            </button>
          )}
        </DropdownMenuLabel>
        <DropdownMenuSeparator />
        <ul className="max-h-72 overflow-y-auto py-1">
          {brands.map((b) => {
            const checked = effective.has(b.id);
            return (
              <li key={b.id}>
                <button
                  type="button"
                  onClick={() => toggle(b.id)}
                  className="flex w-full items-center gap-2.5 px-2 py-1.5 text-left text-sm transition hover:bg-[color:var(--color-gray-50)]"
                >
                  <span
                    aria-hidden
                    className={
                      checked
                        ? "flex size-4 shrink-0 items-center justify-center rounded-[var(--radius-sm)] bg-[color:var(--color-ink)] text-white"
                        : "flex size-4 shrink-0 items-center justify-center rounded-[var(--radius-sm)] border border-[color:var(--color-border-strong)] bg-white"
                    }
                  >
                    {checked && <Check size={11} strokeWidth={3} />}
                  </span>
                  <BrandFavicon domain={b.domain} name={b.name} size={18} />
                  <div className="flex-1 min-w-0">
                    <p className="truncate text-sm font-medium text-[color:var(--color-ink)]">
                      {b.name}
                    </p>
                    <p className="type-meta truncate">{b.domain}</p>
                  </div>
                </button>
              </li>
            );
          })}
        </ul>
      </DropdownMenuContent>
    </DropdownMenu>
  );
}
