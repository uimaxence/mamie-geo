// Layout du route group (marketing). Marketing site public — pas d'auth.
// cf. geo-project/03-architecture-technique.md § Domaine et routes
export default function MarketingLayout({ children }: { children: React.ReactNode }) {
  return <div className="min-h-screen">{children}</div>;
}
