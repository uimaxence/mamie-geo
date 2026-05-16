// Validation du payload jsonb venant de la queue pour audit_workspace_url.
// Isolé pour pouvoir être unit-testé sans setup d'env complet.

export interface AuditWorkspaceUrlPayload {
  workspaceId: string;
  brandId: string | null;
  url: string;
  isCompetitor: boolean;
  /** Si vrai, déclenche un email d'alerte si delta < -10 pts vs précédent. */
  notifyOnDrop: boolean;
}

export function parseAuditWorkspaceUrlPayload(raw: unknown): AuditWorkspaceUrlPayload {
  if (!raw || typeof raw !== "object") {
    throw new Error("audit_workspace_url payload must be an object");
  }
  const r = raw as Record<string, unknown>;
  if (typeof r.workspaceId !== "string") {
    throw new Error("audit_workspace_url payload manque workspaceId string");
  }
  if (r.brandId !== null && typeof r.brandId !== "string") {
    throw new Error("audit_workspace_url payload brandId doit être string|null");
  }
  if (typeof r.url !== "string") {
    throw new Error("audit_workspace_url payload manque url string");
  }
  if (typeof r.isCompetitor !== "boolean") {
    throw new Error("audit_workspace_url payload manque isCompetitor boolean");
  }
  // notifyOnDrop optionnel, défaut false pour préserver les anciens payloads
  const notifyOnDrop = typeof r.notifyOnDrop === "boolean" ? r.notifyOnDrop : false;
  return {
    workspaceId: r.workspaceId,
    brandId: r.brandId,
    url: r.url,
    isCompetitor: r.isCompetitor,
    notifyOnDrop,
  };
}
