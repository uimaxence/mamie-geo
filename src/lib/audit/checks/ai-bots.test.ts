import { describe, expect, it } from "vitest";
import { isBotBlocked, runAiBotsChecks } from "./ai-bots";

describe("isBotBlocked", () => {
  it("détecte un bot bloqué explicitement", () => {
    const robots = `User-agent: GPTBot\nDisallow: /\n`;
    expect(isBotBlocked(robots, "GPTBot")).toBe(true);
  });

  it("retourne false si le bot a un Disallow vide", () => {
    const robots = `User-agent: GPTBot\nDisallow:\n`;
    expect(isBotBlocked(robots, "GPTBot")).toBe(false);
  });

  it("est insensible à la casse sur le user-agent", () => {
    const robots = `User-agent: gptbot\nDisallow: /\n`;
    expect(isBotBlocked(robots, "GPTBot")).toBe(true);
  });

  it("applique le wildcard `*` si pas de bloc spécifique", () => {
    const robots = `User-agent: *\nDisallow: /\n`;
    expect(isBotBlocked(robots, "GPTBot")).toBe(true);
  });

  it("le bloc spécifique prime sur le wildcard global", () => {
    const robots = `User-agent: *\nDisallow: /\n\nUser-agent: GPTBot\nAllow: /\n`;
    expect(isBotBlocked(robots, "GPTBot")).toBe(false);
  });

  it("ignore les commentaires `#`", () => {
    const robots = `# bloque GPTBot\nUser-agent: GPTBot\nDisallow: /\n`;
    expect(isBotBlocked(robots, "GPTBot")).toBe(true);
  });

  it("retourne false si le robots.txt ne contient pas le bot et pas de wildcard bloquant", () => {
    const robots = `User-agent: Googlebot\nDisallow: /private/\n`;
    expect(isBotBlocked(robots, "GPTBot")).toBe(false);
  });

  it("retourne false sur un Disallow d'un sous-chemin (root accessible)", () => {
    const robots = `User-agent: GPTBot\nDisallow: /admin\n`;
    expect(isBotBlocked(robots, "GPTBot")).toBe(false);
  });
});

describe("runAiBotsChecks", () => {
  it("retourne un seul info quand robots.txt est null", () => {
    const results = runAiBotsChecks(null);
    expect(results).toHaveLength(1);
    expect(results[0]?.id).toBe("geo.ai-bots-default-allowed");
    expect(results[0]?.status).toBe("info");
  });

  it("retourne un check par bot, tous en pass si robots.txt ne bloque rien", () => {
    const robots = `User-agent: *\nAllow: /\n`;
    const results = runAiBotsChecks(robots);
    // 8 bots configurés
    expect(results).toHaveLength(8);
    expect(results.every((r) => r.status === "pass")).toBe(true);
  });

  it("marque GPTBot en fail si bloqué et garde les autres en pass", () => {
    const robots = `User-agent: GPTBot\nDisallow: /\n`;
    const results = runAiBotsChecks(robots);
    const gptbot = results.find((r) => r.id === "geo.ai-bot-gptbot");
    const claudebot = results.find((r) => r.id === "geo.ai-bot-claudebot");
    expect(gptbot?.status).toBe("fail");
    expect(gptbot?.severity).toBe("warning");
    expect(claudebot?.status).toBe("pass");
  });

  it("ChatGPT-User bloqué = severity critical (impact live)", () => {
    const robots = `User-agent: ChatGPT-User\nDisallow: /\n`;
    const results = runAiBotsChecks(robots);
    const chatgptUser = results.find((r) => r.id === "geo.ai-bot-chatgpt-user");
    expect(chatgptUser?.status).toBe("fail");
    expect(chatgptUser?.severity).toBe("critical");
  });

  it("un wildcard bloquant fait failer tous les bots", () => {
    const robots = `User-agent: *\nDisallow: /\n`;
    const results = runAiBotsChecks(robots);
    expect(results.every((r) => r.status === "fail")).toBe(true);
  });
});
