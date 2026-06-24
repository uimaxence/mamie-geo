"use client";

import { useEffect, useState } from "react";
import { useSearchParams } from "next/navigation";
import { capture } from "@/lib/posthog-client";
import { PlanPickerModal, type PlanPickerVariant } from "./plan-picker-modal";
import { TrialExplainerModal } from "./trial-explainer-modal";

// Décide quand afficher le PlanPickerModal :
//   - post-onboarding : URL contient ?onboarded=1 → variant "default"
//   - sidebar click : event custom "mamie:open-plan-picker" → variant selon plan
//   - urgent end-of-trial : plan="trialing" ET trialEndsAt < J+2 → variant "urgent" (1×/session)
//   - expired : plan="expired"/"canceled" → variant "expired" (à chaque session sauf "plus tard 24h")
//
// L'état de dismiss est conservé en sessionStorage (key par variant) pour
// ne pas spammer dans la même session. Le "plus tard" du variant expired
// utilise localStorage avec TTL 24h.

interface Props {
  plan: string;
  trialEndsAt: string | null;
}

type TriggerSource = "post_onboarding" | "auto_re_prompt" | "sidebar_click" | "banner_click";

const SESSION_KEY = "mamie:plan-picker:dismissed";
const LATER_24H_KEY = "mamie:plan-picker:later-until";
const POST_ONBOARDED_SESSION_KEY = "mamie:plan-picker:post-onboarded-handled";
const TRIAL_EXPLAINER_SESSION_KEY = "mamie:trial-explainer:shown";

function deriveVariant(
  plan: string,
  trialEndsAt: string | null,
  now: number,
): PlanPickerVariant | null {
  if (plan === "expired" || plan === "canceled") return "expired";
  if (plan === "trialing") {
    if (!trialEndsAt) return "default";
    const daysLeft = Math.ceil((new Date(trialEndsAt).getTime() - now) / 86_400_000);
    if (daysLeft <= 2) return "urgent";
    return null;
  }
  return null;
}

export function PlanPickerModalTrigger({ plan, trialEndsAt }: Props) {
  const params = useSearchParams();
  const [state, setState] = useState<{
    open: boolean;
    variant: PlanPickerVariant;
    trigger: TriggerSource;
  }>({ open: false, variant: "default", trigger: "auto_re_prompt" });
  const [explainerOpen, setExplainerOpen] = useState(false);

  // Auto-show au mount selon les règles. Ce useEffect lit sessionStorage,
  // localStorage, URL params et Date.now — sources externes pour
  // lesquelles useEffect est la place légitime (cf. React docs §
  // "synchronizing with an external system"). setState ici est
  // intentionnel : on synchronise l'ouverture initiale avec le DOM
  // après l'hydratation.
  useEffect(() => {
    if (typeof window === "undefined") return;

    const now = Date.now();
    const v = deriveVariant(plan, trialEndsAt, now);
    if (!v) return;

    const sessionDismissed = sessionStorage.getItem(SESSION_KEY) === v;
    if (sessionDismissed && v !== "expired") return;

    if (v === "expired") {
      const laterUntil = localStorage.getItem(LATER_24H_KEY);
      if (laterUntil && Number(laterUntil) > now) return;
    }

    const isPostOnboarded =
      params.get("onboarded") === "1" && !sessionStorage.getItem(POST_ONBOARDED_SESSION_KEY);

    const nextTrigger: TriggerSource = isPostOnboarded ? "post_onboarding" : "auto_re_prompt";

    if (isPostOnboarded) {
      sessionStorage.setItem(POST_ONBOARDED_SESSION_KEY, "1");
    }

    // eslint-disable-next-line react-hooks/set-state-in-effect
    setState({ open: true, variant: v, trigger: nextTrigger });

    capture("plan_picker_opened", {
      variant: v,
      trigger: nextTrigger,
      plan,
      trial_days_left:
        trialEndsAt !== null
          ? Math.ceil((new Date(trialEndsAt).getTime() - now) / 86_400_000)
          : null,
    });
  }, [plan, trialEndsAt, params]);

  // Écoute l'event custom déclenché par <SidebarSubscribeCard> ou
  // <UpgradeBanner>. Pas de check session dismiss : l'user a explicitement
  // cliqué pour ouvrir.
  useEffect(() => {
    function onOpen(e: Event) {
      const now = Date.now();
      const detail = (e as CustomEvent<{ trigger?: TriggerSource }>).detail;
      const v = deriveVariant(plan, trialEndsAt, now) ?? "default";
      const nextTrigger = detail?.trigger ?? "sidebar_click";
      // L'event est extérieur à React → setState dans le handler est OK.
      setState({ open: true, variant: v, trigger: nextTrigger });
      capture("plan_picker_opened", {
        variant: v,
        trigger: nextTrigger,
        plan,
        trial_days_left:
          trialEndsAt !== null
            ? Math.ceil((new Date(trialEndsAt).getTime() - now) / 86_400_000)
            : null,
      });
    }
    window.addEventListener("mamie:open-plan-picker", onOpen);
    return () => window.removeEventListener("mamie:open-plan-picker", onOpen);
  }, [plan, trialEndsAt]);

  function handleOpenChange(next: boolean) {
    if (next) {
      setState((s) => ({ ...s, open: true }));
      return;
    }
    sessionStorage.setItem(SESSION_KEY, state.variant);
    if (state.variant === "expired") {
      localStorage.setItem(LATER_24H_KEY, String(Date.now() + 24 * 60 * 60 * 1000));
    } else if (!sessionStorage.getItem(TRIAL_EXPLAINER_SESSION_KEY)) {
      // L'utilisateur ferme sans choisir de plan : on lui explique qu'il
      // est en essai gratuit (sinon "trialing" reste obscur). Une seule fois
      // par session, et jamais sur le variant expired (déjà clair).
      sessionStorage.setItem(TRIAL_EXPLAINER_SESSION_KEY, "1");
      setExplainerOpen(true);
      capture("trial_explainer_shown", { from_variant: state.variant });
    }
    setState((s) => ({ ...s, open: false }));
  }

  return (
    <>
      <PlanPickerModal
        open={state.open}
        onOpenChange={handleOpenChange}
        variant={state.variant}
        trialEndsAt={trialEndsAt}
        trigger={state.trigger}
      />
      <TrialExplainerModal
        open={explainerOpen}
        onClose={() => setExplainerOpen(false)}
        trialEndsAt={trialEndsAt}
      />
    </>
  );
}
