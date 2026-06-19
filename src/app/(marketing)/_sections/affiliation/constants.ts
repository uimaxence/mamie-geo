// Constantes du programme d'affiliation (cf. doc 09 § 2026-06-19 et
// doc 04/05). Modèle : 40 % à vie sur Solo, 25 % sur Starter, Pro/Agency
// exclus (programme partenaire agence). Source unique pour le hero, le
// calculateur et la FAQ afin d'éviter les chiffres en dur dispersés.

export const SOLO_PRICE_EUR = 9.99;
export const STARTER_PRICE_EUR = 49;
export const SOLO_RATE = 0.4;
export const STARTER_RATE = 0.25;

// Commission mensuelle récurrente par parrainage Solo (≈ 4 €).
export const COMMISSION_PER_SOLO = SOLO_PRICE_EUR * SOLO_RATE;

// Pas de back-office affilié en V0 (tracking = V1, doc 02) : le CTA
// ouvre un email de candidature. À remplacer par un vrai onboarding
// affilié quand le tracking Stripe sera branché.
export const AFFILIATE_CONTACT_HREF =
  "mailto:hello@mamie-geo.fr?subject=Candidature%20programme%20d%27affiliation%20Mamie%20GEO&body=Bonjour%2C%0A%0AJe%20souhaite%20rejoindre%20le%20programme%20d%27affiliation.%0A%0AMon%20audience%20%2F%20canal%20%3A%20%0AMon%20site%20%2F%20profil%20%3A%20%0A%0AMerci%20%21";
