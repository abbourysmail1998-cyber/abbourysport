"use client";

import { useEffect, useState, useCallback } from "react";
import { useLocale } from "@/lib/LocaleContext";
import MatchCard from "./MatchCard";
import { Zap, CheckCircle, Calendar, RefreshCw } from "lucide-react";

interface Match {
  [key: string]: unknown;
}

export default function MatchesSection() {
  const { t } = useLocale();
  const [liveMatches, setLiveMatches] = useState<Match[]>([]);
  const [finishedMatches, setFinishedMatches] = useState<Match[]>([]);
  const [upcomingMatches, setUpcomingMatches] = useState<Match[]>([]);
  const [activeTab, setActiveTab] = useState<"live" | "finished" | "upcoming">("live");
  const [source, setSource] = useState<string>("database");
  const [refreshing, setRefreshing] = useState(false);
  const [lastRefresh, setLastRefresh] = useState<Date>(new Date());

  const loadMatches = useCallback(async () => {
    setRefreshing(true);
    try {
      // Try football API first for real data
      const res = await fetch("/api/football");
      const data = await res.json();
      setSource(data.source);

      const allMatches: Match[] = data.matches || [];

      const live = allMatches.filter((m) => m.status === "live");
      const finished = allMatches.filter((m) => m.status === "finished");
      const upcoming = allMatches.filter((m) => m.status === "upcoming");

      // If API returned data, use it; otherwise fall back to DB
      if (allMatches.length > 0) {
        setLiveMatches(live);
        setFinishedMatches(finished);
        setUpcomingMatches(upcoming);
      } else {
        // Fallback to database
        const [liveDb, finishedDb, upcomingDb] = await Promise.all([
          fetch("/api/matches?status=live").then(r => r.json()),
          fetch("/api/matches?status=finished").then(r => r.json()),
          fetch("/api/matches?status=upcoming").then(r => r.json()),
        ]);
        setLiveMatches(liveDb);
        setFinishedMatches(finishedDb);
        setUpcomingMatches(upcomingDb);
        setSource("database");
      }
    } catch {
      // Fallback to database
      try {
        const [liveDb, finishedDb, upcomingDb] = await Promise.all([
          fetch("/api/matches?status=live").then(r => r.json()),
          fetch("/api/matches?status=finished").then(r => r.json()),
          fetch("/api/matches?status=upcoming").then(r => r.json()),
        ]);
        setLiveMatches(liveDb);
        setFinishedMatches(finishedDb);
        setUpcomingMatches(upcomingDb);
        setSource("database");
      } catch {}
    }
    setLastRefresh(new Date());
    setRefreshing(false);
  }, []);

  useEffect(() => {
    loadMatches();
  }, [loadMatches]);

  // Auto-refresh every 30 seconds for live matches
  useEffect(() => {
    const interval = setInterval(() => {
      loadMatches();
    }, 30000);
    return () => clearInterval(interval);
  }, [loadMatches]);

  const tabs = [
    { key: "live" as const, label: t("liveMatches"), icon: Zap, count: liveMatches.length, color: "text-red-500 border-red-500" },
    { key: "finished" as const, label: t("finishedMatches"), icon: CheckCircle, count: finishedMatches.length, color: "text-gray-500 dark:text-gray-400 border-gray-500" },
    { key: "upcoming" as const, label: t("upcomingMatches"), icon: Calendar, count: upcomingMatches.length, color: "text-blue-500 border-blue-500" },
  ];

  const currentMatches = activeTab === "live" ? liveMatches : activeTab === "finished" ? finishedMatches : upcomingMatches;

  return (
    <div className="bg-white dark:bg-gray-800 rounded-xl shadow-md border border-gray-100 dark:border-gray-700 overflow-hidden">
      {/* Header with source indicator and refresh */}
      <div className="flex items-center justify-between px-4 py-2 bg-gray-50 dark:bg-gray-900 border-b border-gray-100 dark:border-gray-700">
        <div className="flex items-center gap-2">
          <span className={`w-2 h-2 rounded-full ${source === "api" ? "bg-green-500" : "bg-yellow-500"}`} />
          <span className="text-[10px] text-gray-500 dark:text-gray-400 font-medium">
            {source === "api" ? "🔴 Live API" : "💾 Database"}
          </span>
        </div>
        <button onClick={loadMatches} className="text-gray-400 hover:text-green-600 dark:hover:text-green-400 transition-colors" title="Refresh">
          <RefreshCw className={`w-4 h-4 ${refreshing ? "animate-spin-slow" : ""}`} />
        </button>
      </div>

      {/* Tabs */}
      <div className="flex border-b border-gray-100 dark:border-gray-700">
        {tabs.map((tab) => (
          <button
            key={tab.key}
            onClick={() => setActiveTab(tab.key)}
            className={`flex-1 px-3 py-3 text-sm font-bold flex items-center justify-center gap-1.5 transition-all border-b-2 ${
              activeTab === tab.key
                ? `${tab.color} bg-gray-50 dark:bg-gray-900`
                : "text-gray-400 dark:text-gray-500 border-transparent hover:text-gray-600 dark:hover:text-gray-300"
            }`}
          >
            <tab.icon className="w-4 h-4" />
            <span className="hidden md:inline">{tab.label}</span>
            <span className="md:hidden text-xs">{tab.key === "live" ? t("live") : tab.key === "finished" ? t("finished") : t("upcoming")}</span>
            {tab.count > 0 && (
              <span className={`text-xs px-1.5 py-0.5 rounded-full ${activeTab === tab.key ? "bg-current/10" : "bg-gray-100 dark:bg-gray-700"}`}>
                {tab.count}
              </span>
            )}
          </button>
        ))}
      </div>

      {/* Match list */}
      <div className="p-3 md:p-4 space-y-3 max-h-[500px] overflow-y-auto">
        {currentMatches.length > 0 ? (
          currentMatches.map((match) => (
            <MatchCard key={String(match.id)} match={match} />
          ))
        ) : (
          <div className="text-center py-10">
            <p className="text-gray-400 dark:text-gray-500 text-sm">{t("noMatches")}</p>
          </div>
        )}
      </div>

      {/* Last refresh time */}
      <div className="px-4 py-2 text-center border-t border-gray-100 dark:border-gray-700">
        <span className="text-[10px] text-gray-400 dark:text-gray-600">
          {lastRefresh.toLocaleTimeString()} • Auto-refresh: 30s
        </span>
      </div>
    </div>
  );
}
