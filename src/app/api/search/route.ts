import { NextResponse } from "next/server";
import { db } from "@/db";
import { matches, articles, leagues } from "@/db/schema";
import { ilike, or } from "drizzle-orm";

export async function GET(request: Request) {
  try {
    const { searchParams } = new URL(request.url);
    const q = searchParams.get("q") || "";

    if (!q || q.length < 1) {
      return NextResponse.json({ matches: [], articles: [], leagues: [] });
    }

    const matchingMatches = await db.select().from(matches).where(
      or(
        ilike(matches.homeTeamAr, `%${q}%`),
        ilike(matches.homeTeamFr, `%${q}%`),
        ilike(matches.homeTeamEn, `%${q}%`),
        ilike(matches.awayTeamAr, `%${q}%`),
        ilike(matches.awayTeamFr, `%${q}%`),
        ilike(matches.awayTeamEn, `%${q}%`)
      )
    );

    const matchingArticles = await db.select().from(articles).where(
      or(
        ilike(articles.titleAr, `%${q}%`),
        ilike(articles.titleFr, `%${q}%`),
        ilike(articles.titleEn, `%${q}%`)
      )
    );

    const matchingLeagues = await db.select().from(leagues).where(
      or(
        ilike(leagues.nameAr, `%${q}%`),
        ilike(leagues.nameFr, `%${q}%`),
        ilike(leagues.nameEn, `%${q}%`)
      )
    );

    return NextResponse.json({
      matches: matchingMatches,
      articles: matchingArticles,
      leagues: matchingLeagues,
    });
  } catch (error) {
    console.error("Error searching:", error);
    return NextResponse.json({ matches: [], articles: [], leagues: [] });
  }
}
