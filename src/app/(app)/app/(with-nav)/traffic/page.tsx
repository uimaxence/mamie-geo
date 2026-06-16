import { headers } from "next/headers";
import { redirect } from "next/navigation";
import { Radar } from "lucide-react";
import { auth } from "@/lib/auth";
import { getAiTrafficData, getDashboardData } from "@/lib/dashboard/queries";
import { quotasFor } from "@/lib/plans/quotas";
import { env } from "@/lib/env";
import { PageContainer, PageHeader } from "@/components/ui";
import { AiPixelInstall } from "./ai-pixel-install";
import { TrafficCharts } from "./traffic-charts";

// Page « Trafic IA — preuve de ROI » (V1, cf. doc 09 § 2026-06-15). Surface
// dédiée façon Vercel Analytics : installation du pixel + statut de détection
// en direct + courbes trafic×visibilité. Déplacée depuis le dashboard
// (2026-06-15) pour donner au pixel une vraie page d'onboarding.

export const dynamic = "force-dynamic";

export default async function TrafficPage() {
  const reqHeaders = await headers();
  const session = await auth.api.getSession({ headers: reqHeaders });
  if (!session) redirect("/login");

  const data = await getDashboardData(session.user.id);
  if (!data) redirect("/app/onboarding");

  const aiTraffic = await getAiTrafficData(data.brand.id, data.brand.aiPixelKey, 30);
  const eligible = quotasFor(data.workspace.plan).aiTrafficTracking;
  const detected = aiTraffic.totalVisits > 0;

  // URL du snippet : domaine canonique en prod (le client colle le <script>
  // sur son propre site), origine de la requête en dev (suit le port réel).
  const appUrl =
    process.env.NODE_ENV === "production"
      ? env.NEXT_PUBLIC_APP_URL
      : `${reqHeaders.get("x-forwarded-proto") ?? "http"}://${
          reqHeaders.get("x-forwarded-host") ?? reqHeaders.get("host") ?? "localhost:3000"
        }`;

  return (
    <PageContainer>
      <PageHeader
        icon={Radar}
        title="Trafic IA"
        summary={buildSummary({ eligible, hasKey: Boolean(data.brand.aiPixelKey), detected, totalVisits: aiTraffic.totalVisits })}
      />

      {detected ? (
        // Pixel actif & données : l'analyse passe en premier, l'installation
        // se replie en bas (cf. UX 2026-06-15 — mettre la preuve en avant).
        <>
          <section className="mt-10">
            <div className="flex items-baseline justify-between">
              <div>
                <h2 className="type-h2">Trafic IA × visibilité</h2>
                <p className="type-meta mt-1">
                  Les visites réelles venant de ChatGPT, Perplexity, Gemini &amp; Le Chat,
                  superposées à ton score de visibilité. La preuve que le GEO amène du trafic.
                </p>
              </div>
            </div>
            <div className="mt-6">
              <TrafficCharts data={aiTraffic} />
            </div>
            <p className="type-meta mt-3 text-[color:var(--color-muted)]">
              Chiffre = plancher détecté, pas exhaustif : beaucoup de moteurs IA masquent
              l&apos;origine de la visite. La tendance compte plus que le total absolu.
            </p>
          </section>

          <div className="mt-10">
            <AiPixelInstall
              initialKey={data.brand.aiPixelKey}
              eligible={eligible}
              appUrl={appUrl}
              detected={detected}
              totalVisits={aiTraffic.totalVisits}
              boundDomain={data.brand.domain}
            />
          </div>
        </>
      ) : (
        <div className="mt-10">
          <AiPixelInstall
            initialKey={data.brand.aiPixelKey}
            eligible={eligible}
            appUrl={appUrl}
            detected={detected}
            totalVisits={aiTraffic.totalVisits}
            boundDomain={data.brand.domain}
          />
        </div>
      )}
    </PageContainer>
  );
}

function buildSummary({
  eligible,
  hasKey,
  detected,
  totalVisits,
}: {
  eligible: boolean;
  hasKey: boolean;
  detected: boolean;
  totalVisits: number;
}): string {
  if (!eligible) return "Prouve que ta visibilité IA t'amène de vrais visiteurs — inclus dès Solo";
  if (!hasKey) return "Active le pixel cookieless pour mesurer le trafic venant des IA";
  if (!detected) return "Pixel posé · en attente de la première visite IA";
  return `${totalVisits.toLocaleString("fr-FR")} visite${totalVisits > 1 ? "s" : ""} IA détectée${totalVisits > 1 ? "s" : ""} sur 30 jours`;
}
