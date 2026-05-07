import { redirect } from "next/navigation";
import { headers } from "next/headers";
import { auth } from "@/lib/auth";

// Layout du route group (app). Vérifie l'auth — toute route /app/* est
// protégée. Pas de session → redirect /login. Pas de check de plan ici
// (le plan-guard s'applique au niveau des actions, pas du layout).
// cf. geo-project/03-architecture-technique.md § Auth
export default async function AppLayout({ children }: { children: React.ReactNode }) {
  const session = await auth.api.getSession({ headers: await headers() });
  if (!session) redirect("/login");

  // Fond blanc pur — direction Airbnb-like (cf. doc 09 § 2026-05-07).
  return <div className="min-h-screen bg-white">{children}</div>;
}
