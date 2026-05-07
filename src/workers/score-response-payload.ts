// Validation isolée du payload jsonb pour le worker score_response.
// Sans dep DB → testable sans setup env complet.

export interface ScoreResponsePayload {
  runId: string;
}

export function parseScoreResponsePayload(raw: unknown): ScoreResponsePayload {
  if (!raw || typeof raw !== "object") {
    throw new Error("score_response payload must be an object");
  }
  const r = raw as Record<string, unknown>;
  if (typeof r.runId !== "string") {
    throw new Error("score_response payload manque runId string");
  }
  return { runId: r.runId };
}
