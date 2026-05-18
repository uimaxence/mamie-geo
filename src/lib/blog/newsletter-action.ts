"use server";

import { z } from "zod";
import { subscribeContactToBlogList } from "@/lib/email";

// Server action consommée par <BlogNewsletterForm>. Valide l'email,
// délègue à `subscribeContactToBlogList` qui parle à Brevo. Retourne
// un résultat structuré pour que le composant client puisse afficher
// un toast adapté (créé / déjà inscrit / erreur).

const emailSchema = z.object({
  email: z.string().email("Email invalide"),
});

export type NewsletterSubscribeResult =
  | { ok: true; created: boolean }
  | { ok: false; error: string };

export async function subscribeToBlogNewsletter(
  formData: FormData,
): Promise<NewsletterSubscribeResult> {
  const parsed = emailSchema.safeParse({ email: formData.get("email") });
  if (!parsed.success) {
    return { ok: false, error: parsed.error.issues[0]?.message ?? "Email invalide" };
  }

  try {
    const { created } = await subscribeContactToBlogList(parsed.data.email);
    return { ok: true, created };
  } catch (error) {
    const message = error instanceof Error ? error.message : String(error);
    // Log côté serveur pour debug (Sentry), message générique côté UI.
    console.error(`[newsletter] inscription échouée pour ${parsed.data.email} : ${message}`);
    return {
      ok: false,
      error: "Impossible de t'inscrire pour le moment. Réessaie dans quelques minutes.",
    };
  }
}
