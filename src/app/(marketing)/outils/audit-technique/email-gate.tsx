"use client";

import { useState, useTransition } from "react";
import { CheckCircle2, Mail } from "lucide-react";
import { Button, Input } from "@/components/ui";
import { sendFullReportEmail } from "./actions";

// Form lead capture pour recevoir le rapport complet (30+ checks +
// recommandations détaillées) par email. Bloquant aucunement — le
// teaser reste affiché si le user ne renseigne pas son email.

export function EmailGate({ token }: { token: string }) {
  const [email, setEmail] = useState("");
  const [pending, startTransition] = useTransition();
  const [success, setSuccess] = useState(false);
  const [error, setError] = useState<string | null>(null);

  function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setError(null);
    startTransition(async () => {
      const r = await sendFullReportEmail(token, email);
      if (!r.ok) {
        setError(r.error ?? "Erreur inconnue");
        return;
      }
      setSuccess(true);
    });
  }

  if (success) {
    return (
      <div className="rounded-[var(--radius-xl)] border border-[color:var(--color-success)]/20 bg-[color:var(--color-success-bg)] p-6">
        <div className="flex items-start gap-3">
          <CheckCircle2 size={20} className="mt-0.5 text-[color:var(--color-success)]" />
          <div>
            <h3 className="type-h3 text-[color:var(--color-success)]">Rapport envoyé !</h3>
            <p className="mt-2 text-sm text-[color:var(--color-ink-soft)]">
              On vient d&apos;envoyer le rapport complet à <strong>{email}</strong>. Si tu ne le
              vois pas, vérifie tes spams.
            </p>
          </div>
        </div>
      </div>
    );
  }

  return (
    <form
      onSubmit={handleSubmit}
      className="rounded-[var(--radius-xl)] border border-[color:var(--color-border-strong)] bg-white p-6 shadow-[var(--shadow-sm)]"
    >
      <div className="flex items-center gap-2">
        <Mail size={18} className="text-[color:var(--color-ink-soft)]" />
        <h3 className="type-h3">Reçois le rapport complet par email</h3>
      </div>
      <p className="type-meta mt-2">
        30+ checks · recommandations détaillées par issue · partageable avec ton équipe
      </p>
      <div className="mt-4 flex flex-col gap-3 sm:flex-row">
        <Input
          type="email"
          placeholder="ton@email.fr"
          value={email}
          onChange={(e) => setEmail(e.target.value)}
          required
          className="flex-1"
          autoComplete="email"
        />
        <Button type="submit" disabled={pending || !email.trim()}>
          {pending ? "Envoi…" : "Recevoir le rapport"}
        </Button>
      </div>
      {error && (
        <p className="mt-3 rounded-[var(--radius-md)] bg-[color:var(--color-error-bg)] px-3 py-2 text-xs text-[color:var(--color-error)]">
          {error}
        </p>
      )}
      <p className="type-meta mt-3 text-xs">
        Un seul email transactionnel. Pas de newsletter, pas de spam.
      </p>
    </form>
  );
}
