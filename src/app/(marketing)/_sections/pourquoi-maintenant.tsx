"use client";

import { useRef, type ReactNode } from "react";
import gsap from "gsap";
import { ScrollTrigger } from "gsap/ScrollTrigger";
import { useGSAP } from "@gsap/react";
import { LLMPill } from "@/components/marketing/llm-pill";

gsap.registerPlugin(ScrollTrigger);

// "Pourquoi maintenant ?", section narrative data sur fond sombre,
// révélation **mot par mot** au scroll via GSAP ScrollTrigger.
//
// Chaque mot du paragraphe est wrappé dans un <span.reveal-word>.
// L'animation est scrubbée sur la durée de scroll de la section (180vh
// container, sticky inner = ~80vh de scroll utile). Stagger 50 %
// d'overlap entre mots → effet « curseur de lecture » fluide.
//
// Cf. doc 09 § 2026-05-13 (4ᵉ itération polish UX) : passage de
// scroll-driven CSS à GSAP mot-par-mot suite retour Max (l'effet
// précédent remplissait toutes les lignes ensemble).

export function PourquoiMaintenant() {
  const containerRef = useRef<HTMLElement>(null);
  const textRef = useRef<HTMLDivElement>(null);

  useGSAP(
    () => {
      if (!containerRef.current || !textRef.current) return;

      const words = gsap.utils.toArray<HTMLElement>(".reveal-word", textRef.current);
      if (words.length === 0) return;

      // État initial : tous les mots dim. GSAP applique avant la 1ʳᵉ
      // frame visible (useGSAP runs en useLayoutEffect).
      gsap.set(words, { color: "var(--color-gray-700)" });

      // Animation séquencée scrubbée sur la durée de scroll de la
      // section. `stagger.each = 0.6` + `duration = 1` → ~40 %
      // d'overlap entre mots, lecture fluide sans à-coup.
      gsap.to(words, {
        color: "#ffffff",
        duration: 1,
        ease: "none",
        stagger: { each: 0.6, ease: "none" },
        scrollTrigger: {
          trigger: containerRef.current,
          start: "top top",
          end: "bottom bottom",
          scrub: 0.3, // léger lissage pour absorber la friction trackpad
        },
      });
    },
    { scope: containerRef },
  );

  return (
    <section
      ref={containerRef}
      id="pourquoi-maintenant"
      className="relative bg-[color:var(--color-ink)] text-white"
      style={{ minHeight: "180vh" }}
    >
      {/* Radial bleu brand subtil, touche de couleur, ~0,22 opacité max. */}
      <div aria-hidden className="pointer-events-none absolute inset-0 overflow-hidden">
        <div
          className="absolute -top-32 -right-32 size-[640px] rounded-full"
          style={{
            background:
              "radial-gradient(circle at center, rgba(50, 156, 255, 0.22) 0%, rgba(50, 156, 255, 0.08) 35%, transparent 65%)",
            filter: "blur(40px)",
          }}
        />
      </div>

      {/* Sticky inner pinned au centre */}
      <div className="sticky top-0 flex h-screen items-center justify-center px-6">
        <div className="mx-auto flex max-w-3xl flex-col gap-8 text-center">
          <span className="type-eyebrow text-[color:var(--color-gray-500)]">Le moment</span>

          {/* Bloc unique de prose dense. Le ref capture les mots pour
           * GSAP. Les enfants non-`.reveal-word` (pastilles LLM,
           * footnotes) restent visibles et fixes en couleur. */}
          <div
            ref={textRef}
            className="text-xl font-medium leading-relaxed tracking-tight sm:text-2xl"
          >
            <Words>
              L&apos;IA search n&apos;est plus un futur lointain. En 2025, le trafic depuis les IA a
              fait ×6
            </Words>
            <Footnote n="¹" href="https://www.semrush.com/blog/ai-seo-statistics/" />
            <Words>
              , et leurs visiteurs convertissent ×4,4 mieux que ceux de Google. 60 % des recherches
              Google ne génèrent plus aucun clic, pendant que 44 % des Français utilisent déjà au
              moins une IA
            </Words>
            <Footnote n="²" href="https://www.francenum.gouv.fr/" />
            <Words>. Tes prospects parlent à</Words>{" "}
            <span className="inline-flex flex-wrap items-center justify-center gap-1.5 align-middle">
              <LLMPill llm="chatgpt" size="sm" />
              <LLMPill llm="claude" size="sm" />
              <LLMPill llm="perplexity" size="sm" />
              <LLMPill llm="gemini" size="sm" />
              <LLMPill llm="lechat" size="sm" />
            </span>
            <Words>
              . Mamie GEO te dit exactement ce qu&apos;elles répondent à propos de ta marque.
            </Words>
          </div>

          {/* Sources footnote minimales */}
          <p className="mt-2 text-xs text-[color:var(--color-gray-500)]">
            ¹{" "}
            <a
              href="https://www.semrush.com/blog/ai-seo-statistics/"
              target="_blank"
              rel="noopener noreferrer"
              className="underline underline-offset-2 hover:text-[color:var(--color-accent)]"
            >
              Semrush Blog
            </a>{" "}
            (jan-mai 2025). ²{" "}
            <a
              href="https://www.francenum.gouv.fr/"
              target="_blank"
              rel="noopener noreferrer"
              className="underline underline-offset-2 hover:text-[color:var(--color-accent)]"
            >
              francenum.gouv.fr
            </a>{" "}
            (fév. 2026).
          </p>
        </div>
      </div>
    </section>
  );
}

// Split du texte en spans-mots. Les whitespaces sont rendus comme
// text nodes (pas dans des spans), ils ne participent pas à
// l'animation et permettent un line-wrap naturel.
function Words({ children }: { children: string }): ReactNode {
  const parts = children.split(/(\s+)/);
  return (
    <>
      {parts.map((part, i) => {
        if (part === "") return null;
        if (/^\s+$/.test(part)) return <span key={i}>{part}</span>;
        return (
          <span key={i} className="reveal-word">
            {part}
          </span>
        );
      })}
    </>
  );
}

// Footnote toujours visible (couleur fixe gray-500), pas wrappée dans
// un mot animé, sert d'ancrage pour lire la source en bas.
function Footnote({ n, href }: { n: string; href: string }) {
  return (
    <a
      href={href}
      target="_blank"
      rel="noopener noreferrer"
      className="align-super text-[10px] font-normal text-[color:var(--color-gray-500)] hover:text-[color:var(--color-accent)] ml-0.5"
      aria-label="Voir la source"
    >
      {n}
    </a>
  );
}
