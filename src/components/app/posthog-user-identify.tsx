"use client";

import { useEffect } from "react";
import posthog from "posthog-js";

// Identifie l'utilisateur dès l'app layout et set le contexte
// "workspace" via posthog.group() pour activer Groups Analytics
// (DAU par plan, churn cohort, etc.). Re-fire si plan/workspace
// changent dans la même session (deps array).
//
// Person properties : email, plan, role, workspace_id, brand_count
// (set), signup_at (setOnce). last_seen_plan mirror le plan pour
// faciliter les cohortes de retention.
// Group properties (workspace) : name, plan, slug, brand_count,
// prompt_count, created_at, mrr (€/mois sur la base du plan).

interface Props {
  userId: string;
  email: string;
  plan: string;
  role: string;
  workspaceId: string;
  workspaceName: string;
  workspaceSlug: string;
  workspaceCreatedAt: string;
  brandCount: number;
  promptCount: number;
  mrr: number | null;
  signupAt: string;
}

export function PostHogUserIdentify(props: Props) {
  useEffect(() => {
    posthog.identify(
      props.userId,
      {
        email: props.email,
        plan: props.plan,
        role: props.role,
        workspace_id: props.workspaceId,
        brand_count: props.brandCount,
        last_seen_plan: props.plan,
      },
      {
        signup_at: props.signupAt,
      },
    );
    posthog.group("workspace", props.workspaceId, {
      name: props.workspaceName,
      plan: props.plan,
      slug: props.workspaceSlug,
      brand_count: props.brandCount,
      prompt_count: props.promptCount,
      created_at: props.workspaceCreatedAt,
      mrr: props.mrr,
    });
  }, [
    props.userId,
    props.email,
    props.plan,
    props.role,
    props.workspaceId,
    props.workspaceName,
    props.workspaceSlug,
    props.workspaceCreatedAt,
    props.brandCount,
    props.promptCount,
    props.mrr,
    props.signupAt,
  ]);
  return null;
}
