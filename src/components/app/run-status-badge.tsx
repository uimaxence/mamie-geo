import { CheckCircle2, CircleAlert, CircleX, Clock, Loader2 } from "lucide-react";
import { Badge } from "@/components/ui";

// Status badge pour un `run` (queue → exec). Centralise la logique
// status → tone + icône qui était dupliquée dans dashboard,
// prompts/[id], runs/[id]. Utilise le variant `solid` du Badge (fond
// blanc + icône container coloré) qui matche les status pills de la
// capture 3 (refs Kree8 2026-05-16).
//
// Mapping :
//   pending  → yellow + i (file d'attente)
//   running  → blue + loader (en cours)
//   success  → green + check
//   failed   → error + x
//   skipped  → neutral + clock

export type RunStatus = "pending" | "running" | "success" | "failed" | "skipped" | string;

interface RunStatusBadgeProps {
  status: RunStatus;
  /** Affiche le label texte à côté de l'icône. Défaut: true. Si false → pill juste icône. */
  showLabel?: boolean;
}

const LABEL: Record<string, string> = {
  pending: "en attente",
  running: "en cours",
  success: "succès",
  failed: "échec",
  skipped: "passé",
};

export function RunStatusBadge({ status, showLabel = true }: RunStatusBadgeProps) {
  const label = showLabel ? (LABEL[status] ?? status) : "";

  switch (status) {
    case "success":
      return (
        <Badge variant="solid" tone="success" icon={<CheckCircle2 size={12} strokeWidth={2.6} />}>
          {label}
        </Badge>
      );
    case "running":
      return (
        <Badge variant="solid" tone="blue" icon={<Loader2 size={12} className="animate-spin" />}>
          {label}
        </Badge>
      );
    case "failed":
      return (
        <Badge variant="solid" tone="error" icon={<CircleX size={12} strokeWidth={2.6} />}>
          {label}
        </Badge>
      );
    case "skipped":
      return (
        <Badge variant="solid" tone="neutral" icon={<Clock size={12} strokeWidth={2.2} />}>
          {label}
        </Badge>
      );
    case "pending":
    default:
      return (
        <Badge variant="solid" tone="yellow" icon={<CircleAlert size={12} strokeWidth={2.4} />}>
          {label}
        </Badge>
      );
  }
}
