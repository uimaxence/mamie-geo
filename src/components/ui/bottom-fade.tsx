// Effet d'ambiance — léger fade blanc + blur subtle en bas du viewport.
// Quand l'utilisateur scrolle, le contenu se dilue doucement en bas de
// l'écran avant de disparaître. Pattern utilisé par Linear, Vercel et
// le screenshot Max — donne une sensation premium sans bruiter le
// contenu lui-même.
//
// `pointer-events-none` pour ne jamais intercepter les clics. `z-40`
// pour rester sous les overlays modaux (z-50+).

export function BottomFade() {
  return (
    <div
      aria-hidden
      className="pointer-events-none fixed inset-x-0 bottom-0 z-40 h-20 backdrop-blur-[2px]"
      style={{
        background:
          "linear-gradient(to top, rgba(255, 255, 255, 0.9) 0%, rgba(255, 255, 255, 0.5) 50%, rgba(255, 255, 255, 0) 100%)",
        WebkitMaskImage:
          "linear-gradient(to top, rgba(0, 0, 0, 1) 0%, rgba(0, 0, 0, 1) 40%, rgba(0, 0, 0, 0) 100%)",
        maskImage:
          "linear-gradient(to top, rgba(0, 0, 0, 1) 0%, rgba(0, 0, 0, 1) 40%, rgba(0, 0, 0, 0) 100%)",
      }}
    />
  );
}
