"use client";

import { useState } from "react";
import Link from "next/link";
import { authClient } from "@/lib/auth-client";
import { Button, Field, Input } from "@/components/ui";

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
    <main className="mx-auto flex min-h-screen max-w-md flex-col justify-center px-6 py-16">
      {/* Eyebrow + filet vintage : signature éditoriale en haut de chaque page secondaire */}
      <Link
        href="/"
        className="type-eyebrow inline-block no-underline hover:text-[color:var(--color-ink)]"
      >
        ← Mamie GEO
      </Link>
      <hr className="rule mt-3 mb-10" />

      <h1 className="type-h1">On t&apos;envoie un lien magique.</h1>
      <p className="type-body-lg mt-4">
        Pas de mot de passe à retenir. Un lien valable 10 minutes arrive dans ta boîte.
      </p>

      <form onSubmit={handleSubmit} className="mt-10 flex flex-col gap-5">
        <Field label="Adresse email">
          <Input
            type="email"
            required
            value={email}
            onChange={(event) => setEmail(event.target.value)}
            placeholder="prenom@exemple.fr"
            autoComplete="email"
            autoFocus
          />
        </Field>
        <Button type="submit" size="lg" disabled={status === "sending" || !email}>
          {status === "sending" ? "Envoi en cours…" : "Recevoir le lien"}
        </Button>
      </form>

      {status === "sent" && (
        <div className="mt-6 rounded-[var(--radius-md)] border border-[color:var(--color-success)]/30 bg-[color:var(--color-success-bg)] px-4 py-3 text-sm text-[color:var(--color-success)]">
          ✓ Lien envoyé à <strong>{email}</strong>. Vérifie ta boîte (et tes spams).
        </div>
      )}
      {status === "error" && errorMessage && (
        <div className="mt-6 rounded-[var(--radius-md)] border border-[color:var(--color-error)]/30 bg-[color:var(--color-error-bg)] px-4 py-3 text-sm text-[color:var(--color-error)]">
          {errorMessage}
        </div>
      )}

      <p className="type-meta mt-12">
        Pas encore de compte ? Il sera créé automatiquement à la 1<sup>re</sup> connexion. 14 jours
        d&apos;essai sans carte bancaire.
      </p>
    </main>
  );
}
