"use client";

import { useEffect, useState, useCallback } from "react";
import MainLayout from "@/components/MainLayout";
import MatchCard from "@/components/MatchCard";
import { useLocale } from "@/lib/LocaleContext";
import { Zap, CheckCircle, Calendar, RefreshCw } from "lucide-react";

interface Match {
  [key: string]: unknown;
}

export default function MatchesPage() {
  const { t } = useLocale();
  const [activeTab, setActiveTab] = useState<"live" | "finished" | "upcoming">("live");
  const [matches, setMatches] = useState<Match[]>([]);
  const [source, setSource] = useState<string>("database");
  const [refreshing, setRefreshing] = useState(false);

  const loadMatches = useCallback(async () => {
    setRefreshing(true);
    try {
      const res = await fetch(`/api/football?status=${activeTab}`);
      const data = await res.json();
      if (data.matches && data.matches.length > 0) {
        setMatches(data.matches);
        setSource(data.source);
      } else {
        const dbRes = await fetch(`/api/matches?status=${activeTab}`);
        const dbData = await dbRes.json();
        setMatches(dbData);
        setSource("database");
      }
    } catch {
      try {
        const dbRes = await fetch(`/api/matches?status=${activeTab}`);
        const dbData = await dbRes.json();
        setMatches(dbData);
        setSource("database");
      } catch {}
    }
    setRefreshing(false);
  }, [activeTab]);

  useEffect(() => { loadMatches(); }, [loadMatches]);

  useEffect(() => {
    if (activeTab !== "live") return;
    const interval = setInterval(loadMatches, 30000);
    return () => clearInterval(interval);
  }, [activeTab, loadMatches]);

  const tabs = [
    { key: "live" as const, label: t("liveMatches"), icon: Zap, color: "from-red-500 to-red-600" },
    { key: "finished" as const, label: t("finishedMatches"), icon: CheckCircle, color: "from-gray-600 to-gray-700" },
    { key: "upcoming" as const, label: t("upcomingMatches"), icon: Calendar, color: "from-blue-500 to-blue-600" },
  ];

  return (
    <MainLayout>
      {/* Hero Background Header */}
      <div className="relative h-[35vh] md:h-[40vh] overflow-hidden">
        <div className="absolute inset-0 bg-gradient-to-br from-green-900 via-green-800 to-emerald-900 dark:from-gray-900 dark:via-gray-800 dark:to-gray-900">
          <div className="absolute inset-0 bg-[url('/images/bg-pattern.jpg')] bg-cover bg-center opacity-10" />
          <div className="absolute inset-0 bg-gradient-to-t from-black/60 via-transparent to-black/30" />
        </div>
        <div className="absolute inset-0 flex flex-col items-center justify-center text-white z-10">
          <h1 className="text-4xl md:text-6xl font-black mb-3 drop-shadow-lg">{t("matchResults")}</h1>
          <div className="flex items-center gap-2 text-green-200 dark:text-gray-300">
            <span className={`w-2.5 h-2.5 rounded-full ${source === "api" ? "bg-green-400 animate-pulse" : "bg-yellow-400"}`} />
            <span className="text-sm font-medium">
              {source === "api" ? "🔴 Live API" : "💾 Database"}
            </span>
          </div>
        </div>
        <button onClick={loadMatches} className="absolute top-4 end-4 z-20 p-3 bg-white/10 backdrop-blur-sm rounded-xl hover:bg-white/20 transition-all text-white" title="Refresh">
          <RefreshCw className={`w-5 h-5 ${refreshing ? "animate-spin-slow" : ""}`} />
        </button>
      </div>

      <div className="max-w-7xl mx-auto px-4 py-8">
        <div className="flex gap-3 mb-6 overflow-x-auto pb-2">
          {tabs.map((tab) => (
            <button
              key={tab.key}
              onClick={() => setActiveTab(tab.key)}
              className={`px-5 py-3 rounded-xl font-bold text-sm flex items-center gap-2 transition-all shadow-md whitespace-nowrap ${
                activeTab === tab.key
                  ? `bg-gradient-to-l ${tab.color} text-white scale-105`
                  : "bg-white dark:bg-gray-800 text-gray-600 dark:text-gray-300 hover:bg-gray-50 dark:hover:bg-gray-700 border border-gray-200 dark:border-gray-700"
              }`}
            >
              <tab.icon className="w-5 h-5" />
              {tab.label}
            </button>
          ))}
        </div>

        {matches.length > 0 ? (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
            {matches.map((match) => (
              <MatchCard key={String(match.id)} match={match} />
            ))}
          </div>
        ) : (
          <div className="text-center py-16 bg-white dark:bg-gray-800 rounded-xl shadow-sm border border-gray-100 dark:border-gray-700">
            <p className="text-gray-400 dark:text-gray-500 text-lg">{t("noMatches")}</p>
          </div>
        )}
      </div>
    </MainLayout>
  );
}
