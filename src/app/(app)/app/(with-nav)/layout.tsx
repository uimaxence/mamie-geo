import { redirect } from "next/navigation";
import { RunActivityBar } from "@/components/app/run-activity-bar";
import { UpgradeBanner } from "@/components/app/upgrade-banner";
import { AppSidebar } from "../../app-sidebar";
import { AppTopBar } from "../../app-top-bar";
import { loadSidebarData } from "../../app-sidebar-data";

// Layout intermédiaire (route group `(with-nav)`) : top bar horizontale
// (workspace + brand pattern Vercel) + sidebar latérale (nav + user).
// /app/onboarding reste en dehors → full-screen wizard sans nav.
//
// Bandes top stack :
//   1. <AppTopBar>, sticky workspace + brand switcher en ligne
//   2. <UpgradeBanner>, plan inactif (trialing/past_due/expired) ou
//      hard-cap LLM hit.
//   3. <RunActivityBar>, SSE temps réel de l'état des runs (premier
//      run en cours, X/N terminés, all done). Notifications toast à
//      chaque transition success/failed.

export default async function WithNavLayout({ children }: { children: React.ReactNode }) {
  const data = await loadSidebarData();
  if (!data) redirect("/app/onboarding");

  return (
    <div className="flex min-h-screen flex-col">
      <AppTopBar data={data} />
      <div className="flex flex-1 min-h-0">
        <AppSidebar data={data} />
        <main className="flex-1 min-w-0">
          <UpgradeBanner plan={data.workspace.plan} hardCapHitAt={data.workspace.hardCapHitAt} />
          <RunActivityBar />
          {children}
        </main>
      </div>
    </div>
  );
}
