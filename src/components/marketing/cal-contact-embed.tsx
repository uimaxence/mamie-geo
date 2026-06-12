import Script from "next/script";

// Embed Cal.com inline pour /contact (réservation de l'appel découverte
// accompagnement). Même snippet officiel que CalSupportEmbed (app),
// mais en mode inline : le calendrier se rend directement dans la div
// #cal-contact-inline au lieu d'une modal au clic.
//
// ⚠️ CAL_CONTACT_LINK pointe pour l'instant sur l'event « support »
// existant (seul lien Cal fourni à date, 2026-06-12). À remplacer par
// l'event dédié « appel découverte » dès que Max le crée — une seule
// constante à changer.

export const CAL_CONTACT_NAMESPACE = "contact-mamie-geo";
export const CAL_CONTACT_LINK = "mc.maxence/support-mamie-geo";

export function CalContactEmbed() {
  return (
    <>
      <div
        id="cal-contact-inline"
        className="min-h-[560px] w-full overflow-hidden rounded-[var(--radius-xl)] border border-[color:var(--color-border)] bg-white"
      />
      <Script id="cal-contact-embed" strategy="afterInteractive">
        {`(function (C, A, L) { let p = function (a, ar) { a.q.push(ar); }; let d = C.document; C.Cal = C.Cal || function () { let cal = C.Cal; let ar = arguments; if (!cal.loaded) { cal.ns = {}; cal.q = cal.q || []; d.head.appendChild(d.createElement("script")).src = A; cal.loaded = true; } if (ar[0] === L) { const api = function () { p(api, arguments); }; const namespace = ar[1]; api.q = api.q || []; if(typeof namespace === "string"){cal.ns[namespace] = cal.ns[namespace] || api;p(cal.ns[namespace], ar);p(cal, ["initNamespace", namespace]);} else p(cal, ar); return;} p(cal, ar); }; })(window, "https://app.cal.com/embed/embed.js", "init");
Cal("init", "${CAL_CONTACT_NAMESPACE}", {origin:"https://app.cal.com"});
Cal.ns["${CAL_CONTACT_NAMESPACE}"]("inline", {
  elementOrSelector: "#cal-contact-inline",
  config: {"layout":"month_view","useSlotsViewOnSmallScreen":"true"},
  calLink: "${CAL_CONTACT_LINK}",
});
Cal.ns["${CAL_CONTACT_NAMESPACE}"]("ui", {"cssVarsPerTheme":{"light":{"cal-brand":"#339CFF"},"dark":{"cal-brand":"#dbeeff"}},"hideEventTypeDetails":false,"layout":"month_view"});`}
      </Script>
    </>
  );
}
