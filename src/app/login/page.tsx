"use client";

import { Suspense, useState } from "react";
import Link from "next/link";
import { useSearchParams } from "next/navigation";
import { Asterisk, ArrowLeft, Mail } from "lucide-react";
import { authClient } from "@/lib/auth-client";
import { Button, Field, Input, PatternBlock } from "@/components/ui";
import { Logo } from "@/components/marketing/logo";

// Login en split panel asymétrique (cf. doc 09 § PR 11b, ref
// BrightNest signup) :
//   - Panel gauche (hidden < md) : fond gris-50 + pattern damier ink
//     opacity 8% (nuance de gris très subtile, signature visuelle qui
//     n'écrase pas le titre — itération 2026-05-20 après tests
//     successifs primary 100%, gradient bleu, gradient renforcé)
//   - Panel droite : form magic-link (fond blanc, border-r entre les 2)
// Sur mobile : seul le panel form est rendu, plein écran.
//
// Param `?next=/app/...` propagé en callbackURL Better Auth (cf. doc 09
// § 2026-05-16 PR « premier wow moment » fix friction post-pricing).

export default function LoginPage() {
  return (
    <Suspense fallback={<LoginFallback />}>
      <LoginContent />
    </Suspense>
  );
}

function LoginFallback() {
  return <main className="grid min-h-screen grid-cols-1 md:grid-cols-2" />;
}

function LoginContent() {
  const params = useSearchParams();
  // Whitelist : seuls les paths internes commençant par / sont acceptés.
  // Évite open-redirect (un attaquant pourrait pousser `?next=https://evil`).
  const rawNext = params.get("next");
  const next = rawNext && rawNext.startsWith("/") && !rawNext.startsWith("//") ? rawNext : null;
  const callbackURL = next ?? "/app/dashboard";

  const [email, setEmail] = useState("");
  const [status, setStatus] = useState<"idle" | "sending" | "sent" | "error">("idle");
  const [errorMessage, setErrorMessage] = useState<string | null>(null);

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
    } catch (error) {
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

  return (
    <main className="grid min-h-screen grid-cols-1 md:grid-cols-2">
      {/* Panel gauche, fond gris-50 + pattern damier ink opacity 8%
          (nuance de gris subtile) + border verticale fine. Le pattern
          remplace le dégradé bleu (itération 2026-05-20). */}
      <aside className="relative hidden flex-col justify-between overflow-hidden border-r border-[color:var(--color-border)] bg-[color:var(--color-gray-50)] p-10 text-[color:var(--color-ink)] md:flex">
        <PatternBlock
          corner="bottom-left"
          tone="ink"
          size="xl"
          style={{ opacity: 0.08 }}
        />

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
}: {
  email: string;
  setEmail: (v: string) => void;
  status: "idle" | "sending" | "sent" | "error";
  errorMessage: string | null;
  onSubmit: (e: React.FormEvent<HTMLFormElement>) => void;
  next: string | null;
}) {
  return (
    <>
      <Asterisk
        size={28}
        strokeWidth={2.5}
        className="text-[color:var(--color-primary)]"
        aria-hidden
      />

      <h1 className="type-h1 mt-4">On t&apos;envoie un lien magique.</h1>
      <p className="type-body-lg mt-3">
        Pas de mot de passe à retenir. Un lien valable 10 minutes arrive dans ta boîte.
      </p>

      {next && (
        <p className="mt-4 rounded-[var(--radius-md)] bg-[color:var(--color-gray-50)] px-3 py-2 text-xs text-[color:var(--color-ink-soft)]">
          Une fois connecté, on te ramène automatiquement à&nbsp;
          <code className="font-mono text-[color:var(--color-ink)]">{next}</code>.
        </p>
      )}

      <form onSubmit={onSubmit} className="mt-8 flex flex-col gap-5">
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

      <p className="type-meta mt-12">
        Pas encore de compte ? Il sera créé automatiquement à la 1<sup>re</sup> connexion. Garantie
        remboursement 14 jours sur toute première souscription.
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
