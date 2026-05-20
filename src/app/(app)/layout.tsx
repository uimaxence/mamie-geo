import { redirect } from "next/navigation";
import { headers } from "next/headers";
import { auth } from "@/lib/auth";
import { Toaster, TooltipProvider } from "@/components/ui";

// Layout du route group (app). Vérifie l'auth, toute route /app/*
// est protégée. Pas de session → redirect /login. Le chrome (sidebar)
// est rendu dans (with-nav)/layout.tsx pour permettre à /app/onboarding
// d'être full-screen sans nav (pattern route group Next 15).
//
// Monte les providers globaux nécessaires aux primitifs UI :
//   - <TooltipProvider> pour Radix Tooltip
//   - <Toaster> pour sonner

export default async function AppLayout({ children }: { children: React.ReactNode }) {
  const session = await auth.api.getSession({ headers: await headers() });
  if (!session) redirect("/login");

  return (
    <TooltipProvider delayDuration={250} skipDelayDuration={100}>
      <div className="min-h-screen bg-white">{children}</div>
      <Toaster />
    </TooltipProvider>
  );
}
