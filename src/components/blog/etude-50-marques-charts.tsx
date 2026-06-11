"use client";

import { useState } from "react";
import { BreakdownBars } from "@/components/charts/breakdown-bars";
import { LLM_COLORS, LLM_LABELS } from "@/components/charts/llm-colors";
import { cn } from "@/lib/utils";

// Charts interactifs de l'étude « 50 marques × 5 IA » (juin 2026).
// Données figées issues de geo-project/resultats.json (snapshot
// 2026-06-10) — l'étude est un document daté, pas un dashboard live.
// CSS-only (pattern BreakdownBars de l'app), pas de recharts : le blog
// doit rester ≥ 98 PageSpeed (cf. doc 09 § 2026-06-11).

interface Marque {
  rang: number;
  marque: string;
  secteur: string;
  score: number;
  plateformes: Record<string, number>;
}

const SECTEURS = [
  "Banque",
  "Assurance",
  "Telecom & énergie",
  "Retail & e-commerce",
  "Tech & services FR",
] as const;

const CLASSEMENT: Marque[] = [
  { rang: 1, marque: "BoursoBank", secteur: "Banque", score: 66.87, plateformes: { chatgpt: 67.19, claude: 78.12, perplexity: 62.5, gemini: 73.44, lechat: 53.12 } },
  { rang: 2, marque: "Fortuneo", secteur: "Banque", score: 49.06, plateformes: { chatgpt: 43.75, claude: 62.5, perplexity: 50.0, gemini: 42.19, lechat: 46.88 } },
  { rang: 3, marque: "Free", secteur: "Telecom & énergie", score: 40.31, plateformes: { chatgpt: 50.0, claude: 50.0, perplexity: 37.5, gemini: 32.81, lechat: 31.25 } },
  { rang: 4, marque: "BNP Paribas", secteur: "Banque", score: 38.44, plateformes: { chatgpt: 40.62, claude: 46.88, perplexity: 34.38, gemini: 35.94, lechat: 34.38 } },
  { rang: 5, marque: "Orange", secteur: "Telecom & énergie", score: 37.5, plateformes: { chatgpt: 43.75, claude: 37.5, perplexity: 43.75, gemini: 28.12, lechat: 34.38 } },
  { rang: 6, marque: "SFR", secteur: "Telecom & énergie", score: 37.5, plateformes: { chatgpt: 43.75, claude: 50.0, perplexity: 31.25, gemini: 25.0, lechat: 37.5 } },
  { rang: 7, marque: "Bouygues Telecom", secteur: "Telecom & énergie", score: 34.37, plateformes: { chatgpt: 43.75, claude: 31.25, perplexity: 40.62, gemini: 28.12, lechat: 28.12 } },
  { rang: 8, marque: "MAIF", secteur: "Assurance", score: 32.81, plateformes: { chatgpt: 40.62, claude: 43.75, perplexity: 32.81, gemini: 28.12, lechat: 18.75 } },
  { rang: 9, marque: "Direct Assurance", secteur: "Assurance", score: 31.87, plateformes: { chatgpt: 37.5, claude: 28.12, perplexity: 34.38, gemini: 18.75, lechat: 40.62 } },
  { rang: 10, marque: "Crédit Agricole", secteur: "Banque", score: 28.44, plateformes: { chatgpt: 37.5, claude: 34.38, perplexity: 21.88, gemini: 23.44, lechat: 25.0 } },
  { rang: 11, marque: "Hello bank!", secteur: "Banque", score: 27.19, plateformes: { chatgpt: 35.94, claude: 28.12, perplexity: 18.75, gemini: 21.88, lechat: 31.25 } },
  { rang: 12, marque: "Crédit Mutuel", secteur: "Banque", score: 25.94, plateformes: { chatgpt: 15.62, claude: 37.5, perplexity: 21.88, gemini: 32.81, lechat: 21.88 } },
  { rang: 13, marque: "AXA", secteur: "Assurance", score: 25.62, plateformes: { chatgpt: 37.5, claude: 28.12, perplexity: 25.0, gemini: 6.25, lechat: 31.25 } },
  { rang: 14, marque: "Cdiscount", secteur: "Retail & e-commerce", score: 25.0, plateformes: { chatgpt: 12.5, claude: 40.62, perplexity: 25.0, gemini: 15.62, lechat: 31.25 } },
  { rang: 15, marque: "RED by SFR", secteur: "Telecom & énergie", score: 24.37, plateformes: { chatgpt: 25.0, claude: 25.0, perplexity: 31.25, gemini: 15.62, lechat: 25.0 } },
  { rang: 16, marque: "Société Générale", secteur: "Banque", score: 24.06, plateformes: { chatgpt: 6.25, claude: 53.12, perplexity: 15.62, gemini: 17.19, lechat: 28.12 } },
  { rang: 17, marque: "Back Market", secteur: "Retail & e-commerce", score: 24.06, plateformes: { chatgpt: 18.75, claude: 37.5, perplexity: 14.06, gemini: 31.25, lechat: 18.75 } },
  { rang: 18, marque: "MMA", secteur: "Assurance", score: 21.88, plateformes: { chatgpt: 21.88, claude: 37.5, perplexity: 25.0, gemini: 6.25, lechat: 18.75 } },
  { rang: 19, marque: "Darty", secteur: "Retail & e-commerce", score: 21.87, plateformes: { chatgpt: 15.62, claude: 37.5, perplexity: 18.75, gemini: 21.88, lechat: 15.62 } },
  { rang: 20, marque: "Matmut", secteur: "Assurance", score: 21.25, plateformes: { chatgpt: 28.12, claude: 21.88, perplexity: 18.75, gemini: 25.0, lechat: 12.5 } },
  { rang: 21, marque: "Fnac", secteur: "Retail & e-commerce", score: 21.25, plateformes: { chatgpt: 18.75, claude: 43.75, perplexity: 6.25, gemini: 12.5, lechat: 25.0 } },
  { rang: 22, marque: "GMF", secteur: "Assurance", score: 20.63, plateformes: { chatgpt: 21.88, claude: 37.5, perplexity: 6.25, gemini: 18.75, lechat: 18.75 } },
  { rang: 23, marque: "Leroy Merlin", secteur: "Retail & e-commerce", score: 20.0, plateformes: { chatgpt: 25.0, claude: 18.75, perplexity: 18.75, gemini: 12.5, lechat: 25.0 } },
  { rang: 24, marque: "Groupama", secteur: "Assurance", score: 16.56, plateformes: { chatgpt: 25.0, claude: 12.5, perplexity: 25.0, gemini: 7.81, lechat: 12.5 } },
  { rang: 25, marque: "Leocare", secteur: "Assurance", score: 16.25, plateformes: { chatgpt: 12.5, claude: 28.12, perplexity: 0.0, gemini: 6.25, lechat: 34.38 } },
  { rang: 26, marque: "Sosh", secteur: "Telecom & énergie", score: 15.62, plateformes: { chatgpt: 18.75, claude: 18.75, perplexity: 15.62, gemini: 12.5, lechat: 12.5 } },
  { rang: 27, marque: "EDF", secteur: "Telecom & énergie", score: 15.0, plateformes: { chatgpt: 18.75, claude: 12.5, perplexity: 6.25, gemini: 28.12, lechat: 9.38 } },
  { rang: 28, marque: "E.Leclerc", secteur: "Retail & e-commerce", score: 14.06, plateformes: { chatgpt: 12.5, claude: 21.88, perplexity: 7.81, gemini: 18.75, lechat: 9.38 } },
  { rang: 29, marque: "PayFit", secteur: "Tech & services FR", score: 13.12, plateformes: { chatgpt: 15.62, claude: 12.5, perplexity: 12.5, gemini: 12.5, lechat: 12.5 } },
  { rang: 30, marque: "Decathlon", secteur: "Retail & e-commerce", score: 12.5, plateformes: { chatgpt: 12.5, claude: 12.5, perplexity: 6.25, gemini: 18.75, lechat: 12.5 } },
  { rang: 31, marque: "BlaBlaCar", secteur: "Tech & services FR", score: 12.5, plateformes: { chatgpt: 12.5, claude: 12.5, perplexity: 12.5, gemini: 12.5, lechat: 12.5 } },
  { rang: 32, marque: "Leboncoin", secteur: "Tech & services FR", score: 12.5, plateformes: { chatgpt: 12.5, claude: 12.5, perplexity: 12.5, gemini: 12.5, lechat: 12.5 } },
  { rang: 33, marque: "OVHcloud", secteur: "Tech & services FR", score: 12.5, plateformes: { chatgpt: 12.5, claude: 12.5, perplexity: 12.5, gemini: 12.5, lechat: 12.5 } },
  { rang: 34, marque: "Swile", secteur: "Tech & services FR", score: 12.5, plateformes: { chatgpt: 12.5, claude: 12.5, perplexity: 12.5, gemini: 12.5, lechat: 12.5 } },
  { rang: 35, marque: "Doctolib", secteur: "Tech & services FR", score: 11.25, plateformes: { chatgpt: 12.5, claude: 6.25, perplexity: 12.5, gemini: 12.5, lechat: 12.5 } },
  { rang: 36, marque: "Deezer", secteur: "Tech & services FR", score: 11.25, plateformes: { chatgpt: 12.5, claude: 12.5, perplexity: 6.25, gemini: 12.5, lechat: 12.5 } },
  { rang: 37, marque: "Yuka", secteur: "Tech & services FR", score: 11.25, plateformes: { chatgpt: 6.25, claude: 12.5, perplexity: 12.5, gemini: 12.5, lechat: 12.5 } },
  { rang: 38, marque: "MACIF", secteur: "Assurance", score: 10.31, plateformes: { chatgpt: 9.38, claude: 12.5, perplexity: 1.56, gemini: 15.62, lechat: 12.5 } },
  { rang: 39, marque: "Qonto", secteur: "Banque", score: 10.0, plateformes: { chatgpt: 12.5, claude: 6.25, perplexity: 12.5, gemini: 6.25, lechat: 12.5 } },
  { rang: 40, marque: "La Redoute", secteur: "Retail & e-commerce", score: 7.5, plateformes: { chatgpt: 6.25, claude: 15.62, perplexity: 3.12, gemini: 12.5, lechat: 0.0 } },
  { rang: 41, marque: "La Banque Postale", secteur: "Banque", score: 6.25, plateformes: { chatgpt: 0.0, claude: 18.75, perplexity: 0.0, gemini: 3.12, lechat: 9.38 } },
  { rang: 42, marque: "ManoMano", secteur: "Retail & e-commerce", score: 6.25, plateformes: { chatgpt: 9.38, claude: 9.38, perplexity: 6.25, gemini: 0.0, lechat: 6.25 } },
  { rang: 43, marque: "Mint Énergie", secteur: "Telecom & énergie", score: 5.62, plateformes: { chatgpt: 15.62, claude: 0.0, perplexity: 6.25, gemini: 3.12, lechat: 3.12 } },
  { rang: 44, marque: "Engie", secteur: "Telecom & énergie", score: 5.31, plateformes: { chatgpt: 9.38, claude: 6.25, perplexity: 3.12, gemini: 6.25, lechat: 1.56 } },
  { rang: 45, marque: "Alan", secteur: "Assurance", score: 5.0, plateformes: { chatgpt: 3.12, claude: 3.12, perplexity: 3.12, gemini: 12.5, lechat: 3.12 } },
  { rang: 46, marque: "Carrefour", secteur: "Retail & e-commerce", score: 4.06, plateformes: { chatgpt: 0.0, claude: 12.5, perplexity: 1.56, gemini: 3.12, lechat: 3.12 } },
  { rang: 47, marque: "TotalEnergies", secteur: "Telecom & énergie", score: 3.75, plateformes: { chatgpt: 6.25, claude: 6.25, perplexity: 6.25, gemini: 0.0, lechat: 0.0 } },
  { rang: 48, marque: "CIC", secteur: "Banque", score: 3.12, plateformes: { chatgpt: 0.0, claude: 0.0, perplexity: 0.0, gemini: 3.12, lechat: 12.5 } },
  { rang: 49, marque: "Sumeria", secteur: "Tech & services FR", score: 0.0, plateformes: { chatgpt: 0.0, claude: 0.0, perplexity: 0.0, gemini: 0.0, lechat: 0.0 } },
  { rang: 50, marque: "Mistral AI", secteur: "Tech & services FR", score: 0.0, plateformes: { chatgpt: 0.0, claude: 0.0, perplexity: 0.0, gemini: 0.0, lechat: 0.0 } },
];

const LLM_ORDER = ["chatgpt", "claude", "perplexity", "gemini", "lechat"];

function formatScore(value: number): string {
  return value === Math.floor(value) ? String(value) : value.toFixed(1);
}

function ChartFrame({
  title,
  footnote,
  children,
}: {
  title: string;
  footnote?: string;
  children: React.ReactNode;
}) {
  return (
    <figure className="my-8 rounded-[var(--radius-lg)] border border-[color:var(--color-border)] bg-white p-5 sm:p-6">
      <figcaption className="mb-5 text-sm font-semibold text-[color:var(--color-ink)]">
        {title}
      </figcaption>
      {children}
      {footnote ? <p className="type-meta mt-4">{footnote}</p> : null}
    </figure>
  );
}

function PillButton({
  active,
  onClick,
  children,
}: {
  active: boolean;
  onClick: () => void;
  children: React.ReactNode;
}) {
  return (
    <button
      type="button"
      onClick={onClick}
      aria-pressed={active}
      className={cn(
        "rounded-full border px-3 py-1.5 text-xs font-medium transition-colors",
        active
          ? "border-[color:var(--color-ink)] bg-[color:var(--color-ink)] text-white"
          : "border-[color:var(--color-border)] bg-white text-[color:var(--color-ink-soft)] hover:border-[color:var(--color-border-strong)]",
      )}
    >
      {children}
    </button>
  );
}

/** Classement général filtrable par secteur. Top 15 par défaut, dépliable. */
export function EtudeClassement() {
  const [secteur, setSecteur] = useState<string | null>(null);
  const [expanded, setExpanded] = useState(false);

  const filtered = secteur ? CLASSEMENT.filter((m) => m.secteur === secteur) : CLASSEMENT;
  const visible = secteur || expanded ? filtered : filtered.slice(0, 15);

  return (
    <ChartFrame
      title="Score de visibilité IA — moyenne des 5 plateformes, sur 100"
      footnote="Score = position dans la réponse × sentiment, moyenné sur les 8 prompts du secteur de la marque (absent = 0). Snapshot du 10 juin 2026."
    >
      <div className="mb-5 flex flex-wrap gap-2">
        <PillButton active={secteur === null} onClick={() => setSecteur(null)}>
          Tous secteurs
        </PillButton>
        {SECTEURS.map((s) => (
          <PillButton key={s} active={secteur === s} onClick={() => setSecteur(s)}>
            {s}
          </PillButton>
        ))}
      </div>

      <ul className="flex flex-col gap-2.5">
        {visible.map((m) => (
          <li
            key={m.marque}
            className="grid grid-cols-[2rem_minmax(6rem,9.5rem)_1fr_auto] items-center gap-3"
          >
            <span className="type-tabular text-right text-xs text-[color:var(--color-muted)]">
              {m.rang}
            </span>
            <span className="truncate text-sm font-medium text-[color:var(--color-ink)]">
              {m.marque}
            </span>
            <div
              className="relative h-2.5 overflow-hidden rounded-full bg-[color:var(--color-gray-100)]"
              role="progressbar"
              aria-valuenow={Math.round(m.score)}
              aria-valuemin={0}
              aria-valuemax={100}
              aria-label={m.marque}
            >
              <div
                className="h-full rounded-full bg-[color:var(--color-accent)] transition-[width] duration-500 ease-out"
                style={{ width: `${m.score === 0 ? 0 : Math.max(2, m.score)}%` }}
              />
            </div>
            <span className="type-tabular w-10 text-right text-sm font-medium tabular-nums text-[color:var(--color-ink)]">
              {formatScore(m.score)}
            </span>
          </li>
        ))}
      </ul>

      {!secteur && !expanded ? (
        <button
          type="button"
          onClick={() => setExpanded(true)}
          className="mt-5 rounded-full border border-[color:var(--color-border)] px-4 py-2 text-xs font-medium text-[color:var(--color-ink)] hover:border-[color:var(--color-border-strong)]"
        >
          Afficher les 50 marques
        </button>
      ) : null}
    </ChartFrame>
  );
}

/** Profil d'une marque : son score sur chacune des 5 plateformes. */
export function EtudeProfilMarque({ defaut = "Société Générale" }: { defaut?: string }) {
  const [marque, setMarque] = useState(defaut);
  const selected = CLASSEMENT.find((m) => m.marque === marque) ?? CLASSEMENT[0]!;

  return (
    <ChartFrame
      title="Une marque, cinq visibilités"
      footnote="La même marque, le même jour, les mêmes questions — et jusqu'à 8× d'écart de visibilité selon la plateforme."
    >
      <label className="mb-5 block">
        <span className="type-meta mb-1.5 block">Choisis une marque</span>
        <select
          value={marque}
          onChange={(e) => setMarque(e.target.value)}
          className="w-full max-w-xs rounded-[var(--radius-md)] border border-[color:var(--color-border)] bg-white px-3 py-2 text-sm text-[color:var(--color-ink)] focus:border-[color:var(--color-accent)] focus:outline-none"
        >
          {SECTEURS.map((s) => (
            <optgroup key={s} label={s}>
              {CLASSEMENT.filter((m) => m.secteur === s).map((m) => (
                <option key={m.marque} value={m.marque}>
                  {m.marque}
                </option>
              ))}
            </optgroup>
          ))}
        </select>
      </label>

      <BreakdownBars
        maxValue={100}
        total={formatScore(selected.score)}
        totalLabel={`/ 100 · n°${selected.rang} du classement général`}
        segments={LLM_ORDER.map((llm) => ({
          id: llm,
          label: LLM_LABELS[llm] ?? llm,
          value: selected.plateformes[llm] ?? 0,
          color: LLM_COLORS[llm] ?? "#737373",
        }))}
      />
    </ChartFrame>
  );
}

/** Score moyen des 50 marques par plateforme. */
export function EtudeMoyennesPlateforme() {
  const moyennes: Array<[string, number]> = [
    ["claude", 24.0],
    ["chatgpt", 20.0],
    ["lechat", 18.2],
    ["perplexity", 16.7],
    ["gemini", 16.6],
  ];
  return (
    <ChartFrame
      title="Score moyen des 50 marques, par plateforme"
      footnote="Claude est la plateforme la plus « généreuse » en citations, Gemini et Perplexity les plus avares."
    >
      <BreakdownBars
        maxValue={100}
        segments={moyennes.map(([llm, value]) => ({
          id: llm,
          label: LLM_LABELS[llm] ?? llm,
          value,
          color: LLM_COLORS[llm] ?? "#737373",
        }))}
      />
    </ChartFrame>
  );
}

/** Où les marques apparaissent dans la réponse, par plateforme. */
export function EtudePositions() {
  // Détections par position (scoring.csv) : [début, milieu, fin].
  const data: Array<{ llm: string; counts: [number, number, number] }> = [
    { llm: "claude", counts: [68, 67, 3] },
    { llm: "perplexity", counts: [49, 46, 9] },
    { llm: "lechat", counts: [52, 58, 3] },
    { llm: "chatgpt", counts: [53, 71, 5] },
    { llm: "gemini", counts: [33, 77, 19] },
  ];
  const colors = ["var(--color-accent)", "#a8d4ff", "var(--color-gray-200, #e5e5e5)"];
  const labels = ["Début de réponse", "Milieu", "Fin"];

  return (
    <ChartFrame
      title="Où la marque apparaît dans la réponse, par plateforme"
      footnote="Part des citations selon leur position dans le texte de la réponse. Gemini cite les marques, mais les enterre : 26 % seulement en début de réponse."
    >
      <div className="mb-4 flex flex-wrap gap-4">
        {labels.map((label, i) => (
          <span key={label} className="flex items-center gap-1.5 text-xs text-[color:var(--color-ink-soft)]">
            <span
              aria-hidden
              className="inline-block size-2.5 rounded-full"
              style={{ backgroundColor: colors[i] }}
            />
            {label}
          </span>
        ))}
      </div>
      <ul className="flex flex-col gap-3.5">
        {data.map(({ llm, counts }) => {
          const total = counts[0] + counts[1] + counts[2];
          return (
            <li key={llm} className="grid grid-cols-[7rem_1fr] items-center gap-4">
              <div className="flex items-center gap-2">
                <span
                  aria-hidden
                  className="inline-block size-2.5 shrink-0 rounded-full"
                  style={{ backgroundColor: LLM_COLORS[llm] ?? "#737373" }}
                />
                <span className="text-sm font-medium text-[color:var(--color-ink)]">
                  {LLM_LABELS[llm] ?? llm}
                </span>
              </div>
              <div className="flex h-2.5 overflow-hidden rounded-full bg-[color:var(--color-gray-100)]">
                {counts.map((count, i) => (
                  <div
                    key={labels[i]}
                    title={`${labels[i]} · ${Math.round((100 * count) / total)} %`}
                    className="h-full"
                    style={{
                      width: `${(100 * count) / total}%`,
                      backgroundColor: colors[i],
                    }}
                  />
                ))}
              </div>
            </li>
          );
        })}
      </ul>
    </ChartFrame>
  );
}

/** Typologie des sources citées par les IA. */
export function EtudeSources() {
  const types = [
    { id: "autre", label: "Autres sites tiers", value: 429, color: "#a3a3a3" },
    { id: "comparateur", label: "Comparateurs", value: 233, color: "var(--color-accent)" },
    { id: "presse", label: "Presse", value: 44, color: "#7c3aed" },
    { id: "marque", label: "Site de la marque", value: 12, color: "#ea580c" },
    { id: "ugc", label: "UGC (forums, avis)", value: 4, color: "#db2777" },
  ];
  return (
    <ChartFrame
      title="Qui les IA citent-elles en source ?"
      footnote="722 citations de sources repérables sur l'ensemble des réponses. Le site officiel de la marque ne représente que 1,7 % des sources."
    >
      <BreakdownBars
        mode="share"
        segments={types.map((t) => ({ ...t, suffix: " citations" }))}
      />
    </ChartFrame>
  );
}
