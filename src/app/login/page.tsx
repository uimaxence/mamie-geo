import { Suspense } from "react";
import { env } from "@/lib/env";
import { LoginContent } from "./login-content";

// Login en split panel asymétrique (cf. doc 09 § PR 11b, ref BrightNest
// signup). 2026-05-26 : converti en server component pour lire l'env
// serveur et passer `googleEnabled` au client component LoginContent.
// Toute la logique form vit dans login-content.tsx ("use client").

export default function LoginPage() {
  const googleEnabled = Boolean(env.GOOGLE_CLIENT_ID && env.GOOGLE_CLIENT_SECRET);

  return (
    <Suspense fallback={<LoginFallback />}>
      <LoginContent googleEnabled={googleEnabled} />
    </Suspense>
  );
}

function LoginFallback() {
  return <main className="grid min-h-screen grid-cols-1 md:grid-cols-2" />;
}
