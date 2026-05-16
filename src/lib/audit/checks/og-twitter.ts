import type { CheerioAPI } from "cheerio";
import type { CheckResult } from "../types";

// Open Graph + Twitter Cards — pour les previews social media. Pas
// critique pour le GEO direct mais améliore la propagation des
// partages, qui à terme amène plus de signaux pour les LLM.

export function runOgTwitterChecks($: CheerioAPI): CheckResult[] {
  const results: CheckResult[] = [];

  const ogTitle = $('head > meta[property="og:title"]').attr("content")?.trim();
  const ogDescription = $('head > meta[property="og:description"]').attr("content")?.trim();
  const ogImage = $('head > meta[property="og:image"]').attr("content")?.trim();
  const ogUrl = $('head > meta[property="og:url"]').attr("content")?.trim();

  if (ogTitle) {
    results.push({
      id: "og.og-title-present",
      category: "og",
      severity: "info",
      status: "pass",
      label: "og:title présent",
    });
  } else {
    results.push({
      id: "og.og-title-missing",
      category: "og",
      severity: "warning",
      status: "fail",
      label: "og:title manquant",
    });
  }

  if (ogDescription) {
    results.push({
      id: "og.og-description-present",
      category: "og",
      severity: "info",
      status: "pass",
      label: "og:description présent",
    });
  } else {
    results.push({
      id: "og.og-description-missing",
      category: "og",
      severity: "warning",
      status: "fail",
      label: "og:description manquant",
    });
  }

  if (ogImage) {
    results.push({
      id: "og.og-image-present",
      category: "og",
      severity: "info",
      status: "pass",
      label: "og:image présent",
      found: ogImage,
    });
  } else {
    results.push({
      id: "og.og-image-missing",
      category: "og",
      severity: "warning",
      status: "fail",
      label: "og:image manquant (preview Slack/LinkedIn sans visuel)",
    });
  }

  if (ogUrl) {
    results.push({
      id: "og.og-url-present",
      category: "og",
      severity: "info",
      status: "pass",
      label: "og:url présent",
    });
  }

  const twitterCard = $('head > meta[name="twitter:card"]').attr("content")?.trim();
  if (!twitterCard) {
    results.push({
      id: "og.twitter-card-missing",
      category: "og",
      severity: "warning",
      status: "fail",
      label: "twitter:card manquant",
    });
  } else {
    results.push({
      id: "og.twitter-card-present",
      category: "og",
      severity: "info",
      status: "pass",
      label: "twitter:card présent",
      found: twitterCard,
    });
  }

  return results;
}
