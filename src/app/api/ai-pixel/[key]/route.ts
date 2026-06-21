import { HOST_RULES, UTM_RULES } from "@/lib/ai-traffic/detect";
import { PIXEL_KEY_REGEX } from "@/lib/ai-traffic/schemas";
import { env } from "@/lib/env";

// Sert le snippet JS d'attribution trafic IA. URL d'installation côté client :
//   <script src="https://mamie-geo.fr/api/ai-pixel/mgpx_xxx.js" defer></script>
// Le `[key]` du path = la clé publique + suffixe `.js`. On l'interpole dans le
// script (rien de secret : la clé est publique par nature). Le snippet réutilise
// EXACTEMENT les règles de détection serveur (HOST_RULES/UTM_RULES) — pas de drift.

export const runtime = "nodejs";

function buildSnippet(key: string, collectUrl: string): string {
  const hostRules = JSON.stringify(HOST_RULES.map((r) => ({ s: r.source, h: r.hosts })));
  const utmRules = JSON.stringify(UTM_RULES.map((r) => ({ s: r.source, v: r.values })));
  // Cookieless : aucune lecture/écriture de cookie ou localStorage, aucun ID.
  // Beacon à CHAQUE pageview (mesure du trafic total) ; `s` porte la source IA
  // détectée ou null (cf. doc 09 § 2026-06-21). Le serveur ventile : total +
  // sous-ensemble IA.
  return `(function(){try{
var K=${JSON.stringify(key)},U=${JSON.stringify(collectUrl)};
var H=${hostRules},M=${utmRules};
function host(r){try{return new URL(r).hostname.toLowerCase()}catch(e){return null}}
function detect(ref,p){
var u=(p.get("utm_source")||p.get("ref")||"").trim().toLowerCase();
if(u){for(var i=0;i<M.length;i++){if(M[i].v.indexOf(u)>-1)return M[i].s}}
var h=host(ref);
if(h){for(var j=0;j<H.length;j++){var hs=H[j].h;for(var k=0;k<hs.length;k++){if(h===hs[k]||h.slice(-(hs[k].length+1))==="."+hs[k])return H[j].s}}}
return null}
var s=detect(document.referrer,new URLSearchParams(location.search));
var b=JSON.stringify({k:K,s:s||null,p:location.pathname});
if(navigator.sendBeacon){navigator.sendBeacon(U,b)}
else{fetch(U,{method:"POST",body:b,keepalive:true,headers:{"Content-Type":"application/json"}})}
}catch(e){}})();`;
}

export async function GET(request: Request, { params }: { params: Promise<{ key: string }> }) {
  const { key: raw } = await params;
  const key = raw.endsWith(".js") ? raw.slice(0, -3) : raw;

  // Clé malformée → 404 (on ne sert pas de JS, mais on ne révèle rien).
  if (!PIXEL_KEY_REGEX.test(key)) {
    return new Response("// invalid key", {
      status: 404,
      headers: { "Content-Type": "application/javascript; charset=utf-8" },
    });
  }

  // En prod, la collecte vise toujours le domaine canonique. En dev, on dérive
  // l'origine de la requête pour suivre le port réel du serveur (3001/3002…),
  // sinon le beacon partirait vers `localhost:3000` figé dans l'env.
  const appUrl =
    process.env.NODE_ENV === "production"
      ? env.NEXT_PUBLIC_APP_URL
      : `${request.headers.get("x-forwarded-proto") ?? "http"}://${
          request.headers.get("x-forwarded-host") ?? request.headers.get("host") ?? "localhost:3000"
        }`;
  const collectUrl = `${appUrl}/api/ai-pixel/collect`;
  return new Response(buildSnippet(key, collectUrl), {
    status: 200,
    headers: {
      "Content-Type": "application/javascript; charset=utf-8",
      // Cache court : le snippet change rarement, mais on veut pouvoir corriger
      // les règles de détection sans attendre des heures.
      "Cache-Control": "public, max-age=3600, s-maxage=3600",
    },
  });
}
