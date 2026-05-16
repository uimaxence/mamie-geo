import { z } from "zod";

// Zod schemas — validation côté server actions. URL stricte HTTPS pour
// l'audit V0 (un site en HTTP est déjà un signal critique, on refuse
// proprement à l'entrée). Email simple pour le gate rapport complet.

export const auditUrlSchema = z
  .string()
  .trim()
  .min(8, "URL trop courte")
  .max(2048, "URL trop longue")
  .transform((s) => {
    // Si l'utilisateur n'a pas mis le protocole, on ajoute https://
    if (!/^https?:\/\//i.test(s)) return `https://${s}`;
    return s;
  })
  .refine((s) => /^https:\/\//i.test(s), {
    message: "Seules les URLs HTTPS sont auditées (HTTP = signal critique pour Google et les LLM).",
  })
  .refine(
    (s) => {
      try {
        const u = new URL(s);
        // Refuse les hôtes locaux / privés pour éviter SSRF.
        const host = u.hostname.toLowerCase();
        if (host === "localhost" || host === "127.0.0.1" || host === "::1") return false;
        if (host.endsWith(".local")) return false;
        // Blocs IP privés simples (10.x, 192.168.x, 172.16-31.x)
        if (/^10\./.test(host)) return false;
        if (/^192\.168\./.test(host)) return false;
        if (/^172\.(1[6-9]|2\d|3[01])\./.test(host)) return false;
        return true;
      } catch {
        return false;
      }
    },
    { message: "URL invalide ou hôte privé/local refusé." },
  );

export type AuditUrlInput = z.infer<typeof auditUrlSchema>;

export const auditEmailSchema = z.object({
  token: z.string().uuid("Token invalide"),
  email: z.string().email("Email invalide").max(180),
});

export type AuditEmailInput = z.infer<typeof auditEmailSchema>;
