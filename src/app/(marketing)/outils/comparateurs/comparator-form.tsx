"use client";

import { useEffect, useState, useTransition } from "react";
import { Button, Field, Input } from "@/components/ui";
import { capture, identify } from "@/lib/posthog-client";
import { detectLocationAction } from "../location-actions";
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
  const [location, setLocation] = useState("");
  const [websiteDomain, setWebsiteDomain] = useState("");
  const [detectingLocation, setDetectingLocation] = useState(false);
  const [hpField, setHpField] = useState(""); // honeypot (nom non-sémantique, cf. schemas.ts)
  const [report, setReport] = useState<ComparatorScanReport | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [pending, startTransition] = useTransition();


  // Pré-remplit la ville depuis la home du site (JSON-LD/footer) quand
  // le prospect renseigne son domaine — modifiable, jamais imposé.
  async function handleWebsiteBlur() {
    const domain = websiteDomain.trim();
    if (!domain || location.trim() || detectingLocation) return;
    setDetectingLocation(true);
    try {
      const city = await detectLocationAction(domain);
      if (city) {
        setLocation(city);
        capture("tool_location_autodetected", { tool: "comparateurs", city });
      }
    } finally {
      setDetectingLocation(false);
    }
  }

  function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setError(null);

    capture("tool_lead_form_submitted", {
      tool: "comparateurs",
      sector: sector.trim().toLowerCase(),
      brand_name: brandName.trim(),
      has_website: websiteDomain.trim().length > 0,
      has_location: location.trim().length > 0,
    });
    identify(email.trim().toLowerCase(), { email: email.trim().toLowerCase() });

    startTransition(async () => {
      const result = await runComparatorScanAction({
        email: email.trim(),
        brandName: brandName.trim(),
        sector: sector.trim(),
        location: location.trim() || "",
        websiteDomain: websiteDomain.trim().toLowerCase() || "",
        hpField,
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
        <Field
          label="Ta ville (optionnel)"
          hint={detectingLocation ? "Détection depuis ton site…" : "Si tes clients sont locaux — détectée depuis ton site si possible"}
        >
          <Input
            type="text"
            placeholder="Ex : Tours"
            value={location}
            onChange={(e) => setLocation(e.target.value)}
            maxLength={80}
          />
        </Field>
        <Field label="Ton site (optionnel)" hint="Pour l'exclure des résultats">
          <Input
            type="text"
            inputMode="url"
            placeholder="monsite.fr"
            value={websiteDomain}
            onChange={(e) => setWebsiteDomain(e.target.value)}
            onBlur={handleWebsiteBlur}
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

      {/* Honeypot anti-bot : invisible pour les humains, rempli par les bots.
       * Nom non-sémantique pour ne pas déclencher l'autofill navigateur
       * (« company » était rempli par Chrome → faux positifs). */}
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
        Vérifier ma présence
      </Button>

      {error && (
        <p className="mt-3 rounded-[var(--radius-md)] bg-[color:var(--color-error-bg)] px-3 py-2 text-sm text-[color:var(--color-error)]">
          {error}
        </p>
      )}

      <p className="type-meta mt-4 text-center">
        ~10 secondes · gratuit · vérification par vraies recherches web
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
