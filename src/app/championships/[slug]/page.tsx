"use client";

import { useEffect, useState, useCallback } from "react";
import { useParams } from "next/navigation";
import MainLayout from "@/components/MainLayout";
import MatchCard from "@/components/MatchCard";
import { useLocale } from "@/lib/LocaleContext";
import { getLocalizedField } from "@/lib/helpers";
import { Trophy, ArrowRight, RefreshCw } from "lucide-react";
import Link from "next/link";

interface League {
  id: number;
  nameAr: string;
  nameFr: string;
  nameEn: string;
  slug: string;
}

interface Match {
  [key: string]: unknown;
}

const leagueIcons: Record<string, string> = {
  "world-cup": "🏆", "premier-league": "🦁", "la-liga": "🐂",
  "ligue-1": "🐓", "serie-a": "🏟️", "bundesliga": "⚽",
  "moroccan-league": "🇲🇦", "egyptian-league": "🇪🇬", "algerian-league": "🇩🇿",
};

const leagueColors: Record<string, string> = {
  "world-cup": "from-yellow-500 to-amber-600",
  "premier-league": "from-purple-600 to-purple-800",
  "la-liga": "from-red-500 to-orange-600",
  "ligue-1": "from-blue-500 to-blue-700",
  "serie-a": "from-green-500 to-emerald-700",
  "bundesliga": "from-red-600 to-red-800",
  "moroccan-league": "from-red-500 to-green-700",
  "egyptian-league": "from-red-500 to-red-700",
  "algerian-league": "from-green-500 to-green-700",
};

export default function ChampionshipDetailPage() {
  const { slug } = useParams<{ slug: string }>();
  const { locale, t } = useLocale();
  const [league, setLeague] = useState<League | null>(null);
  const [matches, setMatches] = useState<Match[]>([]);
  const [activeTab, setActiveTab] = useState<"all" | "live" | "finished" | "upcoming">("all");
  const [source, setSource] = useState<string>("database");
  const [refreshing, setRefreshing] = useState(false);

  useEffect(() => {
    fetch("/api/leagues").then(r => r.json()).then((leagues: League[]) => {
      const found = leagues.find((l) => l.slug === slug);
      setLeague(found || null);
    }).catch(() => {});
  }, [slug]);

  const loadMatches = useCallback(async () => {
    if (!league) return;
    setRefreshing(true);
    try {
      const res = await fetch(`/api/football?slug=${slug}`);
      const data = await res.json();
      if (data.matches && data.matches.length > 0) {
        setMatches(data.matches);
        setSource(data.source);
      } else {
        const dbRes = await fetch(`/api/matches?leagueId=${league.id}`);
        const dbData = await dbRes.json();
        setMatches(dbData);
        setSource("database");
      }
    } catch {
      try {
        const dbRes = await fetch(`/api/matches?leagueId=${league.id}`);
        const dbData = await dbRes.json();
        setMatches(dbData);
        setSource("database");
      } catch {}
    }
    setRefreshing(false);
  }, [league, slug]);

  useEffect(() => { loadMatches(); }, [loadMatches]);

  useEffect(() => {
    const interval = setInterval(loadMatches, 30000);
    return () => clearInterval(interval);
  }, [loadMatches]);

  if (!league) {
    return (
      <MainLayout>
        <div className="min-h-[50vh] flex items-center justify-center">
          <div className="text-center">
            <Trophy className="w-16 h-16 text-gray-300 dark:text-gray-600 mx-auto mb-4" />
            <p className="text-gray-400 dark:text-gray-500 text-lg">Loading...</p>
          </div>
        </div>
      </MainLayout>
    );
  }

  const gradient = leagueColors[league.slug] || "from-green-500 to-green-700";
  const icon = leagueIcons[league.slug] || "⚽";

  const filteredMatches = activeTab === "all"
    ? matches
    : matches.filter((m) => m.status === activeTab);

  const tabs = [
    { key: "all" as const, label: locale === "ar" ? "الكل" : locale === "fr" ? "Tous" : "All" },
    { key: "live" as const, label: t("live") },
    { key: "finished" as const, label: t("finished") },
    { key: "upcoming" as const, label: t("upcoming") },
  ];

  return (
    <MainLayout>
      {/* Championship Hero Header */}
      <div className={`relative h-[40vh] md:h-[45vh] overflow-hidden`}>
        <div className={`absolute inset-0 bg-gradient-to-br ${gradient}`}>
          <div className="absolute inset-0 bg-[url('/images/bg-pattern.jpg')] bg-cover bg-center opacity-10" />
          <div className="absolute inset-0 bg-gradient-to-t from-black/60 via-transparent to-black/30" />
          {/* Decorative circles */}
          <div className="absolute top-10 end-10 w-40 h-40 bg-white/5 rounded-full blur-2xl" />
          <div className="absolute bottom-10 start-10 w-60 h-60 bg-white/5 rounded-full blur-3xl" />
        </div>
        <div className="absolute inset-0 flex flex-col items-center justify-center text-white z-10">
          <Link href="/championships" className="absolute top-6 start-6 flex items-center gap-1 text-white/70 hover:text-white text-sm transition-colors">
            <ArrowRight className="w-4 h-4 rtl:rotate-180" />
            {t("championships")}
          </Link>
          <button onClick={loadMatches} className="absolute top-6 end-6 z-20 p-3 bg-white/10 backdrop-blur-sm rounded-xl hover:bg-white/20 transition-all text-white" title="Refresh">
            <RefreshCw className={`w-5 h-5 ${refreshing ? "animate-spin-slow" : ""}`} />
          </button>
          <div className="flex items-center gap-5">
            <span className="text-7xl md:text-8xl drop-shadow-lg">{icon}</span>
            <div>
              <h1 className="text-4xl md:text-6xl font-black drop-shadow-lg">
                {getLocalizedField(league as unknown as Record<string, unknown>, "name", locale)}
              </h1>
              <p className="text-white/80 mt-2 text-lg flex items-center gap-2">
                {locale === "ar" ? "مباريات البطولة" : locale === "fr" ? "Matchs du championnat" : "Championship Matches"}
                <span className={`w-2 h-2 rounded-full ${source === "api" ? "bg-green-400" : "bg-yellow-400"}`} />
              </p>
            </div>
          </div>
        </div>
      </div>

      <div className="max-w-7xl mx-auto px-4 py-8">
        <div className="flex gap-2 mb-6 overflow-x-auto pb-2">
          {tabs.map((tab) => (
            <button
              key={tab.key}
              onClick={() => setActiveTab(tab.key)}
              className={`px-5 py-2.5 rounded-xl font-bold text-sm whitespace-nowrap transition-all ${
                activeTab === tab.key
                  ? `bg-gradient-to-l ${gradient} text-white shadow-md`
                  : "bg-white dark:bg-gray-800 text-gray-600 dark:text-gray-300 hover:bg-gray-50 dark:hover:bg-gray-700 border border-gray-200 dark:border-gray-700"
              }`}
            >
              {tab.label}
            </button>
          ))}
        </div>

        {filteredMatches.length > 0 ? (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
            {filteredMatches.map((match) => (
              <MatchCard key={String(match.id)} match={match} />
            ))}
          </div>
        ) : (
          <div className="text-center py-16 bg-white dark:bg-gray-800 rounded-xl shadow-sm border border-gray-100 dark:border-gray-700">
            <Trophy className="w-16 h-16 text-gray-300 dark:text-gray-600 mx-auto mb-4" />
            <p className="text-gray-400 dark:text-gray-500 text-lg">{t("noMatches")}</p>
          </div>
        )}
      </div>
    </MainLayout>
  );
}
