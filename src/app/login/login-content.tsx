"use client";

import { useState } from "react";
import Link from "next/link";
import { useSearchParams } from "next/navigation";
import { Asterisk, ArrowLeft, Mail } from "lucide-react";
import posthog from "posthog-js";
import { authClient } from "@/lib/auth-client";
import { Button, Field, Input } from "@/components/ui";
import { Logo } from "@/components/marketing/logo";

// Composant client du login. Reçoit `googleEnabled` en prop depuis le
// server component parent (login/page.tsx), qui lit l'env serveur pour
// savoir si Google OAuth est configuré (GOOGLE_CLIENT_ID +
// GOOGLE_CLIENT_SECRET). Pattern défensif : si Google OAuth pas
// configuré → bouton caché, magic-link reste seul actif.
//
// Param `?next=/app/...` propagé en callbackURL Better Auth (cf. doc 09
// § 2026-05-16 PR « premier wow moment » fix friction post-pricing).

export function LoginContent({ googleEnabled }: { googleEnabled: boolean }) {
  const params = useSearchParams();
  // Whitelist : seuls les paths internes commençant par / sont acceptés.
  // Évite open-redirect (un attaquant pourrait pousser `?next=https://evil`).
  const rawNext = params.get("next");
  const next = rawNext && rawNext.startsWith("/") && !rawNext.startsWith("//") ? rawNext : null;
  const callbackURL = next ?? "/app/dashboard";

  // ?mode=signup → copywriting "Inscription" (mais flow identique :
  // Better Auth magic-link crée le user à la 1ʳᵉ connexion auto).
  // Cf. 2026-05-27 : séparation CTA header Connexion vs Inscription.
  const isSignup = params.get("mode") === "signup";

  const [email, setEmail] = useState("");
  const [status, setStatus] = useState<"idle" | "sending" | "sent" | "error">("idle");
  const [errorMessage, setErrorMessage] = useState<string | null>(null);
  const [googleStatus, setGoogleStatus] = useState<"idle" | "sending">("idle");

  async function handleSubmit(event: React.FormEvent<HTMLFormElement>) {
    event.preventDefault();
    if (status === "sending") return;
    setStatus("sending");
    setErrorMessage(null);

    try {
      const result = await authClient.signIn.magicLink({ email, callbackURL });

      if (result.error) {
        console.error("[login] Better Auth error:", result.error);
        setStatus("error");
        const detail = [
          result.error.message,
          result.error.code ? `code: ${result.error.code}` : null,
          result.error.status ? `status: ${result.error.status}` : null,
        ]
          .filter(Boolean)
          .join(" · ");
        setErrorMessage(detail || "Erreur d'envoi du lien (pas de détail).");
        return;
      }
      setStatus("sent");
      posthog.capture("magic_link_requested", { email, is_signup: isSignup });
    } catch (error) {
      posthog.captureException(error);
      console.error("[login] fetch error:", error);
      setStatus("error");
      setErrorMessage(
        error instanceof Error
          ? error.message
          : "Erreur inattendue. Voir les logs serveur (Vercel → Logs).",
      );
    }
  }

  async function handleResend() {
    if (status === "sending" || !email) return;
    setStatus("sending");
    try {
      const result = await authClient.signIn.magicLink({ email, callbackURL });
      if (result.error) {
        setStatus("error");
        setErrorMessage(result.error.message ?? "Erreur d'envoi du lien.");
        return;
      }
      setStatus("sent");
    } catch (error) {
      setStatus("error");
      setErrorMessage(error instanceof Error ? error.message : "Erreur inattendue.");
    }
  }

  async function handleGoogleSignIn() {
    if (googleStatus === "sending") return;
    setGoogleStatus("sending");
    setErrorMessage(null);
    posthog.capture("google_signin_clicked");
    try {
      // signIn.social redirige vers l'écran de consentement Google.
      // Better Auth gère le callback côté /api/auth/callback/google
      // automatiquement, puis redirige vers callbackURL.
      await authClient.signIn.social({ provider: "google", callbackURL });
    } catch (error) {
      console.error("[login] Google OAuth error:", error);
      setGoogleStatus("idle");
      setErrorMessage(error instanceof Error ? error.message : "Erreur Google sign-in inattendue.");
    }
  }

  return (
    <main className="grid min-h-screen grid-cols-1 md:grid-cols-2">
      {/* Panel gauche, fond gris-50 + border verticale fine. Pattern
          retiré (PR 2026-05-20) après 4 itérations infructueuses. */}
      <aside className="relative hidden flex-col justify-between overflow-hidden border-r border-[color:var(--color-border)] bg-[color:var(--color-gray-50)] p-10 text-[color:var(--color-ink)] md:flex">
        <Link
          href="/"
          className="relative flex items-center gap-2 text-base font-bold tracking-tight text-[color:var(--color-ink)]"
        >
          <Logo size={28} />
          <span>Mamie GEO</span>
        </Link>

        <div className="relative max-w-md">
          <p className="type-eyebrow">Tu peux enfin</p>
          <h2 className="mt-4 font-semibold text-[2rem] leading-tight tracking-tight text-[color:var(--color-ink)] sm:text-[2.5rem]">
            mesurer ta visibilité dans ChatGPT, Claude et Le Chat, en français, dès 9,99 €/mois.
          </h2>
        </div>
      </aside>

      {/* Panel droite, form login */}
      <section className="flex min-h-screen flex-col justify-center px-6 py-12 md:px-12 lg:px-20">
        <div className="mx-auto w-full max-w-md">
          <Link
            href="/"
            className="mb-8 inline-flex items-center gap-1.5 text-sm font-semibold text-[color:var(--color-ink)] hover:opacity-70 md:hidden"
          >
            <span className="text-base">←</span>
            <Logo size={20} />
            <span>Mamie GEO</span>
          </Link>

          {status === "sent" ? (
            <SentState email={email} onResend={handleResend} onEdit={() => setStatus("idle")} />
          ) : (
            <IdleState
              email={email}
              setEmail={setEmail}
              status={status}
              errorMessage={errorMessage}
              onSubmit={handleSubmit}
              next={next}
              isSignup={isSignup}
              googleEnabled={googleEnabled}
              googleStatus={googleStatus}
              onGoogleSignIn={handleGoogleSignIn}
            />
          )}
        </div>
      </section>
    </main>
  );
}

function IdleState({
  email,
  setEmail,
  status,
  errorMessage,
  onSubmit,
  next,
  isSignup,
  googleEnabled,
  googleStatus,
  onGoogleSignIn,
}: {
  email: string;
  setEmail: (v: string) => void;
  status: "idle" | "sending" | "sent" | "error";
  errorMessage: string | null;
  onSubmit: (e: React.FormEvent<HTMLFormElement>) => void;
  next: string | null;
  isSignup: boolean;
  googleEnabled: boolean;
  googleStatus: "idle" | "sending";
  onGoogleSignIn: () => void;
}) {
  return (
    <>
      <Asterisk
        size={28}
        strokeWidth={2.5}
        className="text-[color:var(--color-primary)]"
        aria-hidden
      />

      <h1 className="type-h1 mt-4">
        {isSignup ? "Crée ton compte en 30 secondes." : "On t'envoie un lien magique."}
      </h1>
      <p className="type-body-lg mt-3">
        {isSignup
          ? "Pas de carte bancaire à cette étape. Pas de mot de passe à choisir. Tape ton email, reçois un lien, t'es dedans."
          : "Pas de mot de passe à retenir. Un lien valable 10 minutes arrive dans ta boîte."}
      </p>

      {next && (
        <p className="mt-4 rounded-[var(--radius-md)] bg-[color:var(--color-gray-50)] px-3 py-2 text-xs text-[color:var(--color-ink-soft)]">
          Une fois connecté, on te ramène automatiquement à&nbsp;
          <code className="font-mono text-[color:var(--color-ink)]">{next}</code>.
        </p>
      )}

      {/* Google OAuth, rendu seulement si configuré côté serveur.
       * Placé AVANT le form magic-link : c'est le chemin le plus rapide
       * (1 clic vs email + clic dans la boîte mail). */}
      {googleEnabled && (
        <>
          <button
            type="button"
            onClick={onGoogleSignIn}
            disabled={googleStatus === "sending"}
            className="mt-8 inline-flex w-full items-center justify-center gap-2.5 rounded-[var(--radius-pill)] border border-[color:var(--color-border-strong)] bg-white px-6 py-3 text-base font-medium text-[color:var(--color-ink)] transition hover:bg-[color:var(--color-gray-50)] disabled:cursor-not-allowed disabled:opacity-50"
          >
            <GoogleLogo />
            {googleStatus === "sending" ? "Redirection…" : "Continuer avec Google"}
          </button>

          <div className="my-6 flex items-center gap-3">
            <span className="h-px flex-1 bg-[color:var(--color-border)]" />
            <span className="text-xs uppercase tracking-wider text-[color:var(--color-muted)]">
              ou
            </span>
            <span className="h-px flex-1 bg-[color:var(--color-border)]" />
          </div>
        </>
      )}

      <form onSubmit={onSubmit} className={`flex flex-col gap-5 ${googleEnabled ? "" : "mt-8"}`}>
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
        <Button type="submit" variant="primary" size="lg" disabled={status === "sending" || !email}>
          {status === "sending" ? "Envoi en cours…" : "Recevoir le lien →"}
        </Button>
      </form>

      {status === "error" && errorMessage && (
        <div className="mt-6 rounded-[var(--radius-lg)] border border-[color:var(--color-error)]/20 bg-[color:var(--color-error-bg)] px-4 py-3 text-sm text-[color:var(--color-error)]">
          {errorMessage}
        </div>
      )}

      {/* Switch login ↔ signup : flow technique identique (magic-link
       * crée le user à la 1ʳᵉ), mais on dissocie l'intention pour la
       * clarté UX. */}
      <p className="type-meta mt-10">
        {isSignup ? (
          <>
            Déjà un compte ?{" "}
            <Link
              href="/login"
              className="font-medium text-[color:var(--color-ink)] underline decoration-[color:var(--color-ink-soft)]/40 underline-offset-2 hover:decoration-[color:var(--color-ink)]"
            >
              Se connecter
            </Link>
          </>
        ) : (
          <>
            Pas encore de compte ?{" "}
            <Link
              href="/login?mode=signup"
              className="font-medium text-[color:var(--color-ink)] underline decoration-[color:var(--color-ink-soft)]/40 underline-offset-2 hover:decoration-[color:var(--color-ink)]"
            >
              S&apos;inscrire
            </Link>
          </>
        )}
      </p>

      <p className="type-meta mt-3">
        {isSignup
          ? "Garantie remboursement 14 jours sur toute première souscription. Annulation en 1 clic."
          : "On crée ton compte automatiquement si c'est ta 1ʳᵉ connexion."}
      </p>
    </>
  );
}

function SentState({
  email,
  onResend,
  onEdit,
}: {
  email: string;
  onResend: () => void;
  onEdit: () => void;
}) {
  return (
    <div>
      <div className="inline-flex size-12 items-center justify-center rounded-[var(--radius-pill)] bg-[color:var(--color-success-bg)] text-[color:var(--color-success)] shadow-[var(--shadow-sm)]">
        <Mail size={22} strokeWidth={2} />
      </div>

      <h1 className="type-h1 mt-4">Vérifie ta boîte mail.</h1>
      <p className="type-body-lg mt-3">
        On a envoyé un lien de connexion à <strong>{email}</strong>. Tu as 10 minutes pour cliquer
        dessus.
      </p>

      <div className="mt-6 rounded-[var(--radius-lg)] bg-[color:var(--color-gray-50)] p-4 text-sm text-[color:var(--color-ink-soft)]">
        <p className="font-medium text-[color:var(--color-ink)]">Si tu utilises ton téléphone</p>
        <p className="mt-1">
          Le lien s&apos;ouvrira dans ton navigateur, pas dans l&apos;app email. Tu peux fermer
          cette page et revenir y plus tard, ta session sera active partout.
        </p>
      </div>

      <div className="mt-8 flex flex-col gap-3">
        <Button variant="secondary" size="md" onClick={onResend}>
          Renvoyer le lien
        </Button>
        <button
          type="button"
          onClick={onEdit}
          className="inline-flex items-center gap-1 self-start text-sm font-medium text-[color:var(--color-ink-soft)] hover:text-[color:var(--color-ink)]"
        >
          <ArrowLeft size={14} strokeWidth={2.2} />
          Utiliser une autre adresse
        </button>
      </div>

      <p className="type-meta mt-10">
        Rien reçu ? Vérifie tes spams. Si toujours rien après 2 min, renvoie le lien ou
        contacte-nous à{" "}
        <a href="mailto:hello@mamie-geo.fr" className="link">
          hello@mamie-geo.fr
        </a>
        .
      </p>
    </div>
  );
}

// Logo Google officiel (G coloré), SVG inline pour éviter une
// dépendance externe et garantir la conformité avec les guidelines
// Google Brand Resource Center.
function GoogleLogo() {
  return (
    <svg
      width="18"
      height="18"
      viewBox="0 0 18 18"
      xmlns="http://www.w3.org/2000/svg"
      aria-hidden="true"
    >
      <path
        d="M17.64 9.205c0-.639-.057-1.252-.164-1.841H9v3.481h4.844a4.14 4.14 0 0 1-1.796 2.716v2.259h2.908c1.702-1.567 2.684-3.875 2.684-6.615z"
        fill="#4285F4"
      />
      <path
        d="M9 18c2.43 0 4.467-.806 5.956-2.18l-2.908-2.259c-.806.54-1.837.86-3.048.86-2.344 0-4.328-1.584-5.036-3.711H.957v2.332A8.997 8.997 0 0 0 9 18z"
        fill="#34A853"
      />
      <path
        d="M3.964 10.71A5.41 5.41 0 0 1 3.682 9c0-.593.102-1.17.282-1.71V4.958H.957A8.996 8.996 0 0 0 0 9c0 1.452.348 2.827.957 4.042l3.007-2.332z"
        fill="#FBBC05"
      />
      <path
        d="M9 3.58c1.321 0 2.508.454 3.44 1.345l2.582-2.58C13.463.891 11.426 0 9 0A8.997 8.997 0 0 0 .957 4.958L3.964 7.29C4.672 5.163 6.656 3.58 9 3.58z"
        fill="#EA4335"
      />
    </svg>
  );
}
