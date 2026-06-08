// Convertit un plan ID en MRR € mensuel. Source de vérité publique :
// pricing-data.ts. Utilisé pour set la group property "mrr" sur le
// workspace dans PostHog (cohort analysis par tier de revenu).
//
// Valeurs alignées avec PLANS dans
// src/app/(marketing)/_sections/pricing/pricing-data.ts.
// Plans non-publics (agency, enterprise) : null (custom pricing).

export function planToMrr(plan: string): number | null {
  switch (plan) {
    case "solo":
      return 9.99;
    case "starter":
      return 49;
    case "pro":
      return 149;
    default:
      return null;
  }
}
