"use client";

import { useState, useTransition } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import {
  AlertCircle,
  ArrowUpRight,
  Bot,
  Check,
  CheckCircle2,
  ChevronDown,
  Copy,
  PlugZap,
  Sparkles,
} from "lucide-react";
import { Card } from "@/components/ui";
import { activateAiPixel, checkPixelInstalled, type CheckPixelResult } from "../settings/actions";

// Carte d'installation du pixel de trafic IA, façon « Get Started » Vercel.
// États : non éligible (upsell), pas de clé (activer), clé sans hit (étapes
// + statut + vérification d'installation), clé avec hits (compact, replié
// pour laisser la place à l'analyse). cf. doc 09 § 2026-06-15.

function snippetFor(appUrl: string, key: string): string {
  return `<script src="${appUrl}/api/ai-pixel/${key}.js" defer></script>`;
}

// Prompt prêt à coller dans un assistant IA (Claude Code, Cursor…) pour
// déléguer la pose de la balise. 1-2 phrases + la balise personnalisée.
function installPromptFor(snippet: string): string {
  return `Ajoute cette balise de suivi d'audience sur mon site, juste avant la balise </head>, sur toutes les pages (idéalement dans le layout ou le template partagé, pas page par page), sans rien modifier d'autre. Insère-la exactement telle quelle :\n\n${snippet}`;
}

// Bloc snippet réutilisé (état d'attente + état compact) : la balise + un
// bouton « Copier » et un bouton « Copier le prompt d'installation » (IA).
// État de copie encapsulé ici pour que les deux boutons ne se marchent pas
// dessus.
function SnippetBlock({ snippet }: { snippet: string }) {
  const [copied, setCopied] = useState<null | "snippet" | "prompt">(null);

  async function copy(value: string, what: "snippet" | "prompt") {
    await navigator.clipboard.writeText(value);
    setCopied(what);
    setTimeout(() => setCopied(null), 1800);
  }

  return (
    <div>
      <div className="flex items-start gap-2">
        <pre className="type-tabular flex-1 overflow-x-auto rounded-[var(--radius-md)] border border-[color:var(--color-border)] bg-[color:var(--color-gray-50)] px-4 py-3 text-xs text-[color:var(--color-ink)]">
          {snippet}
        </pre>
        <button
          type="button"
          onClick={() => copy(snippet, "snippet")}
          aria-label="Copier le script"
          className="inline-flex shrink-0 items-center gap-1.5 rounded-[var(--radius-md)] border border-[color:var(--color-border)] bg-white px-3 py-2 text-sm font-medium text-[color:var(--color-ink)] transition hover:bg-[color:var(--color-gray-50)]"
        >
          {copied === "snippet" ? (
            <Check size={15} strokeWidth={2.4} />
          ) : (
            <Copy size={15} strokeWidth={2.2} />
          )}
          {copied === "snippet" ? "Copié" : "Copier"}
        </button>
      </div>
      <button
        type="button"
        onClick={() => copy(installPromptFor(snippet), "prompt")}
        className="mt-2 inline-flex items-center gap-1.5 rounded-[var(--radius-md)] border border-[color:var(--color-border)] bg-white px-3 py-1.5 text-xs font-medium text-[color:var(--color-ink-soft)] transition hover:bg-[color:var(--color-gray-50)] hover:text-[color:var(--color-ink)]"
      >
        {copied === "prompt" ? (
          <Check size={14} strokeWidth={2.4} />
        ) : (
          <Bot size={14} strokeWidth={2.2} />
        )}
        {copied === "prompt"
          ? "Prompt copié — colle-le dans ton assistant IA"
          : "Copier le prompt d'installation (Claude Code, Cursor…)"}
      </button>
    </div>
  );
}

export function AiPixelInstall({
  initialKey,
  eligible,
  appUrl,
  detected,
  totalVisits,
  boundDomain,
}: {
  initialKey: string | null;
  eligible: boolean;
  appUrl: string;
  /** true dès qu'au moins une visite IA a été comptabilisée. */
  detected: boolean;
  totalVisits: number;
  /** Domaine de la marque auquel la clé est liée (le pixel ne compte que
   *  depuis ce domaine et ses sous-domaines). */
  boundDomain: string;
}) {
  const router = useRouter();
  const [key, setKey] = useState<string | null>(initialKey);
  const [error, setError] = useState<string | null>(null);
  const [showSnippet, setShowSnippet] = useState(false);
  const [check, setCheck] = useState<CheckPixelResult | null>(null);
  const [activating, startActivate] = useTransition();
  const [checking, startCheck] = useTransition();

  function handleActivate() {
    setError(null);
    startActivate(async () => {
      const res = await activateAiPixel();
      if (res.ok) {
        setKey(res.key);
        router.refresh();
      } else {
        setError(res.error);
      }
    });
  }

  function handleCheck() {
    startCheck(async () => {
      const res = await checkPixelInstalled();
      setCheck(res);
      // Un check réussi rafraîchit aussi la détection (une visite IA a pu
      // arriver entre-temps → bascule en mode compact + courbes).
      if (res.ok && res.status === "installed") router.refresh();
    });
  }

  // ── Plan sans la feature ────────────────────────────────────────────
  if (!eligible) {
    return (
      <Card className="p-6">
        <div className="flex items-start gap-3">
          <span className="mt-0.5 inline-flex h-9 w-9 shrink-0 items-center justify-center rounded-[var(--radius-md)] bg-[color:var(--color-accent-faint)] text-[color:var(--color-accent)]">
            <Sparkles size={18} strokeWidth={2.2} />
          </span>
          <div>
            <p className="type-body font-medium text-[color:var(--color-ink)]">
              Le trafic IA est inclus dès le plan Solo
            </p>
            <p className="type-meta mt-1 max-w-prose">
              Passe sur un plan payant pour prouver, courbe à l&apos;appui, que ta visibilité dans
              les IA t&apos;amène de vrais visiteurs.
            </p>
            <Link
              href="/app/settings#billing"
              className="mt-4 inline-flex items-center gap-1.5 rounded-[var(--radius-pill)] bg-[color:var(--color-ink)] px-4 py-2 text-sm font-medium text-white transition hover:opacity-90"
            >
              Voir les plans
              <ArrowUpRight size={15} strokeWidth={2.2} />
            </Link>
          </div>
        </div>
      </Card>
    );
  }

  // ── Pixel jamais activé ─────────────────────────────────────────────
  if (!key) {
    return (
      <Card className="p-6">
        <p className="type-body font-medium text-[color:var(--color-ink)]">
          Active le pixel pour prouver ton ROI
        </p>
        <p className="type-meta mt-1 max-w-prose">
          Un seul script à coller sur ton site. Il compte uniquement les visites venant des moteurs
          IA (ChatGPT, Perplexity, Gemini, Le Chat) — cookieless, sans bannière, sans donnée
          personnelle.
        </p>
        {error && <p className="type-meta mt-2 text-[color:var(--color-error)]">{error}</p>}
        <button
          type="button"
          onClick={handleActivate}
          disabled={activating}
          className="mt-4 inline-flex items-center justify-center rounded-[var(--radius-pill)] bg-[color:var(--color-ink)] px-4 py-2 text-sm font-medium text-white transition hover:opacity-90 disabled:cursor-not-allowed disabled:opacity-50"
        >
          {activating ? "Activation…" : "Activer le pixel"}
        </button>
      </Card>
    );
  }

  const snippet = snippetFor(appUrl, key);

  // ── Pixel actif & données présentes : carte compacte repliée ────────
  // L'analyse (courbes) est rendue au-dessus par la page : ici on ne garde
  // qu'une confirmation discrète + le script accessible à la demande.
  if (detected) {
    return (
      <Card className="overflow-hidden p-0">
        <div className="flex flex-wrap items-center justify-between gap-3 px-6 py-4">
          <div className="flex items-center gap-2.5">
            <span className="inline-flex h-2.5 w-2.5 shrink-0 rounded-full bg-[color:var(--color-success)]" />
            <p className="type-body text-sm font-medium text-[color:var(--color-ink)]">
              Pixel actif
              <span className="type-meta ml-2 font-normal text-[color:var(--color-ink-soft)]">
                {totalVisits.toLocaleString("fr-FR")} visite{totalVisits > 1 ? "s" : ""} IA détectée
                {totalVisits > 1 ? "s" : ""} sur 30 j
              </span>
            </p>
          </div>
          <button
            type="button"
            onClick={() => setShowSnippet((v) => !v)}
            aria-expanded={showSnippet}
            className="inline-flex shrink-0 items-center gap-1.5 rounded-[var(--radius-md)] border border-[color:var(--color-border)] bg-white px-3 py-1.5 text-sm font-medium text-[color:var(--color-ink)] transition hover:bg-[color:var(--color-gray-50)]"
          >
            Script d&apos;installation
            <ChevronDown
              size={14}
              strokeWidth={2.2}
              className={showSnippet ? "rotate-180 transition" : "transition"}
            />
          </button>
        </div>
        {showSnippet && (
          <div className="border-t border-[color:var(--color-border)] px-6 py-4">
            <SnippetBlock snippet={snippet} />
            <p className="type-meta mt-2 text-xs text-[color:var(--color-muted)]">
              À garder sur toutes les pages de <span className="font-medium">{boundDomain}</span>{" "}
              (la clé est liée à ce domaine). Cookieless &amp; RGPD-friendly : aucun cookie, aucune
              IP stockée.
            </p>
          </div>
        )}
      </Card>
    );
  }

  // ── Pixel posé, pas encore de hit : onboarding + vérif d'installation ─
  return (
    <Card className="overflow-hidden p-0">
      <div className="flex items-center gap-2.5 border-b border-[color:var(--color-border)] bg-[color:var(--color-gray-50)] px-6 py-4">
        <span className="relative inline-flex h-2.5 w-2.5 shrink-0">
          <span className="absolute inline-flex h-full w-full animate-ping rounded-full bg-[color:var(--color-warning)] opacity-60" />
          <span className="relative inline-flex h-2.5 w-2.5 rounded-full bg-[color:var(--color-warning)]" />
        </span>
        <div>
          <p className="type-body text-sm font-medium text-[color:var(--color-ink)]">
            En attente de la première visite IA
          </p>
          <p className="type-meta">
            Le script est prêt à recevoir. Termine les 3 étapes, puis vérifie l&apos;installation.
          </p>
        </div>
      </div>

      <div className="p-6">
        <ol className="flex flex-col gap-5">
          <Step n={1} title="Copie le script">
            <div className="mt-2">
              <SnippetBlock snippet={snippet} />
            </div>
          </Step>

          <Step n={2} title="Colle-le avant la balise </head>">
            <p className="type-meta mt-1 max-w-prose">
              Sur toutes les pages de ton site (dans le template/layout, pas page par page). Le
              script pèse moins d&apos;1 ko et ne bloque pas le rendu.
            </p>
          </Step>

          <Step n={3} title="Vérifie l'installation">
            <p className="type-meta mt-1 max-w-prose">
              On va chercher le script sur ta page d&apos;accueil — pas besoin d&apos;attendre une
              visite IA. Tu peux aussi tester en direct avec{" "}
              <code className="type-tabular">?utm_source=chatgpt.com</code> à la fin d&apos;une de
              tes URLs.
            </p>
            <div className="mt-3">
              <button
                type="button"
                onClick={handleCheck}
                disabled={checking}
                className="inline-flex items-center gap-1.5 rounded-[var(--radius-pill)] bg-[color:var(--color-ink)] px-4 py-2 text-sm font-medium text-white transition hover:opacity-90 disabled:cursor-not-allowed disabled:opacity-50"
              >
                <PlugZap size={15} strokeWidth={2.2} />
                {checking ? "Vérification…" : "Vérifier l'installation"}
              </button>
            </div>
            {check && <CheckFeedback check={check} />}
          </Step>
        </ol>

        <div className="mt-6 border-t border-[color:var(--color-border)] pt-4">
          <p className="type-meta text-xs text-[color:var(--color-ink-soft)]">
            <span className="font-medium">Clé liée à {boundDomain}.</span> Le pixel ne compte que
            les visites depuis ce domaine (et ses sous-domaines) — la même clé copiée sur un autre
            site n&apos;est pas comptée. Pour suivre un autre site, crée une nouvelle marque : elle
            aura sa propre clé.
          </p>
          <p className="type-meta mt-2 text-xs text-[color:var(--color-muted)]">
            Cookieless &amp; RGPD-friendly : aucun cookie, aucune IP stockée, aucun consentement
            requis. Le pixel ne mesure que l&apos;origine IA des visites — pas un analytics complet.
          </p>
        </div>
      </div>
    </Card>
  );
}

function CheckFeedback({ check }: { check: CheckPixelResult }) {
  if (check.ok && check.status === "installed") {
    return (
      <Feedback tone="success" icon={CheckCircle2}>
        Script détecté sur <span className="type-tabular">{check.url}</span>. L&apos;installation
        est bonne — il ne reste qu&apos;à recevoir une visite venant d&apos;une IA pour les
        premières données.
      </Feedback>
    );
  }
  if (check.ok && check.status === "missing") {
    return (
      <Feedback tone="warning" icon={AlertCircle}>
        Script introuvable sur <span className="type-tabular">{check.url}</span>. Vérifie qu&apos;il
        est bien collé avant <code className="type-tabular">&lt;/head&gt;</code>, puis réessaie. Si
        tu l&apos;injectes via un tag manager (Google Tag Manager…), ce test ne peut pas le voir —
        teste alors avec <code className="type-tabular">?utm_source=chatgpt.com</code>.
      </Feedback>
    );
  }
  return (
    <Feedback tone="neutral" icon={AlertCircle}>
      {check.ok ? "" : check.error} Le script reste valide — tu peux tester en direct avec{" "}
      <code className="type-tabular">?utm_source=chatgpt.com</code>.
    </Feedback>
  );
}

function Feedback({
  tone,
  icon: Icon,
  children,
}: {
  tone: "success" | "warning" | "neutral";
  icon: typeof CheckCircle2;
  children: React.ReactNode;
}) {
  const styles = {
    success:
      "border-[color:var(--color-success)]/25 bg-[color:var(--color-success-bg)] text-[color:var(--color-success)]",
    warning:
      "border-[color:var(--color-warning)]/25 bg-[color:var(--color-warning-bg)] text-[color:var(--color-warning)]",
    neutral:
      "border-[color:var(--color-border)] bg-[color:var(--color-gray-50)] text-[color:var(--color-ink-soft)]",
  }[tone];
  return (
    <div
      className={`mt-3 flex items-start gap-2 rounded-[var(--radius-md)] border px-3 py-2.5 ${styles}`}
    >
      <Icon size={15} strokeWidth={2.2} className="mt-0.5 shrink-0" />
      <p className="type-meta text-xs leading-relaxed">{children}</p>
    </div>
  );
}

function Step({ n, title, children }: { n: number; title: string; children: React.ReactNode }) {
  return (
    <li className="flex gap-3">
      <span className="mt-0.5 inline-flex h-6 w-6 shrink-0 items-center justify-center rounded-full bg-[color:var(--color-ink)] text-xs font-semibold text-white">
        {n}
      </span>
      <div className="min-w-0 flex-1">
        <p className="type-body text-sm font-medium text-[color:var(--color-ink)]">{title}</p>
        {children}
      </div>
    </li>
  );
}
