"use client";

import { useEffect } from "react";
import { capture } from "@/lib/posthog-client";

// Tracker invisible monté dans un server component pour fire un event
// PostHog côté client au montage. Utile pour les pages app où on veut
// un event business explicite (audit_viewed, dashboard_viewed, etc.)
// en plus du $pageview autocapture.

interface Props {
  event: string;
  properties?: Record<string, unknown>;
}

export function PageViewTracker({ event, properties }: Props) {
  useEffect(() => {
    capture(event, properties);
    // properties is intentionally captured at mount: this tracker fires once
    // per mount; subsequent prop changes are ignored to avoid duplicate events.
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [event]);
  return null;
}
