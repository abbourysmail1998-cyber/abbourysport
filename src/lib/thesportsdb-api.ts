// TheSportsDB API - FREE, No API Key Required!
// Docs: https://www.thesportsdb.com/free_sports_api

const TSDB_BASE = "https://www.thesportsdb.com/api/v1/json/3";

// League IDs in TheSportsDB
export const TSDB_LEAGUE_MAP: Record<string, { tsdbId: number; name: string }> = {
  "premier-league": { tsdbId: 4328, name: "Premier League" },
  "la-liga":         { tsdbId: 4335, name: "La Liga" },
  "ligue-1":         { tsdbId: 4334, name: "Ligue 1" },
  "serie-a":         { tsdbId: 4332, name: "Serie A" },
  "bundesliga":      { tsdbId: 4331, name: "Bundesliga" },
  "world-cup":       { tsdbId: 4429, name: "FIFA World Cup" },
  "moroccan-league": { tsdbId: 4569, name: "Botola Pro" },
  "egyptian-league": { tsdbId: 4566, name: "Egyptian Premier League" },
  "algerian-league": { tsdbId: 4557, name: "Algerian Ligue 1" },
};

export interface TSDBEvent {
  idEvent: string;
  strEvent: string;
  strEventAlternate: string;
  strSport: string;
  idLeague: string;
  strLeague: string;
  strLeagueBadge: string;
  strSeason: string;
  strHomeTeam: string;
  strAwayTeam: string;
  intHomeScore: string | null;
  intAwayScore: string | null;
  intRound: string | null;
  dateEvent: string;
  strTime: string | null;
  strTimestamp: string | null;
  strStatus: string | null;
  strHomeTeamBadge: string | null;
  strAwayTeamBadge: string | null;
  strVenue: string | null;
  strCountry: string | null;
  strThumb: string | null;
  strPoster: string | null;
}

export function tsdbStatusToOurStatus(status: string | null, dateEvent: string): "live" | "finished" | "upcoming" {
  if (!status) {
    // If no status, check date
    const eventDate = new Date(dateEvent);
    const now = new Date();
    if (eventDate > now) return "upcoming";
    return "finished";
  }
  const s = status.toUpperCase();
  if (["FT", "AET", "PEN", "WO", "AWARDED"].includes(s)) return "finished";
  if (["1H", "2H", "HT", "ET", "P", "BT", "LIVE", "SUSP", "INT", "PST"].includes(s)) return "live";
  if (["NS", "TBD", "CANCL"].includes(s)) return "upcoming";
  // Default: check date
  const eventDate = new Date(dateEvent);
  const now = new Date();
  if (eventDate > now) return "upcoming";
  return "finished";
}

export function transformTSDBEvent(event: TSDBEvent): Record<string, unknown> {
  const status = tsdbStatusToOurStatus(event.strStatus, event.dateEvent);
  const homeScore = event.intHomeScore ? parseInt(event.intHomeScore) : null;
  const awayScore = event.intAwayScore ? parseInt(event.intAwayScore) : null;
  const matchTime = event.strTime ? event.strTime.substring(0, 5) : null;

  return {
    id: `tsdb-${event.idEvent}`,
    externalId: event.idEvent,
    homeTeamAr: event.strHomeTeam,
    homeTeamFr: event.strHomeTeam,
    homeTeamEn: event.strHomeTeam,
    awayTeamAr: event.strAwayTeam,
    awayTeamFr: event.strAwayTeam,
    awayTeamEn: event.strAwayTeam,
    homeScore,
    awayScore,
    status,
    matchDate: event.dateEvent || null,
    matchTime,
    homeCrest: event.strHomeTeamBadge || null,
    awayCrest: event.strAwayTeamBadge || null,
    competition: event.strLeague || "",
    competitionBadge: event.strLeagueBadge || null,
    venue: event.strVenue || null,
    round: event.intRound || null,
    season: event.strSeason || null,
    source: "api",
  };
}

// Fetch next (upcoming) events for a league
export async function fetchTSDBNextEvents(leagueId: number): Promise<TSDBEvent[]> {
  try {
    const res = await fetch(`${TSDB_BASE}/eventsnextleague.php?id=${leagueId}`, {
      next: { revalidate: 300 },
    });
    if (!res.ok) return [];
    const data = await res.json();
    return data.events || [];
  } catch (err) {
    console.error("TSDB fetch next error:", err);
    return [];
  }
}

// Fetch past (finished) events for a league
export async function fetchTSDBPastEvents(leagueId: number): Promise<TSDBEvent[]> {
  try {
    const res = await fetch(`${TSDB_BASE}/eventspastleague.php?id=${leagueId}`, {
      next: { revalidate: 300 },
    });
    if (!res.ok) return [];
    const data = await res.json();
    return data.events || [];
  } catch (err) {
    console.error("TSDB fetch past error:", err);
    return [];
  }
}

// Fetch events on a specific day
export async function fetchTSDBEventsDay(date: string, leagueId?: number): Promise<TSDBEvent[]> {
  try {
    let url = `${TSDB_BASE}/eventsday.php?d=${date}`;
    if (leagueId) url += `&l=${leagueId}`;
    const res = await fetch(url, { next: { revalidate: 60 } });
    if (!res.ok) return [];
    const data = await res.json();
    return data.events || [];
  } catch (err) {
    console.error("TSDB fetch day error:", err);
    return [];
  }
}

// Fetch all matches (past + next) for a league
export async function fetchTSDBAllMatches(leagueId: number): Promise<TSDBEvent[]> {
  const [past, next] = await Promise.all([
    fetchTSDBPastEvents(leagueId),
    fetchTSDBNextEvents(leagueId),
  ]);
  return [...past, ...next];
}

// Fetch all matches across all supported leagues
export async function fetchAllLeaguesMatches(): Promise<TSDBEvent[]> {
  const promises = Object.values(TSDB_LEAGUE_MAP).map((league) =>
    fetchTSDBAllMatches(league.tsdbId)
  );
  const results = await Promise.all(promises);
  return results.flat();
}
