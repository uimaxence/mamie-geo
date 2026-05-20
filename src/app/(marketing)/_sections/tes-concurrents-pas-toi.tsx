"use client";

import { useRef } from "react";
import gsap from "gsap";
import { ScrollTrigger } from "gsap/ScrollTrigger";
import { useGSAP } from "@gsap/react";
import { ArrowUp, Sparkles } from "lucide-react";
import { LinkButton, Section } from "@/components/ui";

gsap.registerPlugin(ScrollTrigger);

// "Tes concurrents, pas toi", section démo concrète où on simule en
// live une conversation LLM dans laquelle la marque du visiteur N'EST
// PAS citée, mais des concurrents le sont. Effet émotionnel fort :
// l'utilisateur visualise instantanément le problème que Mamie GEO
// résout.
//
// Animation séquencée GSAP, démarrée au scroll-in (ScrollTrigger) :
//   1. Le prompt utilisateur s'écrit lettre par lettre (~30ms / char)
//   2. Pause ~600ms (le LLM "réfléchit")
//   3. Le typing indicator (3 dots) apparaît brièvement
//   4. La réponse se révèle token par token (chunks de 1-2 mots)
//   5. Les noms de concurrents sont highlight (fade-in bg)
//
// Le texte de la réponse est un exemple plausible, outils GEO du
// marché qui apparaissent souvent dans les vraies réponses ChatGPT
// pour ce genre de prompt.

const USER_PROMPT = "Quels outils de monitoring de visibilité GEO me recommandes-tu ?";

// Tokens de réponse, chaque entrée = un "token" qui s'affiche en bloc.
// Les `competitor` sont highlight rouge (= concurrent qui rafle la mise).
// Mamie GEO apparaît en 4ᵉ avec un highlight terracotta (= notre marque
// est citée mais pas en tête, ce qui légitime le pitch « il y a de la
// place pour grimper »).
type Token =
  | { type: "text"; value: string }
  | { type: "competitor"; value: string }
  | { type: "self"; value: string }
  | { type: "newline" };

const RESPONSE_TOKENS: Token[] = [
  { type: "text", value: "Pour suivre " },
  { type: "text", value: "ta visibilité " },
  { type: "text", value: "dans les " },
  { type: "text", value: "moteurs IA, " },
  { type: "text", value: "tu peux " },
  { type: "text", value: "regarder :" },
  { type: "newline" },
  { type: "newline" },
  { type: "text", value: "• " },
  { type: "competitor", value: "Profound" },
  { type: "text", value: ", la " },
  { type: "text", value: "référence US, " },
  { type: "text", value: "très complète" },
  { type: "newline" },
  { type: "text", value: "• " },
  { type: "competitor", value: "AthenaHQ" },
  { type: "text", value: ", " },
  { type: "text", value: "orientée " },
  { type: "text", value: "agences" },
  { type: "newline" },
  { type: "text", value: "• " },
  { type: "competitor", value: "Otterly.AI" },
  { type: "text", value: ", " },
  { type: "text", value: "plus accessible" },
  { type: "newline" },
  { type: "text", value: "• " },
  { type: "self", value: "Mamie GEO" },
  { type: "text", value: ", " },
  { type: "text", value: "le concurrent " },
  { type: "text", value: "francophone, " },
  { type: "text", value: "pensé PME" },
];

export function TesConcurrentsPasToi() {
  const containerRef = useRef<HTMLElement>(null);
  const promptRef = useRef<HTMLSpanElement>(null);
  const caretRef = useRef<HTMLSpanElement>(null);
  const submitRef = useRef<HTMLButtonElement>(null);
  const thinkingRef = useRef<HTMLDivElement>(null);
  const responseRef = useRef<HTMLDivElement>(null);

  useGSAP(
    () => {
      if (
        !containerRef.current ||
        !promptRef.current ||
        !caretRef.current ||
        !submitRef.current ||
        !thinkingRef.current ||
        !responseRef.current
      ) {
        return;
      }

      const promptEl = promptRef.current;
      const responseEl = responseRef.current;
      const tokens = gsap.utils.toArray<HTMLElement>(".response-token", responseEl);

      // État initial, tout caché / vide.
      promptEl.textContent = "";
      gsap.set(tokens, { opacity: 0, y: 4 });
      gsap.set(thinkingRef.current, { opacity: 0 });
      gsap.set(".competitor-highlight", { backgroundColor: "rgba(0,0,0,0)" });
      gsap.set(".self-highlight", { backgroundColor: "rgba(0,0,0,0)" });

      const tl = gsap.timeline({
        scrollTrigger: {
          trigger: containerRef.current,
          start: "top 70%",
          toggleActions: "play none none reset",
        },
      });

      // 1. Typewriter du prompt user, caractère par caractère.
      tl.to(promptEl, {
        duration: USER_PROMPT.length * 0.028, // ~28ms/char
        ease: "none",
        text: { value: USER_PROMPT, type: "diff" },
        onUpdate: function () {
          promptEl.textContent = USER_PROMPT.slice(
            0,
            Math.floor(this.progress() * USER_PROMPT.length),
          );
        },
      });

      // 2. Submit press feedback.
      tl.to(submitRef.current, { scale: 0.92, duration: 0.08 }, "+=0.2").to(submitRef.current, {
        scale: 1,
        duration: 0.12,
      });

      // 3. Caret disparaît, thinking indicator apparaît.
      tl.to(caretRef.current, { opacity: 0, duration: 0.15 }).to(
        thinkingRef.current,
        { opacity: 1, duration: 0.2 },
        "<",
      );

      // 4. Pause "réflexion".
      tl.to({}, { duration: 0.5 });

      // 5. Thinking indicator disparaît, response apparaît token par token.
      tl.to(thinkingRef.current, { opacity: 0, duration: 0.15 });
      tl.to(tokens, {
        opacity: 1,
        y: 0,
        duration: 0.18,
        ease: "power2.out",
        stagger: 0.07,
      });

      // 6a. Highlight des concurrents (background rouge clair), "ils
      //     prennent les premières places".
      tl.to(
        ".competitor-highlight",
        {
          backgroundColor: "var(--color-error-bg)",
          duration: 0.35,
          ease: "power2.out",
          stagger: 0.15,
        },
        "+=0.3",
      );

      // 6b. Highlight Mamie GEO (terracotta faint), "tu y es, mais en
      //     queue de peloton". L'effet finit après les concurrents pour
      //     ramener l'œil vers la marque.
      tl.to(
        ".self-highlight",
        {
          backgroundColor: "var(--color-accent-faint)",
          duration: 0.45,
          ease: "power2.out",
        },
        "+=0.15",
      );
    },
    { scope: containerRef },
  );

  return (
    <Section variant="tinted" pad="xl" id="tes-concurrents-pas-toi">
      <section
        ref={containerRef}
        className="grid grid-cols-1 gap-12 lg:grid-cols-2 lg:gap-16 lg:items-center"
      >
        {/* Colonne gauche, texte + CTA */}
        <div className="max-w-xl">
          <span className="type-eyebrow">Le vrai problème</span>
          <h2 className="type-display mt-3">
            Et si les IA parlaient de tes concurrents,{" "}
            <span className="text-[color:var(--color-accent)]">pas de toi&nbsp;?</span>
          </h2>
          <p className="type-body-lg mt-6">
            Quand un prospect demande à ChatGPT « quel outil tu me recommandes&nbsp;? », la réponse
            cite quelques marques. Si tu n&apos;en fais pas partie, tu n&apos;existes pas.
          </p>
          <p className="type-body mt-4 text-sm text-[color:var(--color-ink-soft)]">
            Le SEO te dit qui te dépasse sur Google. Mamie GEO te dit qui te dépasse dans ChatGPT,
            Claude, Perplexity, Gemini et Le Chat, et te livre les actions pour rentrer dans la
            réponse.
          </p>
          <div className="mt-8 flex flex-wrap gap-3">
            <LinkButton href="/pricing" variant="primary" size="lg">
              Tester ma visibilité →
            </LinkButton>
            <LinkButton href="/outils/test-visibilite-ia" variant="ai" size="lg">
              Audit gratuit
            </LinkButton>
          </div>
        </div>

        {/* Colonne droite, mockup conversation LLM */}
        <div className="relative">
          <LLMMockup
            promptRef={promptRef}
            caretRef={caretRef}
            submitRef={submitRef}
            thinkingRef={thinkingRef}
            responseRef={responseRef}
          />
        </div>
      </section>
    </Section>
  );
}

interface LLMMockupProps {
  promptRef: React.RefObject<HTMLSpanElement | null>;
  caretRef: React.RefObject<HTMLSpanElement | null>;
  submitRef: React.RefObject<HTMLButtonElement | null>;
  thinkingRef: React.RefObject<HTMLDivElement | null>;
  responseRef: React.RefObject<HTMLDivElement | null>;
}

function LLMMockup({ promptRef, caretRef, submitRef, thinkingRef, responseRef }: LLMMockupProps) {
  return (
    <div className="relative mx-auto max-w-[560px]">
      {/* Halo ambient AI (gradient rose/indigo très subtile) */}
      <div
        aria-hidden
        className="pointer-events-none absolute -inset-8 rounded-[var(--radius-xl)]"
        style={{
          background:
            "radial-gradient(circle at 30% 20%, rgba(248,196,209,0.25) 0%, transparent 60%), radial-gradient(circle at 80% 80%, rgba(165,180,246,0.22) 0%, transparent 65%)",
          filter: "blur(28px)",
        }}
      />

      <div className="relative rounded-[var(--radius-xl)] border border-[color:var(--color-border)] bg-white shadow-[var(--shadow-lg)]">
        {/* Header simulant l'app LLM */}
        <header className="flex items-center justify-between border-b border-[color:var(--color-border)] px-5 py-3">
          <div className="flex items-center gap-2">
            <Sparkles size={14} className="text-[color:var(--color-purple)]" />
            <span className="text-sm font-medium text-[color:var(--color-ink)]">
              Une IA générative
            </span>
          </div>
          <div className="flex gap-1.5">
            <span className="size-2 rounded-full bg-[color:var(--color-gray-300)]" />
            <span className="size-2 rounded-full bg-[color:var(--color-gray-300)]" />
            <span className="size-2 rounded-full bg-[color:var(--color-gray-300)]" />
          </div>
        </header>

        <div className="px-5 py-5">
          {/* Input simulant le prompt user */}
          <div className="flex items-center gap-2 rounded-[var(--radius-lg)] border border-[color:var(--color-border-strong)] bg-[color:var(--color-gray-50)] px-3 py-2.5">
            <span className="flex-1 text-sm text-[color:var(--color-ink)]">
              <span ref={promptRef} />
              <span
                ref={caretRef}
                className="inline-block w-[1.5px] h-4 align-middle bg-[color:var(--color-ink)] ml-0.5 animate-[blink_900ms_steps(2)_infinite]"
              />
            </span>
            <button
              ref={submitRef}
              type="button"
              tabIndex={-1}
              aria-label="Envoyer"
              className="flex size-7 shrink-0 items-center justify-center rounded-full bg-[color:var(--color-ink)] text-white"
            >
              <ArrowUp size={14} strokeWidth={2.4} />
            </button>
          </div>

          {/* Thinking indicator (3 dots, apparaît brièvement) */}
          <div
            ref={thinkingRef}
            className="mt-5 flex items-center gap-1.5 text-[color:var(--color-muted)]"
          >
            <span className="size-1.5 rounded-full bg-[color:var(--color-muted)] animate-[pulse_1.4s_ease-in-out_infinite]" />
            <span
              className="size-1.5 rounded-full bg-[color:var(--color-muted)] animate-[pulse_1.4s_ease-in-out_infinite]"
              style={{ animationDelay: "0.2s" }}
            />
            <span
              className="size-1.5 rounded-full bg-[color:var(--color-muted)] animate-[pulse_1.4s_ease-in-out_infinite]"
              style={{ animationDelay: "0.4s" }}
            />
          </div>

          {/* Response (chaque token apparaît avec fade-in y) */}
          <div
            ref={responseRef}
            className="mt-5 text-sm leading-relaxed text-[color:var(--color-ink)]"
          >
            {RESPONSE_TOKENS.map((token, idx) => {
              if (token.type === "newline") {
                return <br key={idx} className="response-token" />;
              }
              if (token.type === "competitor") {
                return (
                  <span
                    key={idx}
                    className="response-token competitor-highlight rounded-sm px-1 font-semibold text-[color:var(--color-error)]"
                  >
                    {token.value}
                  </span>
                );
              }
              if (token.type === "self") {
                return (
                  <span
                    key={idx}
                    className="response-token self-highlight rounded-sm px-1 font-semibold text-[color:var(--color-accent)]"
                  >
                    {token.value}
                  </span>
                );
              }
              return (
                <span key={idx} className="response-token">
                  {token.value}
                </span>
              );
            })}
          </div>
        </div>
      </div>

      {/* Légende sous le mockup */}
      <p className="mt-4 text-center text-xs text-[color:var(--color-muted)]">
        Exemple basé sur des réponses réelles des 5 IA suivies. Ta marque devrait être dans cette
        liste.
      </p>
    </div>
  );
}
