"use client";

import { useEffect, useState } from "react";
import posthog from "posthog-js";

// Façade client thin pour PostHog. Le domaine n'importe jamais
// `posthog-js` directement, ce qui permet d'ajouter du masquage,
// du logging, ou un fallback no-op en SSR / tests / quand le SDK
// n'a pas chargé.

function isReady(): boolean {
  return typeof window !== "undefined" && typeof posthog?.capture === "function";
}

export function capture(event: string, properties?: Record<string, unknown>): void {
  if (!isReady()) return;
  posthog.capture(event, properties);
}

export function captureException(err: unknown, context?: Record<string, unknown>): void {
  if (!isReady()) return;
  posthog.captureException(err, context);
}

type SetMode = "set" | "set_once";

export function setPersonProperty(
  key: string,
  value: unknown,
  mode: SetMode = "set",
): void {
  if (!isReady()) return;
  if (mode === "set_once") {
    posthog.setPersonProperties(undefined, { [key]: value });
  } else {
    posthog.setPersonProperties({ [key]: value });
  }
}

export function setPersonProperties(
  set?: Record<string, unknown>,
  setOnce?: Record<string, unknown>,
): void {
  if (!isReady()) return;
  posthog.setPersonProperties(set, setOnce);
}

export function group(
  groupType: "workspace",
  groupKey: string,
  properties?: Record<string, unknown>,
): void {
  if (!isReady()) return;
  posthog.group(groupType, groupKey, properties);
}

export function aliasUser(userId: string): void {
  if (!isReady()) return;
  posthog.alias(userId);
}

export function identify(
  distinctId: string,
  properties?: Record<string, unknown>,
  setOnce?: Record<string, unknown>,
): void {
  if (!isReady()) return;
  posthog.identify(distinctId, properties, setOnce);
}

// Hook stub pour futur A/B testing. Subscribe à onFeatureFlags
// et retourne la valeur résolue (string variant, boolean, ou undefined
// pendant le loading).
export function useFeatureFlag(key: string): string | boolean | undefined {
  const [value, setValue] = useState<string | boolean | undefined>(undefined);
  useEffect(() => {
    if (!isReady()) return;
    const update = () => setValue(posthog.getFeatureFlag(key));
    update();
    const unsubscribe = posthog.onFeatureFlags(update);
    return () => {
      if (typeof unsubscribe === "function") unsubscribe();
    };
  }, [key]);
  return value;
}
