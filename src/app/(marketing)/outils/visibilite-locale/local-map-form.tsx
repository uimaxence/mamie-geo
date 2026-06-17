"use client";

import { useEffect, useState, useTransition } from "react";
import { Button, Field, Input } from "@/components/ui";
import { capture, identify } from "@/lib/posthog-client";
import type { SiteProfile } from "@/lib/site-profile";
import type { LocalMapReport } from "@/lib/local-map/types";
import { detectSiteProfileAction } from "../location-actions";
import { runLocalMapScanAction } from "./actions";
import { LocalMapResults } from "./local-map-results";

// Form de la carte locale : le prospect saisit SITE + EMAIL — marque,
// secteur et ville sont déduits de la home (detectSiteProfileAction). Si
// l'activité est nationale (pas de ville détectée), on bascule en manuel
// pour demander la ville principale. Les villes autour sont déduites côté
// serveur. Mode manuel en fallback / correction.

const TOOL = "visibilite-locale";

export function LocalMapForm() {
  const [email, setEmail] = useState("");
  const [websiteDomain, setWebsiteDomain] = useState("");
  const [mode, setMode] = useState<"auto" | "manual">("auto");
  const [brandName, setBrandName] = useState("");
  const [sector, setSector] = useState("");
  const [city, setCity] = useState("");
  const [detected, setDetected] = useState<SiteProfile | null>(null);
  const [hpField, setHpField] = useState("");
  const [report, setReport] = useState<LocalMapReport | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [pending, startTransition] = useTransition();

  async function runScan(profile: { brandName: string; sector: string; mainCity: string }) {
    const result = await runLocalMapScanAction({
      email: email.trim(),
      brandName: profile.brandName,
      sector: profile.sector,
      mainCity: profile.mainCity,
      surroundingCities: [],
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
      mode: mode === "auto" ? "local-auto" : "local-manual",
      domain: websiteDomain.trim().toLowerCase(),
    });
    identify(email.trim().toLowerCase(), { email: email.trim().toLowerCase() });

    startTransition(async () => {
      if (mode === "manual") {
        if (city.trim().length < 2) {
          setError("Indique ta ville principale pour générer la carte.");
          return;
        }
        await runScan({
          brandName: brandName.trim(),
          sector: sector.trim(),
          mainCity: city.trim(),
        });
        return;
      }

      const profile = await detectSiteProfileAction(websiteDomain.trim());
      if (!profile) {
        setMode("manual");
        setError(
          "On n'a pas réussi à analyser ton site automatiquement — complète marque, activité et ville, puis relance.",
        );
        return;
      }
      setDetected(profile);
      setBrandName(profile.brandName);
      setSector(profile.sector);
      setCity(profile.zone ?? "");
      capture("tool_profile_autodetected", {
        tool: TOOL,
        sector: profile.sector,
        has_zone: Boolean(profile.zone),
      });

      // Activité nationale / ville non détectée → on demande la ville.
      if (!profile.zone) {
        setMode("manual");
        setError(
          "Ton activité a l'air nationale (ou ta ville n'est pas détectée). Indique ta ville principale pour voir ta carte locale — sinon, le scan express est plus adapté.",
        );
        return;
      }
      await runScan({
        brandName: profile.brandName,
        sector: profile.sector,
        mainCity: profile.zone,
      });
    });
  }

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
    return <LocalMapResults report={report} onReset={handleReset} onEdit={handleEdit} />;
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
        <Field label="Ton email" hint="Pour t'envoyer ta carte et les prochaines analyses">
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
              placeholder="Ex : Coiffure Léa"
              value={brandName}
              onChange={(e) => setBrandName(e.target.value)}
              maxLength={80}
              required
            />
          </Field>
          <Field label="Ton activité">
            <Input
              type="text"
              placeholder="Ex : coiffeur"
              value={sector}
              onChange={(e) => setSector(e.target.value)}
              maxLength={80}
              required
            />
          </Field>
          <Field label="Ta ville principale">
            <Input
              type="text"
              placeholder="Ex : Tours"
              value={city}
              onChange={(e) => setCity(e.target.value)}
              maxLength={80}
              required
            />
          </Field>
        </div>
      )}

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
        Générer ma carte de visibilité locale
      </Button>

      {error && (
        <p className="mt-3 rounded-[var(--radius-md)] bg-[color:var(--color-error-bg)] px-3 py-2 text-sm text-[color:var(--color-error)]">
          {error}
        </p>
      )}

      <p className="type-meta mt-4 text-center">
        ~30 secondes · gratuit · marque, activité et ville détectées depuis ton site ·{" "}
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
  { atMs: 0, label: "Analyse de ton site : marque, activité, ville…" },
  { atMs: 4000, label: "Détection des villes autour de chez toi…" },
  { atMs: 6500, label: "On interroge l'IA pour chaque ville, en direct…" },
  { atMs: 14000, label: "Détection de ta marque et de tes concurrents par ville…" },
  { atMs: 19000, label: "On allume ta carte…" },
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
      <p className="type-h3">Carte locale en cours pour {domain}</p>
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
        ~30 secondes — on interroge l&apos;IA ville par ville, en direct.
      </p>
    </div>
  );
}
