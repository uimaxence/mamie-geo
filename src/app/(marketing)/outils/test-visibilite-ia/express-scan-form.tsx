"use client";

import { useEffect, useState, useTransition } from "react";
import { Button, Field, Input } from "@/components/ui";
import { capture, identify } from "@/lib/posthog-client";
import type { ExpressScanReport } from "@/lib/express-scan/types";
import { runExpressScanAction } from "./actions";
import { ExpressScanResults } from "./express-scan-results";

// Form du scan express : marque + secteur + site optionnel + email →
// 3 prompts posés en live à Le Chat (~10-20 s) → résultats + 4 IA
// verrouillées. 3 états : idle / loading / results.

export function ExpressScanForm() {
  const [email, setEmail] = useState("");
  const [brandName, setBrandName] = useState("");
  const [sector, setSector] = useState("");
  const [location, setLocation] = useState("");
  const [websiteDomain, setWebsiteDomain] = useState("");
  const [hpField, setHpField] = useState(""); // honeypot (nom non-sémantique)
  const [report, setReport] = useState<ExpressScanReport | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [pending, startTransition] = useTransition();

  function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setError(null);

    capture("tool_lead_form_submitted", {
      tool: "test-visibilite-ia",
      mode: "express",
      sector: sector.trim().toLowerCase(),
      brand_name: brandName.trim(),
      has_location: location.trim().length > 0,
    });
    identify(email.trim().toLowerCase(), { email: email.trim().toLowerCase() });

    startTransition(async () => {
      const result = await runExpressScanAction({
        email: email.trim(),
        brandName: brandName.trim(),
        sector: sector.trim(),
        location: location.trim() || "",
        websiteDomain: websiteDomain.trim() || "",
        hpField,
      });
      if (!result.ok) {
        setError(result.message);
        return;
      }
      setReport(result.report);
    });
  }

  if (pending) {
    return <ScanProgress brandName={brandName} />;
  }

  if (report) {
    return (
      <ExpressScanResults
        report={report}
        email={email.trim()}
        websiteDomain={websiteDomain.trim()}
        onReset={() => setReport(null)}
      />
    );
  }

  return (
    <form
      onSubmit={handleSubmit}
      className="relative mx-auto max-w-2xl rounded-[var(--radius-xl)] border border-[color:var(--color-border)] bg-white p-6 shadow-[var(--shadow-sm)] sm:p-8"
    >
      <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
        <Field label="Nom de ta marque">
          <Input
            type="text"
            placeholder="Ex : Mamie GEO"
            value={brandName}
            onChange={(e) => setBrandName(e.target.value)}
            maxLength={80}
            required
            autoFocus
          />
        </Field>
        <Field label="Ton secteur" hint="Ex : agence seo, menuiserie, crm, plombier">
          <Input
            type="text"
            placeholder="Ex : agence seo"
            value={sector}
            onChange={(e) => setSector(e.target.value)}
            maxLength={80}
            required
          />
        </Field>
        <Field label="Ta ville (optionnel)" hint="Si tes clients sont locaux">
          <Input
            type="text"
            placeholder="Ex : Tours"
            value={location}
            onChange={(e) => setLocation(e.target.value)}
            maxLength={80}
          />
        </Field>
        <Field label="Ton site (optionnel)" hint="Pour l'audit complet ensuite">
          <Input
            type="text"
            inputMode="url"
            placeholder="monsite.fr"
            value={websiteDomain}
            onChange={(e) => setWebsiteDomain(e.target.value)}
            maxLength={120}
          />
        </Field>
        <Field label="Ton email" hint="Pour t'envoyer les prochaines analyses">
          <Input
            type="email"
            placeholder="toi@entreprise.fr"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            maxLength={120}
            required
          />
        </Field>
      </div>

      {/* Honeypot anti-bot, invisible pour les humains. */}
      <div aria-hidden className="absolute -left-[9999px] top-auto h-px w-px overflow-hidden">
        <label>
          Ne pas remplir
          <input
            type="text"
            name="hp_field"
            tabIndex={-1}
            autoComplete="off"
            value={hpField}
            onChange={(e) => setHpField(e.target.value)}
          />
        </label>
      </div>

      <Button type="submit" size="lg" disabled={pending} className="mt-6 w-full">
        Tester ma visibilité maintenant
      </Button>

      {error && (
        <p className="mt-3 rounded-[var(--radius-md)] bg-[color:var(--color-error-bg)] px-3 py-2 text-sm text-[color:var(--color-error)]">
          {error}
        </p>
      )}

      <p className="type-meta mt-4 text-center">
        ~15 secondes · gratuit · 3 vraies questions posées à une IA en direct
      </p>
    </form>
  );
}

const PROGRESS_STEPS = [
  { atMs: 0, label: "Génération des 3 questions de ton secteur…" },
  { atMs: 1500, label: "On interroge l'IA en direct…" },
  { atMs: 6000, label: "Détection de ta marque et de tes concurrents…" },
  { atMs: 11000, label: "Compilation du verdict…" },
];

function ScanProgress({ brandName }: { brandName: string }) {
  const [elapsed, setElapsed] = useState(0);
  useEffect(() => {
    const interval = setInterval(() => setElapsed((e) => e + 500), 500);
    return () => clearInterval(interval);
  }, []);

  const currentIndex = PROGRESS_STEPS.reduce(
    (acc, step, i) => (elapsed >= step.atMs ? i : acc),
    0,
  );

  return (
    <div className="mx-auto max-w-2xl rounded-[var(--radius-xl)] border border-[color:var(--color-border)] bg-white p-8 text-center shadow-[var(--shadow-sm)]">
      <p className="type-h3">Test en cours pour {brandName}</p>
      <div className="mx-auto mt-6 flex max-w-md flex-col gap-3 text-left">
        {PROGRESS_STEPS.map((step, i) => (
          <div key={step.atMs} className="flex items-center gap-3">
            <span
              className={`flex size-5 shrink-0 items-center justify-center rounded-full text-[10px] font-bold ${
                i < currentIndex
                  ? "bg-[color:var(--color-success)] text-white"
                  : i === currentIndex
                    ? "animate-pulse bg-[color:var(--color-accent)] text-white"
                    : "bg-[color:var(--color-gray-100)] text-[color:var(--color-faint)]"
              }`}
            >
              {i < currentIndex ? "✓" : i + 1}
            </span>
            <span
              className={`text-sm ${
                i <= currentIndex
                  ? "text-[color:var(--color-ink)]"
                  : "text-[color:var(--color-faint)]"
              }`}
            >
              {step.label}
            </span>
          </div>
        ))}
      </div>
      <p className="type-meta mt-6">10 à 20 secondes — l&apos;IA rédige ses réponses en direct.</p>
    </div>
  );
}
