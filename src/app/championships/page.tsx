"use client";

import { useEffect, useState } from "react";
import MainLayout from "@/components/MainLayout";
import { useLocale } from "@/lib/LocaleContext";
import { getLocalizedField } from "@/lib/helpers";
import Link from "next/link";
import { Trophy } from "lucide-react";

interface League {
  id: number;
  nameAr: string;
  nameFr: string;
  nameEn: string;
  slug: string;
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

export default function ChampionshipsPage() {
  const { locale, t } = useLocale();
  const [leagues, setLeagues] = useState<League[]>([]);

  useEffect(() => {
    fetch("/api/leagues").then(r => r.json()).then(setLeagues).catch(() => {});
  }, []);

  return (
    <MainLayout>
      {/* Hero Background Header */}
      <div className="relative h-[35vh] md:h-[40vh] overflow-hidden">
        <div className="absolute inset-0 bg-gradient-to-br from-yellow-700 via-amber-800 to-orange-900 dark:from-gray-900 dark:via-gray-800 dark:to-gray-900">
          <div className="absolute inset-0 bg-[url('/images/bg-pattern.jpg')] bg-cover bg-center opacity-10" />
          <div className="absolute inset-0 bg-gradient-to-t from-black/60 via-transparent to-black/30" />
        </div>
        <div className="absolute inset-0 flex flex-col items-center justify-center text-white z-10">
          <Trophy className="w-12 h-12 text-yellow-400 mb-3" />
          <h1 className="text-4xl md:text-6xl font-black mb-3 drop-shadow-lg">{t("championships")}</h1>
          <p className="text-yellow-200/80 dark:text-gray-300 text-lg">
            {locale === "ar" ? "استعرض مختلف البطولات والدوريات" : locale === "fr" ? "Explorez les championnats" : "Explore various championships"}
          </p>
        </div>
      </div>

      <div className="max-w-7xl mx-auto px-4 py-8">
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
          {leagues.map((league) => {
            const gradient = leagueColors[league.slug] || "from-green-500 to-green-700";
            return (
              <Link
                key={league.id}
                href={`/championships/${league.slug}`}
                className="group relative overflow-hidden rounded-2xl shadow-lg hover:shadow-2xl transition-all hover:scale-[1.03]"
              >
                <div className={`bg-gradient-to-br ${gradient} p-8 text-white min-h-[200px] flex flex-col justify-between`}>
                  <div className="absolute top-0 end-0 w-32 h-32 bg-white/10 rounded-full -translate-y-8 translate-x-8" />
                  <div className="absolute bottom-0 start-0 w-24 h-24 bg-white/10 rounded-full translate-y-6 -translate-x-6" />
                  <div className="relative">
                    <span className="text-5xl mb-4 block drop-shadow-lg">{leagueIcons[league.slug] || "⚽"}</span>
                    <h3 className="text-xl font-black leading-tight drop-shadow">
                      {getLocalizedField(league as unknown as Record<string, unknown>, "name", locale)}
                    </h3>
                  </div>
                  <div className="relative mt-4">
                    <span className="text-sm text-white/80 font-medium group-hover:text-white transition-colors flex items-center gap-1">
                      <Trophy className="w-4 h-4" />
                      {locale === "ar" ? "عرض المباريات" : locale === "fr" ? "Voir les matchs" : "View Matches"}
                    </span>
                  </div>
                </div>
              </Link>
            );
          })}
        </div>
      </div>
    </MainLayout>
  );
}
