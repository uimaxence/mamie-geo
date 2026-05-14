// Effet d'ambiance — flou subtile en bas du viewport, sans tint coloré.
//
// Update 2026-05-13 : retrait du gradient blanc 90→0% qui peignait
// activement le strip et créait une bande blanche moche sur les
// sections sombres (cf. PourquoiMaintenant fond ink). Maintenant
// uniquement `backdrop-blur-md` + mask vertical → s'adapte
// nativement à la couleur de fond du contenu derrière (clair = flou
// clair, sombre = flou sombre).
//
// `pointer-events-none` pour ne jamais intercepter les clics. `z-40`
// pour rester sous les overlays modaux (z-50+).

export function BottomFade() {
  return (
    <div
      aria-hidden
      className="pointer-events-none fixed inset-x-0 bottom-0 z-40 h-20 backdrop-blur-md"
      style={{
        // Mask vertical : flou plein en bas, dégradé doux vers transparent
        // en haut → la frontière entre zone floutée et zone nette est
        // invisible côté UX.
        WebkitMaskImage:
          "linear-gradient(to top, rgba(0, 0, 0, 1) 0%, rgba(0, 0, 0, 1) 40%, rgba(0, 0, 0, 0) 100%)",
        maskImage:
          "linear-gradient(to top, rgba(0, 0, 0, 1) 0%, rgba(0, 0, 0, 1) 40%, rgba(0, 0, 0, 0) 100%)",
      }}
    />
  );
}
