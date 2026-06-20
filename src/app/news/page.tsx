"use client";

import { useEffect, useState } from "react";
import MainLayout from "@/components/MainLayout";
import ArticleCard from "@/components/ArticleCard";
import { useLocale } from "@/lib/LocaleContext";
import { Newspaper } from "lucide-react";

interface Article {
  [key: string]: unknown;
}

export default function NewsPage() {
  const { t } = useLocale();
  const [articles, setArticles] = useState<Article[]>([]);

  useEffect(() => {
    fetch("/api/articles").then(r => r.json()).then(setArticles).catch(() => {});
  }, []);

  return (
    <MainLayout>
      {/* Hero Background Header */}
      <div className="relative h-[35vh] md:h-[40vh] overflow-hidden">
        <div className="absolute inset-0 bg-gradient-to-br from-green-900 via-emerald-800 to-teal-900 dark:from-gray-900 dark:via-gray-800 dark:to-gray-900">
          <div className="absolute inset-0 bg-[url('/images/bg-pattern.jpg')] bg-cover bg-center opacity-10" />
          <div className="absolute inset-0 bg-gradient-to-t from-black/60 via-transparent to-black/30" />
        </div>
        <div className="absolute inset-0 flex flex-col items-center justify-center text-white z-10">
          <Newspaper className="w-12 h-12 text-yellow-400 mb-3" />
          <h1 className="text-4xl md:text-6xl font-black mb-3 drop-shadow-lg">{t("latestNews")}</h1>
          <p className="text-green-200 dark:text-gray-300 text-lg">{t("publishedArticles")}</p>
        </div>
      </div>

      <div className="max-w-7xl mx-auto px-4 py-8">
        {articles.length > 0 ? (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {articles.map((article) => (
              <ArticleCard key={article.id as number} article={article} />
            ))}
          </div>
        ) : (
          <div className="text-center py-16 bg-white dark:bg-gray-800 rounded-xl shadow-sm border border-gray-100 dark:border-gray-700">
            <Newspaper className="w-16 h-16 text-gray-300 dark:text-gray-600 mx-auto mb-4" />
            <p className="text-gray-400 dark:text-gray-500 text-lg">{t("noArticles")}</p>
          </div>
        )}
      </div>
    </MainLayout>
  );
}
