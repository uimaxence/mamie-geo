"use client";

import { useEffect, useState } from "react";
import { ArrowRight, ListChecks, Sparkles, Target, Users } from "lucide-react";
import {
  Button,
  Card,
  Dialog,
  DialogContent,
  DialogDescription,
  DialogTitle,
  LinkButton,
} from "@/components/ui";
import { capture } from "@/lib/posthog-client";

// Guide d'activation in-app : tant qu'aucun prompt n'est configuré, le
// dashboard ne sert à rien (stats vides). On accompagne donc l'utilisateur
// avec (a) une carte d'amorçage persistante en haut du dashboard et (b) une
// modale de bienvenue qui s'ouvre une fois par session pour expliquer les
// étapes. Couvre surtout les comptes créés via « Configurer plus tard »
// (quickSetup) et les nouveaux signups qui n'ont pas saisi de prompt.
// Demande 2026-06-16.

const SESSION_KEY = "mamie:dashboard-setup-guide:seen";

const STEPS = [
  {
    icon: ListChecks,
    title: "Ajoute tes prompts",
    body: "Les vraies questions que tes prospects posent à ChatGPT, Claude, Le Chat… On peut t'en suggérer à partir de ton site.",
  },
  {
    icon: Users,
    title: "Liste tes concurrents",
    body: "Pour mesurer ta part de voix face à eux dans les réponses des IA.",
  },
  {
    icon: Target,
    title: "Le tracking démarre",
    body: "Chaque jour, on interroge les 5 IA et on calcule ton score de visibilité. Reviens le suivre ici.",
  },
] as const;

export function DashboardSetupGuide({ promptCount }: { promptCount: number }) {
  const [open, setOpen] = useState(false);

  // Auto-ouverture de la modale, une fois par session, uniquement si rien
  // n'est configuré. sessionStorage = ne pas re-spammer à chaque navigation.
  useEffect(() => {
    if (promptCount > 0) return;
    if (typeof window === "undefined") return;
    if (sessionStorage.getItem(SESSION_KEY)) return;
    sessionStorage.setItem(SESSION_KEY, "1");
    // eslint-disable-next-line react-hooks/set-state-in-effect
    setOpen(true);
    capture("dashboard_setup_guide_shown", { prompt_count: promptCount });
  }, [promptCount]);

  if (promptCount > 0) return null;

  return (
    <>
      {/* Carte d'amorçage persistante — visible tant qu'aucun prompt. */}
      <Card className="mt-10 border-[color:var(--color-accent)]/30 bg-[color:var(--color-accent)]/[0.04] p-6">
        <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
          <div className="flex items-start gap-3">
            <span className="flex size-9 shrink-0 items-center justify-center rounded-[var(--radius-md)] bg-[color:var(--color-accent)]/10">
              <Sparkles size={18} className="text-[color:var(--color-accent)]" strokeWidth={2} />
            </span>
            <div>
              <h2 className="type-h3">Configure tes prompts pour démarrer</h2>
              <p className="type-meta mt-1 max-w-xl">
                Ton dashboard restera vide tant que tu n&apos;as pas de prompts à suivre. Ça prend
                2 minutes — on peut même te les suggérer à partir de ton site.
              </p>
            </div>
          </div>
          <div className="flex shrink-0 items-center gap-3">
            <Button variant="ghost" size="md" onClick={() => setOpen(true)}>
              Voir les étapes
            </Button>
            <LinkButton
              href="/app/prompts"
              variant="primary"
              size="md"
              onClick={() => capture("dashboard_setup_cta_clicked", { from: "inline_card" })}
            >
              Configurer mes prompts <ArrowRight size={15} />
            </LinkButton>
          </div>
        </div>
      </Card>

      <Dialog open={open} onOpenChange={setOpen}>
        <DialogContent className="max-w-lg">
          <div className="flex flex-col items-center text-center">
            <span className="flex size-12 items-center justify-center rounded-full bg-[color:var(--color-accent)]/10">
              <Sparkles size={24} className="text-[color:var(--color-accent)]" strokeWidth={2} />
            </span>
            <DialogTitle className="mt-4 type-h2">Bienvenue ! Lançons ton tracking.</DialogTitle>
            <DialogDescription className="mt-2 max-w-md">
              En 3 étapes, Mamie commence à mesurer ta visibilité dans ChatGPT, Claude, Perplexity,
              Gemini et Le Chat.
            </DialogDescription>
          </div>

          <ol className="mt-6 flex flex-col gap-4">
            {STEPS.map((step, i) => (
              <li key={step.title} className="flex items-start gap-3">
                <span className="flex size-8 shrink-0 items-center justify-center rounded-full bg-[color:var(--color-gray-100)] text-sm font-semibold text-[color:var(--color-ink)]">
                  {i + 1}
                </span>
                <div>
                  <p className="flex items-center gap-1.5 text-sm font-medium text-[color:var(--color-ink)]">
                    <step.icon size={14} className="text-[color:var(--color-accent)]" />
                    {step.title}
                  </p>
                  <p className="type-meta mt-0.5">{step.body}</p>
                </div>
              </li>
            ))}
          </ol>

          <div className="mt-7 flex flex-col gap-2">
            <LinkButton
              href="/app/prompts"
              variant="primary"
              size="lg"
              className="w-full"
              onClick={() => capture("dashboard_setup_cta_clicked", { from: "modal" })}
            >
              Configurer mes prompts <ArrowRight size={16} />
            </LinkButton>
            <button
              type="button"
              onClick={() => setOpen(false)}
              className="text-xs text-[color:var(--color-muted)] underline-offset-2 hover:text-[color:var(--color-ink)] hover:underline"
            >
              Plus tard
            </button>
          </div>
        </DialogContent>
      </Dialog>
    </>
  );
}
