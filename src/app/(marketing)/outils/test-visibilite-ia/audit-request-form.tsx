"use client";

import { useState, useTransition } from "react";
import { Button, Field, Input } from "@/components/ui";
import { capture, identify } from "@/lib/posthog-client";
import { submitAuditRequest } from "./actions";

// Form lead magnet, 3 champs minimum (email + marque + domaine) + notes
// optionnelles. Sur submit, server action qui envoie 2 emails Brevo.

export function AuditRequestForm() {
  const [pending, startTransition] = useTransition();
  const [status, setStatus] = useState<"idle" | "sent" | "error">("idle");
  const [errorMessage, setErrorMessage] = useState<string | null>(null);

  const [email, setEmail] = useState("");
  const [brandName, setBrandName] = useState("");
  const [domain, setDomain] = useState("");
  const [notes, setNotes] = useState("");

  function handleSubmit(event: React.FormEvent<HTMLFormElement>) {
    event.preventDefault();
    setStatus("idle");
    setErrorMessage(null);
    startTransition(async () => {
      try {
        const result = await submitAuditRequest({
          prospectEmail: email.trim(),
          brandName: brandName.trim(),
          domain: domain.trim().toLowerCase(),
          notes: notes.trim() || undefined,
        });
        if (!result.ok) {
          setStatus("error");
          setErrorMessage(result.error);
          return;
        }
        identify(email.trim(), { email: email.trim() });
        capture("tool_lead_form_submitted", {
          tool: "test-visibilite-ia",
          has_notes: notes.trim().length > 0,
          domain: domain.trim().toLowerCase(),
          brand_name: brandName.trim(),
        });
        setStatus("sent");
      } catch {
        setStatus("error");
        setErrorMessage("Erreur inattendue, réessaye dans quelques minutes.");
      }
    });
  }

  if (status === "sent") {
    return (
      <div className="rounded-[var(--radius-lg)] border border-[color:var(--color-success)]/20 bg-[color:var(--color-success-bg)] px-6 py-8 text-center">
        <h3 className="type-h3 text-[color:var(--color-success)]">Demande envoyée ✓</h3>
        <p className="mt-3 text-sm text-[color:var(--color-ink-soft)] max-w-prose mx-auto">
          On a bien reçu ta demande pour <strong>{brandName}</strong>. Tu vas recevoir une
          confirmation par email à <strong>{email}</strong>, puis le rapport complet sous 24 h
          ouvrées.
        </p>
        <p className="type-meta mt-4">
          Pas de mail ? Vérifie tes spams ou écris à hello@mamie-geo.fr
        </p>
      </div>
    );
  }

  return (
    <form
      onSubmit={handleSubmit}
      className="rounded-[var(--radius-xl)] border border-[color:var(--color-border)] bg-white p-6 sm:p-8"
    >
      <div className="grid grid-cols-1 gap-5 sm:grid-cols-2">
        <Field label="Ton email" className="sm:col-span-2">
          <Input
            type="email"
            required
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            placeholder="prenom@exemple.fr"
            autoComplete="email"
          />
        </Field>
        <Field label="Nom de la marque">
          <Input
            type="text"
            required
            value={brandName}
            onChange={(e) => setBrandName(e.target.value)}
            placeholder="Mamie GEO"
            maxLength={80}
          />
        </Field>
        <Field label="Domaine principal">
          <Input
            type="text"
            required
            value={domain}
            onChange={(e) => setDomain(e.target.value.toLowerCase())}
            placeholder="mamie-geo.fr"
            maxLength={120}
            inputMode="url"
          />
        </Field>
      </div>

      <div className="mt-5">
        <Field label="Notes (optionnel)" hint="Concurrents principaux, questions à tester…">
          <textarea
            value={notes}
            onChange={(e) => setNotes(e.target.value)}
            placeholder="Mes concurrents directs sont X, Y, Z. J'aimerais tester la visibilité sur les questions « meilleur outil de … »."
            maxLength={1000}
            rows={4}
            className="w-full rounded-[var(--radius-md)] border border-[color:var(--color-border-strong)] bg-white px-3.5 py-2.5 text-base text-[color:var(--color-ink)] placeholder:text-[color:var(--color-faint)] outline-none transition focus:border-[color:var(--color-ink)] focus:ring-2 focus:ring-[color:var(--color-gray-200)] resize-none"
          />
        </Field>
      </div>

      <div className="mt-6 flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
        <p className="type-meta">Gratuit · 1 audit par marque · Rapport sous 24 h ouvrées</p>
        <Button type="submit" variant="primary" size="lg" disabled={pending}>
          {pending ? "Envoi en cours…" : "Recevoir mon audit →"}
        </Button>
      </div>

      {status === "error" && errorMessage && (
        <p className="mt-4 rounded-[var(--radius-lg)] border border-[color:var(--color-error)]/20 bg-[color:var(--color-error-bg)] px-4 py-3 text-sm text-[color:var(--color-error)]">
          {errorMessage}
        </p>
      )}
    </form>
  );
}
