"use client";

import { useState } from "react";
import { authClient } from "@/lib/auth-client";

export default function LoginPage() {
  const [email, setEmail] = useState("");
  const [status, setStatus] = useState<"idle" | "sending" | "sent" | "error">("idle");
  const [errorMessage, setErrorMessage] = useState<string | null>(null);

  async function handleSubmit(event: React.FormEvent<HTMLFormElement>) {
    event.preventDefault();
    setStatus("sending");
    setErrorMessage(null);

    try {
      const result = await authClient.signIn.magicLink({
        email,
        callbackURL: "/app/dashboard",
      });

      if (result.error) {
        setStatus("error");
        setErrorMessage(result.error.message ?? "Erreur d'envoi du lien.");
        return;
      }
      setStatus("sent");
    } catch (error) {
      // Crash réseau / 500 server / SMTP throw : on ne reste plus bloqué
      // sur "sending" indéfiniment. L'erreur vraie est dans les logs Vercel.
      setStatus("error");
      setErrorMessage(
        error instanceof Error
          ? error.message
          : "Erreur inattendue. Voir les logs serveur (Vercel → Logs).",
      );
    }
  }

  return (
    <main className="mx-auto flex min-h-screen max-w-md flex-col justify-center px-6 py-24">
      <p className="text-sm uppercase tracking-widest text-[color:var(--color-warm-gray)]">
        Connexion
      </p>
      <h1 className="mt-4 font-serif text-4xl">On t&apos;envoie un lien magique.</h1>
      <p className="mt-3 text-[color:var(--color-warm-gray)]">
        Pas de mot de passe à retenir. Un lien valable 10 minutes arrive dans ta boîte.
      </p>

      <form onSubmit={handleSubmit} className="mt-10 flex flex-col gap-4">
        <label className="flex flex-col gap-2 text-sm">
          <span className="text-[color:var(--color-ink)]">Adresse email</span>
          <input
            type="email"
            required
            value={email}
            onChange={(event) => setEmail(event.target.value)}
            placeholder="prenom@exemple.fr"
            className="rounded-md border border-[color:var(--color-warm-gray)]/40 bg-white px-3 py-2 text-base outline-none focus:border-[color:var(--color-terracotta)]"
          />
        </label>
        <button
          type="submit"
          disabled={status === "sending"}
          className="rounded-md bg-[color:var(--color-terracotta)] px-4 py-2 font-medium text-white transition hover:opacity-90 disabled:opacity-50"
        >
          {status === "sending" ? "Envoi…" : "Recevoir le lien"}
        </button>
      </form>

      {status === "sent" && (
        <p className="mt-6 text-sm text-[color:var(--color-ink)]">
          ✓ Lien envoyé à <strong>{email}</strong>. Vérifie ta boîte (et tes spams).
        </p>
      )}
      {status === "error" && errorMessage && (
        <p className="mt-6 text-sm text-red-600">{errorMessage}</p>
      )}
    </main>
  );
}
