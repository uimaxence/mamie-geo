import { desc, eq } from "drizzle-orm";
import { db } from "@/db/client";
import { competitors } from "@/db/schema";
import { getUserContext } from "@/lib/auth/user-context";

// Queries pour la page /app/competitors.

export interface CompetitorRow {
  id: string;
  name: string;
  domain: string | null;
  aliases: string[];
  createdAt: Date;
}

export interface CompetitorListResult {
  competitors: CompetitorRow[];
  total: number;
  brandId: string;
  plan: string;
}

export async function listCompetitors(userId: string): Promise<CompetitorListResult | null> {
  const ctx = await getUserContext(userId);
  if (!ctx) return null;

  const rows = await db
    .select({
      id: competitors.id,
      name: competitors.name,
      domain: competitors.domain,
      aliases: competitors.aliases,
      createdAt: competitors.createdAt,
    })
    .from(competitors)
    .where(eq(competitors.brandId, ctx.brand.id))
    .orderBy(desc(competitors.createdAt));

  return {
    competitors: rows,
    total: rows.length,
    brandId: ctx.brand.id,
    plan: ctx.workspace.plan,
  };
}
