"use client";

import { useEffect, useState, useTransition } from "react";
import { Button, Field, Input } from "@/components/ui";
import { capture, identify } from "@/lib/posthog-client";
import type { SiteProfile } from "@/lib/site-profile";
import type { ExpressScanReport } from "@/lib/express-scan/types";
import { detectSiteProfileAction } from "../location-actions";
import { runExpressScanAction } from "./actions";
import { ExpressScanResults } from "./express-scan-results";

// Form du scan express, refondu 2026-06-12 (doc 09) : le prospect ne
// saisit que SITE + EMAIL — marque, secteur et zone de chalandise sont
// déduits de la home (detectSiteProfileAction), puis 3 questions sont
// posées en live à Le Chat. Mode manuel en fallback ou en correction.

const TOOL = "test-visibilite-ia";

export function ExpressScanForm() {
  const [email, setEmail] = useState("");
  const [websiteDomain, setWebsiteDomain] = useState("");
  const [mode, setMode] = useState<"auto" | "manual">("auto");
  // Champs du mode manuel, pré-remplis par la détection quand elle existe.
  const [brandName, setBrandName] = useState("");
  const [sector, setSector] = useState("");
  const [location, setLocation] = useState("");
  const [detected, setDetected] = useState<SiteProfile | null>(null);
  const [hpField, setHpField] = useState(""); // honeypot (nom non-sémantique)
  const [report, setReport] = useState<ExpressScanReport | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [pending, startTransition] = useTransition();

  async function runScan(profile: { brandName: string; sector: string; zone: string | null }) {
    const result = await runExpressScanAction({
      email: email.trim(),
      brandName: profile.brandName,
      sector: profile.sector,
      location: profile.zone ?? "",
      websiteDomain: websiteDomain.trim().toLowerCase(),
      hpField,
    });
    if (!result.ok) {
      setError(result.message);
      return;
    }
    setReport(result.report);
  }

  function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setError(null);

    capture("tool_lead_form_submitted", {
      tool: TOOL,
      mode: mode === "auto" ? "express-auto" : "express-manual",
      domain: websiteDomain.trim().toLowerCase(),
    });
    identify(email.trim().toLowerCase(), { email: email.trim().toLowerCase() });

    startTransition(async () => {
      if (mode === "manual") {
        await runScan({
          brandName: brandName.trim(),
          sector: sector.trim(),
          zone: location.trim() || null,
        });
        return;
      }

      const profile = await detectSiteProfileAction(websiteDomain.trim());
      if (!profile) {
        setMode("manual");
        setError(
          "On n'a pas réussi à analyser ton site automatiquement. Complète ces 3 champs et relance.",
        );
        return;
      }
      setDetected(profile);
      setBrandName(profile.brandName);
      setSector(profile.sector);
      setLocation(profile.zone ?? "");
      capture("tool_profile_autodetected", {
        tool: TOOL,
        sector: profile.sector,
        has_zone: Boolean(profile.zone),
      });
      await runScan(profile);
    });
  }

  // Correction depuis les résultats : mode manuel pré-rempli.
  function handleEdit() {
    setReport(null);
    setMode("manual");
    setError(null);
  }

  function handleReset() {
    setReport(null);
    setDetected(null);
    setMode("auto");
    setError(null);
  }

  if (pending) {
    return <ScanProgress domain={websiteDomain} detected={detected} />;
  }

  if (report) {
    return <ExpressScanResults report={report} onReset={handleReset} onEdit={handleEdit} />;
  }

  return (
    <form
      onSubmit={handleSubmit}
      className="relative mx-auto max-w-2xl rounded-[var(--radius-xl)] border border-[color:var(--color-border)] bg-white p-6 shadow-[var(--shadow-sm)] sm:p-8"
    >
      <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
        <Field label="Ton site">
          <Input
            type="text"
            inputMode="url"
            placeholder="monsite.fr"
            value={websiteDomain}
            onChange={(e) => setWebsiteDomain(e.target.value)}
            maxLength={120}
            required
            autoFocus
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

      {mode === "manual" && (
        <div className="mt-4 grid grid-cols-1 gap-4 border-t border-[color:var(--color-border)] pt-4 sm:grid-cols-3">
          <Field label="Nom de ta marque">
            <Input
              type="text"
              placeholder="Ex : Mamie GEO"
              value={brandName}
              onChange={(e) => setBrandName(e.target.value)}
              maxLength={80}
              required
            />
          </Field>
          <Field label="Ton secteur">
            <Input
              type="text"
              placeholder="Ex : menuiserie"
              value={sector}
              onChange={(e) => setSector(e.target.value)}
              maxLength={80}
              required
            />
          </Field>
          <Field label="Ta zone (optionnel)" hint="Ville si clients locaux">
            <Input
              type="text"
              placeholder="Ex : Tours"
              value={location}
              onChange={(e) => setLocation(e.target.value)}
              maxLength={80}
            />
          </Field>
        </div>
      )}

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
        ~20 secondes · gratuit · marque, secteur et zone détectés depuis ton site ·{" "}
        {mode === "auto" ? (
          <button
            type="button"
            onClick={() => setMode("manual")}
            className="underline underline-offset-2 hover:text-[color:var(--color-ink)]"
          >
            renseigner manuellement
          </button>
        ) : (
          <button
            type="button"
            onClick={() => setMode("auto")}
            className="underline underline-offset-2 hover:text-[color:var(--color-ink)]"
          >
            revenir au mode automatique
          </button>
        )}
      </p>
    </form>
  );
}

const PROGRESS_STEPS = [
  { atMs: 0, label: "Analyse de ton site : marque, secteur, zone de chalandise…" },
  { atMs: 4000, label: "Génération des 3 questions de ton secteur…" },
  { atMs: 5500, label: "On interroge l'IA en direct…" },
  { atMs: 11000, label: "Détection de ta marque et de tes concurrents…" },
  { atMs: 16000, label: "Compilation du verdict…" },
];

function ScanProgress({ domain, detected }: { domain: string; detected: SiteProfile | null }) {
  const [elapsed, setElapsed] = useState(0);
  useEffect(() => {
    const interval = setInterval(() => setElapsed((e) => e + 500), 500);
    return () => clearInterval(interval);
  }, []);

  const currentIndex = PROGRESS_STEPS.reduce((acc, step, i) => (elapsed >= step.atMs ? i : acc), 0);

  return (
    <div className="mx-auto max-w-2xl rounded-[var(--radius-xl)] border border-[color:var(--color-border)] bg-white p-8 text-center shadow-[var(--shadow-sm)]">
      <p className="type-h3">Test en cours pour {domain}</p>
      {detected && (
        <p className="type-meta mt-2">
          Détecté : <strong>{detected.brandName}</strong> · {detected.sector}
          {detected.zone ? ` · ${detected.zone}` : ""}
        </p>
      )}
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
      <p className="type-meta mt-6">
        ~20 secondes, on analyse ton site puis l&apos;IA répond en direct.
      </p>
    </div>
  );
}
