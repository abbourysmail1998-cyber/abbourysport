import { NextResponse } from "next/server";
import {
  fetchTSDBAllMatches,
  transformTSDBEvent,
  TSDB_LEAGUE_MAP,
} from "@/lib/thesportsdb-api";
import { db } from "@/db";
import { matches, leagues } from "@/db/schema";
import { eq } from "drizzle-orm";

export async function POST(request: Request) {
  try {
    const body = await request.json().catch(() => ({}));
    const source = body.source || "thesportsdb"; // "thesportsdb" or "footballdata"

    // If source is footballdata, try football-data.org
    if (source === "footballdata") {
      return await syncFromFootballDataOrg(body.apiKey);
    }

    // Default: Sync from TheSportsDB (FREE, no key required!)
    return await syncFromTheSportsDB();
  } catch (error) {
    console.error("Sync error:", error);
    return NextResponse.json({ error: "Sync failed", details: String(error) }, { status: 500 });
  }
}

async function syncFromTheSportsDB() {
  let totalSynced = 0;
  const errors: string[] = [];

  for (const [slug, info] of Object.entries(TSDB_LEAGUE_MAP)) {
    try {
      const tsdbEvents = await fetchTSDBAllMatches(info.tsdbId);
      if (tsdbEvents.length === 0) continue;

      // Find corresponding league in our database
      const leagueList = await db.select().from(leagues);
      const league = leagueList.find((l) => l.slug === slug);
      if (!league) {
        errors.push(`League not found in DB: ${slug}`);
        continue;
      }

      for (const event of tsdbEvents) {
        const transformed = transformTSDBEvent(event);
        const matchData = {
          leagueId: league.id,
          homeTeamAr: (transformed.homeTeamEn as string) || "",
          homeTeamFr: (transformed.homeTeamEn as string) || "",
          homeTeamEn: (transformed.homeTeamEn as string) || "",
          awayTeamAr: (transformed.awayTeamEn as string) || "",
          awayTeamFr: (transformed.awayTeamEn as string) || "",
          awayTeamEn: (transformed.awayTeamEn as string) || "",
          homeScore: transformed.homeScore as number | null,
          awayScore: transformed.awayScore as number | null,
          status: transformed.status as string,
          matchDate: transformed.matchDate ? new Date(transformed.matchDate as string) : null,
          matchTime: (transformed.matchTime as string) || null,
        };

        try {
          // Check if match already exists by teams and date
          const existing = await db.select().from(matches)
            .where(eq(matches.leagueId, league.id));
          
          const duplicate = existing.find(m => 
            m.homeTeamEn === matchData.homeTeamEn && 
            m.awayTeamEn === matchData.awayTeamEn &&
            m.matchDate?.toDateString() === new Date(matchData.matchDate || "").toDateString()
          );

          if (duplicate) {
            await db.update(matches).set(matchData).where(eq(matches.id, duplicate.id));
          } else {
            await db.insert(matches).values(matchData);
          }
          totalSynced++;
        } catch (err) {
          // Skip duplicates silently
        }
      }
    } catch (err) {
      const msg = `Error syncing ${slug}: ${err}`;
      errors.push(msg);
      console.error(msg);
    }
  }

  return NextResponse.json({
    success: true,
    synced: totalSynced,
    source: "thesportsdb",
    errors: errors.length > 0 ? errors : undefined,
    message: totalSynced > 0
      ? `✅ تم مزامنة ${totalSynced} مباراة حقيقية من ${Object.keys(TSDB_LEAGUE_MAP).length} دوري! / Synced ${totalSynced} real matches from ${Object.keys(TSDB_LEAGUE_MAP).length} leagues!`
      : "No new matches found to sync. Leagues may be in off-season.",
  });
}

async function syncFromFootballDataOrg(apiKey?: string) {
  const key = apiKey || process.env.FOOTBALL_API_KEY;
  if (!key) {
    return NextResponse.json({ error: "Football-data.org API key required. Get one free at: https://www.football-data.org/client/register" }, { status: 400 });
  }

  // Save API key
  if (apiKey) {
    try {
      const { siteSettings } = await import("@/db/schema");
      const existing = await db.select().from(siteSettings).where(eq(siteSettings.key, "football_api_key"));
      if (existing.length > 0) {
        await db.update(siteSettings).set({ value: apiKey }).where(eq(siteSettings.key, "football_api_key"));
      } else {
        await db.insert(siteSettings).values({ key: "football_api_key", value: apiKey, category: "api" });
      }
    } catch {}
  }

  return NextResponse.json({
    success: false,
    message: "Football-data.org sync is available but TheSportsDB is recommended (no key needed). Use source=thesportsdb instead.",
  });
}
