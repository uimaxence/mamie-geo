import { eq, sql } from "drizzle-orm";
import { db } from "@/db/client";
import { aiTrafficDaily, brands, siteTrafficDaily, workspaces } from "@/db/schema";
import { isAllowedOrigin } from "@/lib/ai-traffic/detect";
import { hashIp } from "@/lib/ai-traffic/keys";
import { allowAiHit, allowSiteHit } from "@/lib/ai-traffic/rate-limit";
import { collectPayloadSchema } from "@/lib/ai-traffic/schemas";
import { quotasFor } from "@/lib/plans/quotas";

// Endpoint public d'ingestion du pixel d'attribution trafic IA. Appelé en
// cross-origin par navigator.sendBeacon depuis le site du client. Best-effort :
// on répond TOUJOURS 200 (un beacon ne doit jamais voir d'erreur) ; les rejets
// (clé inconnue, bot, throttle, plan inéligible) sont des drops silencieux.
//
// RGPD : aucun cookie, aucune PII stockée. L'IP n'entre que hashée+salée dans
// le rate-limit (Redis-less, cf. src/lib/ai-traffic/rate-limit.ts).

export const runtime = "nodejs";
export const dynamic = "force-dynamic";

const CORS_HEADERS = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Methods": "POST, OPTIONS",
  "Access-Control-Allow-Headers": "Content-Type",
  "Access-Control-Max-Age": "86400",
} as const;

const BOT_UA = /bot|crawl|spider|slurp|headless|preview|facebookexternalhit|monitor|lighthouse/i;

function ok(): Response {
  return Response.json({ ok: true }, { headers: CORS_HEADERS });
}

function todayUTC(): string {
  return new Date().toISOString().slice(0, 10);
}

function clientIp(request: Request): string {
  const fwd = request.headers.get("x-forwarded-for");
  if (fwd) return fwd.split(",")[0]!.trim();
  return request.headers.get("x-real-ip") ?? "0.0.0.0";
}

export function OPTIONS(): Response {
  return new Response(null, { status: 204, headers: CORS_HEADERS });
}

export async function POST(request: Request): Promise<Response> {
  // 1. Filtrage bot par user-agent (drop silencieux).
  if (BOT_UA.test(request.headers.get("user-agent") ?? "")) return ok();

  // 2. Parse + validation de frontière.
  let body: unknown;
  try {
    body = await request.json();
  } catch {
    return ok();
  }
  const parsed = collectPayloadSchema.safeParse(body);
  if (!parsed.success) return ok();
  const { k, s } = parsed.data;

  // 3. Lookup brand par clé publique + plan du workspace.
  const [row] = await db
    .select({
      brandId: brands.id,
      domain: brands.domain,
      pausedAt: brands.pausedAt,
      plan: workspaces.plan,
    })
    .from(brands)
    .innerJoin(workspaces, eq(workspaces.id, brands.workspaceId))
    .where(eq(brands.aiPixelKey, k))
    .limit(1);

  // Clé inconnue, brand en pause, ou plan sans la feature → drop silencieux.
  if (!row || row.pausedAt) return ok();
  if (!quotasFor(row.plan).aiTrafficTracking) return ok();

  // 3 bis. Binding au domaine du projet : la clé ne compte QUE depuis le
  // domaine de la marque (ou un sous-domaine). Copiée sur un autre site → drop.
  // Bypass en dev (origine localhost ≠ domaine enregistré) pour les tests.
  if (process.env.NODE_ENV === "production") {
    const origin = request.headers.get("origin") ?? request.headers.get("referer");
    if (!isAllowedOrigin(origin, row.domain)) return ok();
  }

  // 4. Rate-limit / dédup (Postgres). IP jamais stockée en clair.
  const date = todayUTC();
  const ipHash = hashIp(clientIp(request), date);

  // 5. Trafic TOTAL : chaque pageview compte (cap large par IP/jour). Si
  //    throttlé, on s'arrête là (pas non plus de comptage IA).
  if (!(await allowSiteHit(ipHash, date))) return ok();
  await db
    .insert(siteTrafficDaily)
    .values({ brandId: row.brandId, date, visits: 1 })
    .onConflictDoUpdate({
      target: [siteTrafficDaily.brandId, siteTrafficDaily.date],
      set: { visits: sql`${siteTrafficDaily.visits} + 1` },
    });

  // 6. Sous-ensemble IA : seulement si une origine a été détectée, avec son
  //    propre cap par (IP × source). Le total est déjà compté ci-dessus.
  if (s !== null && (await allowAiHit(ipHash, s, date))) {
    await db
      .insert(aiTrafficDaily)
      .values({ brandId: row.brandId, source: s, date, visits: 1 })
      .onConflictDoUpdate({
        target: [aiTrafficDaily.brandId, aiTrafficDaily.source, aiTrafficDaily.date],
        set: { visits: sql`${aiTrafficDaily.visits} + 1` },
      });
  }

  return ok();
}
