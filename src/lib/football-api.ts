// Football Data API v4 Integration
// API Docs: https://www.football-data.org/documentation/api
// Get free API key: https://www.football-data.org/client/register

const FOOTBALL_API_BASE = "https://api.football-data.org/v4";

// Competition IDs available on free tier
export const LEAGUE_API_MAP: Record<string, { fdId: number; name: string }> = {
  "premier-league": { fdId: 2021, name: "Premier League" },
  "la-liga":         { fdId: 2014, name: "La Liga" },
  "ligue-1":         { fdId: 2015, name: "Ligue 1" },
  "serie-a":         { fdId: 2019, name: "Serie A" },
  "bundesliga":      { fdId: 2002, name: "Bundesliga" },
  "world-cup":       { fdId: 2000, name: "FIFA World Cup" },
};

export interface FDTeam {
  id: number;
  name: string;
  shortName: string;
  tla: string;
  crest: string;
}

export interface FDMatch {
  id: number;
  competition: { id: number; name: string; emblem: string };
  homeTeam: FDTeam;
  awayTeam: FDTeam;
  score: {
    winner: string | null;
    duration: string;
    fullTime: { home: number | null; away: number | null };
    halfTime: { home: number | null; away: number | null };
  };
  status: string;
  utcDate: string;
  matchday: number | null;
  venue: string | null;
}

export function fdStatusToOurStatus(status: string): "live" | "finished" | "upcoming" {
  if (["IN_PLAY", "PAUSED", "HALFTIME"].includes(status)) return "live";
  if (["FINISHED", "AWARDED"].includes(status)) return "finished";
  return "upcoming";
}

export function transformFDMatch(m: FDMatch): Record<string, unknown> {
  const status = fdStatusToOurStatus(m.status);
  const homeName = m.homeTeam?.shortName || m.homeTeam?.tla || m.homeTeam?.name || "Home";
  const awayName = m.awayTeam?.shortName || m.awayTeam?.tla || m.awayTeam?.name || "Away";

  return {
    id: `fd-${m.id}`,
    externalId: m.id,
    homeTeamAr: homeName,
    homeTeamFr: homeName,
    homeTeamEn: homeName,
    awayTeamAr: awayName,
    awayTeamFr: awayName,
    awayTeamEn: awayName,
    homeScore: m.score?.fullTime?.home ?? null,
    awayScore: m.score?.fullTime?.away ?? null,
    status,
    matchDate: m.utcDate?.split("T")[0] || null,
    matchTime: m.utcDate ? m.utcDate.split("T")[1]?.substring(0, 5) : null,
    homeCrest: m.homeTeam?.crest || null,
    awayCrest: m.awayTeam?.crest || null,
    competition: m.competition?.name || "",
    competitionEmblem: m.competition?.emblem || null,
    venue: m.venue || null,
    source: "api",
  };
}

// Fetch matches from football-data.org
export async function fetchFDMatches(
  apiKey: string,
  competitionId?: number,
  status?: string,
  dateFrom?: string,
  dateTo?: string
): Promise<FDMatch[]> {
  let url: string;
  const params: string[] = [];

  if (competitionId) {
    url = `${FOOTBALL_API_BASE}/competitions/${competitionId}/matches`;
  } else {
    url = `${FOOTBALL_API_BASE}/matches`;
  }

  if (dateFrom) params.push(`dateFrom=${dateFrom}`);
  if (dateTo) params.push(`dateTo=${dateTo}`);
  if (status) params.push(`status=${status}`);

  if (params.length > 0) {
    url += `?${params.join("&")}`;
  }

  try {
    const res = await fetch(url, {
      headers: { "X-Auth-Token": apiKey },
      next: { revalidate: 60 },
    });

    if (!res.ok) {
      const errorText = await res.text();
      console.error(`Football API error: ${res.status} ${res.statusText}`, errorText);
      return [];
    }

    const data = await res.json();
    return data.matches || [];
  } catch (err) {
    console.error("Football API fetch error:", err);
    return [];
  }
}

// Get date range for current week
export function getWeekDateRange(): { dateFrom: string; dateTo: string } {
  const now = new Date();
  const dateFrom = new Date(now);
  dateFrom.setDate(dateFrom.getDate() - 3);
  const dateTo = new Date(now);
  dateTo.setDate(dateTo.getDate() + 10);

  return {
    dateFrom: dateFrom.toISOString().split("T")[0],
    dateTo: dateTo.toISOString().split("T")[0],
  };
}
