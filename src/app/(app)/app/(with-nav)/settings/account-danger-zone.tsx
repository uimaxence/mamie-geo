"use client";

import { useState, useTransition } from "react";
import { useRouter } from "next/navigation";
import { Download, Trash2 } from "lucide-react";
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
  toast,
} from "@/components/ui";
import { authClient } from "@/lib/auth-client";
import { deleteAccount } from "./account-actions";

// Zone sensible RGPD du compte — droits article 17 (effacement) et
// article 20 (portabilité). Cf. plan V0 pré-lancement (2026-05-26).
//
// Deux actions :
//   1. Export data : lien direct vers /api/account/export.json,
//      le navigateur déclenche le download via Content-Disposition.
//   2. Delete account : dialog avec double confirmation (taper SUPPRIMER)
//      + checkbox de compréhension. Server action `deleteAccount` côté
//      serveur revalide la confirmation, annule Stripe, supprime DB,
//      redirige vers / après signOut côté client.

export function AccountDangerZone({ userEmail }: { userEmail: string }) {
  return (
    <div className="flex flex-col gap-6">
      {/* Export data : action sûre, pas de confirmation */}
      <div className="flex flex-wrap items-start justify-between gap-3">
        <div className="max-w-md">
          <h3 className="text-sm font-semibold text-[color:var(--color-ink)]">
            Exporter mes données
          </h3>
          <p className="type-meta mt-1">
            Télécharge un fichier JSON contenant toutes les données associées à ton compte
            (workspace, marque, prompts, runs, métriques, audits). Droit à la portabilité, RGPD
            article&nbsp;20.
          </p>
        </div>
        <a
          href="/api/account/export.json"
          download
          className="inline-flex items-center gap-2 rounded-[var(--radius-pill)] border border-[color:var(--color-border-strong)] bg-white px-5 py-2 text-sm font-medium text-[color:var(--color-ink)] transition hover:bg-[color:var(--color-gray-50)]"
        >
          <Download size={14} strokeWidth={2.2} />
          Télécharger l&apos;export
        </a>
      </div>

      {/* Delete account : action destructive, dialog de confirmation */}
      <div className="flex flex-wrap items-start justify-between gap-3 border-t border-[color:var(--color-error)]/20 pt-6">
        <div className="max-w-md">
          <h3 className="text-sm font-semibold text-[color:var(--color-error)]">
            Supprimer mon compte
          </h3>
          <p className="type-meta mt-1">
            Suppression définitive de ton compte, de ton workspace, de ta marque, de tes prompts et
            de tout l&apos;historique de runs. L&apos;abonnement Stripe en cours est annulé.
            Irréversible. Droit à l&apos;effacement, RGPD article&nbsp;17.
          </p>
        </div>
        <DeleteAccountDialog userEmail={userEmail} />
      </div>
    </div>
  );
}

function DeleteAccountDialog({ userEmail }: { userEmail: string }) {
  const router = useRouter();
  const [open, setOpen] = useState(false);
  const [confirmation, setConfirmation] = useState("");
  const [acknowledged, setAcknowledged] = useState(false);
  const [pending, startTransition] = useTransition();

  const canSubmit = confirmation === "SUPPRIMER" && acknowledged;

  function handleDelete() {
    if (!canSubmit) return;
    startTransition(async () => {
      const result = await deleteAccount(confirmation);
      if (!result.ok) {
        toast.error("Suppression échouée", { description: result.error });
        return;
      }
      // Compte supprimé en DB → la session est invalidée par cascade,
      // mais le cookie reste côté client. Sign-out propre pour le
      // nettoyer + push vers / (la home publique).
      await authClient.signOut().catch(() => {
        // Si signOut échoue (token déjà invalide), on continue quand
        // même vers / — l'auth check sur la prochaine nav redirigera.
      });
      router.push("/");
      router.refresh();
    });
  }

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <button
        type="button"
        onClick={() => setOpen(true)}
        className="inline-flex items-center gap-2 rounded-[var(--radius-pill)] border border-[color:var(--color-error)]/40 bg-white px-5 py-2 text-sm font-medium text-[color:var(--color-error)] transition hover:bg-[color:var(--color-error-bg)]"
      >
        <Trash2 size={14} strokeWidth={2.2} />
        Supprimer mon compte
      </button>
      <DialogContent>
        <DialogHeader>
          <DialogTitle>Supprimer définitivement {userEmail}&nbsp;?</DialogTitle>
          <DialogDescription>
            Cette action est <strong>irréversible</strong>. Tout ton historique sera perdu&nbsp;:
          </DialogDescription>
        </DialogHeader>

        {/* Liste à puces plutôt que paragraphe : une action irréversible
         * doit être scannable en 2 secondes. */}
        <ul className="flex flex-col gap-1 text-sm text-[color:var(--color-ink-soft)]">
          <li>· Workspace, marque et concurrents</li>
          <li>· Prompts, runs et métriques</li>
          <li>· Audits techniques</li>
          <li>· Abonnement Stripe annulé immédiatement</li>
        </ul>
        <p className="type-meta">
          Pour un remboursement (garantie 14&nbsp;jours), contacte hello@mamie-geo.fr avant de
          supprimer.
        </p>

        <div className="flex flex-col gap-4">
          <label className="flex items-start gap-2.5 text-sm text-[color:var(--color-ink-soft)]">
            <input
              type="checkbox"
              checked={acknowledged}
              onChange={(e) => setAcknowledged(e.target.checked)}
              className="mt-0.5 size-4 rounded border-[color:var(--color-border-strong)] text-[color:var(--color-ink)] focus:ring-[color:var(--color-ink)]"
            />
            <span>
              Je comprends que cette action est définitive et que mes données ne pourront pas être
              restaurées.
            </span>
          </label>

          <Field label="Pour confirmer, tape SUPPRIMER en majuscules">
            <Input
              value={confirmation}
              onChange={(e) => setConfirmation(e.target.value)}
              placeholder="SUPPRIMER"
              autoComplete="off"
              data-private="true"
              autoCapitalize="characters"
              spellCheck={false}
            />
          </Field>
        </div>

        <DialogFooter>
          <Button variant="ghost" onClick={() => setOpen(false)} disabled={pending}>
            Annuler
          </Button>
          <Button variant="accent" onClick={handleDelete} disabled={!canSubmit || pending}>
            {pending ? "Suppression en cours…" : "Supprimer définitivement"}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
