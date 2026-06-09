import type { Metadata } from "next";
import { PageContainer } from "@/components/ui";
import { ConseilsView } from "./conseils-view";

// Page /app/conseils — « Conseils GEO ». Contenu evergreen (10 leviers
// pour être cité par les IA), aucune data DB. L'auth est garantie par
// le layout (with-nav) qui redirige vers /app/onboarding sans contexte.
// Le suivi des URLs auditées vit sur /app/audits (pas de doublon ici).

export const metadata: Metadata = {
  title: "Conseils GEO",
};

export default function ConseilsPage() {
  return (
    <PageContainer>
      <ConseilsView />
    </PageContainer>
  );
}
