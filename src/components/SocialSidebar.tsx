"use client";

import { useEffect, useState } from "react";
import { useLocale } from "@/lib/LocaleContext";
import { getLocalizedField } from "@/lib/helpers";

interface SocialLink {
  id: number;
  platform: string;
  url: string;
  icon: string;
}

const platformStyles: Record<string, { bg: string; icon: string; color: string }> = {
  facebook: { bg: "bg-blue-600", icon: "f", color: "text-white" },
  twitter: { bg: "bg-gray-900", icon: "𝕏", color: "text-white" },
  instagram: { bg: "bg-gradient-to-br from-purple-600 to-pink-500", icon: "📷", color: "text-white" },
  youtube: { bg: "bg-red-600", icon: "▶", color: "text-white" },
  tiktok: { bg: "bg-black", icon: "♪", color: "text-white" },
};

export default function SocialSidebar() {
  const { locale } = useLocale();
  const [links, setLinks] = useState<SocialLink[]>([]);

  useEffect(() => {
    fetch("/api/social-links").then(r => r.json()).then(setLinks).catch(() => {});
  }, []);

  const message = locale === "ar"
    ? "زرنا على مواقع التواصل الاجتماعي"
    : locale === "fr"
    ? "Visitez-nous sur les réseaux sociaux"
    : "Visit us on social media";

  return (
    <div className="bg-white dark:bg-gray-800 rounded-xl shadow-md border border-gray-100 dark:border-gray-700 p-6">
      <h3 className="font-bold text-gray-900 dark:text-white text-lg mb-2">{message}</h3>
      <p className="text-gray-500 dark:text-gray-400 text-sm mb-4">
        {locale === "ar"
          ? "تابعنا لأحدث الأخبار الرياضية"
          : locale === "fr"
          ? "Suivez-nous pour les dernières nouvelles sportives"
          : "Follow us for the latest sports news"}
      </p>
      <div className="space-y-3">
        {links.map((link) => {
          const style = platformStyles[link.icon] || { bg: "bg-gray-600", icon: link.platform[0], color: "text-white" };
          return (
            <a
              key={link.id}
              href={link.url}
              target="_blank"
              rel="noopener noreferrer"
              className={`flex items-center gap-3 px-4 py-3 rounded-xl ${style.bg} ${style.color} hover:opacity-90 transition-all hover:scale-[1.02] shadow-sm`}
            >
              <span className="w-9 h-9 rounded-lg bg-white/20 flex items-center justify-center font-bold text-lg">
                {style.icon}
              </span>
              <span className="font-semibold text-sm">{link.platform}</span>
            </a>
          );
        })}
      </div>
    </div>
  );
}
