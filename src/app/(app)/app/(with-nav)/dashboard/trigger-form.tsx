"use client";

import { useState, useTransition } from "react";
import { useRouter } from "next/navigation";
import { Play } from "lucide-react";
import {
  Button,
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
  toast,
} from "@/components/ui";
import { triggerRunNow, type TriggerResult } from "./actions";

// Bouton "Lancer un run maintenant" — dialog de confirmation puis
// server action. Feedback via toast sonner (au lieu d'un texte inline).

export function TriggerRunForm() {
  const router = useRouter();
  const [open, setOpen] = useState(false);
  const [pending, startTransition] = useTransition();

  function handleConfirm() {
    startTransition(async () => {
      try {
        const result: TriggerResult = await triggerRunNow();
        toast.success("Run lancé", {
          description: `${result.jobsEnqueued} job(s) en attente · ${result.runsCreated} run(s) créé(s)${result.skipped > 0 ? ` · ${result.skipped} idempotent` : ""}.`,
        });
        setOpen(false);
        router.refresh();
      } catch (error) {
        toast.error("Échec du run", {
          description: error instanceof Error ? error.message : "Erreur inconnue",
        });
      }
    });
  }

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogTrigger asChild>
        <Button variant="primary">
          <Play size={14} strokeWidth={2} />
          Lancer un run
        </Button>
      </DialogTrigger>
      <DialogContent>
        <DialogHeader>
          <DialogTitle>Lancer un run maintenant ?</DialogTitle>
          <DialogDescription>
            Tous les prompts actifs seront exécutés sur les LLMs trackés (Phase A : Claude
            uniquement). Coût estimé ~$0,01 par prompt. Les jobs idempotents déjà en cours seront
            ignorés.
          </DialogDescription>
        </DialogHeader>
        <DialogFooter>
          <Button variant="ghost" onClick={() => setOpen(false)} disabled={pending}>
            Annuler
          </Button>
          <Button variant="primary" onClick={handleConfirm} disabled={pending}>
            {pending ? "Enqueue en cours…" : "Confirmer"}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
