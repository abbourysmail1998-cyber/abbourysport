import { NextResponse } from "next/server";
import {
  fetchAllLeaguesMatches,
  fetchTSDBAllMatches,
  transformTSDBEvent,
  TSDB_LEAGUE_MAP,
} from "@/lib/thesportsdb-api";
import { db } from "@/db";
import { matches, leagues } from "@/db/schema";
import { eq } from "drizzle-orm";

export const dynamic = "force-dynamic";
export const revalidate = 30;

export async function GET(request: Request) {
  try {
    const { searchParams } = new URL(request.url);
    const slug = searchParams.get("slug");
    const status = searchParams.get("status");
    const mode = searchParams.get("mode");

    // If mode=db, return database matches only
    if (mode === "db") {
      return await getDatabaseMatches(slug, status);
    }

    // Try TheSportsDB API (FREE, no key required!)
    try {
      let apiMatches: Record<string, unknown>[] = [];

      if (slug && TSDB_LEAGUE_MAP[slug]) {
        // Fetch for specific league
        const leagueInfo = TSDB_LEAGUE_MAP[slug];
        const tsdbEvents = await fetchTSDBAllMatches(leagueInfo.tsdbId);
        apiMatches = tsdbEvents.map(transformTSDBEvent);
      } else {
        // Fetch all leagues
        const tsdbEvents = await fetchAllLeaguesMatches();
        apiMatches = tsdbEvents.map(transformTSDBEvent);
      }

      // Filter by status if needed
      if (status && apiMatches.length > 0) {
        apiMatches = apiMatches.filter((m) => m.status === status);
      }

      if (apiMatches.length > 0) {
        // Also get DB matches for any additional data
        const dbMatches = await getDatabaseMatchesRaw(slug, status);
        // Combine, avoiding duplicates (API matches take priority)
        const apiIds = new Set(apiMatches.map((m) => m.id));
        const uniqueDbMatches = dbMatches.filter((m) => !apiIds.has(m.id));

        return NextResponse.json({
          source: "api",
          matches: [...apiMatches, ...uniqueDbMatches],
        });
      }
    } catch (err) {
      console.error("API fetch failed, falling back to database:", err);
    }

    // Fallback to database
    return await getDatabaseMatches(slug, status);
  } catch (error) {
    console.error("Football route error:", error);
    return NextResponse.json({ source: "error", matches: [] }, { status: 500 });
  }
}

async function getDatabaseMatches(slug: string | null, status: string | null) {
  const allMatches = await getDatabaseMatchesRaw(slug, status);
  return NextResponse.json({ source: "database", matches: allMatches });
}

async function getDatabaseMatchesRaw(slug: string | null, status: string | null): Promise<Record<string, unknown>[]> {
  try {
    let leagueId: number | undefined;
    if (slug) {
      const leagueList = await db.select().from(leagues);
      const league = leagueList.find((l) => l.slug === slug);
      if (league) leagueId = league.id;
    }

    if (leagueId && status) {
      const result = await db.select().from(matches).where(eq(matches.leagueId, leagueId));
      return result.filter(m => m.status === status) as unknown as Record<string, unknown>[];
    } else if (leagueId) {
      const result = await db.select().from(matches).where(eq(matches.leagueId, leagueId));
      return result as unknown as Record<string, unknown>[];
    } else if (status) {
      const result = await db.select().from(matches);
      return result.filter(m => m.status === status) as unknown as Record<string, unknown>[];
    } else {
      const result = await db.select().from(matches);
      return result as unknown as Record<string, unknown>[];
    }
  } catch {
    return [];
  }
}
