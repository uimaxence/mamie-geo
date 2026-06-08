"use client";

import { useEffect } from "react";
import { capture, setPersonProperty } from "@/lib/posthog-client";

// Tracker dashboard. À chaque vue :
//   - dashboard_viewed { has_runs }
//   - si has_runs : set_once person property first_metric_viewed_at
//     → permet de mesurer l'activation (signup → first_metric_viewed)
//     dans les funnels PostHog.

interface Props {
  hasRuns: boolean;
  visibilityScore: number;
  trackedLlms: number;
}

export function DashboardTracker({ hasRuns, visibilityScore, trackedLlms }: Props) {
  useEffect(() => {
    capture("dashboard_viewed", {
      has_runs: hasRuns,
      visibility_score: visibilityScore,
      tracked_llms: trackedLlms,
    });
    if (hasRuns) {
      setPersonProperty("first_metric_viewed_at", new Date().toISOString(), "set_once");
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);
  return null;
}
