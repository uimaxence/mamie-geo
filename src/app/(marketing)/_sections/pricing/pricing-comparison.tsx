import { Check, Minus } from "lucide-react";
import { Section } from "@/components/ui";
import { COMPARISON_GROUPS, PLANS, type ComparisonRow } from "./pricing-data";

// Tableau comparatif détaillé (cf. doc 10 § Pricing). 3 groupes
// (Tracking / Reporting / Compte) avec 4 colonnes plans. Toujours
// visible, pas de toggle "Voir tous les détails" en V0 pour rester
// simple. On le ré-introduira si la page devient trop longue.

const PLAN_HEADERS = PLANS.map((p) => ({ id: p.id, name: p.name }));

export function PricingComparison() {
  return (
    <Section variant="tinted" pad="xl">
      <div className="mx-auto max-w-3xl text-center">
        <span className="type-eyebrow">Comparatif détaillé</span>
        <h2 className="type-h1 mt-3">Toutes les features, plan par plan.</h2>
      </div>

      <div className="mt-12 overflow-x-auto">
        <table className="mx-auto w-full max-w-5xl border-collapse text-left">
          <thead>
            <tr className="border-b border-[color:var(--color-border-strong)]">
              <th className="type-eyebrow px-3 py-3 text-left">Feature</th>
              {PLAN_HEADERS.map((p) => (
                <th key={p.id} className="type-h3 px-3 py-3 text-center">
                  {p.name}
                </th>
              ))}
            </tr>
          </thead>
          <tbody>
            {COMPARISON_GROUPS.map((group) => (
              <ComparisonGroup key={group.title} title={group.title} rows={group.rows} />
            ))}
          </tbody>
        </table>
      </div>
    </Section>
  );
}

function ComparisonGroup({ title, rows }: { title: string; rows: ComparisonRow[] }) {
  return (
    <>
      <tr>
        <td
          colSpan={1 + PLAN_HEADERS.length}
          className="type-eyebrow pt-8 pb-3 text-[color:var(--color-ink)]"
        >
          {title}
        </td>
      </tr>
      {rows.map((row) => (
        <tr key={row.feature} className="border-t border-[color:var(--color-border)]">
          <td className="px-3 py-3 text-sm font-medium text-[color:var(--color-ink-soft)]">
            {row.feature}
          </td>
          <ComparisonCell value={row.solo} />
          <ComparisonCell value={row.starter} />
          <ComparisonCell value={row.pro} />
        </tr>
      ))}
    </>
  );
}

function ComparisonCell({ value }: { value: string | boolean }) {
  if (value === true) {
    return (
      <td className="px-3 py-3 text-center">
        <span className="inline-flex size-5 items-center justify-center rounded-full bg-[color:var(--color-success-bg)] text-[color:var(--color-success)]">
          <Check size={12} strokeWidth={3} />
        </span>
      </td>
    );
  }
  if (value === false) {
    return (
      <td className="px-3 py-3 text-center">
        <span className="inline-flex size-5 items-center justify-center text-[color:var(--color-faint)]">
          <Minus size={14} />
        </span>
      </td>
    );
  }
  return <td className="px-3 py-3 text-center text-sm text-[color:var(--color-ink)]">{value}</td>;
}
