import type { Metadata } from "next";
import { redirect } from "next/navigation";
import { headers } from "next/headers";
import Link from "next/link";
import { Fraunces, Hanken_Grotesk, Caveat } from "next/font/google";
import { auth } from "@/lib/auth";

// Fonts carrousels Mamie (cf. linkedindesign.md § 3 Typographie). Chargés
// UNIQUEMENT pour les routes /app/admin/* — l'app et le site marketing
// gardent Inter unique (doc 10). next/font/google self-host les fichiers
// → même origine, html-to-image les embed sans CORS.
const fraunces = Fraunces({
  subsets: ["latin"],
  weight: ["600", "700", "900"],
  variable: "--font-fraunces",
  display: "swap",
});
const hanken = Hanken_Grotesk({
  subsets: ["latin"],
  weight: ["400", "500", "700"],
  variable: "--font-hanken",
  display: "swap",
});
const caveat = Caveat({
  subsets: ["latin"],
  weight: ["400", "700"],
  variable: "--font-caveat",
  display: "swap",
});

// Layout admin — protégé par email allowlist (founder uniquement V0).
// Toute route /app/admin/* hérite de ce guard.
//
// V0 : Max seul. Si besoin d'ouvrir à d'autres admins, passer en
// ADMIN_EMAILS env var (split par virgules) ou ajouter un champ `role`
// dans la table users + check `role === "admin"`.
//
// Sécurité :
//   1. Guard côté serveur (Server Component layout) — non-bypassable client-side.
//   2. Email du user lu depuis la session Better Auth (signée par BETTER_AUTH_SECRET).
//   3. Refus → redirect /app/dashboard (et non /login) pour ne pas
//      révéler l'existence de la route admin aux users authentifiés non
//      admins.
//   4. noindex + nofollow pour ne pas indexer la route si jamais un
//      lien fuitait.

export const metadata: Metadata = {
  robots: { index: false, follow: false, noarchive: true, nosnippet: true },
};

const ADMIN_EMAILS = new Set(["maxencecailleau.pro@gmail.com"]);

export default async function AdminLayout({ children }: { children: React.ReactNode }) {
  const session = await auth.api.getSession({ headers: await headers() });
  if (!session) redirect("/login");
  const email = session.user.email?.toLowerCase() ?? "";
  if (!ADMIN_EMAILS.has(email)) redirect("/app/dashboard");

  return (
    <div
      className={`${fraunces.variable} ${hanken.variable} ${caveat.variable} min-h-screen bg-[color:var(--color-surface)]`}
    >
      <header className="sticky top-0 z-10 border-b border-[color:var(--color-border)] bg-white">
        <div className="mx-auto flex max-w-[1400px] items-center justify-between px-6 py-3">
          <Link
            href="/app/admin/visuals"
            className="flex items-center gap-3 text-sm font-semibold text-[color:var(--color-ink)]"
          >
            <span className="rounded-[var(--radius-sm)] bg-[color:var(--color-ink)] px-2 py-1 text-[10px] font-bold uppercase tracking-wider text-white">
              Admin
            </span>
            <span>Visuels marketing</span>
          </Link>
          <Link
            href="/app/dashboard"
            className="text-sm text-[color:var(--color-muted)] hover:text-[color:var(--color-ink)]"
          >
            ← Retour au dashboard
          </Link>
        </div>
      </header>
      <main className="mx-auto max-w-[1400px] px-6 py-8">{children}</main>
    </div>
  );
}
