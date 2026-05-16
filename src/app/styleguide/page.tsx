import type { Metadata } from "next";
import {
  Activity,
  Bot,
  Cat,
  Filter,
  MessageCircle,
  Sparkles,
  TrendingUp,
  Users,
} from "lucide-react";
import {
  Badge,
  Banner,
  Button,
  Card,
  CardBody,
  CardHeader,
  CardFooter,
  EmptyState,
  Field,
  Input,
  LinkButton,
  Skeleton,
  Stat,
  StatusDot,
  Tabs,
  TabsContent,
  TabsList,
  TabsTrigger,
} from "@/components/ui";
import { RunStatusBadge } from "@/components/app/run-status-badge";
import { PaginationDemo, SegmentedControlDemo, SwitchDemo } from "./interactive-demos";

// Page interne /styleguide — montre tous les composants UI + tokens
// design d'un coup. Non-indexée (`noindex` via metadata) pour rester
// invisible publique tout en étant accessible directement par URL.
//
// Usage : référence visuelle pour valider la cohérence du design system,
// repérer ce qui cloche, pointer du doigt avant ajustement.

export const metadata: Metadata = {
  title: "Design system — Mamie GEO",
  robots: { index: false, follow: false },
};

export default function StyleguidePage() {
  return (
    <main className="mx-auto max-w-5xl px-6 py-16">
      <header className="mb-12">
        <span className="type-eyebrow">Référence interne</span>
        <h1 className="type-display mt-3">Design system</h1>
        <p className="type-body-lg mt-4 max-w-prose">
          Vue d&apos;ensemble de tous les composants UI et tokens design. Page non-indexée (
          <code className="rounded bg-[color:var(--color-gray-100)] px-1.5 py-0.5 text-xs">
            noindex
          </code>
          ), accessible uniquement via URL directe.
        </p>
      </header>

      <Stack>
        {/* ── COULEURS ─────────────────────────────────────────────── */}
        <SubSection
          title="Couleurs"
          subtitle="Palette tokens — ink, accent, primary, status, pastels"
        >
          <ColorSwatchGroup
            title="Encres & gris"
            swatches={[
              { name: "ink", token: "--color-ink" },
              { name: "ink-soft", token: "--color-ink-soft" },
              { name: "muted", token: "--color-muted" },
              { name: "faint", token: "--color-faint" },
              { name: "border", token: "--color-border" },
              { name: "border-strong", token: "--color-border-strong" },
              { name: "bg", token: "--color-bg" },
            ]}
          />
          <ColorSwatchGroup
            title="Accents marque"
            swatches={[
              { name: "accent", token: "--color-accent" },
              { name: "accent-dim", token: "--color-accent-dim" },
              { name: "accent-faint", token: "--color-accent-faint" },
              { name: "primary", token: "--color-primary" },
              { name: "primary-dim", token: "--color-primary-dim" },
              { name: "primary-soft", token: "--color-primary-soft" },
            ]}
          />
          <ColorSwatchGroup
            title="Status"
            swatches={[
              { name: "success", token: "--color-success" },
              { name: "success-bg", token: "--color-success-bg" },
              { name: "warning", token: "--color-warning" },
              { name: "warning-bg", token: "--color-warning-bg" },
              { name: "error", token: "--color-error" },
              { name: "error-bg", token: "--color-error-bg" },
            ]}
          />
          <ColorSwatchGroup
            title="Palette pastel (pills, badges, status pills)"
            swatches={[
              { name: "blue", token: "--color-blue" },
              { name: "green", token: "--color-green" },
              { name: "orange", token: "--color-orange" },
              { name: "purple", token: "--color-purple" },
              { name: "pink", token: "--color-pink" },
              { name: "yellow", token: "--color-yellow" },
            ]}
          />
        </SubSection>

        {/* ── RADII ────────────────────────────────────────────────── */}
        <SubSection title="Radii" subtitle="--radius-{sm,md,lg,xl,pill}">
          <div className="flex flex-wrap gap-6">
            {[
              { name: "sm — 6px", radius: "var(--radius-sm)" },
              { name: "md — 10px", radius: "var(--radius-md)" },
              { name: "lg — 16px", radius: "var(--radius-lg)" },
              { name: "xl — 20px", radius: "var(--radius-xl)" },
              { name: "pill — 9999px", radius: "var(--radius-pill)" },
            ].map((r) => (
              <div key={r.name} className="flex flex-col items-center gap-2">
                <div
                  className="size-20 border border-[color:var(--color-border)] bg-white shadow-[var(--shadow-sm)]"
                  style={{ borderRadius: r.radius }}
                />
                <span className="type-meta">{r.name}</span>
              </div>
            ))}
          </div>
        </SubSection>

        {/* ── SHADOWS ──────────────────────────────────────────────── */}
        <SubSection title="Ombres" subtitle="--shadow-{sm,md,lg} — multi-couches subtiles">
          <div className="flex flex-wrap gap-8">
            {(["sm", "md", "lg"] as const).map((s) => (
              <div key={s} className="flex flex-col items-center gap-3">
                <div
                  className="size-24 rounded-[var(--radius-lg)] bg-white"
                  style={{ boxShadow: `var(--shadow-${s})` }}
                />
                <span className="type-meta">shadow-{s}</span>
              </div>
            ))}
          </div>
        </SubSection>

        {/* ── BUTTONS ──────────────────────────────────────────────── */}
        <SubSection
          title="Boutons"
          subtitle="5 variants × 3 sizes — variant `ai` réservé aux actions IA"
        >
          <Row label="Primary">
            <Button size="sm">Action sm</Button>
            <Button size="md">Action md</Button>
            <Button size="lg">Action lg</Button>
            <Button disabled>Disabled</Button>
          </Row>
          <Row label="Secondary">
            <Button variant="secondary" size="sm">
              Action sm
            </Button>
            <Button variant="secondary" size="md">
              Action md
            </Button>
            <Button variant="secondary" size="lg">
              Action lg
            </Button>
          </Row>
          <Row label="Ghost">
            <Button variant="ghost" size="sm">
              Action sm
            </Button>
            <Button variant="ghost" size="md">
              Action md
            </Button>
            <Button variant="ghost" size="lg">
              Action lg
            </Button>
          </Row>
          <Row label="Accent (rare)">
            <Button variant="accent" size="md">
              Accent rare
            </Button>
          </Row>
          <Row label="AI (Sparkles auto-injectée)">
            <Button variant="ai" size="sm">
              Audit IA
            </Button>
            <Button variant="ai" size="md">
              Suggérer prompts
            </Button>
            <Button variant="ai" size="lg">
              Audit IA gratuit
            </Button>
          </Row>
        </SubSection>

        {/* ── BADGES ───────────────────────────────────────────────── */}
        <SubSection
          title="Badges"
          subtitle="2 variants : soft (fond pastel) et solid (fond blanc + icône container coloré)"
        >
          <Row label="Soft — défaut">
            <Badge tone="neutral">neutral</Badge>
            <Badge tone="success">success</Badge>
            <Badge tone="warning">warning</Badge>
            <Badge tone="error">error</Badge>
            <Badge tone="accent">accent</Badge>
            <Badge tone="blue">blue</Badge>
            <Badge tone="green">green</Badge>
            <Badge tone="purple">purple</Badge>
            <Badge tone="pink">pink</Badge>
            <Badge tone="yellow">yellow</Badge>
          </Row>
          <Row label="Soft + icône">
            <Badge tone="blue" icon={<MessageCircle size={11} strokeWidth={2.2} />}>
              ChatGPT
            </Badge>
            <Badge tone="purple" icon={<Bot size={11} strokeWidth={2.2} />}>
              Claude
            </Badge>
            <Badge tone="pink" icon={<Cat size={11} strokeWidth={2.2} />}>
              Le Chat
            </Badge>
          </Row>
          <Row label="Solid (status pills)">
            <RunStatusBadge status="pending" />
            <RunStatusBadge status="running" />
            <RunStatusBadge status="success" />
            <RunStatusBadge status="failed" />
            <RunStatusBadge status="skipped" />
          </Row>
        </SubSection>

        {/* ── STATUS DOTS ──────────────────────────────────────────── */}
        <SubSection
          title="Status dots"
          subtitle="Indicateur status d'un service (online, dégradé, offline)"
        >
          <Row label="">
            <span className="inline-flex items-center gap-2 text-sm">
              <StatusDot tone="success" /> En ligne
            </span>
            <span className="inline-flex items-center gap-2 text-sm">
              <StatusDot tone="warning" /> Dégradé
            </span>
            <span className="inline-flex items-center gap-2 text-sm">
              <StatusDot tone="error" /> Hors-ligne
            </span>
            <span className="inline-flex items-center gap-2 text-sm">
              <StatusDot tone="neutral" /> Inconnu
            </span>
          </Row>
        </SubSection>

        {/* ── INPUTS ───────────────────────────────────────────────── */}
        <SubSection title="Inputs">
          <div className="grid max-w-xl gap-4">
            <Field label="Email" hint="On enverra un magic-link à cette adresse.">
              <Input type="email" placeholder="vous@exemple.com" />
            </Field>
            <Field label="Avec icône" hint="Champ avec ornement à gauche.">
              <Input type="text" placeholder="Rechercher…" />
            </Field>
          </div>
        </SubSection>

        {/* ── STAT ─────────────────────────────────────────────────── */}
        <SubSection title="Stat" subtitle="Tuile dashboard : label + valeur + delta + icône pastel">
          <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
            <Stat
              label="Score visibilité"
              value="78"
              icon={Activity}
              iconTone="orange"
              delta={{ value: 12.4, period: "vs J-7" }}
            />
            <Stat
              label="Citations"
              value="1 392"
              icon={TrendingUp}
              iconTone="green"
              delta={{ value: -3.1, period: "vs J-7" }}
            />
            <Stat label="Concurrents" value="5" icon={Users} iconTone="blue" delta={null} />
            <Stat
              label="Sparkles"
              value="42"
              icon={Sparkles}
              iconTone="purple"
              delta={{ value: 0, period: "stable" }}
            />
          </div>
        </SubSection>

        {/* ── CARDS ────────────────────────────────────────────────── */}
        <SubSection title="Cards">
          <div className="grid gap-4 md:grid-cols-2">
            <Card>
              <CardHeader>
                <h3 className="type-h3">Titre de card</h3>
                <p className="type-meta mt-1">Sous-titre explicatif</p>
              </CardHeader>
              <CardBody>
                <p className="text-sm text-[color:var(--color-ink-soft)]">
                  Le contenu principal de la card. Tu peux y mettre du texte, des stats, ou
                  n&apos;importe quel composant.
                </p>
              </CardBody>
              <CardFooter>
                <Button variant="secondary" size="sm">
                  Action secondaire
                </Button>
                <Button size="sm">Action principale</Button>
              </CardFooter>
            </Card>
            <Card>
              <CardHeader>
                <h3 className="type-h3">Card avec body seul</h3>
              </CardHeader>
              <CardBody>
                <p className="text-sm">Pas de footer ici, juste le contenu.</p>
              </CardBody>
            </Card>
          </div>
        </SubSection>

        {/* ── BANNERS ──────────────────────────────────────────────── */}
        <SubSection title="Banners">
          <div className="flex flex-col gap-3">
            <Banner tone="info" title="Information">
              Un message informatif neutre, pour une nouveauté ou un rappel.
            </Banner>
            <Banner tone="success" title="Succès">
              Une opération s&apos;est bien déroulée.
            </Banner>
            <Banner tone="warning" title="Attention">
              Quelque chose à vérifier mais pas bloquant.
            </Banner>
            <Banner tone="error" title="Erreur">
              Un problème qui requiert ton attention.
            </Banner>
          </div>
        </SubSection>

        {/* ── EMPTY STATE ──────────────────────────────────────────── */}
        <SubSection title="EmptyState">
          <EmptyState
            icon={Filter}
            title="Aucun résultat trouvé"
            description="Essaye d'élargir ta recherche ou de retirer un filtre."
            action={
              <Button variant="secondary" size="sm">
                Réinitialiser
              </Button>
            }
          />
        </SubSection>

        {/* ── TABS ─────────────────────────────────────────────────── */}
        <SubSection title="Tabs">
          <Tabs defaultValue="tab1">
            <TabsList>
              <TabsTrigger value="tab1">Vue d&apos;ensemble</TabsTrigger>
              <TabsTrigger value="tab2">Concurrents</TabsTrigger>
              <TabsTrigger value="tab3">Runs</TabsTrigger>
            </TabsList>
            <TabsContent value="tab1" className="pt-4 text-sm">
              Contenu de l&apos;onglet « Vue d&apos;ensemble ».
            </TabsContent>
            <TabsContent value="tab2" className="pt-4 text-sm">
              Contenu « Concurrents ».
            </TabsContent>
            <TabsContent value="tab3" className="pt-4 text-sm">
              Contenu « Runs ».
            </TabsContent>
          </Tabs>
        </SubSection>

        {/* ── SEGMENTED CONTROL ────────────────────────────────────── */}
        <SubSection title="SegmentedControl">
          <SegmentedControlDemo />
        </SubSection>

        {/* ── SWITCH ───────────────────────────────────────────────── */}
        <SubSection title="Switch">
          <Row label="">
            <SwitchDemo />
          </Row>
        </SubSection>

        {/* ── PAGINATION ───────────────────────────────────────────── */}
        <SubSection title="Pagination">
          <PaginationDemo />
        </SubSection>

        {/* ── SKELETON ─────────────────────────────────────────────── */}
        <SubSection title="Skeleton" subtitle="Placeholder de chargement">
          <div className="space-y-3 max-w-md">
            <Skeleton className="h-4 w-3/4" />
            <Skeleton className="h-4 w-1/2" />
            <Skeleton className="h-20 w-full rounded-[var(--radius-lg)]" />
          </div>
        </SubSection>

        {/* ── LINK BUTTONS ─────────────────────────────────────────── */}
        <SubSection title="LinkButton" subtitle="Variantes mais rendu en <a> au lieu de <button>">
          <Row label="">
            <LinkButton href="#" variant="primary">
              Lien principal
            </LinkButton>
            <LinkButton href="#" variant="secondary">
              Lien secondaire
            </LinkButton>
            <LinkButton href="#" variant="ai">
              Audit IA
            </LinkButton>
          </Row>
        </SubSection>
      </Stack>
    </main>
  );
}

// ─── Helpers de mise en page ─────────────────────────────────────────

function Stack({ children }: { children: React.ReactNode }) {
  return <div className="flex flex-col gap-16">{children}</div>;
}

function SubSection({
  title,
  subtitle,
  children,
}: {
  title: string;
  subtitle?: string;
  children: React.ReactNode;
}) {
  return (
    <section>
      <header className="mb-6">
        <h2 className="type-h2">{title}</h2>
        {subtitle && <p className="type-meta mt-1">{subtitle}</p>}
      </header>
      <div className="flex flex-col gap-5">{children}</div>
    </section>
  );
}

function Row({ label, children }: { label: string; children: React.ReactNode }) {
  return (
    <div className="flex flex-col gap-2">
      {label && <span className="type-eyebrow">{label}</span>}
      <div className="flex flex-wrap items-center gap-3">{children}</div>
    </div>
  );
}

function ColorSwatchGroup({
  title,
  swatches,
}: {
  title: string;
  swatches: { name: string; token: string }[];
}) {
  return (
    <div>
      <p className="type-eyebrow mb-3">{title}</p>
      <div className="flex flex-wrap gap-3">
        {swatches.map((s) => (
          <div
            key={s.name}
            className="flex w-[150px] flex-col gap-1 rounded-[var(--radius-md)] border border-[color:var(--color-border)] bg-white p-2"
          >
            <div
              className="h-10 w-full rounded-[var(--radius-sm)] border border-[color:var(--color-border)]"
              style={{ backgroundColor: `var(${s.token})` }}
            />
            <p className="text-xs font-medium">{s.name}</p>
            <p className="type-meta text-[10px]">{s.token}</p>
          </div>
        ))}
      </div>
    </div>
  );
}
