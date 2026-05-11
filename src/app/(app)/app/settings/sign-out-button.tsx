"use client";

import { useTransition } from "react";
import { useRouter } from "next/navigation";
import { LogOut } from "lucide-react";
import { authClient } from "@/lib/auth-client";

// Bouton de déconnexion — appelle Better Auth signOut côté client,
// puis redirige vers /. useTransition pour l'état pending.

export function SignOutButton() {
  const router = useRouter();
  const [pending, startTransition] = useTransition();

  function handleSignOut() {
    startTransition(async () => {
      await authClient.signOut();
      router.push("/");
      router.refresh();
    });
  }

  return (
    <button
      type="button"
      onClick={handleSignOut}
      disabled={pending}
      className="inline-flex items-center gap-2 rounded-[var(--radius-pill)] border border-[color:var(--color-error)]/30 bg-white px-5 py-2 text-sm font-medium text-[color:var(--color-error)] transition hover:bg-[color:var(--color-error-bg)] disabled:cursor-not-allowed disabled:opacity-50"
    >
      <LogOut size={14} strokeWidth={2.2} />
      {pending ? "Déconnexion en cours…" : "Se déconnecter"}
    </button>
  );
}
