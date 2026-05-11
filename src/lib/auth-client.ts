import { createAuthClient } from "better-auth/react";
import { magicLinkClient } from "better-auth/client/plugins";

// Client Better Auth — utilisé dans les composants `"use client"`.
//
// Pas de baseURL hardcodée : on laisse Better Auth utiliser le
// domaine courant (window.location.origin). Comme ça le client marche
// sur n'importe quel domaine (mamie-geo.fr en prod, *.vercel.app en
// preview, localhost en dev) sans dépendre d'une variable d'env
// `NEXT_PUBLIC_APP_URL` qui est gelée au build (et qui causait des
// "Failed to fetch" quand le domaine déployé ne matchait pas).

export const authClient = createAuthClient({
  plugins: [magicLinkClient()],
});
