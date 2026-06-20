"use client";

import { useLocale } from "@/lib/LocaleContext";
import { getLocalizedField, formatDate } from "@/lib/helpers";
import { Calendar, ArrowRight } from "lucide-react";

interface ArticleCardProps {
  article: Record<string, unknown>;
}

export default function ArticleCard({ article }: ArticleCardProps) {
  const { locale, t } = useLocale();
  const title = getLocalizedField(article, "title", locale);
  const summary = getLocalizedField(article, "summary", locale);
  const content = getLocalizedField(article, "content", locale);
  const displayText = summary || content.slice(0, 120) + "...";
  const publishedAt = article.publishedAt as string | null;

  return (
    <div className="bg-white dark:bg-gray-800 rounded-xl shadow-md hover:shadow-xl transition-all border border-gray-100 dark:border-gray-700 overflow-hidden group cursor-pointer">
      {/* Image */}
      <div className="relative h-48 md:h-52 bg-gradient-to-br from-green-700 to-green-900 dark:from-green-800 dark:to-green-950 overflow-hidden">
        <div className="absolute inset-0 flex items-center justify-center">
          <div className="text-center">
            <span className="text-5xl font-black text-white/20">⚽</span>
          </div>
        </div>
        <div className="absolute inset-0 bg-gradient-to-t from-black/50 to-transparent" />
        {publishedAt && (
          <div className="absolute bottom-3 start-3 flex items-center gap-1 text-white/80 text-xs">
            <Calendar className="w-3 h-3" />
            {formatDate(publishedAt, locale)}
          </div>
        )}
      </div>

      {/* Content */}
      <div className="p-4 md:p-5">
        <h3 className="font-bold text-gray-900 dark:text-white text-base md:text-lg mb-2 line-clamp-2 group-hover:text-green-700 dark:group-hover:text-green-400 transition-colors">
          {title}
        </h3>
        <p className="text-gray-600 dark:text-gray-400 text-sm leading-relaxed mb-3 line-clamp-3">
          {displayText}
        </p>
        <div className="flex items-center text-green-700 dark:text-green-400 font-semibold text-sm group-hover:text-green-900 dark:group-hover:text-green-300 transition-colors">
          {t("readMore")}
          <ArrowRight className="w-4 h-4 ms-1 group-hover:translate-x-1 transition-transform rtl:rotate-180 rtl:group-hover:-translate-x-1" />
        </div>
      </div>
    </div>
  );
}
