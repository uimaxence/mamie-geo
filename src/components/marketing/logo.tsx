// Logo Mamie GEO, SVG inline (zéro HTTP roundtrip, color customisable
// via prop, pas de CLS au load).
//
// Forme stylisée bleue `#329CFF` (couleur de marque actée 2026-05-13).
// Source originale : "Vector 7.svg" fourni par Max. Le viewBox 0 0
// 541 524 ≈ ratio 1.03:1 (quasi-carré).

export interface LogoProps {
  /** Taille en px du carré contenant (le SVG s'adapte au ratio interne). */
  size?: number;
  /** Couleur override. Par défaut : bleu de marque `#329CFF`. */
  color?: string;
  className?: string;
  ariaLabel?: string;
}

export function Logo({
  size = 28,
  color = "#329CFF",
  className,
  ariaLabel = "Mamie GEO",
}: LogoProps) {
  return (
    <svg
      width={size}
      height={size}
      viewBox="0 0 541 524"
      fill="none"
      xmlns="http://www.w3.org/2000/svg"
      aria-label={ariaLabel}
      role="img"
      className={className}
    >
      <path
        d="M507.944 18.6203L460.634 141.219C458.596 146.499 453.52 149.981 447.861 149.981H269.31C237.156 149.981 169.239 167.095 154.801 235.551C142.532 293.726 174.786 332.8 200.347 350.863C206.857 355.464 215.508 352.141 218.46 344.736L282.364 184.429C284.44 179.223 289.478 175.808 295.082 175.808H527.264C534.826 175.808 540.956 181.937 540.956 189.499V510.309C540.956 517.87 534.826 524 527.264 524H401.243C393.682 524 387.552 517.87 387.552 510.309V409.912C387.552 394.802 366.672 390.831 361.125 404.886L317.537 515.335C315.473 520.564 310.423 524 304.801 524H238.193C135.198 520.577 -35.9424 407.936 6.68714 196.656C44.0268 48.8527 181.146 1.24466 238.193 0H495.17C504.785 0 511.405 9.65028 507.944 18.6203Z"
        fill={color}
      />
    </svg>
  );
}
