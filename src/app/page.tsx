"use client";

import { useEffect, useState } from "react";
import MainLayout from "@/components/MainLayout";
import Hero from "@/components/Hero";
import MatchesSection from "@/components/MatchesSection";
import ArticleCard from "@/components/ArticleCard";
import SocialSidebar from "@/components/SocialSidebar";
import { useLocale } from "@/lib/LocaleContext";
import { getLocalizedField } from "@/lib/helpers";
import Link from "next/link";
import Image from "next/image";
import { Newspaper, Trophy, ArrowRight } from "lucide-react";

interface Article {
  [key: string]: unknown;
}

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

export default function HomePage() {
  const { locale, t } = useLocale();
  const [articles, setArticles] = useState<Article[]>([]);
  const [leagues, setLeagues] = useState<League[]>([]);

  useEffect(() => {
    fetch("/api/articles?limit=6").then(r => r.json()).then(setArticles).catch(() => {});
    fetch("/api/leagues").then(r => r.json()).then(setLeagues).catch(() => {});
  }, []);

  return (
    <MainLayout>
      {/* Hero Section */}
      <Hero />

      {/* Content with Background Image */}
      <div className="relative">
        {/* Background image layer */}
        <div className="absolute inset-0 z-0">
          <Image
            src="/images/bg-pattern.jpg"
            alt=""
            fill
            className="object-cover opacity-[0.03] dark:opacity-[0.05]"
            sizes="100vw"
          />
        </div>

        {/* Gradient overlay */}
        <div className="absolute inset-0 bg-gradient-to-b from-gray-50/95 via-gray-50/90 to-gray-50/95 dark:from-gray-950/95 dark:via-gray-950/90 dark:to-gray-950/95 z-0" />

        {/* Actual Content */}
        <div className="relative z-10 max-w-7xl mx-auto px-4 py-8">
          <div className="grid grid-cols-1 lg:grid-cols-4 gap-6">
            {/* Right side - Matches */}
            <div className="lg:col-span-1 order-1 lg:order-1">
              <MatchesSection />
            </div>

            {/* Center - Articles */}
            <div className="lg:col-span-2 order-2 lg:order-2">
              <div className="flex items-center justify-between mb-6">
                <div className="flex items-center gap-2">
                  <Newspaper className="w-6 h-6 text-green-700 dark:text-green-500" />
                  <h2 className="text-xl md:text-2xl font-black text-gray-900 dark:text-white">{t("publishedArticles")}</h2>
                </div>
                <Link href="/news" className="flex items-center gap-1 text-green-700 dark:text-green-400 font-semibold text-sm hover:text-green-900 dark:hover:text-green-300 transition-colors">
                  {locale === "ar" ? "عرض الكل" : locale === "fr" ? "Voir tout" : "View All"}
                  <ArrowRight className="w-4 h-4 rtl:rotate-180" />
                </Link>
              </div>

              {articles.length > 0 ? (
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  {articles.map((article) => (
                    <ArticleCard key={article.id as number} article={article} />
                  ))}
                </div>
              ) : (
                <div className="text-center py-12 bg-white dark:bg-gray-800 rounded-xl shadow-sm border border-gray-100 dark:border-gray-700">
                  <Newspaper className="w-12 h-12 text-gray-300 dark:text-gray-600 mx-auto mb-3" />
                  <p className="text-gray-400 dark:text-gray-500 text-sm">{t("noArticles")}</p>
                </div>
              )}
            </div>

            {/* Left side - Social + Championships */}
            <div className="lg:col-span-1 order-3 lg:order-3">
              <SocialSidebar />
              <div className="mt-6 bg-white dark:bg-gray-800 rounded-xl shadow-md border border-gray-100 dark:border-gray-700 p-6">
                <div className="flex items-center gap-2 mb-4">
                  <Trophy className="w-5 h-5 text-yellow-500" />
                  <h3 className="font-bold text-gray-900 dark:text-white">{t("championships")}</h3>
                </div>
                <ChampionshipQuickLinks leagues={leagues} />
              </div>
            </div>
          </div>
        </div>
      </div>
    </MainLayout>
  );
}

function ChampionshipQuickLinks({ leagues }: { leagues: League[] }) {
  const { locale } = useLocale();

  return (
    <div className="space-y-1.5">
      {leagues.map((league) => (
        <Link
          key={league.id}
          href={`/championships/${league.slug}`}
          className="flex items-center gap-2 px-3 py-2 rounded-lg hover:bg-green-50 dark:hover:bg-gray-700 transition-colors text-sm text-gray-700 dark:text-gray-300 hover:text-green-700 dark:hover:text-green-400"
        >
          <span className="text-lg">{leagueIcons[league.slug] || "⚽"}</span>
          <span className="font-medium">{getLocalizedField(league as unknown as Record<string, unknown>, "name", locale)}</span>
        </Link>
      ))}
    </div>
  );
}
