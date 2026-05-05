// Types des jobs supportés. Chaque kind a un payload typé strictement.
// cf. geo-project/03-architecture-technique.md § Idempotence des jobs LLM

export type JobKind =
  | "execute_prompt"
  | "score_response"
  | "send_weekly_email"
  | "recompute_metrics";

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

export type Job =
  | ExecutePromptPayload
  | ScoreResponsePayload
  | SendWeeklyEmailPayload
  | RecomputeMetricsPayload;

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
  }
}
