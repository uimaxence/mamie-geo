// Layout du route group (blog). MDX articles publiés en /blog/[slug].
// Sprint 0 : layout vide. Le pipeline MDX est mis en place en Sprint 1.
export default function BlogLayout({ children }: { children: React.ReactNode }) {
  return <div className="min-h-screen">{children}</div>;
}
