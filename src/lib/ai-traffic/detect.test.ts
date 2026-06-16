import { describe, expect, it } from "vitest";
import { detectAiSource, isAllowedOrigin } from "./detect";

function detect(referrer: string, query = ""): ReturnType<typeof detectAiSource> {
  return detectAiSource(referrer, new URLSearchParams(query));
}

describe("detectAiSource", () => {
  it("détecte les referrers IA connus", () => {
    expect(detect("https://chatgpt.com/")).toBe("chatgpt");
    expect(detect("https://chat.openai.com/c/abc")).toBe("chatgpt");
    expect(detect("https://www.perplexity.ai/search")).toBe("perplexity");
    expect(detect("https://gemini.google.com/app")).toBe("gemini");
    expect(detect("https://claude.ai/chat/x")).toBe("claude");
    expect(detect("https://chat.mistral.ai/")).toBe("lechat");
  });

  it("fusionne Copilot (Microsoft) sur chatgpt", () => {
    expect(detect("https://copilot.microsoft.com/")).toBe("chatgpt");
    expect(detect("", "utm_source=copilot")).toBe("chatgpt");
  });

  it("détecte via UTM quand le referrer est strippé (app native)", () => {
    expect(detect("", "utm_source=chatgpt.com")).toBe("chatgpt");
    expect(detect("", "utm_source=perplexity")).toBe("perplexity");
    expect(detect("", "ref=claude")).toBe("claude");
  });

  it("ignore le trafic non-IA", () => {
    expect(detect("https://www.google.com/search?q=x")).toBeNull();
    expect(detect("https://t.co/abc")).toBeNull();
    expect(detect("", "utm_source=newsletter")).toBeNull();
    expect(detect("")).toBeNull();
  });

  it("matching strict du host (pas de substring naïf)", () => {
    expect(detect("https://evil-chatgpt.com.attacker.net/")).toBeNull();
    expect(detect("https://notchatgpt.com/")).toBeNull();
    expect(detect("https://perplexity.ai.phishing.io/")).toBeNull();
  });

  it("gère un referrer mal formé sans throw", () => {
    expect(detect("not a url")).toBeNull();
    expect(detect("javascript:void(0)")).toBeNull();
  });
});

describe("isAllowedOrigin (binding clé ↔ domaine du projet)", () => {
  it("accepte le domaine exact et ses sous-domaines", () => {
    expect(isAllowedOrigin("https://marque.fr", "marque.fr")).toBe(true);
    expect(isAllowedOrigin("https://marque.fr/page", "marque.fr")).toBe(true);
    expect(isAllowedOrigin("https://www.marque.fr", "marque.fr")).toBe(true);
    expect(isAllowedOrigin("https://blog.marque.fr", "marque.fr")).toBe(true);
  });

  it("normalise le www. côté domaine enregistré", () => {
    expect(isAllowedOrigin("https://marque.fr", "www.marque.fr")).toBe(true);
    expect(isAllowedOrigin("https://marque.fr", "https://marque.fr/")).toBe(true);
  });

  it("rejette un autre site (clé copiée ailleurs)", () => {
    expect(isAllowedOrigin("https://autre-site.com", "marque.fr")).toBe(false);
    expect(isAllowedOrigin("https://concurrent.fr", "marque.fr")).toBe(false);
  });

  it("rejette les tentatives de spoof (pas de substring naïf)", () => {
    expect(isAllowedOrigin("https://marque.fr.attaquant.com", "marque.fr")).toBe(false);
    expect(isAllowedOrigin("https://evil-marque.fr", "marque.fr")).toBe(false);
  });

  it("rejette une origine absente ou illisible (binding strict)", () => {
    expect(isAllowedOrigin(null, "marque.fr")).toBe(false);
    expect(isAllowedOrigin("not a url", "marque.fr")).toBe(false);
    expect(isAllowedOrigin("https://marque.fr", "")).toBe(false);
  });
});
