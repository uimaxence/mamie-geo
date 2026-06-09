import Script from "next/script";

// Embed Cal.com (element-click) pour le lien "Support" du menu app.
// Le script pose un listener de clic délégué sur le document : tout
// élément portant `data-cal-link` + `data-cal-namespace` ouvre la modal
// de réservation, sans logique JS supplémentaire côté nos composants.
//
// Monté une seule fois dans le layout (app). Constantes Cal côté lib pour
// les réutiliser sur l'élément déclencheur (cf. CAL_SUPPORT_*).
//
// Snippet officiel fourni par le dashboard Cal — laissé verbatim (init +
// ui), injecté via next/script `afterInteractive` pour ne pas bloquer le
// rendu de l'app.

export const CAL_SUPPORT_NAMESPACE = "support-mamie-geo";
export const CAL_SUPPORT_LINK = "mc.maxence/support-mamie-geo";
export const CAL_SUPPORT_CONFIG = '{"layout":"month_view","useSlotsViewOnSmallScreen":"true"}';

export function CalSupportEmbed() {
  return (
    <Script id="cal-support-embed" strategy="afterInteractive">
      {`(function (C, A, L) { let p = function (a, ar) { a.q.push(ar); }; let d = C.document; C.Cal = C.Cal || function () { let cal = C.Cal; let ar = arguments; if (!cal.loaded) { cal.ns = {}; cal.q = cal.q || []; d.head.appendChild(d.createElement("script")).src = A; cal.loaded = true; } if (ar[0] === L) { const api = function () { p(api, arguments); }; const namespace = ar[1]; api.q = api.q || []; if(typeof namespace === "string"){cal.ns[namespace] = cal.ns[namespace] || api;p(cal.ns[namespace], ar);p(cal, ["initNamespace", namespace]);} else p(cal, ar); return;} p(cal, ar); }; })(window, "https://app.cal.com/embed/embed.js", "init");
Cal("init", "${CAL_SUPPORT_NAMESPACE}", {origin:"https://app.cal.com"});
Cal.ns["${CAL_SUPPORT_NAMESPACE}"]("ui", {"cssVarsPerTheme":{"light":{"cal-brand":"#339CFF"},"dark":{"cal-brand":"#dbeeff"}},"hideEventTypeDetails":false,"layout":"month_view"});`}
    </Script>
  );
}
