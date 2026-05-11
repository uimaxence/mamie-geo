import Link from "next/link";

// Top bar minimaliste pour le route group (app). Logo brand à gauche,
// 2 liens nav (Dashboard / Settings), email user à droite. Pas de
// menu déroulant pour V0 — déconnexion vit dans /app/settings.

export function AppHeader({ userEmail }: { userEmail: string }) {
  return (
    <header className="border-b border-[color:var(--color-border)] bg-white">
      <div className="mx-auto flex max-w-6xl items-center justify-between px-6 py-4">
        <div className="flex items-center gap-8">
          <Link
            href="/app/dashboard"
            className="text-base font-bold tracking-tight text-[color:var(--color-ink)]"
          >
            Mamie GEO
          </Link>
          <nav className="flex items-center gap-5">
            <Link
              href="/app/dashboard"
              className="text-sm font-medium text-[color:var(--color-ink-soft)] hover:text-[color:var(--color-ink)]"
            >
              Dashboard
            </Link>
            <Link
              href="/app/settings"
              className="text-sm font-medium text-[color:var(--color-ink-soft)] hover:text-[color:var(--color-ink)]"
            >
              Réglages
            </Link>
          </nav>
        </div>
        <span className="hidden sm:block type-meta">{userEmail}</span>
      </div>
    </header>
  );
}
