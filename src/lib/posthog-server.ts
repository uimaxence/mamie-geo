import { PostHog } from "posthog-node";

let posthogClient: PostHog | null = null;

export function getPostHogClient(): PostHog {
  if (!posthogClient) {
    posthogClient = new PostHog(process.env.NEXT_PUBLIC_POSTHOG_PROJECT_TOKEN!, {
      host: process.env.NEXT_PUBLIC_POSTHOG_HOST,
      flushAt: 1,
      flushInterval: 0,
    });
  }
  return posthogClient;
}

export async function shutdownPostHog(): Promise<void> {
  if (posthogClient) {
    await posthogClient.shutdown();
    posthogClient = null;
  }
}

export interface ServerCtx {
  workspaceId?: string;
  plan?: string;
  role?: string;
}

interface CaptureArgs {
  event: string;
  distinctId: string;
  properties?: Record<string, unknown>;
  ctx?: ServerCtx;
  groups?: Record<string, string>;
}

function buildAuto(args: CaptureArgs): {
  properties: Record<string, unknown>;
  groups: Record<string, string>;
} {
  const properties = { ...(args.properties ?? {}) };
  const groups = { ...(args.groups ?? {}) };
  if (args.ctx?.workspaceId) {
    if (properties.workspace_id === undefined) properties.workspace_id = args.ctx.workspaceId;
    if (properties.plan === undefined && args.ctx.plan) properties.plan = args.ctx.plan;
    if (properties.role === undefined && args.ctx.role) properties.role = args.ctx.role;
    if (!groups.workspace) groups.workspace = args.ctx.workspaceId;
  }
  return { properties, groups };
}

// captureServerEvent : helper standardisé pour capter un event PostHog
// côté serveur. Flush via flushAsync() (pas shutdown) pour préserver
// le singleton entre invocations Vercel. Auto-injecte workspace_id/plan/role
// + groups.workspace si ctx fourni.
export async function captureServerEvent(args: CaptureArgs): Promise<void> {
  if (!process.env.NEXT_PUBLIC_POSTHOG_PROJECT_TOKEN) return;
  const client = getPostHogClient();
  const { properties, groups } = buildAuto(args);
  client.capture({
    distinctId: args.distinctId,
    event: args.event,
    properties,
    groups: Object.keys(groups).length ? groups : undefined,
  });
  await client.flush();
}

interface IdentifyArgs {
  distinctId: string;
  properties?: Record<string, unknown>;
  setOnce?: Record<string, unknown>;
}

export async function identifyServerUser(args: IdentifyArgs): Promise<void> {
  if (!process.env.NEXT_PUBLIC_POSTHOG_PROJECT_TOKEN) return;
  const client = getPostHogClient();
  // Bypass client.identify() qui ne supporte que $set : on émet
  // $identify via capture() pour avoir $set + $set_once en un appel.
  client.capture({
    distinctId: args.distinctId,
    event: "$identify",
    properties: {
      ...(args.properties ? { $set: args.properties } : {}),
      ...(args.setOnce ? { $set_once: args.setOnce } : {}),
    },
  });
  await client.flush();
}

interface GroupArgs {
  groupType: "workspace";
  groupKey: string;
  properties?: Record<string, unknown>;
}

export async function groupServer(args: GroupArgs): Promise<void> {
  if (!process.env.NEXT_PUBLIC_POSTHOG_PROJECT_TOKEN) return;
  const client = getPostHogClient();
  client.groupIdentify({
    groupType: args.groupType,
    groupKey: args.groupKey,
    properties: args.properties,
  });
  await client.flush();
}

export async function isFeatureEnabled(
  flagKey: string,
  distinctId: string,
  groups?: Record<string, string>,
): Promise<boolean | string> {
  if (!process.env.NEXT_PUBLIC_POSTHOG_PROJECT_TOKEN) return false;
  const client = getPostHogClient();
  const result = await client.isFeatureEnabled(flagKey, distinctId, { groups });
  return result ?? false;
}
