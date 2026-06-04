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

  const { Component, format } = visual;

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
      </div>

      <VisualCanvas slug={visual.slug} width={format.width} height={format.height}>
        <Component />
      </VisualCanvas>
    </div>
  );
}
