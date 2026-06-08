"use client";

import type { ReactNode } from "react";
import { LinkButton, type LinkButtonProps } from "@/components/ui";
import { capture } from "@/lib/posthog-client";

// Wrapper client autour de <LinkButton> qui capte un event PostHog
// au clic. Permet de garder les server components marketing tels quels
// (préserve LCP/SEO) tout en instrumentant les CTA.

interface Props extends LinkButtonProps {
  trackEvent: string;
  trackProperties?: Record<string, unknown>;
  children?: ReactNode;
}

export function TrackedLinkButton({
  trackEvent,
  trackProperties,
  onClick,
  children,
  ...rest
}: Props) {
  return (
    <LinkButton
      {...rest}
      onClick={(event) => {
        capture(trackEvent, trackProperties);
        onClick?.(event);
      }}
    >
      {children}
    </LinkButton>
  );
}
