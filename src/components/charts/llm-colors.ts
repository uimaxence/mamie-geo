// Mapping LLM → couleur pastel. Aligné sur la palette tokens
// (--color-blue, --color-green, --color-orange, --color-purple,
// --color-pink) — recopié en hex parce que Recharts veut un string
// stable côté serveur/client.

export const LLM_COLORS: Record<string, string> = {
  chatgpt: "#16a34a", // green
  claude: "#ea580c", // orange
  perplexity: "#7c3aed", // purple
  gemini: "#2563eb", // blue
  lechat: "#db2777", // pink
};

export const LLM_LABELS: Record<string, string> = {
  chatgpt: "ChatGPT",
  claude: "Claude",
  perplexity: "Perplexity",
  gemini: "Gemini",
  lechat: "Le Chat",
};
