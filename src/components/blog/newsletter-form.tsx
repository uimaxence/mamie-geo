"use client";

import { useState, useTransition } from "react";
import { Button } from "@/components/ui";
import { capture, identify } from "@/lib/posthog-client";
import { subscribeToBlogNewsletter } from "@/lib/blog/newsletter-action";

// Form d'inscription à la newsletter blog. Inline sur /blog (header
// de la page index), pourrait être réutilisé sur la page article si
// on veut un CTA fin d'article plus tard.
//
// UX : input + bouton inline, message succès/erreur sous le form.
// État stocké localement, server action via useTransition pour le
// pending. Pas de toaster pour rester local et indépendant du provider.

interface FeedbackState {
  tone: "success" | "info" | "error";
  message: string;
}

export function BlogNewsletterForm() {
  const [email, setEmail] = useState("");
  const [feedback, setFeedback] = useState<FeedbackState | null>(null);
  const [pending, startTransition] = useTransition();

  function handleSubmit(formData: FormData) {
    setFeedback(null);
    const submittedEmail = (formData.get("email") ?? "").toString().trim();
    startTransition(async () => {
      const result = await subscribeToBlogNewsletter(formData);
      if (result.ok) {
        if (submittedEmail) identify(submittedEmail, { email: submittedEmail });
        capture("newsletter_signup_submitted", {
          source: "blog_index",
          was_new: result.created,
        });
        setFeedback({
          tone: result.created ? "success" : "info",
          message: result.created
            ? "Inscrit. Tu recevras un email à chaque nouveau papier."
            : "Tu étais déjà dans la liste, pas de doublon créé.",
        });
        setEmail("");
      } else {
        setFeedback({ tone: "error", message: result.error });
      }
    });
  }

  return (
    <div className="mx-auto mt-10 max-w-md">
      <form
        action={handleSubmit}
        className="flex flex-col gap-2 sm:flex-row"
        aria-label="S'inscrire à la newsletter du blog"
      >
        <input
          type="email"
          name="email"
          required
          autoComplete="email"
          placeholder="ton@email.fr"
          value={email}
          onChange={(e) => setEmail(e.target.value)}
          disabled={pending}
          className="flex-1 rounded-[var(--radius-lg)] border border-[color:var(--color-border)] bg-white px-4 py-2.5 text-sm focus:border-[color:var(--color-ink)] focus:outline-none focus:ring-2 focus:ring-[color:var(--color-ink)] focus:ring-offset-1 disabled:opacity-60"
        />
        <Button type="submit" variant="primary" size="sm" disabled={pending}>
          {pending ? "..." : "M'inscrire"}
        </Button>
      </form>
      {feedback && (
        <p
          role={feedback.tone === "error" ? "alert" : "status"}
          className={`mt-3 text-sm ${
            feedback.tone === "success"
              ? "text-[color:var(--color-green)]"
              : feedback.tone === "error"
                ? "text-[color:var(--color-error)]"
                : "text-[color:var(--color-muted)]"
          }`}
        >
          {feedback.message}
        </p>
      )}
      <p className="mt-3 text-center text-xs text-[color:var(--color-muted)]">
        1 email par publication, pas de spam. Désinscription en 1 clic.
      </p>
    </div>
  );
}
