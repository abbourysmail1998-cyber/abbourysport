"use client";

import { useEffect, useState } from "react";
import { useParams } from "next/navigation";
import MainLayout from "@/components/MainLayout";
import { useLocale } from "@/lib/LocaleContext";
import { getLocalizedField } from "@/lib/helpers";
import { FileText } from "lucide-react";

interface FooterPage {
  id: number;
  slug: string;
  titleAr: string;
  titleFr: string;
  titleEn: string;
  contentAr: string;
  contentFr: string;
  contentEn: string;
}

export default function FooterPageView() {
  const { slug } = useParams<{ slug: string }>();
  const { locale } = useLocale();
  const [page, setPage] = useState<FooterPage | null>(null);

  useEffect(() => {
    fetch(`/api/footer-pages?slug=${slug}`).then(r => r.json()).then(setPage).catch(() => {});
  }, [slug]);

  if (!page) {
    return (
      <MainLayout>
        <div className="min-h-[50vh] flex items-center justify-center">
          <p className="text-gray-400 dark:text-gray-500">Loading...</p>
        </div>
      </MainLayout>
    );
  }

  const title = getLocalizedField(page as unknown as Record<string, unknown>, "title", locale);
  const content = getLocalizedField(page as unknown as Record<string, unknown>, "content", locale);

  return (
    <MainLayout>
      {/* Hero Background Header */}
      <div className="relative h-[30vh] md:h-[35vh] overflow-hidden">
        <div className="absolute inset-0 bg-gradient-to-br from-green-900 via-green-800 to-emerald-900 dark:from-gray-900 dark:via-gray-800 dark:to-gray-900">
          <div className="absolute inset-0 bg-[url('/images/bg-pattern.jpg')] bg-cover bg-center opacity-10" />
          <div className="absolute inset-0 bg-gradient-to-t from-black/60 via-transparent to-black/30" />
        </div>
        <div className="absolute inset-0 flex flex-col items-center justify-center text-white z-10">
          <FileText className="w-10 h-10 text-yellow-400 mb-3" />
          <h1 className="text-3xl md:text-5xl font-black drop-shadow-lg">{title}</h1>
        </div>
      </div>

      <div className="max-w-4xl mx-auto px-4 py-8">
        <div className="bg-white dark:bg-gray-800 rounded-2xl shadow-lg border border-gray-100 dark:border-gray-700 p-8 md:p-12">
          <div className="prose prose-lg max-w-none">
            <p className="text-gray-700 dark:text-gray-300 leading-relaxed text-base md:text-lg whitespace-pre-line">
              {content}
            </p>
          </div>
        </div>
      </div>
    </MainLayout>
  );
}
