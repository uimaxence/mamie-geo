"use client";

import { useState } from "react";
import Link from "next/link";
import { Asterisk } from "lucide-react";
import { authClient } from "@/lib/auth-client";
import { Button, Field, Input } from "@/components/ui";

// Login en split panel asymétrique (cf. doc 09 § PR 11b, ref
// BrightNest signup) :
//   - Panel gauche (hidden < md) : dégradé warm orange + logo en haut
//     + tagline éditoriale en bas
//   - Panel droite : asterisque accent + form magic-link
// Sur mobile : seul le panel form est rendu, plein écran.

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
      setStatus("error");
      setErrorMessage(
        error instanceof Error
          ? error.message
          : "Erreur inattendue. Voir les logs serveur (Vercel → Logs).",
      );
    }
  }

  return (
    <main className="grid min-h-screen grid-cols-1 md:grid-cols-2">
      {/* Panel gauche — dégradé warm + identité brand. Caché sur mobile. */}
      <aside className="gradient-warm-panel relative hidden flex-col justify-between p-10 text-[color:var(--color-ink)] md:flex">
        <Link href="/" className="text-base font-bold tracking-tight text-[color:var(--color-ink)]">
          Mamie GEO
        </Link>

        <div className="max-w-md">
          <p className="type-eyebrow text-[color:var(--color-ink)]/70">Tu peux enfin</p>
          <h2 className="mt-4 font-semibold text-[2rem] leading-tight tracking-tight text-[color:var(--color-ink)] sm:text-[2.5rem]">
            mesurer ta visibilité dans ChatGPT, Claude et Le Chat — en français, à 49 €/mois.
          </h2>
        </div>
      </aside>

      {/* Panel droite — form login */}
      <section className="flex min-h-screen flex-col justify-center px-6 py-12 md:px-12 lg:px-20">
        <div className="mx-auto w-full max-w-md">
          <Link
            href="/"
            className="mb-8 inline-block text-sm font-semibold text-[color:var(--color-ink)] hover:opacity-70 md:hidden"
          >
            ← Mamie GEO
          </Link>

          <Asterisk
            size={28}
            strokeWidth={2.5}
            className="text-[color:var(--color-accent)]"
            aria-hidden
          />

          <h1 className="type-h1 mt-4">On t&apos;envoie un lien magique.</h1>
          <p className="type-body-lg mt-3">
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
            <Button
              type="submit"
              variant="primary"
              size="lg"
              disabled={status === "sending" || !email}
            >
              {status === "sending" ? "Envoi en cours…" : "Recevoir le lien →"}
            </Button>
          </form>

          {status === "sent" && (
            <div className="mt-6 rounded-[var(--radius-lg)] border border-[color:var(--color-success)]/20 bg-[color:var(--color-success-bg)] px-4 py-3 text-sm text-[color:var(--color-success)]">
              Lien envoyé à <strong>{email}</strong>. Vérifie ta boîte (et tes spams).
            </div>
          )}
          {status === "error" && errorMessage && (
            <div className="mt-6 rounded-[var(--radius-lg)] border border-[color:var(--color-error)]/20 bg-[color:var(--color-error-bg)] px-4 py-3 text-sm text-[color:var(--color-error)]">
              {errorMessage}
            </div>
          )}

          <p className="type-meta mt-12">
            Pas encore de compte ? Il sera créé automatiquement à la 1<sup>re</sup> connexion. 14
            jours d&apos;essai sans carte bancaire.
          </p>
        </div>
      </section>
    </main>
  );
}
