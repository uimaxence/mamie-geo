"use client";

import { Activity, ArrowUpRight, BarChart3, Sparkles, Users, type LucideIcon } from "lucide-react";
import { Bar, BarChart, Cell, Line, LineChart, ResponsiveContainer } from "recharts";
import { LLM_COLORS, LLM_LABELS } from "@/components/charts/llm-colors";
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from "@/components/ui";
import { cn } from "@/lib/utils";

// "Hero data showcase", 4 cartes data tiltées sous le hero.
//
// Pattern visuel : cartes hautes (~440 px) profondément enfouies dans
// la section sombre <PourquoiMaintenant> (~280 px masqués). Au repos,
// ~160 px du haut visibles dans le hero blanc. Au hover, la carte se
// lève de 80 px et redresse à 0°, son haut s'étend, son bas RESTE
// masqué par la section sombre (la coupe ne disparaît jamais).
//
// Fixes 2026-05-13 (7ᵉ itération polish UX) :
//   - Rotation via CSS prop `rotate` (et plus `transform`) → hover:rotate-0
//     prend bien effet (previousment masqué par transform inline)
//   - Plus de hover:z-10 (cause du « passe au-dessus » signalé) :
//     l'ordre du document seul garantit que la section sombre peint
//     toujours par-dessus
//   - Cartes plus larges + padding p-7 + textes plus gros
//   - Container max-w-[1500px] → presque full-width sur écrans usuels
//   - Charts h-[150px] (vs 140) + spacing interne ↑ → contenu mieux respiré
//   - mb-[-200px] (vs -280) → heading + chart visibles au repos sans
//     écraser le rendu. Lift hover -60 px → coupe maintenue active.
//   - `flex-1` sur toutes les cartes + max-w-[1900px] container →
//     largeur égalisée qui stretche jusqu'à ~300 px/carte sur grands
//     écrans (vs widths fixes 210-280 px qui faisaient des cartes
//     étroites sur écrans 1920+).
//   - Réduction de 6 → 4 cartes (8ᵉ itération) : sur viewport 1500 px
//     standard, 6 cartes ÷ container = ~230 px chacune (trop étroit
//     pour respirer). 4 cartes = ~350 px chacune. AreaChart Citations
//     et Donut Sentiment retirés (redondant avec LineChart Évolution
//     pour l'un, moins lisible en marketing pour l'autre).
//
// Cf. doc 09 § 2026-05-13.

interface DataCardProps {
  rotation: number; // degrés (-5 à +5)
  tooltip: string;
  children: React.ReactNode;
  className?: string;
}

function DataCard({ rotation, tooltip, children, className }: DataCardProps) {
  return (
    <Tooltip>
      <TooltipTrigger asChild>
        <div
          tabIndex={0}
          // `rotate` CSS prop (separate from `transform`) → permet à
          // `hover:rotate-0` de l'override correctement. `translate-y`
          // utilise `translate` CSS prop → indépendant, se combine.
          style={{ rotate: `${rotation}deg` }}
          className={cn(
            "group/card relative cursor-default rounded-[var(--radius-xl)] border border-[color:var(--color-border)] bg-white shadow-[var(--shadow-md)] transition-all duration-400 ease-out",
            "hover:-translate-y-[60px] hover:rotate-0 hover:shadow-[var(--shadow-lg)]",
            "focus:outline-none focus-visible:-translate-y-[60px] focus-visible:rotate-0 focus-visible:shadow-[var(--shadow-lg)] focus-visible:ring-2 focus-visible:ring-[color:var(--color-ink)] focus-visible:ring-offset-2",
            className,
          )}
        >
          {children}
        </div>
      </TooltipTrigger>
      <TooltipContent className="max-w-[280px] text-center">
        <p>{tooltip}</p>
      </TooltipContent>
    </Tooltip>
  );
}

function CardHeading({ icon: Icon, label }: { icon: LucideIcon; label: string }) {
  return (
    <div className="mb-4 flex items-center gap-2">
      <Icon size={15} strokeWidth={2.2} className="text-[color:var(--color-muted)]" />
      <span className="text-xs font-semibold uppercase tracking-wider text-[color:var(--color-muted)]">
        {label}
      </span>
    </div>
  );
}

// ─── Mock data ──────────────────────────────────────────────────────

const TREND_DATA = [
  { d: 1, claude: 28, chatgpt: 22, perplexity: 18 },
  { d: 2, claude: 32, chatgpt: 26, perplexity: 19 },
  { d: 3, claude: 35, chatgpt: 28, perplexity: 22 },
  { d: 4, claude: 41, chatgpt: 31, perplexity: 24 },
  { d: 5, claude: 48, chatgpt: 35, perplexity: 28 },
  { d: 6, claude: 52, chatgpt: 40, perplexity: 32 },
  { d: 7, claude: 58, chatgpt: 44, perplexity: 36 },
];

const LLM_BAR_DATA = [
  { id: "chatgpt", v: 58 },
  { id: "claude", v: 67 },
  { id: "perplexity", v: 42 },
  { id: "gemini", v: 51 },
  { id: "lechat", v: 35 },
];

const SHARE_DATA = [
  { name: "Ta marque", value: 38, color: "#0a0a0a" },
  { name: "Concurrent A", value: 27, color: "#737373" },
  { name: "Concurrent B", value: 19, color: "#a3a3a3" },
  { name: "Concurrent C", value: 16, color: "#d4d4d4" },
];

// ─── Mini-charts ────────────────────────────────────────────────────

function MiniLineChart() {
  return (
    <div className="h-[150px] w-full">
      <ResponsiveContainer width="100%" height="100%">
        <LineChart data={TREND_DATA} margin={{ top: 4, right: 4, left: 4, bottom: 4 }}>
          {(["claude", "chatgpt", "perplexity"] as const).map((llm) => (
            <Line
              key={llm}
              type="monotone"
              dataKey={llm}
              stroke={LLM_COLORS[llm]}
              strokeWidth={3}
              dot={false}
            />
          ))}
        </LineChart>
      </ResponsiveContainer>
    </div>
  );
}

function MiniBarChart() {
  return (
    <div className="h-[150px] w-full">
      <ResponsiveContainer width="100%" height="100%">
        <BarChart data={LLM_BAR_DATA} margin={{ top: 4, right: 4, left: 4, bottom: 4 }}>
          <Bar dataKey="v" radius={[6, 6, 0, 0]}>
            {LLM_BAR_DATA.map((d) => (
              <Cell key={d.id} fill={LLM_COLORS[d.id] ?? "#737373"} />
            ))}
          </Bar>
        </BarChart>
      </ResponsiveContainer>
    </div>
  );
}

function MiniShareBars() {
  const total = SHARE_DATA.reduce((a, b) => a + b.value, 0);
  return (
    <div className="flex h-[150px] w-full flex-col justify-center gap-2.5">
      {SHARE_DATA.map((s) => (
        <div key={s.name} className="flex items-center gap-2.5">
          <span className="w-[92px] truncate text-xs font-medium text-[color:var(--color-ink-soft)]">
            {s.name}
          </span>
          <div className="flex-1 overflow-hidden rounded-full bg-[color:var(--color-gray-100)]">
            <div
              className="h-2.5 rounded-full transition-all"
              style={{ width: `${(s.value / total) * 100}%`, backgroundColor: s.color }}
            />
          </div>
          <span className="type-tabular w-[34px] text-right text-xs font-semibold text-[color:var(--color-ink)]">
            {s.value}%
          </span>
        </div>
      ))}
    </div>
  );
}

// ─── Composant principal ────────────────────────────────────────────

export function HeroDataShowcase() {
  return (
    <TooltipProvider delayDuration={150}>
      {/* mb-[-280px] : 280 px cachés dans la section sombre (carte
       * ~440 px, ~160 px visibles dans le hero blanc). Au hover, +80 px
       * remontent → 240 px visibles, 200 px restent cachés. La coupe
       * reste active pendant tout le hover. */}
      <div
        className="relative mx-auto mt-20 mb-[-200px] hidden max-w-[1900px] items-stretch justify-center gap-4 px-6 md:flex"
        aria-hidden="false"
      >
        {/* Card 1, Évolution LineChart */}
        <DataCard
          rotation={-3}
          tooltip="Suis l'évolution de ta visibilité dans chaque IA, sur 7, 30 ou 90 jours."
          className="flex-1 p-7"
        >
          <CardHeading icon={Activity} label="Évolution 7 j" />
          <MiniLineChart />
          <div className="mt-5 flex items-baseline gap-2">
            <span className="font-semibold text-3xl leading-none tracking-tight text-[color:var(--color-ink)]">
              +28 %
            </span>
          </div>
          <p className="mt-2 text-xs text-[color:var(--color-muted)]">
            sur 7 jours · 3 IA trackées
          </p>
        </DataCard>

        {/* Card 2, Stat score */}
        <DataCard
          rotation={2}
          tooltip="Une note de 0 à 100 par IA, mise à jour quotidiennement. Combine taux de citation, position et sentiment."
          className="flex-1 p-7"
        >
          <CardHeading icon={Sparkles} label="Score visibilité" />
          <div className="flex items-baseline gap-2">
            <span className="font-semibold text-7xl leading-none tracking-tighter text-[color:var(--color-ink)]">
              67
            </span>
            <span className="text-base text-[color:var(--color-muted)]">/ 100</span>
          </div>
          <div className="mt-5 inline-flex items-center gap-1.5 rounded-full bg-[color:var(--color-success-bg)] px-2.5 py-1 text-xs font-semibold text-[color:var(--color-success)]">
            <ArrowUpRight size={13} strokeWidth={2.5} />
            +12 % vs J-7
          </div>
          <p className="mt-3 text-xs text-[color:var(--color-muted)]">Claude · sur 100</p>
        </DataCard>

        {/* Card 3, BarChart par LLM */}
        <DataCard
          rotation={-2}
          tooltip="Compare ta visibilité dans les 5 IA grand public (ChatGPT, Claude, Perplexity, Gemini, Le Chat)."
          className="flex-1 p-7"
        >
          <CardHeading icon={BarChart3} label="Par moteur" />
          <MiniBarChart />
          <div className="mt-4 flex flex-wrap gap-x-3 gap-y-1.5">
            {LLM_BAR_DATA.map((d) => (
              <span
                key={d.id}
                className="flex items-center gap-1.5 text-[11px] text-[color:var(--color-ink-soft)]"
              >
                <span
                  aria-hidden
                  className="inline-block size-2 rounded-full"
                  style={{ backgroundColor: LLM_COLORS[d.id] }}
                />
                {LLM_LABELS[d.id]}
              </span>
            ))}
          </div>
        </DataCard>

        {/* Card 4, Part de voix */}
        <DataCard
          rotation={3}
          tooltip="Le pourcentage de citations qui vont à ta marque vs tes concurrents sur tes prompts."
          className="flex-1 p-7"
        >
          <CardHeading icon={Users} label="Part de voix" />
          <MiniShareBars />
          <p className="mt-4 text-xs text-[color:var(--color-muted)]">
            Toi vs 3 concurrents · ce mois
          </p>
        </DataCard>
      </div>
    </TooltipProvider>
  );
}
