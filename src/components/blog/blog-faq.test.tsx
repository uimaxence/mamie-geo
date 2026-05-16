import { describe, expect, it } from "vitest";
import { renderToStaticMarkup } from "react-dom/server";
import { BlogFAQ } from "./blog-faq";

describe("BlogFAQ", () => {
  it("rend les questions sous forme de <details>", () => {
    const html = renderToStaticMarkup(
      <BlogFAQ
        items={[
          { q: "Question 1 ?", a: "Réponse 1." },
          { q: "Question 2 ?", a: "Réponse 2." },
        ]}
      />,
    );
    expect(html).toContain("Question 1 ?");
    expect(html).toContain("Question 2 ?");
    expect(html).toContain("<details");
    expect(html.match(/<details/g)?.length).toBe(2);
  });

  it("injecte le JSON-LD FAQPage avec les items", () => {
    const html = renderToStaticMarkup(<BlogFAQ items={[{ q: "Q1 ?", a: "A1." }]} />);
    expect(html).toContain('"@type":"FAQPage"');
    expect(html).toContain('"name":"Q1 ?"');
    expect(html).toContain('"text":"A1."');
  });

  it("ne rend rien si items vide", () => {
    const html = renderToStaticMarkup(<BlogFAQ items={[]} />);
    expect(html).toBe("");
  });
});
