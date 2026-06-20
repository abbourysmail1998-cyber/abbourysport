"use client";

import Link from "next/link";
import { useLocale } from "@/lib/LocaleContext";
import { getLocalizedField } from "@/lib/helpers";
import { useEffect, useState } from "react";

interface FooterPage {
  id: number;
  slug: string;
  titleAr: string;
  titleFr: string;
  titleEn: string;
}

export default function Footer() {
  const { locale, t } = useLocale();
  const [pages, setPages] = useState<FooterPage[]>([]);

  useEffect(() => {
    fetch("/api/footer-pages").then(r => r.json()).then(setPages).catch(() => {});
  }, []);

  return (
    <footer className="bg-gradient-to-t from-gray-900 via-gray-900 to-gray-800 dark:from-gray-950 dark:via-gray-950 dark:to-gray-900 text-white">
      <div className="max-w-7xl mx-auto px-4 py-10">
        <div className="grid grid-cols-1 md:grid-cols-3 gap-8 mb-8">
          <div>
            <div className="flex items-center gap-3 mb-4">
              <div className="w-12 h-12 bg-white rounded-xl flex items-center justify-center">
                <span className="text-green-900 font-black text-xl">AS</span>
              </div>
              <div>
                <h3 className="text-xl font-black text-yellow-400">Abbourysport</h3>
                <p className="text-xs text-gray-400">Sports News & Results</p>
              </div>
            </div>
            <p className="text-gray-400 text-sm leading-relaxed">
              {locale === "ar" ? "موقع رياضي شامل يغطي أخبار كرة القدم والبطولات العالمية والمحلية بثلاث لغات." : locale === "fr" ? "Site sportif complet couvrant l'actualité du football en trois langues." : "Comprehensive sports website covering football news in three languages."}
            </p>
          </div>
          <div>
            <h4 className="font-bold text-yellow-400 mb-4 text-lg">{locale === "ar" ? "روابط سريعة" : locale === "fr" ? "Liens Rapides" : "Quick Links"}</h4>
            <ul className="space-y-2">
              <li><Link href="/" className="text-gray-400 hover:text-yellow-400 transition-colors text-sm">{t("home")}</Link></li>
              <li><Link href="/matches" className="text-gray-400 hover:text-yellow-400 transition-colors text-sm">{t("matchResults")}</Link></li>
              <li><Link href="/news" className="text-gray-400 hover:text-yellow-400 transition-colors text-sm">{t("latestNews")}</Link></li>
              <li><Link href="/championships" className="text-gray-400 hover:text-yellow-400 transition-colors text-sm">{t("championships")}</Link></li>
            </ul>
          </div>
          <div>
            <h4 className="font-bold text-yellow-400 mb-4 text-lg">{locale === "ar" ? "معلومات" : "Informations"}</h4>
            <ul className="space-y-2">
              {pages.map((page) => (
                <li key={page.id}>
                  <Link href={`/page/${page.slug}`} className="text-gray-400 hover:text-yellow-400 transition-colors text-sm">
                    {getLocalizedField(page as unknown as Record<string, unknown>, "title", locale)}
                  </Link>
                </li>
              ))}
            </ul>
          </div>
        </div>
        <div className="border-t border-gray-700 pt-6 flex flex-col md:flex-row items-center justify-between gap-4">
          <p className="text-gray-400 text-sm">© 2026 Abbourysport. {t("allRightsReserved")}.</p>
          <div className="flex items-center gap-4">
            {pages.map((page) => (
              <Link key={page.id} href={`/page/${page.slug}`} className="text-gray-500 hover:text-yellow-400 transition-colors text-xs">
                {getLocalizedField(page as unknown as Record<string, unknown>, "title", locale)}
              </Link>
            ))}
          </div>
        </div>
      </div>
    </footer>
  );
}
