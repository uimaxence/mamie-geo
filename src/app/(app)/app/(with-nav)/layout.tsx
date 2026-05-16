import { redirect } from "next/navigation";
import { RunActivityBar } from "@/components/app/run-activity-bar";
import { UpgradeBanner } from "@/components/app/upgrade-banner";
import { AppSidebar } from "../../app-sidebar";
import { loadSidebarData } from "../../app-sidebar-data";

// Layout intermédiaire (route group `(with-nav)`) : ajoute la sidebar
// autour de dashboard, prompts, competitors, runs, settings.
// /app/onboarding reste en dehors → full-screen wizard sans nav.
//
// Bandes top stack :
//   1. <UpgradeBanner> — plan inactif (trialing/past_due/expired) ou
//      hard-cap LLM hit.
//   2. <RunActivityBar> — SSE temps réel de l'état des runs (premier
//      run en cours, X/N terminés, all done). Notifications toast à
//      chaque transition success/failed.

export default async function WithNavLayout({ children }: { children: React.ReactNode }) {
  const data = await loadSidebarData();
  if (!data) redirect("/app/onboarding");

  return (
    <div className="md:flex md:min-h-screen">
      <AppSidebar data={data} />
      <main className="flex-1 min-w-0">
        <UpgradeBanner plan={data.workspace.plan} hardCapHitAt={data.workspace.hardCapHitAt} />
        <RunActivityBar />
        {children}
      </main>
    </div>
  );
}
