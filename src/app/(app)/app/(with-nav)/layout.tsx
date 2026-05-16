import { redirect } from "next/navigation";
import { UpgradeBanner } from "@/components/app/upgrade-banner";
import { AppSidebar } from "../../app-sidebar";
import { loadSidebarData } from "../../app-sidebar-data";

// Layout intermédiaire (route group `(with-nav)`) : ajoute la sidebar
// autour de dashboard, prompts, competitors, runs, settings.
// /app/onboarding reste en dehors → full-screen wizard sans nav.
// Inclut aussi <UpgradeBanner> qui apparaît si plan ∉ actif (trialing,
// past_due, expired, canceled).

export default async function WithNavLayout({ children }: { children: React.ReactNode }) {
  const data = await loadSidebarData();
  if (!data) redirect("/app/onboarding");

  return (
    <div className="md:flex md:min-h-screen">
      <AppSidebar data={data} />
      <main className="flex-1 min-w-0">
        <UpgradeBanner plan={data.workspace.plan} hardCapHitAt={data.workspace.hardCapHitAt} />
        {children}
      </main>
    </div>
  );
}
