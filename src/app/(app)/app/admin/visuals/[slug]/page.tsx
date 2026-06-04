import { notFound } from "next/navigation";
import Link from "next/link";
import { getVisual } from "@/lib/admin/visuals/registry";
import { VisualCanvas } from "@/components/admin/visuals/visual-canvas";

interface Props {
  params: Promise<{ slug: string }>;
}

// force-dynamic : la page hérite du guard auth du layout admin
// (lecture session via headers()), donc rendu serveur à chaque requête.
// Pas de generateStaticParams : aucune raison de pré-rendre, les
// visuels sont rendus côté admin uniquement.
export const dynamic = "force-dynamic";

export default async function VisualDetailPage({ params }: Props) {
  const { slug } = await params;
  const visual = getVisual(slug);
  if (!visual) notFound();

  const { format, slides, slug: visualSlug } = visual;
  const total = slides.length;

  return (
    <div className="flex flex-col gap-6">
      <div className="flex flex-col gap-2">
        <Link
          href="/app/admin/visuals"
          className="text-sm text-[color:var(--color-muted)] hover:text-[color:var(--color-ink)]"
        >
          ← Tous les visuels
        </Link>
        <h1 className="type-h2">{visual.title}</h1>
        <p className="type-body max-w-2xl">{visual.description}</p>
        {total > 1 && (
          <div className="mt-1 text-sm font-medium text-[color:var(--color-muted)]">
            Carousel {total} slides — télécharge chaque slide individuellement, dans l&apos;ordre
            sur LinkedIn.
          </div>
        )}
      </div>

      <div className="flex flex-col gap-10">
        {slides.map(({ key, label, Component }, i) => {
          const index = i + 1;
          return (
            <section key={key} className="flex flex-col gap-3">
              <div className="flex items-baseline gap-3">
                <span className="font-mono text-xs uppercase tracking-wider text-[color:var(--color-muted)] tabular-nums">
                  {String(index).padStart(2, "0")} / {String(total).padStart(2, "0")}
                </span>
                <span className="text-base font-semibold text-[color:var(--color-ink)]">
                  {label}
                </span>
              </div>
              <VisualCanvas
                slug={`${visualSlug}-${String(index).padStart(2, "0")}-${key}`}
                width={format.width}
                height={format.height}
              >
                <Component index={index} total={total} />
              </VisualCanvas>
            </section>
          );
        })}
      </div>
    </div>
  );
}
