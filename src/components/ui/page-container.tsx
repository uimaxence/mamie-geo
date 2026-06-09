import type { HTMLAttributes } from "react";
import { cn } from "@/lib/utils";

// Conteneur standard d'une page app `(with-nav)`. Centralise largeur +
// padding pour éviter les divergences historiques (max-w-3xl/4xl/5xl/6xl
// mélangées). Une page app = un <PageContainer> en racine, point.
//
//   default  6xl → vues principales (dashboard, audits, citations, conseils…)
//   narrow   3xl → réglages / contenu de lecture
//   form     2xl → formulaires (nouvel audit…)
//
// Convention de blocs à l'intérieur : `grid gap-4 lg:grid-cols-2
// items-start` pour des blocs côte à côte ; les tables/listes principales
// restent pleine largeur (cf. doc 10 § Layout app).

type Width = "default" | "narrow" | "form";

const widthClass: Record<Width, string> = {
  default: "max-w-6xl",
  narrow: "max-w-3xl",
  form: "max-w-2xl",
};

export interface PageContainerProps extends HTMLAttributes<HTMLDivElement> {
  width?: Width;
}

export function PageContainer({ width = "default", className, ...props }: PageContainerProps) {
  return (
    <div className={cn("mx-auto px-6 py-12 lg:px-10", widthClass[width], className)} {...props} />
  );
}
