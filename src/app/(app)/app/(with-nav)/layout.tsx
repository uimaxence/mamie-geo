import { redirect } from "next/navigation";
import { AppSidebar } from "../../app-sidebar";
import { loadSidebarData } from "../../app-sidebar-data";

// Layout intermédiaire (route group `(with-nav)`) : ajoute la sidebar
// autour de dashboard, prompts, competitors, runs, settings.
// /app/onboarding reste en dehors → full-screen wizard sans nav.

export default async function WithNavLayout({ children }: { children: React.ReactNode }) {
  const data = await loadSidebarData();
  if (!data) redirect("/app/onboarding");

  return (
    <div className="md:flex md:min-h-screen">
      <AppSidebar data={data} />
      <main className="flex-1 min-w-0">{children}</main>
    </div>
  );
}
