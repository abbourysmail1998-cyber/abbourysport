"use client";

import { useLocale } from "@/lib/LocaleContext";
import { formatDate } from "@/lib/helpers";
import { Zap, Calendar, Clock } from "lucide-react";
import Image from "next/image";

interface MatchCardProps {
  match: Record<string, unknown>;
}

export default function MatchCard({ match }: MatchCardProps) {
  const { locale, t } = useLocale();
  const status = match.status as string;
  const homeTeam = (match.homeTeamAr && locale === "ar" ? match.homeTeamAr : match.homeTeamEn || match.homeTeamAr) as string;
  const awayTeam = (match.awayTeamAr && locale === "ar" ? match.awayTeamAr : match.awayTeamEn || match.awayTeamAr) as string;
  const homeScore = match.homeScore as number | null;
  const awayScore = match.awayScore as number | null;
  const matchDate = match.matchDate as string | null;
  const matchTime = match.matchTime as string | null;
  const homeCrest = (match.homeCrest || match.homeLogo) as string | null;
  const awayCrest = (match.awayCrest || match.awayLogo) as string | null;

  const statusColors: Record<string, string> = {
    live: "bg-red-500 text-white animate-pulse",
    finished: "bg-gray-600 dark:bg-gray-500 text-white",
    upcoming: "bg-blue-500 text-white",
  };

  const statusLabels: Record<string, string> = {
    live: t("live"),
    finished: t("finished"),
    upcoming: t("upcoming"),
  };

  return (
    <div className="bg-white dark:bg-gray-800 rounded-xl shadow-md hover:shadow-xl transition-all border border-gray-100 dark:border-gray-700 overflow-hidden group">
      <div className="flex items-center justify-between px-4 py-2 bg-gray-50 dark:bg-gray-750 border-b border-gray-100 dark:border-gray-700">
        <span className={`px-3 py-0.5 rounded-full text-xs font-bold ${statusColors[status] || "bg-gray-400"}`}>
          {status === "live" && <Zap className="w-3 h-3 inline me-1" />}
          {statusLabels[status] || status}
        </span>
        {matchDate && (
          <span className="text-xs text-gray-500 dark:text-gray-400 flex items-center gap-1">
            <Calendar className="w-3 h-3" />
            {formatDate(matchDate, locale)}
          </span>
        )}
      </div>

      <div className="px-4 py-4">
        <div className="flex items-center justify-between">
          <div className="flex-1 text-center">
            <div className="w-12 h-12 md:w-14 md:h-14 bg-green-50 dark:bg-green-900/30 rounded-full flex items-center justify-center mx-auto mb-2 border-2 border-green-100 dark:border-green-800 group-hover:border-green-300 dark:group-hover:border-green-600 transition-colors overflow-hidden">
              {homeCrest ? (
                <Image src={homeCrest} alt={homeTeam} width={36} height={36} className="w-9 h-9 object-contain" unoptimized />
              ) : (
                <span className="text-green-800 dark:text-green-400 font-bold text-lg md:text-xl">{homeTeam.charAt(0)}</span>
              )}
            </div>
            <p className="text-sm font-bold text-gray-800 dark:text-gray-200 leading-tight">{homeTeam}</p>
          </div>

          <div className="flex-shrink-0 mx-2 md:mx-4">
            {status === "upcoming" ? (
              <div className="text-center">
                <span className="text-2xl md:text-3xl font-black text-gray-400 dark:text-gray-500">VS</span>
                {matchTime && (
                  <div className="flex items-center justify-center gap-1 mt-1">
                    <Clock className="w-3 h-3 text-gray-400" />
                    <span className="text-xs text-gray-500 dark:text-gray-400 font-semibold">{matchTime}</span>
                  </div>
                )}
              </div>
            ) : (
              <div className="bg-green-900 dark:bg-green-950 rounded-xl px-4 md:px-6 py-2 md:py-3 shadow-lg">
                <div className="flex items-center gap-2 md:gap-3">
                  <span className="text-2xl md:text-4xl font-black text-white">{homeScore ?? "-"}</span>
                  <span className="text-lg md:text-xl text-green-400 font-bold">-</span>
                  <span className="text-2xl md:text-4xl font-black text-white">{awayScore ?? "-"}</span>
                </div>
                {status === "live" && (
                  <div className="flex items-center justify-center gap-1 mt-1">
                    <span className="w-1.5 h-1.5 bg-red-400 rounded-full animate-pulse" />
                    <span className="text-[10px] text-red-300 font-bold uppercase">LIVE</span>
                  </div>
                )}
              </div>
            )}
          </div>

          <div className="flex-1 text-center">
            <div className="w-12 h-12 md:w-14 md:h-14 bg-blue-50 dark:bg-blue-900/30 rounded-full flex items-center justify-center mx-auto mb-2 border-2 border-blue-100 dark:border-blue-800 group-hover:border-blue-300 dark:group-hover:border-blue-600 transition-colors overflow-hidden">
              {awayCrest ? (
                <Image src={awayCrest} alt={awayTeam} width={36} height={36} className="w-9 h-9 object-contain" unoptimized />
              ) : (
                <span className="text-blue-800 dark:text-blue-400 font-bold text-lg md:text-xl">{awayTeam.charAt(0)}</span>
              )}
            </div>
            <p className="text-sm font-bold text-gray-800 dark:text-gray-200 leading-tight">{awayTeam}</p>
          </div>
        </div>
      </div>
    </div>
  );
}
