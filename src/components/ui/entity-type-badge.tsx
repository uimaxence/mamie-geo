import { cn } from "@/lib/utils";

// Badge pastel pour qualifier une entité (marque ou domaine source)
// dans les tables Citations. Pattern Peec docs (cf. doc 09 § 2026-06-08).
// Anticipe la feature V1 "Domain Types classification" — pour l'instant
// seuls "you" et "competitor" portent une vraie sémantique, le reste est
// neutre et sera affiné quand on aura le classifier LLM.

export type EntityType =
  | "you" // ta marque trackée
  | "competitor" // concurrent suivi
  | "editorial" // média / blog éditorial
  | "ugc" // user-generated (Reddit, forums)
  | "reference" // Wikipedia, wikis, references
  | "corporate" // page corporate / about
  | "other";

interface EntityTypeBadgeProps {
  type: EntityType;
  className?: string;
}

const TYPE_CONFIG: Record<EntityType, { label: string; bg: string; text: string }> = {
  you: {
    // "Toi" et pas "Vous" : toute l'app tutoie (cf. "vs toi" dans la même
    // table Citations).
    label: "Toi",
    bg: "bg-[color:var(--color-green-bg)]",
    text: "text-[color:var(--color-green)]",
  },
  competitor: {
    label: "Concurrent",
    bg: "bg-[color:var(--color-orange-bg)]",
    text: "text-[color:var(--color-orange)]",
  },
  editorial: {
    label: "Éditorial",
    bg: "bg-[color:var(--color-blue-bg)]",
    text: "text-[color:var(--color-blue)]",
  },
  ugc: {
    label: "UGC",
    bg: "bg-[color:var(--color-purple-bg)]",
    text: "text-[color:var(--color-purple)]",
  },
  reference: {
    label: "Référence",
    bg: "bg-[color:var(--color-pink-bg)]",
    text: "text-[color:var(--color-pink)]",
  },
  corporate: {
    label: "Corporate",
    bg: "bg-[color:var(--color-yellow-bg)]",
    text: "text-[color:var(--color-yellow)]",
  },
  other: {
    label: "Autre",
    bg: "bg-[color:var(--color-gray-100)]",
    text: "text-[color:var(--color-gray-600)]",
  },
};

export function EntityTypeBadge({ type, className }: EntityTypeBadgeProps) {
  const cfg = TYPE_CONFIG[type];
  return (
    <span
      className={cn(
        "inline-flex items-center rounded-[var(--radius-pill)] px-2 py-0.5 text-[0.75rem] font-medium",
        cfg.bg,
        cfg.text,
        className,
      )}
    >
      {cfg.label}
    </span>
  );
}
