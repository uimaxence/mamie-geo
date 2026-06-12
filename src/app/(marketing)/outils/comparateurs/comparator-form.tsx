"use client";

import { useEffect, useState, useTransition } from "react";
import { Button, Field, Input } from "@/components/ui";
import { capture, identify } from "@/lib/posthog-client";
import type { ComparatorScanReport } from "@/lib/comparators/types";
import { runComparatorScanAction } from "./actions";
import { ComparatorResults } from "./comparator-results";

// Form /outils/comparateurs : email gate + marque + secteur (+ site
// optionnel) → scan live (~10-20 s, requêtes web séquentielles) →
// résultats à l'écran. 3 états : idle / loading (étapes animées) /
// results.

const SECTOR_EXAMPLES = [
  "agence seo",
  "logiciel de caisse",
  "assurance habitation",
  "plombier",
  "banque en ligne",
  "crm",
];

export function ComparatorForm() {
  const [email, setEmail] = useState("");
  const [brandName, setBrandName] = useState("");
  const [sector, setSector] = useState("");
  const [websiteDomain, setWebsiteDomain] = useState("");
  const [company, setCompany] = useState(""); // honeypot
  const [report, setReport] = useState<ComparatorScanReport | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [pending, startTransition] = useTransition();

  function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setError(null);

    capture("tool_lead_form_submitted", {
      tool: "comparateurs",
      sector: sector.trim().toLowerCase(),
      brand_name: brandName.trim(),
      has_website: websiteDomain.trim().length > 0,
    });
    identify(email.trim().toLowerCase(), { email: email.trim().toLowerCase() });

    startTransition(async () => {
      const result = await runComparatorScanAction({
        email: email.trim(),
        brandName: brandName.trim(),
        sector: sector.trim(),
        websiteDomain: websiteDomain.trim().toLowerCase() || "",
        company,
      });
      if (!result.ok) {
        setError(result.message);
        return;
      }
      setReport(result.report);
    });
  }

  function handleReset() {
    setReport(null);
    setError(null);
  }

  if (pending) {
    return <ScanProgress brandName={brandName} />;
  }

  if (report) {
    return <ComparatorResults report={report} onReset={handleReset} />;
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
        <Field label="Ton secteur" hint={`Ex : ${SECTOR_EXAMPLES.join(", ")}`}>
          <Input
            type="text"
            placeholder="Ex : agence seo"
            value={sector}
            onChange={(e) => setSector(e.target.value)}
            maxLength={80}
            required
          />
        </Field>
        <Field label="Ton site (optionnel)" hint="Pour l'exclure des résultats">
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

      {/* Honeypot anti-bot : invisible pour les humains, rempli par les bots. */}
      <div aria-hidden className="absolute -left-[9999px] top-auto h-px w-px overflow-hidden">
        <label>
          Entreprise
          <input
            type="text"
            name="company"
            tabIndex={-1}
            autoComplete="off"
            value={company}
            onChange={(e) => setCompany(e.target.value)}
          />
        </label>
      </div>

      <Button type="submit" size="lg" disabled={pending} className="mt-6 w-full">
        Vérifier ma présence
      </Button>

      {error && (
        <p className="mt-3 rounded-[var(--radius-md)] bg-[color:var(--color-error-bg)] px-3 py-2 text-sm text-[color:var(--color-error)]">
          {error}
        </p>
      )}

      <p className="type-meta mt-4 text-center">
        ~10 secondes · gratuit · vraies recherches web, pas d&apos;IA générative
      </p>
    </form>
  );
}

// Étapes affichées pendant le scan, avancées au temps écoulé (le scan
// fait ~10 requêtes web parallélisées, ~5-10 s au total).
const PROGRESS_STEPS = [
  { atMs: 0, label: "Recherche des comparateurs et annuaires de ton secteur…" },
  { atMs: 1500, label: "Identification des sites que les IA citent vraiment…" },
  { atMs: 3000, label: "Vérification de ta présence, site par site…" },
  { atMs: 6000, label: "Compilation du verdict…" },
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
      <p className="type-h3">Scan en cours pour {brandName}</p>
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
      <p className="type-meta mt-6">Quelques secondes — on interroge le web en direct.</p>
    </div>
  );
}
