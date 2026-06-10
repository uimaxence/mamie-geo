"use client";

import { useRouter, useSearchParams } from "next/navigation";
import { useState } from "react";
import { BookOpen, Globe, Trophy, Users } from "lucide-react";
import { PageHeader, Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui";
import type { CompetitorRowWithMetrics, RankingData } from "@/lib/competitors/queries";
import type { BrandSelfMetrics, SuggestedCompetitor } from "@/lib/competitors/metrics";
import type { SourceListItem } from "@/lib/sources/queries";
import { CompetitorsTable } from "./competitors-table";
import { RankingTab } from "./ranking-tab";
import { SourcesTable } from "./sources-table";

// Wrapper client de /app/citations : tabs Concurrents / Classement /
// Sources. L'état actif est conservé dans l'URL (?tab=...) pour permettre
// le deep-link + le bouton Retour navigateur. Le changement de tab utilise
// `router.replace()` (shallow) — pas de re-fetch côté server, on garde
// la data déjà chargée.

type Tab = "competitors" | "ranking" | "sources";

interface CitationsViewProps {
  initialTab: Tab;
  brand: { id: string; name: string; domain: string | null };
  plan: string;
  competitors: CompetitorRowWithMetrics[];
  maxCompetitors: number;
  competitorsWindowDays: number;
  competitorsTotalRuns: number;
  brandSelf: BrandSelfMetrics;
  suggestions: SuggestedCompetitor[];
  ranking: RankingData;
  /** Domaines des concurrents suivis, pour tagger les sources. */
  competitorDomains: (string | null)[];
  workspaceBrands: Array<{ id: string; name: string; domain: string }>;
  sources: SourceListItem[];
  sourcesScopeLabel: string;
}

export function CitationsView({
  initialTab,
  brand,
  plan,
  competitors,
  maxCompetitors,
  competitorsWindowDays,
  competitorsTotalRuns,
  brandSelf,
  suggestions,
  ranking,
  competitorDomains,
  workspaceBrands,
  sources,
  sourcesScopeLabel,
}: CitationsViewProps) {
  const router = useRouter();
  const searchParams = useSearchParams();
  const [tab, setTab] = useState<Tab>(initialTab);

  function handleTabChange(value: string) {
    const next: Tab =
      value === "sources" ? "sources" : value === "ranking" ? "ranking" : "competitors";
    setTab(next);
    const params = new URLSearchParams(searchParams.toString());
    params.set("tab", next);
    router.replace(`/app/citations?${params.toString()}`, { scroll: false });
  }

  const summary =
    tab === "competitors"
      ? `Qui apparaît à côté de ${brand.name} dans les réponses IA`
      : tab === "ranking"
        ? `Qui domine les réponses IA sur tes prompts`
        : `Les pages où les IA vont chercher leurs réponses sur ${sourcesScopeLabel}`;

  return (
    <>
      <PageHeader icon={BookOpen} title="Citations" summary={summary} />

      <Tabs value={tab} onValueChange={handleTabChange} className="mt-8">
        <TabsList>
          <TabsTrigger value="competitors">
            <Users size={14} strokeWidth={2} />
            Concurrents
            <span className="text-[color:var(--color-muted)] tabular-nums">
              {competitors.length}
            </span>
          </TabsTrigger>
          <TabsTrigger value="ranking">
            <Trophy size={14} strokeWidth={2} />
            Classement
          </TabsTrigger>
          <TabsTrigger value="sources">
            <Globe size={14} strokeWidth={2} />
            Sources
            <span className="text-[color:var(--color-muted)] tabular-nums">{sources.length}</span>
          </TabsTrigger>
        </TabsList>

        <TabsContent value="competitors" className="mt-6">
          <CompetitorsTable
            brandDomain={brand.domain}
            plan={plan}
            initialCompetitors={competitors}
            maxCompetitors={maxCompetitors}
            windowDays={competitorsWindowDays}
            totalRuns={competitorsTotalRuns}
            brandSelf={brandSelf}
            suggestions={suggestions}
          />
        </TabsContent>

        <TabsContent value="ranking" className="mt-6">
          <RankingTab data={ranking} />
        </TabsContent>

        <TabsContent value="sources" className="mt-6">
          <SourcesTable
            sources={sources}
            workspaceBrands={workspaceBrands}
            brandDomain={brand.domain}
            competitorDomains={competitorDomains}
          />
        </TabsContent>
      </Tabs>
    </>
  );
}
