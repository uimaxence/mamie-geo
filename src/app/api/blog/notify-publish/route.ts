import { NextResponse, type NextRequest } from "next/server";
import { z } from "zod";
import { env } from "@/lib/env";
import { sendNewArticleNewsletter } from "@/lib/email";
import { BLOG_CATEGORIES } from "@/lib/blog/schemas";

// POST /api/blog/notify-publish — déclenche une campagne Brevo annonçant
// un nouvel article à la liste BREVO_BLOG_LIST_ID. Appelé en fin du
// workflow de publication launchd (cf. .claude-code/publication-articles-prompt.md)
// juste après le `git push origin main` qui rend l'article live.
//
// Auth : Bearer CRON_SECRET (même secret que les autres endpoints
// d'orchestration). On veut éviter qu'un attaquant puisse spam la liste
// avec des emails arbitraires.
//
// Idempotence : si l'agent retry, on enverra 2 campagnes — pas de
// déduplication côté serveur en V0. Le prompt agent doit ne pas
// re-appeler en cas d'échec (le log/flag suffit).

export const dynamic = "force-dynamic";
export const runtime = "nodejs";

const bodySchema = z.object({
  slug: z
    .string()
    .min(1)
    .regex(/^[a-z0-9-]+$/, "slug doit matcher /^[a-z0-9-]+$/"),
  title: z.string().min(1).max(200),
  description: z.string().min(20).max(300),
  category: z.enum(BLOG_CATEGORIES),
  readingTimeMin: z.number().int().positive().max(60),
});

export async function POST(request: NextRequest): Promise<NextResponse> {
  const authHeader = request.headers.get("authorization");
  if (authHeader !== `Bearer ${env.CRON_SECRET}`) {
    return NextResponse.json({ ok: false, error: "unauthorized" }, { status: 401 });
  }

  let body: unknown;
  try {
    body = await request.json();
  } catch {
    return NextResponse.json({ ok: false, error: "invalid JSON body" }, { status: 400 });
  }

  const parsed = bodySchema.safeParse(body);
  if (!parsed.success) {
    return NextResponse.json(
      { ok: false, error: "invalid payload", issues: parsed.error.flatten().fieldErrors },
      { status: 400 },
    );
  }

  try {
    const result = await sendNewArticleNewsletter(parsed.data);
    if (result === null) {
      // Skip silencieux (env Brevo manquant). On retourne ok=true pour
      // que le caller (launchd agent) ne lève pas de flag — l'admin
      // verra le warn dans les logs Vercel s'il regarde.
      return NextResponse.json({ ok: true, sent: false, reason: "brevo not configured" });
    }
    return NextResponse.json({ ok: true, sent: true, campaignId: result.campaignId });
  } catch (error) {
    const message = error instanceof Error ? error.message : String(error);
    console.error(`[notify-publish] échec pour ${parsed.data.slug}: ${message}`);
    return NextResponse.json({ ok: false, error: message }, { status: 500 });
  }
}
