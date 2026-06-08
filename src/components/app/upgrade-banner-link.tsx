"use client";

import { useEffect } from "react";
import Link from "next/link";
import { capture } from "@/lib/posthog-client";

// Wrapper client autour du CTA upgrade banner : fire upgrade_banner_viewed
// au mount (impression) + upgrade_banner_clicked au clic. Le parent
// reste server component pour ne pas alourdir le layout (with-nav).

interface Props {
  variant: string;
  currentPlan: string;
  cta: string;
}

export function UpgradeBannerLink({ variant, currentPlan, cta }: Props) {
  useEffect(() => {
    capture("upgrade_banner_viewed", { banner_variant: variant, current_plan: currentPlan });
  }, [variant, currentPlan]);

  return (
    <Link
      href="/app/settings#billing"
      onClick={() =>
        capture("upgrade_banner_clicked", {
          banner_variant: variant,
          current_plan: currentPlan,
          cta_label: cta,
        })
      }
      className="shrink-0 rounded-[var(--radius-md)] bg-[color:var(--color-ink)] px-3 py-1 text-xs font-medium text-white hover:bg-[color:var(--color-ink-soft)]"
    >
      {cta}
    </Link>
  );
}
