// Types des jobs supportés. Chaque kind a un payload typé strictement.
// cf. geo-project/03-architecture-technique.md § Idempotence des jobs LLM

export type JobKind =
  | "execute_prompt"
  | "score_response"
  | "send_weekly_email"
  | "recompute_metrics"
  | "audit_workspace_url";

export interface ExecutePromptPayload {
  kind: "execute_prompt";
  payload: { promptId: string; llm: string; runId: string };
}

export interface ScoreResponsePayload {
  kind: "score_response";
  payload: { runId: string };
}

export interface SendWeeklyEmailPayload {
  kind: "send_weekly_email";
  payload: { workspaceId: string; isoWeek: string };
}

export interface RecomputeMetricsPayload {
  kind: "recompute_metrics";
  payload: { brandId: string; date: string };
}

export interface AuditWorkspaceUrlPayload {
  kind: "audit_workspace_url";
  payload: {
    workspaceId: string;
    /** brandId nullable : null pour les audits de concurrents qui ne sont pas
     *  dans la table `brands`. Pour les audits owned, l'id de la brand. */
    brandId: string | null;
    url: string;
    /** Marque l'audit comme étant celui d'un concurrent. */
    isCompetitor: boolean;
    /** Si vrai, déclenche l'envoi d'un email d'alerte si delta < -10 pts vs
     *  l'audit précédent sur la même URL. Désactivé pour les concurrents et
     *  pour les batchs comparaison (pas pertinent). */
    notifyOnDrop: boolean;
  };
}

export type Job =
  | ExecutePromptPayload
  | ScoreResponsePayload
  | SendWeeklyEmailPayload
  | RecomputeMetricsPayload
  | AuditWorkspaceUrlPayload;

// Format imposé pour l'idempotency_key (cf. doc 03 tableau).
export function buildIdempotencyKey(job: Job): string {
  switch (job.kind) {
    case "execute_prompt": {
      const date = new Date().toISOString().slice(0, 10);
      return `execute_prompt:${job.payload.promptId}:${job.payload.llm}:${date}`;
    }
    case "score_response":
      return `score_response:${job.payload.runId}`;
    case "send_weekly_email":
      return `send_weekly_email:${job.payload.workspaceId}:${job.payload.isoWeek}`;
    case "recompute_metrics":
      return `recompute_metrics:${job.payload.brandId}:${job.payload.date}`;
    case "audit_workspace_url": {
      const date = new Date().toISOString().slice(0, 10);
      // Un seul audit par {workspace, url, date} — relancer la même URL le
      // même jour est dédupliqué (no-op silencieux côté enqueue).
      return `audit_workspace_url:${job.payload.workspaceId}:${job.payload.url}:${date}`;
    }
  }
}
