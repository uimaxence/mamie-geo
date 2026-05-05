import { toNextJsHandler } from "better-auth/next-js";
import { auth } from "@/lib/auth";

// Catch-all route Better Auth (sign-in, sign-out, magic-link verification…).
// cf. geo-project/03-architecture-technique.md § Domaine et routes
export const { GET, POST } = toNextJsHandler(auth.handler);
