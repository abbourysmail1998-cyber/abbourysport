"use client";

import { useState, useEffect, useRef } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { useLocale } from "@/lib/LocaleContext";
import { useTheme } from "@/lib/ThemeContext";
import { type Locale } from "@/lib/i18n";
import { getLocalizedField } from "@/lib/helpers";
import {
  Search,
  Globe,
  Menu,
  X,
  Sun,
  Moon,
  Lock,
  AlertCircle,
} from "lucide-react";

interface League {
  id: number;
  nameAr: string;
  nameFr: string;
  nameEn: string;
  slug: string;
}

interface SearchResult {
  matches: Array<Record<string, unknown>>;
  articles: Array<Record<string, unknown>>;
  leagues: Array<Record<string, unknown>>;
}

const ADMIN_PASSWORD = "ismail1998";

export default function Header() {
  const { locale, setLocale, t } = useLocale();
  const { theme, toggleTheme } = useTheme();
  const router = useRouter();

  const [searchOpen, setSearchOpen] = useState(false);
  const [searchQuery, setSearchQuery] = useState("");
  const [searchResults, setSearchResults] = useState<SearchResult | null>(null);
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const [langOpen, setLangOpen] = useState(false);
  const [leagues, setLeagues] = useState<League[]>([]);
  const [champOpen, setChampOpen] = useState(false);

  // 4-tap admin access
  const [tapCount, setTapCount] = useState(0);
  const [showPasswordModal, setShowPasswordModal] = useState(false);
  const [passwordInput, setPasswordInput] = useState("");
  const [passwordError, setPasswordError] = useState(false);
  const tapTimerRef = useRef<NodeJS.Timeout | null>(null);

  const searchRef = useRef<HTMLDivElement>(null);
  const langRef = useRef<HTMLDivElement>(null);
  const champRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    fetch("/api/leagues").then(r => r.json()).then(setLeagues).catch(() => {});
  }, []);

  useEffect(() => {
    if (searchQuery.length >= 1) {
      const timer = setTimeout(() => {
        fetch(`/api/search?q=${encodeURIComponent(searchQuery)}`)
          .then(r => r.json())
          .then(setSearchResults)
          .catch(() => {});
      }, 300);
      return () => clearTimeout(timer);
    } else {
      setSearchResults(null);
    }
  }, [searchQuery]);

  useEffect(() => {
    function handleClickOutside(e: MouseEvent) {
      if (searchRef.current && !searchRef.current.contains(e.target as Node)) setSearchOpen(false);
      if (langRef.current && !langRef.current.contains(e.target as Node)) setLangOpen(false);
      if (champRef.current && !champRef.current.contains(e.target as Node)) setChampOpen(false);
    }
    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, []);

  const handleLogoTap = () => {
    const newCount = tapCount + 1;
    setTapCount(newCount);

    if (tapTimerRef.current) clearTimeout(tapTimerRef.current);

    if (newCount >= 4) {
      setShowPasswordModal(true);
      setTapCount(0);
      setPasswordInput("");
      setPasswordError(false);
      return;
    }

    tapTimerRef.current = setTimeout(() => setTapCount(0), 2000);
  };

  const handlePasswordSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (passwordInput === ADMIN_PASSWORD) {
      setShowPasswordModal(false);
      setPasswordInput("");
      setPasswordError(false);
      router.push("/admin");
    } else {
      setPasswordError(true);
      setTimeout(() => setPasswordError(false), 2000);
    }
  };

  const languages: { code: Locale; label: string; flag: string }[] = [
    { code: "ar", label: "العربية", flag: "🇲🇦" },
    { code: "fr", label: "Français", flag: "🇫🇷" },
    { code: "en", label: "English", flag: "🇬🇧" },
  ];

  return (
    <>
      <header className="bg-gradient-to-l from-green-900 via-green-800 to-green-900 text-white shadow-xl sticky top-0 z-50 dark:from-gray-900 dark:via-gray-800 dark:to-gray-900">
        <div className="max-w-7xl mx-auto px-4">
          <div className="flex items-center justify-between h-16 md:h-20">
            {/* Logo - 4 tap to access admin */}
            <div onClick={handleLogoTap} className="flex items-center gap-3 shrink-0 cursor-pointer select-none">
              <div className="w-11 h-11 md:w-14 md:h-14 bg-white rounded-xl flex items-center justify-center shadow-lg border-2 border-yellow-400">
                <span className="text-green-900 font-black text-lg md:text-2xl tracking-tighter">AS</span>
              </div>
              <div className="hidden sm:block">
                <h1 className="text-xl md:text-2xl font-black tracking-tight text-yellow-400">Abbourysport</h1>
                <p className="text-[10px] md:text-xs text-green-200 dark:text-gray-400 -mt-1">Sports News & Results</p>
              </div>
            </div>

            {/* Desktop Navigation */}
            <nav className="hidden lg:flex items-center gap-1">
              <Link href="/" className="px-4 py-2 rounded-lg hover:bg-white/15 transition-all font-semibold text-sm md:text-base">
                {t("home")}
              </Link>
              <Link href="/matches" className="px-4 py-2 rounded-lg hover:bg-white/15 transition-all font-semibold text-sm md:text-base">
                {t("matchResults")}
              </Link>
              <Link href="/news" className="px-4 py-2 rounded-lg hover:bg-white/15 transition-all font-semibold text-sm md:text-base">
                {t("latestNews")}
              </Link>

              {/* Championships dropdown */}
              <div ref={champRef} className="relative">
                <button
                  onClick={() => setChampOpen(!champOpen)}
                  className="px-4 py-2 rounded-lg hover:bg-white/15 transition-all font-semibold text-sm md:text-base flex items-center gap-1"
                >
                  {t("championships")}
                  <svg className={`w-4 h-4 transition-transform ${champOpen ? 'rotate-180' : ''}`} fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
                  </svg>
                </button>
                {champOpen && (
                  <div className="absolute top-full mt-2 bg-white dark:bg-gray-800 text-gray-800 dark:text-gray-200 rounded-xl shadow-2xl py-2 min-w-[220px] border border-gray-100 dark:border-gray-700 z-50 animate-slideDown">
                    {leagues.map((league) => (
                      <Link
                        key={league.id}
                        href={`/championships/${league.slug}`}
                        className="block px-4 py-2.5 hover:bg-green-50 dark:hover:bg-gray-700 hover:text-green-800 dark:hover:text-green-400 transition-colors text-sm"
                        onClick={() => setChampOpen(false)}
                      >
                        {getLocalizedField(league as unknown as Record<string, unknown>, "name", locale)}
                      </Link>
                    ))}
                  </div>
                )}
              </div>
            </nav>

            {/* Right side actions */}
            <div className="flex items-center gap-1 md:gap-2">
              {/* Search */}
              <div ref={searchRef} className="relative">
                <button onClick={() => setSearchOpen(!searchOpen)} className="p-2 rounded-lg hover:bg-white/15 transition-all" aria-label="Search">
                  <Search className="w-5 h-5" />
                </button>
                {searchOpen && (
                  <div className="absolute top-full mt-2 end-0 bg-white dark:bg-gray-800 rounded-xl shadow-2xl p-3 w-80 md:w-96 border border-gray-100 dark:border-gray-700 z-50 animate-slideDown">
                    <input
                      type="text"
                      value={searchQuery}
                      onChange={(e) => setSearchQuery(e.target.value)}
                      placeholder={t("searchPlaceholder")}
                      className="w-full px-4 py-2.5 bg-gray-50 dark:bg-gray-700 border border-gray-200 dark:border-gray-600 rounded-lg text-gray-800 dark:text-gray-200 text-sm focus:outline-none focus:ring-2 focus:ring-green-500"
                      autoFocus
                    />
                    {searchResults && (
                      <div className="mt-3 max-h-72 overflow-y-auto">
                        {searchResults.matches.length > 0 && (
                          <div>
                            <p className="text-xs font-bold text-green-700 dark:text-green-400 mb-1 px-2">{t("matchResults")}</p>
                            {searchResults.matches.slice(0, 5).map((m, i) => (
                              <Link key={i} href="/matches" className="block px-2 py-1.5 hover:bg-green-50 dark:hover:bg-gray-700 rounded text-sm text-gray-700 dark:text-gray-300" onClick={() => setSearchOpen(false)}>
                                {getLocalizedField(m, "homeTeam", locale)} vs {getLocalizedField(m, "awayTeam", locale)}
                              </Link>
                            ))}
                          </div>
                        )}
                        {searchResults.articles.length > 0 && (
                          <div className="mt-2">
                            <p className="text-xs font-bold text-green-700 dark:text-green-400 mb-1 px-2">{t("latestNews")}</p>
                            {searchResults.articles.slice(0, 5).map((a, i) => (
                              <Link key={i} href="/news" className="block px-2 py-1.5 hover:bg-green-50 dark:hover:bg-gray-700 rounded text-sm text-gray-700 dark:text-gray-300" onClick={() => setSearchOpen(false)}>
                                {getLocalizedField(a, "title", locale)}
                              </Link>
                            ))}
                          </div>
                        )}
                        {searchResults.leagues.length > 0 && (
                          <div className="mt-2">
                            <p className="text-xs font-bold text-green-700 dark:text-green-400 mb-1 px-2">{t("championships")}</p>
                            {searchResults.leagues.slice(0, 5).map((l, i) => (
                              <Link key={i} href={`/championships/${(l as Record<string, unknown>).slug}`} className="block px-2 py-1.5 hover:bg-green-50 dark:hover:bg-gray-700 rounded text-sm text-gray-700 dark:text-gray-300" onClick={() => setSearchOpen(false)}>
                                {getLocalizedField(l, "name", locale)}
                              </Link>
                            ))}
                          </div>
                        )}
                      </div>
                    )}
                  </div>
                )}
              </div>

              {/* Dark Mode Toggle */}
              <button onClick={toggleTheme} className="p-2 rounded-lg hover:bg-white/15 transition-all" aria-label="Toggle theme">
                {theme === "dark" ? <Sun className="w-5 h-5 text-yellow-400" /> : <Moon className="w-5 h-5" />}
              </button>

              {/* Language Switcher */}
              <div ref={langRef} className="relative">
                <button onClick={() => setLangOpen(!langOpen)} className="p-2 rounded-lg hover:bg-white/15 transition-all flex items-center gap-1" aria-label="Language">
                  <Globe className="w-5 h-5" />
                  <span className="hidden md:inline text-xs font-semibold uppercase">{locale}</span>
                </button>
                {langOpen && (
                  <div className="absolute top-full mt-2 end-0 bg-white dark:bg-gray-800 rounded-xl shadow-2xl py-2 min-w-[160px] border border-gray-100 dark:border-gray-700 z-50 animate-slideDown">
                    {languages.map((lang) => (
                      <button
                        key={lang.code}
                        onClick={() => { setLocale(lang.code); setLangOpen(false); }}
                        className={`w-full text-start px-4 py-2.5 text-sm hover:bg-green-50 dark:hover:bg-gray-700 transition-colors flex items-center gap-2 ${
                          locale === lang.code ? "text-green-700 dark:text-green-400 font-bold bg-green-50 dark:bg-gray-700" : "text-gray-700 dark:text-gray-300"
                        }`}
                      >
                        <span className="text-lg">{lang.flag}</span>
                        {lang.label}
                      </button>
                    ))}
                  </div>
                )}
              </div>

              {/* Mobile menu toggle */}
              <button onClick={() => setMobileMenuOpen(!mobileMenuOpen)} className="lg:hidden p-2 rounded-lg hover:bg-white/15 transition-all" aria-label="Menu">
                {mobileMenuOpen ? <X className="w-6 h-6" /> : <Menu className="w-6 h-6" />}
              </button>
            </div>
          </div>

          {/* Mobile Navigation */}
          {mobileMenuOpen && (
            <div className="lg:hidden pb-4 border-t border-white/20 mt-2 pt-4 animate-fadeIn">
              <nav className="flex flex-col gap-1">
                <Link href="/" onClick={() => setMobileMenuOpen(false)} className="px-4 py-3 rounded-lg hover:bg-white/15 transition-all font-semibold">{t("home")}</Link>
                <Link href="/matches" onClick={() => setMobileMenuOpen(false)} className="px-4 py-3 rounded-lg hover:bg-white/15 transition-all font-semibold">{t("matchResults")}</Link>
                <Link href="/news" onClick={() => setMobileMenuOpen(false)} className="px-4 py-3 rounded-lg hover:bg-white/15 transition-all font-semibold">{t("latestNews")}</Link>
                <div className="px-4 py-2 text-xs font-bold text-yellow-400 uppercase">{t("championships")}</div>
                {leagues.map((league) => (
                  <Link key={league.id} href={`/championships/${league.slug}`} onClick={() => setMobileMenuOpen(false)} className="ps-8 pe-4 py-2 rounded-lg hover:bg-white/15 transition-all text-sm">
                    {getLocalizedField(league as unknown as Record<string, unknown>, "name", locale)}
                  </Link>
                ))}
              </nav>
            </div>
          )}
        </div>
      </header>

      {/* Password Modal */}
      {showPasswordModal && (
        <div className="fixed inset-0 bg-black/60 backdrop-blur-sm z-[100] flex items-center justify-center p-4 animate-fadeIn">
          <div className="bg-white dark:bg-gray-800 rounded-2xl shadow-2xl p-8 w-full max-w-md border border-gray-200 dark:border-gray-700 animate-slideDown">
            <div className="text-center mb-6">
              <div className="w-16 h-16 bg-green-100 dark:bg-green-900 rounded-full flex items-center justify-center mx-auto mb-4">
                <Lock className="w-8 h-8 text-green-700 dark:text-green-400" />
              </div>
              <h2 className="text-xl font-black text-gray-900 dark:text-white">
                {locale === "ar" ? "الوصول للإدارة" : locale === "fr" ? "Accès Administration" : "Admin Access"}
              </h2>
              <p className="text-sm text-gray-500 dark:text-gray-400 mt-1">
                {locale === "ar" ? "أدخل كلمة المرور للدخول" : locale === "fr" ? "Entrez le mot de passe" : "Enter password to continue"}
              </p>
            </div>

            <form onSubmit={handlePasswordSubmit}>
              <input
                type="password"
                value={passwordInput}
                onChange={(e) => setPasswordInput(e.target.value)}
                placeholder="••••••••••"
                className={`w-full px-4 py-3 border rounded-xl text-center text-lg tracking-widest focus:outline-none focus:ring-2 focus:ring-green-500 transition-all ${
                  passwordError
                    ? "border-red-500 bg-red-50 dark:bg-red-900/20 dark:border-red-500"
                    : "border-gray-200 dark:border-gray-600 bg-gray-50 dark:bg-gray-700"
                } text-gray-900 dark:text-white`}
                autoFocus
              />
              {passwordError && (
                <div className="flex items-center gap-1 mt-2 text-red-500 text-sm justify-center animate-fadeIn">
                  <AlertCircle className="w-4 h-4" />
                  {locale === "ar" ? "كلمة المرور خاطئة" : locale === "fr" ? "Mot de passe incorrect" : "Incorrect password"}
                </div>
              )}

              <div className="flex gap-3 mt-6">
                <button
                  type="button"
                  onClick={() => { setShowPasswordModal(false); setPasswordInput(""); setPasswordError(false); }}
                  className="flex-1 px-4 py-3 bg-gray-100 dark:bg-gray-700 text-gray-700 dark:text-gray-300 rounded-xl font-bold hover:bg-gray-200 dark:hover:bg-gray-600 transition-colors"
                >
                  {t("cancel")}
                </button>
                <button
                  type="submit"
                  className="flex-1 px-4 py-3 bg-green-700 text-white rounded-xl font-bold hover:bg-green-800 transition-colors shadow-lg"
                >
                  <Lock className="w-4 h-4 inline me-1" />
                  {locale === "ar" ? "دخول" : locale === "fr" ? "Connexion" : "Login"}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </>
  );
}
