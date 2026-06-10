"use client";

import { useState, useTransition } from "react";
import { useRouter } from "next/navigation";
import { Plus, Sparkles, X } from "lucide-react";
import posthog from "posthog-js";
import { Badge, Button, Field, Input } from "@/components/ui";
import { quickSetup, submitOnboarding, suggestPrompts, type OnboardingInput } from "./actions";

// Wizard onboarding 3 étapes, client component avec state local.
// PR 13 : step 3 a maintenant un bouton "Suggérer 5 prompts via IA"
// qui appelle Claude Haiku 4.5 avec brand + domain + competitors et
// pré-remplit les prompts. Coût ~$0.003 par appel.

type Step = 1 | 2 | 3;

interface WizardState {
  workspaceName: string;
  brandName: string;
  domain: string;
  brandAliases: string[];
  competitors: { name: string; domain: string }[];
  prompts: string[];
}

const INITIAL_STATE: WizardState = {
  workspaceName: "",
  brandName: "",
  domain: "",
  brandAliases: [],
  competitors: [{ name: "", domain: "" }],
  prompts: ["", "", "", "", ""],
};

export function OnboardingWizard({
  userEmail,
  nextAfter,
}: {
  userEmail: string;
  /** Redirect path après onboarding/skip (de `?next=` du login). */
  nextAfter: string | null;
}) {
  const router = useRouter();
  const [step, setStep] = useState<Step>(1);
  const [state, setState] = useState<WizardState>(INITIAL_STATE);
  const [error, setError] = useState<string | null>(null);
  const [pending, startTransition] = useTransition();
  const redirectTarget = nextAfter ?? "/app/dashboard";

  function canGoNext(): boolean {
    if (step === 1) {
      return (
        state.workspaceName.trim().length > 0 &&
        state.brandName.trim().length > 0 &&
        /^[a-z0-9.-]+\.[a-z]{2,}$/i.test(state.domain.trim())
      );
    }
    if (step === 2) {
      return state.competitors.some((c) => c.name.trim().length > 0);
    }
    if (step === 3) {
      return state.prompts.filter((p) => p.trim().length >= 5).length >= 3;
    }
    return false;
  }

  function handleNext() {
    if (step < 3) {
      setError(null);
      setStep((step + 1) as Step);
      return;
    }
    handleSubmit();
  }

  function handleSubmit() {
    setError(null);
    const payload: OnboardingInput = {
      workspaceName: state.workspaceName.trim(),
      brandName: state.brandName.trim(),
      domain: state.domain.trim(),
      brandAliases: state.brandAliases.map((a) => a.trim()).filter(Boolean),
      competitors: state.competitors
        .filter((c) => c.name.trim().length > 0)
        .map((c) => ({
          name: c.name.trim(),
          domain: c.domain.trim() || undefined,
        })),
      prompts: state.prompts.map((p) => p.trim()).filter((p) => p.length >= 5),
    };
    startTransition(async () => {
      try {
        await submitOnboarding(payload);
        posthog.capture("onboarding_completed", {
          prompts_count: payload.prompts.length,
          competitors_count: payload.competitors.length,
        });
        router.push(`${redirectTarget}${redirectTarget.includes("?") ? "&" : "?"}onboarded=1`);
        router.refresh();
      } catch (err) {
        posthog.captureException(err);
        setError(err instanceof Error ? err.message : "Erreur inconnue");
      }
    });
  }

  function canSkip(): boolean {
    // Skip requiert au minimum l'étape 1 (workspace + brand + domain).
    return (
      state.workspaceName.trim().length > 0 &&
      state.brandName.trim().length > 0 &&
      /^[a-z0-9.-]+\.[a-z]{2,}$/i.test(state.domain.trim())
    );
  }

  function handleSkip() {
    if (!canSkip()) return;
    setError(null);
    startTransition(async () => {
      try {
        await quickSetup({
          workspaceName: state.workspaceName.trim(),
          brandName: state.brandName.trim(),
          domain: state.domain.trim(),
        });
        posthog.capture("onboarding_skipped");
        router.push(`${redirectTarget}${redirectTarget.includes("?") ? "&" : "?"}onboarded=1`);
        router.refresh();
      } catch (err) {
        posthog.captureException(err);
        setError(err instanceof Error ? err.message : "Erreur inconnue");
      }
    });
  }

  return (
    <main className="mx-auto max-w-2xl px-6 py-12">
      <header className="mb-10 flex items-center justify-between">
        <span className="type-eyebrow">Onboarding · {userEmail}</span>
        <Badge tone="neutral">Étape {step} / 3</Badge>
      </header>

      {/* Progress bar 3 segments, repère visuel d'avancement. Segments
       * passent en noir au fur et à mesure. */}
      <div className="mb-10 flex items-center gap-2" aria-hidden>
        {([1, 2, 3] as const).map((s) => (
          <div
            key={s}
            className={
              s <= step
                ? "h-1 flex-1 rounded-full bg-[color:var(--color-ink)] transition-colors"
                : "h-1 flex-1 rounded-full bg-[color:var(--color-gray-200)] transition-colors"
            }
          />
        ))}
      </div>

      {step === 1 && <Step1 state={state} setState={setState} />}
      {step === 2 && <Step2 state={state} setState={setState} />}
      {step === 3 && <Step3 state={state} setState={setState} />}

      {error && (
        <p className="mt-6 rounded-[var(--radius-lg)] border border-[color:var(--color-error)]/20 bg-[color:var(--color-error-bg)] px-4 py-3 text-sm text-[color:var(--color-error)]">
          {error}
        </p>
      )}

      <div className="mt-10 flex items-center justify-between">
        <Button
          variant="ghost"
          onClick={() => setStep(Math.max(1, step - 1) as Step)}
          disabled={step === 1 || pending}
        >
          ← Précédent
        </Button>
        <Button variant="primary" onClick={handleNext} disabled={!canGoNext() || pending}>
          {step === 3 ? (pending ? "Création en cours…" : "Terminer →") : "Suivant →"}
        </Button>
      </div>

      {/* Skip, visible dès que l'étape 1 est valide. Le user peut
       * passer direct au dashboard / paiement avec un workspace minimal.
       * Pratique pour les conversions impulsives via /pricing. */}
      {step < 3 && canSkip() && (
        <div className="mt-6 flex items-center justify-center">
          <button
            type="button"
            onClick={handleSkip}
            disabled={pending}
            className="text-sm font-medium text-[color:var(--color-muted)] underline-offset-4 hover:text-[color:var(--color-ink)] hover:underline disabled:opacity-50"
          >
            {pending ? "Configuration…" : "Configurer plus tard, j'y vais directement →"}
          </button>
        </div>
      )}
    </main>
  );
}

function Step1({ state, setState }: { state: WizardState; setState: (s: WizardState) => void }) {
  return (
    <div className="flex flex-col gap-6">
      <div>
        <h1 className="type-h1">D&apos;abord, ta marque.</h1>
        <p className="type-body-lg mt-3">
          C&apos;est la marque qu&apos;on va tracker quotidiennement dans les 5 IA.
        </p>
      </div>

      <Field label="Nom du workspace" hint="Ex: « Ma société », visible uniquement par toi.">
        <Input
          type="text"
          value={state.workspaceName}
          onChange={(e) => setState({ ...state, workspaceName: e.target.value })}
          placeholder="Ma société"
          maxLength={80}
          autoFocus
        />
      </Field>

      <Field label="Nom de la marque" hint="Le nom que les LLMs sont censés citer.">
        <Input
          type="text"
          value={state.brandName}
          onChange={(e) => setState({ ...state, brandName: e.target.value })}
          placeholder="Ta marque"
          maxLength={80}
        />
      </Field>

      <Field label="Domaine principal" hint="Pour générer le rapport et faire le matching.">
        <Input
          type="text"
          value={state.domain}
          onChange={(e) => setState({ ...state, domain: e.target.value.toLowerCase() })}
          placeholder="ton-domaine.fr"
          maxLength={120}
          inputMode="url"
        />
      </Field>
    </div>
  );
}

function Step2({ state, setState }: { state: WizardState; setState: (s: WizardState) => void }) {
  function updateCompetitor(idx: number, key: "name" | "domain", value: string) {
    const next = [...state.competitors];
    next[idx] = { ...next[idx]!, [key]: value };
    setState({ ...state, competitors: next });
  }
  function addCompetitor() {
    if (state.competitors.length >= 10) return;
    setState({ ...state, competitors: [...state.competitors, { name: "", domain: "" }] });
  }
  function removeCompetitor(idx: number) {
    if (state.competitors.length <= 1) return;
    setState({
      ...state,
      competitors: state.competitors.filter((_, i) => i !== idx),
    });
  }

  return (
    <div className="flex flex-col gap-6">
      <div>
        <h1 className="type-h1">Tes concurrents directs.</h1>
        <p className="type-body-lg mt-3">
          1 à 10 concurrents qu&apos;on doit comparer à toi dans les réponses IA.
        </p>
      </div>

      <div className="flex flex-col gap-3">
        {state.competitors.map((c, idx) => (
          <div key={idx} className="flex items-center gap-2">
            <Input
              type="text"
              value={c.name}
              onChange={(e) => updateCompetitor(idx, "name", e.target.value)}
              placeholder={idx === 0 ? "Profound" : "Nom concurrent"}
              className="flex-1"
              maxLength={80}
            />
            <Input
              type="text"
              value={c.domain}
              onChange={(e) => updateCompetitor(idx, "domain", e.target.value.toLowerCase())}
              placeholder="domaine.com (optionnel)"
              className="flex-1"
              maxLength={120}
            />
            <button
              type="button"
              onClick={() => removeCompetitor(idx)}
              disabled={state.competitors.length <= 1}
              aria-label="Retirer concurrent"
              className="flex size-9 shrink-0 items-center justify-center rounded-[var(--radius-md)] border border-[color:var(--color-border)] bg-white text-[color:var(--color-muted)] transition hover:bg-[color:var(--color-gray-50)] focus:outline-none focus-visible:ring-2 focus-visible:ring-[color:var(--color-ink)] disabled:opacity-40"
            >
              <X size={14} />
            </button>
          </div>
        ))}

        <button
          type="button"
          onClick={addCompetitor}
          disabled={state.competitors.length >= 10}
          className="self-start inline-flex items-center gap-1.5 text-sm font-medium text-[color:var(--color-ink-soft)] hover:text-[color:var(--color-ink)] disabled:opacity-40"
        >
          <Plus size={14} /> Ajouter un concurrent
        </button>
      </div>
    </div>
  );
}

function Step3({ state, setState }: { state: WizardState; setState: (s: WizardState) => void }) {
  const [suggesting, startSuggesting] = useTransition();
  const [suggestError, setSuggestError] = useState<string | null>(null);

  function updatePrompt(idx: number, value: string) {
    const next = [...state.prompts];
    next[idx] = value;
    setState({ ...state, prompts: next });
  }
  function addPrompt() {
    if (state.prompts.length >= 25) return;
    setState({ ...state, prompts: [...state.prompts, ""] });
  }
  function removePrompt(idx: number) {
    if (state.prompts.length <= 3) return;
    setState({
      ...state,
      prompts: state.prompts.filter((_, i) => i !== idx),
    });
  }

  function handleSuggest() {
    setSuggestError(null);
    if (!state.brandName.trim() || !state.domain.trim()) {
      setSuggestError(
        "Renseigne d'abord la marque et le domaine (étape 1) pour suggérer des prompts.",
      );
      return;
    }
    posthog.capture("prompt_ai_suggestions_requested", { source: "onboarding" });
    startSuggesting(async () => {
      try {
        const result = await suggestPrompts({
          brandName: state.brandName.trim(),
          domain: state.domain.trim(),
          competitors: state.competitors.map((c) => c.name.trim()).filter(Boolean),
        });
        // Pad à 5 minimum côté UI (l'utilisateur peut ajouter plus
        // manuellement après). Remplace les prompts vides en priorité ;
        // s'il y a du contenu existant, on l'écrase pour respecter
        // l'intention "suggérer = je veux ces prompts".
        const next = [...result.prompts];
        while (next.length < 5) next.push("");
        setState({ ...state, prompts: next });
      } catch (err) {
        setSuggestError(err instanceof Error ? err.message : "Erreur de suggestion");
      }
    });
  }

  return (
    <div className="flex flex-col gap-6">
      <div>
        <h1 className="type-h1">Les prompts à suivre.</h1>
        <p className="type-body-lg mt-3">
          Questions réelles que tes prospects posent aux IA. 3 minimum, 25 maximum. Tu peux les
          écrire à la main ou laisser Claude Haiku t&apos;en suggérer 5.
        </p>
      </div>

      {/* CTA "Suggérer via IA", variant secondary pour rester sobre */}
      <div className="flex flex-col gap-2">
        <button
          type="button"
          onClick={handleSuggest}
          disabled={suggesting}
          className="card-hover-warm inline-flex w-full items-center justify-center gap-2 rounded-[var(--radius-pill)] border border-[color:var(--color-border-strong)] bg-white px-5 py-3 text-sm font-medium text-[color:var(--color-ink)] transition hover:bg-[color:var(--color-gray-50)] disabled:cursor-not-allowed disabled:opacity-50"
        >
          <Sparkles size={16} strokeWidth={2} className="text-[color:var(--color-accent)]" />
          {suggesting ? "Génération en cours…" : "Suggérer 5 prompts via Claude Haiku"}
        </button>
        {suggestError && <p className="text-xs text-[color:var(--color-error)]">{suggestError}</p>}
        <p className="type-meta text-center">
          Coût ~0,003 $. Tu pourras éditer chaque prompt après suggestion.
        </p>
      </div>

      <div className="flex flex-col gap-3">
        {state.prompts.map((prompt, idx) => (
          <div key={idx} className="flex items-start gap-2">
            <span className="mt-2.5 type-eyebrow shrink-0 w-8">
              #{(idx + 1).toString().padStart(2, "0")}
            </span>
            <Input
              type="text"
              value={prompt}
              onChange={(e) => updatePrompt(idx, e.target.value)}
              placeholder={
                idx === 0
                  ? "Quels sont les meilleurs outils SEO francophones en 2026 ?"
                  : "Une question que tes prospects poseraient à ChatGPT…"
              }
              className="flex-1"
              maxLength={500}
            />
            <button
              type="button"
              onClick={() => removePrompt(idx)}
              disabled={state.prompts.length <= 3}
              aria-label="Retirer prompt"
              className="flex size-9 shrink-0 items-center justify-center rounded-[var(--radius-md)] border border-[color:var(--color-border)] bg-white text-[color:var(--color-muted)] transition hover:bg-[color:var(--color-gray-50)] focus:outline-none focus-visible:ring-2 focus-visible:ring-[color:var(--color-ink)] disabled:opacity-40"
            >
              <X size={14} />
            </button>
          </div>
        ))}

        <button
          type="button"
          onClick={addPrompt}
          disabled={state.prompts.length >= 25}
          className="self-start inline-flex items-center gap-1.5 text-sm font-medium text-[color:var(--color-ink-soft)] hover:text-[color:var(--color-ink)] disabled:opacity-40"
        >
          <Plus size={14} /> Ajouter un prompt
        </button>
      </div>
    </div>
  );
}
