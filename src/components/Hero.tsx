"use client";

import { useLocale } from "@/lib/LocaleContext";
import Image from "next/image";

export default function Hero() {
  const { locale } = useLocale();

  const title = locale === "ar"
    ? "عالم الرياضة بين يديك"
    : locale === "fr"
    ? "Le monde du sport à portée de main"
    : "The World of Sports at Your Fingertips";

  const subtitle = locale === "ar"
    ? "تابع آخر الأخبار والنتائج والبطولات"
    : locale === "fr"
    ? "Suivez les dernières nouvelles, résultats et championnats"
    : "Follow the latest news, results and championships";

  return (
    <div className="relative w-full h-[55vh] md:h-[75vh] overflow-hidden">
      {/* Background Image */}
      <Image
        src="/images/hero.jpg"
        alt="Sports Stadium"
        fill
        className="object-cover object-center"
        priority
        sizes="100vw"
        quality={90}
      />

      {/* Multi-layer overlay for depth */}
      <div className="absolute inset-0 bg-gradient-to-t from-black/90 via-black/50 to-black/20" />
      <div className="absolute inset-0 bg-gradient-to-r from-green-900/50 via-transparent to-green-900/30" />
      <div className="absolute inset-0 bg-gradient-to-b from-black/30 via-transparent to-black/70" />

      {/* Animated particles / decorative elements */}
      <div className="absolute inset-0 overflow-hidden">
        <div className="absolute top-1/4 start-1/4 w-64 h-64 bg-yellow-400/5 rounded-full blur-3xl animate-pulse" />
        <div className="absolute bottom-1/4 end-1/4 w-96 h-96 bg-green-400/5 rounded-full blur-3xl animate-pulse" style={{ animationDelay: "1s" }} />
      </div>

      {/* Content */}
      <div className="absolute inset-0 flex flex-col items-center justify-center text-center px-4 z-10">
        {/* Logo Badge */}
        <div className="mb-8 animate-fadeIn">
          <div className="w-24 h-24 md:w-36 md:h-36 bg-white/95 dark:bg-white/90 rounded-3xl flex items-center justify-center shadow-2xl mx-auto mb-5 border-4 border-yellow-400 backdrop-blur-sm">
            <span className="text-green-900 font-black text-4xl md:text-6xl tracking-tighter">AS</span>
          </div>
        </div>

        {/* Title */}
        <h1 className="text-4xl md:text-7xl font-black text-white mb-5 leading-tight drop-shadow-2xl">
          {title}
        </h1>

        {/* Subtitle */}
        <p className="text-xl md:text-3xl text-gray-200 font-medium max-w-3xl drop-shadow-lg mb-8">
          {subtitle}
        </p>

        {/* Live indicator */}
        <div className="flex items-center gap-3 bg-red-600/80 backdrop-blur-sm px-6 py-3 rounded-full shadow-lg border border-red-400/30">
          <span className="w-3 h-3 bg-white rounded-full animate-pulse" />
          <span className="text-white font-bold text-sm md:text-base tracking-wide">
            {locale === "ar" ? "مباريات مباشرة الآن" : locale === "fr" ? "Matchs en direct maintenant" : "Live matches now"}
          </span>
        </div>

        {/* Scroll indicator */}
        <div className="absolute bottom-8 left-1/2 -translate-x-1/2 animate-bounce">
          <div className="w-8 h-12 border-2 border-white/40 rounded-full flex items-start justify-center p-1">
            <div className="w-1.5 h-3 bg-white/60 rounded-full" />
          </div>
        </div>
      </div>
    </div>
  );
}
