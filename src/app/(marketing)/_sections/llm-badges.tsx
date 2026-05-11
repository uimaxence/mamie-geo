import { Bot, Cat, MessageCircle, Search, Sparkles, type LucideIcon } from "lucide-react";
import { Badge, Section } from "@/components/ui";

// Les 5 LLMs trackés — badges pastel colorés avec icônes Lucide.
// Signature visuelle DA (cf. doc 10 § Patterns de personnalité).

const LLMS: {
  name: string;
  tone: "green" | "purple" | "blue" | "orange" | "pink";
  Icon: LucideIcon;
}[] = [
  { name: "ChatGPT", tone: "green", Icon: MessageCircle },
  { name: "Claude", tone: "purple", Icon: Bot },
  { name: "Perplexity", tone: "blue", Icon: Search },
  { name: "Gemini", tone: "orange", Icon: Sparkles },
  { name: "Le Chat", tone: "pink", Icon: Cat },
];

export function LLMBadges() {
  return (
    <Section variant="tinted" pad="lg">
      <div className="mx-auto max-w-4xl text-center">
        <span className="type-eyebrow">Sources trackées dès le jour J</span>
        <h2 className="type-h2 mt-3">
          Les 5 IA qui répondent aux questions de tes futurs clients.
        </h2>
        <div className="mt-10 flex flex-wrap items-center justify-center gap-3">
          {LLMS.map((llm) => (
            <Badge
              key={llm.name}
              tone={llm.tone}
              icon={<llm.Icon size={14} strokeWidth={2.2} />}
              className="px-3 py-1.5 text-sm"
            >
              {llm.name}
            </Badge>
          ))}
        </div>
      </div>
    </Section>
  );
}
