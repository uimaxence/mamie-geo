"use client";

import { useState, useTransition } from "react";
import { CheckCircle2, Lock, XCircle } from "lucide-react";
import { Badge, Button, Field, Input, LinkButton } from "@/components/ui";
import { capture } from "@/lib/posthog-client";
import { normalizeText } from "@/lib/comparators/sectors";
import type { ExpressPromptResult, ExpressScanReport } from "@/lib/express-scan/types";
import { submitAuditRequest } from "./actions";

// Écran de résultat du scan express : verdict par question sur Le Chat
// (en clair), puis les 4 autres IA verrouillées (CTA trial — on ne
// floute pas de fausses données, on verrouille avec l'argument variance
// ×8 de l'étude), puis upsell audit manuel 24 h.

const LOCKED_LLMS = ["ChatGPT", "Claude", "Gemini", "Perplexity"];

const POSITION_LABEL: Record<string, string> = {
  debut: "en début de réponse",
  milieu: "en milieu de réponse",
  fin: "en fin de réponse",
};

export function ExpressScanResults({
  report,
  email,
  websiteDomain,
  onReset,
}: {
  report: ExpressScanReport;
  email: string;
  websiteDomain: string;
  onReset: () => void;
}) {
  return (
    <div className="mx-auto max-w-3xl">
      {/* Verdict Le Chat */}
      <div className="rounded-[var(--radius-xl)] border border-[color:var(--color-border)] bg-white p-6 shadow-[var(--shadow-sm)] sm:p-8">
        <div className="flex flex-col items-center gap-2 text-center">
          <p className="type-eyebrow">
            {report.brand} · {report.llmLabel} · en direct
          </p>
          <p className="text-5xl font-bold tabular-nums tracking-tight">
            {report.citedCount}
            <span className="text-2xl font-semibold text-[color:var(--color-ink-soft)]">
              /{report.totalPrompts}
            </span>
          </p>
          <p className="type-body max-w-md">{verdictText(report)}</p>
        </div>

        <div className="mt-8 flex flex-col gap-3">
          {report.results.map((result) => (
            <PromptCard key={result.prompt} result={result} brand={report.brand} />
          ))}
        </div>
      </div>

      {/* Les 4 autres IA, verrouillées */}
      <div className="mt-6 rounded-[var(--radius-xl)] border-2 border-[color:var(--color-ink)] bg-white p-6 sm:p-8">
        <h3 className="type-h3">Et sur les 4 autres IA ?</h3>
        <p className="type-body mt-2">
          C&apos;est là que ça se joue : dans notre étude 50 marques, les scores varient jusqu&apos;à{" "}
          <strong>×8 d&apos;une IA à l&apos;autre</strong> — Société Générale est invisible sur
          ChatGPT et n°2 sur Claude. Être cité sur une IA ne dit rien des quatre autres.
        </p>
        <div className="mt-5 flex flex-col gap-2">
          {LOCKED_LLMS.map((llm) => (
            <div
              key={llm}
              className="flex items-center justify-between rounded-[var(--radius-lg)] border border-[color:var(--color-border)] bg-[color:var(--color-gray-50)] px-4 py-3"
            >
              <span className="text-sm font-medium text-[color:var(--color-ink)]">{llm}</span>
              <span className="inline-flex items-center gap-1.5 text-xs font-medium text-[color:var(--color-faint)]">
                <Lock size={13} /> suivi quotidien dans l&apos;app
              </span>
            </div>
          ))}
        </div>
        <div className="mt-6 flex flex-col gap-3 sm:flex-row sm:items-center">
          <LinkButton href="/login?mode=signup" variant="accent" size="lg">
            Voir les 5 IA — essai 14 jours
          </LinkButton>
          <span className="type-meta">Garantie remboursement 14 jours, annulable en 1 clic.</span>
        </div>
      </div>

      {/* Upsell audit manuel */}
      <ManualAuditUpsell report={report} email={email} websiteDomain={websiteDomain} />

      <div className="mt-6 text-center">
        <Button variant="ghost" size="sm" onClick={onReset}>
          Tester une autre marque
        </Button>
      </div>
    </div>
  );
}

function verdictText(report: ExpressScanReport): string {
  if (report.citedCount === 0) {
    return "Ta marque n'apparaît dans aucune des 3 réponses. L'IA recommande tes concurrents à ta place — c'est exactement ce que voient tes prospects.";
  }
  if (report.citedCount < report.totalPrompts) {
    return "Ta marque apparaît, mais pas systématiquement : selon la question posée, l'IA te cite ou t'oublie.";
  }
  return "Ta marque est citée sur les 3 questions — reste à savoir si c'est aussi le cas sur les 4 autres IA, et si ça tient dans le temps.";
}

function PromptCard({ result, brand }: { result: ExpressPromptResult; brand: string }) {
  const brandNormalized = normalizeText(brand);
  return (
    <div className="rounded-[var(--radius-lg)] border border-[color:var(--color-border)] bg-white p-4">
      <p className="text-sm italic text-[color:var(--color-ink-soft)]">«&nbsp;{result.prompt}&nbsp;»</p>
      <div className="mt-3 flex items-center gap-2">
        {result.cited ? (
          <>
            <CheckCircle2 size={16} className="shrink-0 text-[color:var(--color-success)]" />
            <span className="text-sm font-medium text-[color:var(--color-success)]">
              Cité {result.position ? POSITION_LABEL[result.position] : ""}
            </span>
          </>
        ) : (
          <>
            <XCircle size={16} className="shrink-0 text-[color:var(--color-error)]" />
            <span className="text-sm font-medium text-[color:var(--color-error)]">Absent</span>
          </>
        )}
      </div>
      {result.brandsCited.length > 0 && (
        <div className="mt-3 flex flex-wrap items-center gap-1.5">
          <span className="type-meta mr-1">L&apos;IA cite :</span>
          {result.brandsCited.map((name) => (
            <Badge
              key={name}
              tone={normalizeText(name) === brandNormalized ? "accent" : "neutral"}
            >
              {name}
            </Badge>
          ))}
        </div>
      )}
    </div>
  );
}

// Le rapport manuel 24 h (ex-funnel principal) devient l'upsell : un
// clic si le domaine est déjà connu, sinon un seul champ à remplir.
function ManualAuditUpsell({
  report,
  email,
  websiteDomain,
}: {
  report: ExpressScanReport;
  email: string;
  websiteDomain: string;
}) {
  const [domain, setDomain] = useState(websiteDomain);
  const [status, setStatus] = useState<"idle" | "sent" | "error">("idle");
  const [errorMessage, setErrorMessage] = useState<string | null>(null);
  const [pending, startTransition] = useTransition();

  function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setErrorMessage(null);
    startTransition(async () => {
      const result = await submitAuditRequest({
        prospectEmail: email,
        brandName: report.brand,
        domain: domain.trim(),
        notes: `Demande issue du scan express — secteur « ${report.sector} », cité ${report.citedCount}/${report.totalPrompts} sur Le Chat.`,
      });
      if (!result.ok) {
        setStatus("error");
        setErrorMessage(result.error);
        return;
      }
      capture("tool_lead_form_submitted", {
        tool: "test-visibilite-ia",
        mode: "manual-followup",
        brand_name: report.brand,
      });
      setStatus("sent");
    });
  }

  if (status === "sent") {
    return (
      <div className="mt-6 rounded-[var(--radius-xl)] border border-[color:var(--color-success)]/20 bg-[color:var(--color-success-bg)] p-6 text-center">
        <p className="type-h3 text-[color:var(--color-success)]">Audit demandé ✓</p>
        <p className="mt-2 text-sm text-[color:var(--color-ink-soft)]">
          Tu recevras l&apos;analyse complète des 5 IA, faite à la main, sous 24 h ouvrées à{" "}
          <strong>{email}</strong>.
        </p>
      </div>
    );
  }

  return (
    <div className="mt-6 rounded-[var(--radius-xl)] border border-[color:var(--color-border)] bg-[color:var(--color-gray-50)] p-6 sm:p-8">
      <h3 className="type-h3">Tu préfères une analyse humaine complète ?</h3>
      <p className="type-body mt-2">
        On lance le même test sur les 5 IA, à la main : 5 questions de ton secteur, comparatif
        avec 3 concurrents, 3 actions concrètes. Gratuit, par email sous 24 h ouvrées.
      </p>
      <form onSubmit={handleSubmit} className="mt-4 flex flex-col gap-3 sm:flex-row sm:items-end">
        <Field label="Ton site" className="flex-1">
          <Input
            type="text"
            inputMode="url"
            placeholder="monsite.fr"
            value={domain}
            onChange={(e) => setDomain(e.target.value)}
            maxLength={120}
            required
          />
        </Field>
        <Button type="submit" variant="secondary" size="md" disabled={pending}>
          {pending ? "Envoi…" : "Recevoir l'audit complet"}
        </Button>
      </form>
      {status === "error" && errorMessage && (
        <p className="mt-3 rounded-[var(--radius-md)] bg-[color:var(--color-error-bg)] px-3 py-2 text-sm text-[color:var(--color-error)]">
          {errorMessage}
        </p>
      )}
    </div>
  );
}
