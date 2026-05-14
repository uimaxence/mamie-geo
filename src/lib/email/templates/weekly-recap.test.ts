import { describe, expect, it } from "vitest";
import { renderWeeklyRecap, type WeeklyRecapData } from "./weekly-recap";

const baseData: WeeklyRecapData = {
  workspaceName: "Acme Studio",
  brandName: "Acme",
  brandDomain: "acme.com",
  isoWeek: "2026-W19",
  stats: [
    {
      label: "Score de visibilité",
      value: "42.5",
      deltaPct: 12.3,
      deltaPeriod: "vs semaine dernière",
    },
    {
      label: "Marque citée",
      value: "8/14",
      deltaPct: null,
      deltaPeriod: "runs Claude cette semaine",
    },
    {
      label: "Taux citation",
      value: "57%",
      deltaPct: -5.5,
      deltaPeriod: "vs semaine dernière",
    },
    {
      label: "Runs exécutés",
      value: "14",
      deltaPct: null,
    },
  ],
  topCompetitors: [
    { name: "Concurrent A", citationCount: 9 },
    { name: "Concurrent B", citationCount: 4 },
    { name: "Concurrent C", citationCount: 2 },
  ],
  dashboardUrl: "https://mamie-geo.fr/app/dashboard",
  settingsUrl: "https://mamie-geo.fr/app/settings",
};

describe("renderWeeklyRecap", () => {
  it("génère un sujet structuré au format `Récap visibilité IA — semaine NN / YYYY`", () => {
    const { subject } = renderWeeklyRecap(baseData);
    expect(subject).toBe("Récap visibilité IA — semaine 19 / 2026");
  });

  it("inclut le nom de la marque + le domaine dans HTML et text", () => {
    const { html, text } = renderWeeklyRecap(baseData);
    expect(html).toContain("Acme");
    expect(html).toContain("acme.com");
    expect(text).toContain("Acme");
    expect(text).toContain("acme.com");
  });

  it("affiche le delta avec la bonne couleur selon le signe", () => {
    const { html } = renderWeeklyRecap(baseData);
    // Premier stat = +12.3 → vert ↑
    expect(html).toContain("delta-up");
    expect(html).toContain("+12.3%");
    // Troisième stat = -5.5 → rouge ↓
    expect(html).toContain("delta-down");
    expect(html).toContain("-5.5%");
  });

  it("rend les liens absolus exactement passés par l'appelant", () => {
    const { html, text } = renderWeeklyRecap(baseData);
    expect(html).toContain('href="https://mamie-geo.fr/app/dashboard"');
    expect(html).toContain('href="https://mamie-geo.fr/app/settings"');
    expect(text).toContain("https://mamie-geo.fr/app/dashboard");
    expect(text).toContain("https://mamie-geo.fr/app/settings");
  });

  it("liste les top concurrents dans l'ordre fourni", () => {
    const { html, text } = renderWeeklyRecap(baseData);
    const aIdx = html.indexOf("Concurrent A");
    const bIdx = html.indexOf("Concurrent B");
    const cIdx = html.indexOf("Concurrent C");
    expect(aIdx).toBeLessThan(bIdx);
    expect(bIdx).toBeLessThan(cIdx);
    expect(text).toContain("#1 Concurrent A");
    expect(text).toContain("#2 Concurrent B");
    expect(text).toContain("#3 Concurrent C");
  });

  it("escape le HTML pour prévenir injection via nom de workspace", () => {
    const malicious: WeeklyRecapData = {
      ...baseData,
      workspaceName: "<script>alert('xss')</script>",
    };
    const { html } = renderWeeklyRecap(malicious);
    expect(html).not.toContain("<script>alert");
    expect(html).toContain("&lt;script&gt;");
  });

  it("omet le bloc concurrents quand la liste est vide", () => {
    const noCompetitors: WeeklyRecapData = { ...baseData, topCompetitors: [] };
    const { html, text } = renderWeeklyRecap(noCompetitors);
    expect(html).not.toContain("Top concurrents cités");
    expect(text).not.toContain("Top concurrents cités");
  });

  it("affiche `—` quand un delta est null", () => {
    const { html } = renderWeeklyRecap(baseData);
    // Stat #2 et #4 ont deltaPct: null → ligne "—"
    expect(html.match(/—/g)?.length ?? 0).toBeGreaterThanOrEqual(2);
  });

  it("snapshot HTML stable pour data canonique", () => {
    const { html } = renderWeeklyRecap(baseData);
    // On vérifie quelques ancres clés plutôt qu'un full snapshot
    // (snapshot complet trop fragile aux ajustements visuels).
    expect(html).toContain("<!doctype html>");
    expect(html).toContain('<html lang="fr">');
    expect(html).toContain("Voir le dashboard complet");
    expect(html).toContain("Réglages &amp; préférences");
  });
});
