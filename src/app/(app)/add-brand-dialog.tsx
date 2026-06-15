"use client";

import { useState, useTransition, type ReactNode } from "react";
import { useRouter } from "next/navigation";
import {
  Button,
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
  Field,
  Input,
  LinkButton,
} from "@/components/ui";
import { createBrand, type CreateBrandResult } from "@/lib/brands/actions";
import { quotasFor, type PlanKey } from "@/lib/plans/quotas";

// Dialog d'ajout d'une nouvelle marque (brand) depuis le BrandSwitcher
// de la top bar app. 2 modes selon quota :
//   - Quota OK : form (nom + domaine + aliases optionnel) → createBrand
//   - Quota atteint : message d'upgrade + CTA /pricing
//
// Le composant accepte un `children` qui sert de trigger (typiquement
// un DropdownMenuItem). On bypass le `DialogTrigger` standard car le
// DropdownMenu Radix se ferme au clic ; on contrôle l'open state
// manuellement pour que la dialog s'ouvre après la fermeture du menu.

interface AddBrandDialogProps {
  currentBrandsCount: number;
  plan: string;
  children: ReactNode;
}

export function AddBrandDialog({ currentBrandsCount, plan, children }: AddBrandDialogProps) {
  const [open, setOpen] = useState(false);
  const max = quotasFor(plan).brands;
  const quotaReached = currentBrandsCount >= max;

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogTrigger asChild>{children}</DialogTrigger>
      <DialogContent className="sm:max-w-md">
        {quotaReached ? (
          <QuotaReachedContent
            plan={plan as PlanKey}
            currentBrandsCount={currentBrandsCount}
            max={max}
          />
        ) : (
          <AddBrandForm onSuccess={() => setOpen(false)} />
        )}
      </DialogContent>
    </Dialog>
  );
}

function QuotaReachedContent({
  plan,
  currentBrandsCount,
  max,
}: {
  plan: PlanKey;
  currentBrandsCount: number;
  max: number;
}) {
  // Quel plan upgrade proposer ? Beta/Solo/Starter → Pro (3 brands).
  // Pro → Agency (10 brands). Agency → Enterprise (illimité).
  const upgradeLabel =
    plan === "beta" || plan === "solo" || plan === "starter"
      ? "Pro"
      : plan === "pro"
        ? "Agency"
        : plan === "agency"
          ? "Enterprise"
          : "supérieur";

  return (
    <>
      <DialogHeader>
        <DialogTitle>Quota de marques atteint</DialogTitle>
        <DialogDescription>
          Ton plan{" "}
          <strong className="text-[color:var(--color-ink)]">{plan}</strong> autorise{" "}
          <strong className="text-[color:var(--color-ink)]">
            {max === Number.POSITIVE_INFINITY ? "illimité" : max}
          </strong>{" "}
          marque{max > 1 ? "s" : ""}, et tu en as déjà{" "}
          <strong className="text-[color:var(--color-ink)]">{currentBrandsCount}</strong>. Passe au
          plan {upgradeLabel} pour en ajouter d&apos;autres.
        </DialogDescription>
      </DialogHeader>
      <DialogFooter>
        <LinkButton href="/pricing" variant="primary" size="md">
          Voir les plans
        </LinkButton>
      </DialogFooter>
    </>
  );
}

function AddBrandForm({ onSuccess }: { onSuccess: () => void }) {
  const router = useRouter();
  const [pending, startTransition] = useTransition();
  const [name, setName] = useState("");
  const [domain, setDomain] = useState("");
  const [aliasesText, setAliasesText] = useState("");
  const [error, setError] = useState<string | null>(null);

  function handleSubmit(event: React.FormEvent<HTMLFormElement>) {
    event.preventDefault();
    setError(null);
    const aliases = aliasesText
      .split(",")
      .map((s) => s.trim())
      .filter((s) => s.length > 0);

    startTransition(async () => {
      let result: CreateBrandResult;
      try {
        result = await createBrand({ name, domain, aliases });
      } catch (err) {
        const message = err instanceof Error ? err.message : "Erreur inattendue";
        setError(message);
        return;
      }
      if (!result.ok) {
        if (result.error === "validation") {
          setError(result.message);
        } else if (result.error === "quota_reached") {
          // Cas rare : entre l'ouverture de la dialog et le submit, le
          // quota a été atteint côté serveur. On affiche le message
          // générique, l'utilisateur peut fermer et rouvrir pour voir
          // l'écran upgrade.
          setError(
            `Quota atteint (${result.current}/${result.max} marques). Passe à un plan supérieur.`,
          );
        } else if (result.error === "unauthorized") {
          setError("Action non autorisée. Re-connecte-toi.");
        } else if (result.error === "no_workspace") {
          setError("Pas de workspace trouvé. Termine ton onboarding.");
        } else {
          setError("Impossible de créer la marque pour le moment.");
        }
        return;
      }
      // Succès : ferme la dialog + refresh pour que la sidebar reflète
      // la nouvelle brand. Reset du form au passage.
      router.refresh();
      onSuccess();
      setName("");
      setDomain("");
      setAliasesText("");
    });
  }

  return (
    <form onSubmit={handleSubmit}>
      <DialogHeader>
        <DialogTitle>Ajouter une marque</DialogTitle>
        <DialogDescription>
          Une nouvelle marque trackée par Mamie GEO. Tu pourras ensuite ajouter ses prompts et
          concurrents.
        </DialogDescription>
      </DialogHeader>
      <div className="mt-5 flex flex-col gap-4">
        <Field label="Nom de marque">
          <Input
            type="text"
            required
            value={name}
            onChange={(e) => setName(e.target.value)}
            placeholder="Acme Inc."
            autoFocus
            maxLength={80}
            disabled={pending}
          />
        </Field>
        <Field label="Domaine">
          <Input
            type="text"
            required
            value={domain}
            onChange={(e) => setDomain(e.target.value)}
            placeholder="acme.fr"
            inputMode="url"
            autoCapitalize="none"
            spellCheck={false}
            maxLength={120}
            disabled={pending}
          />
        </Field>
        <Field label="Alias (optionnel, séparés par des virgules)">
          <Input
            type="text"
            value={aliasesText}
            onChange={(e) => setAliasesText(e.target.value)}
            placeholder="Acme, Acme Group, ACME"
            disabled={pending}
          />
        </Field>
        {error && (
          <p
            role="alert"
            className="rounded-[var(--radius-md)] border border-[color:var(--color-error)]/20 bg-[color:var(--color-error-bg)] px-3 py-2 text-sm text-[color:var(--color-error)]"
          >
            {error}
          </p>
        )}
      </div>
      <DialogFooter className="mt-6">
        <Button type="submit" variant="primary" size="md" disabled={pending || !name || !domain}>
          {pending ? "Création…" : "Créer la marque"}
        </Button>
      </DialogFooter>
    </form>
  );
}
