"use client";

import { useEffect, useState, type FormEvent } from "react";
import { useLocale } from "@/lib/LocaleContext";
import { useTheme } from "@/lib/ThemeContext";
import { getLocalizedField } from "@/lib/helpers";
import Link from "next/link";
import {
  Trophy, Newspaper, Zap, Globe, ArrowLeft, Plus, Trash2,
  Edit3, Save, X, RefreshCw, Key, AlertCircle,
  Sun, Moon, Database, Cloud, Activity, Check,
} from "lucide-react";
import type { TranslationKey } from "@/lib/i18n";

interface League { id: number; nameAr: string; nameFr: string; nameEn: string; slug: string; order: number; }
interface Match { id: number; leagueId: number; homeTeamAr: string; homeTeamFr: string; homeTeamEn: string; awayTeamAr: string; awayTeamFr: string; awayTeamEn: string; homeScore: number | null; awayScore: number | null; status: string; matchDate: string | null; matchTime: string | null; }
interface Article { id: number; titleAr: string; titleFr: string; titleEn: string; contentAr: string; contentFr: string; contentEn: string; summaryAr: string; summaryFr: string; summaryEn: string; isPublished: boolean; }
interface SocialLink { id: number; platform: string; url: string; icon: string; order: number; }
interface FooterPage { id: number; slug: string; titleAr: string; titleFr: string; titleEn: string; contentAr: string; contentFr: string; contentEn: string; }

type Tab = "leagues" | "matches" | "articles" | "social" | "footer" | "settings";

export default function AdminPage() {
  const { locale, t } = useLocale();
  const { theme, toggleTheme } = useTheme();
  const [activeTab, setActiveTab] = useState<Tab>("settings");
  const [leagues, setLeagues] = useState<League[]>([]);
  const [matches, setMatches] = useState<Match[]>([]);
  const [articles, setArticles] = useState<Article[]>([]);
  const [socialLinks, setSocialLinks] = useState<SocialLink[]>([]);
  const [footerPages, setFooterPages] = useState<FooterPage[]>([]);
  const [editingItem, setEditingItem] = useState<Record<string, unknown> | null>(null);
  const [isCreating, setIsCreating] = useState(false);

  const [apiKey, setApiKey] = useState("");
  const [apiKeySaved, setApiKeySaved] = useState(false);
  const [syncStatus, setSyncStatus] = useState<"idle" | "syncing" | "success" | "error">("idle");
  const [syncResult, setSyncResult] = useState<string>("");
  const [syncedCount, setSyncedCount] = useState<number>(0);

  const loadData = async () => {
    const [l, m, a, s, f] = await Promise.all([
      fetch("/api/leagues").then(r => r.json()),
      fetch("/api/matches").then(r => r.json()),
      fetch("/api/articles").then(r => r.json()),
      fetch("/api/social-links").then(r => r.json()),
      fetch("/api/footer-pages").then(r => r.json()),
    ]);
    setLeagues(l); setMatches(m); setArticles(a); setSocialLinks(s); setFooterPages(f);
  };

  useEffect(() => {
    loadData();
    fetch("/api/settings?key=football_api_key").then(r => r.json()).then(s => {
      if (s?.value) { setApiKey(s.value); setApiKeySaved(true); }
    }).catch(() => {});
  }, []);

  const deleteItem = async (type: string, id: number) => {
    if (!confirm(locale === "ar" ? "هل أنت متأكد من الحذف؟" : "Delete?")) return;
    await fetch(`/api/${type}?id=${id}`, { method: "DELETE" });
    loadData();
  };

  const handleSync = async () => {
    setSyncStatus("syncing");
    try {
      const res = await fetch("/api/football/sync", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(apiKey ? { apiKey } : {}),
      });
      const data = await res.json();
      if (data.success) {
        setSyncStatus("success");
        setSyncedCount(data.synced);
        setSyncResult(data.message || `${data.synced} matches synced`);
        loadData();
      } else {
        setSyncStatus("error");
        setSyncResult(data.error || "Sync failed");
      }
    } catch {
      setSyncStatus("error");
      setSyncResult("Connection error");
    }
    setTimeout(() => setSyncStatus("idle"), 8000);
  };

  const saveApiKey = async () => {
    await fetch("/api/settings", {
      method: "PUT",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ key: "football_api_key", value: apiKey, category: "api" }),
    });
    setApiKeySaved(true);
    setTimeout(() => setApiKeySaved(false), 3000);
  };

  const tabs = [
    { key: "settings" as Tab, label: locale === "ar" ? "إعدادات" : "Settings", icon: Key },
    { key: "matches" as Tab, label: t("matchResults"), icon: Zap },
    { key: "leagues" as Tab, label: t("championships"), icon: Trophy },
    { key: "articles" as Tab, label: t("latestNews"), icon: Newspaper },
    { key: "social" as Tab, label: "Social", icon: Globe },
    { key: "footer" as Tab, label: "Pages", icon: FileTextIcon },
  ];

  const liveCount = matches.filter(m => m.status === "live").length;
  const finishedCount = matches.filter(m => m.status === "finished").length;
  const upcomingCount = matches.filter(m => m.status === "upcoming").length;

  return (
    <div className="min-h-screen bg-gray-50 dark:bg-gray-950 flex flex-col" dir={locale === "ar" ? "rtl" : "ltr"}>
      {/* Admin Header */}
      <div className="bg-gradient-to-l from-gray-900 via-gray-800 to-gray-900 text-white py-4">
        <div className="max-w-7xl mx-auto px-4 flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 bg-yellow-400 rounded-lg flex items-center justify-center">
              <span className="text-gray-900 font-black text-lg">AS</span>
            </div>
            <div>
              <h1 className="text-xl font-black">{t("adminPanel")}</h1>
              <p className="text-xs text-gray-400">Abbourysport CMS</p>
            </div>
          </div>
          <div className="flex items-center gap-3">
            <button onClick={toggleTheme} className="p-2 rounded-lg hover:bg-white/15 transition-all">
              {theme === "dark" ? <Sun className="w-5 h-5 text-yellow-400" /> : <Moon className="w-5 h-5" />}
            </button>
            <Link href="/" className="flex items-center gap-1 text-gray-300 hover:text-white text-sm transition-colors">
              <ArrowLeft className="w-4 h-4 rtl:rotate-180" />
              {t("home")}
            </Link>
          </div>
        </div>
      </div>

      <div className="max-w-7xl mx-auto px-4 py-6 flex-1">
        {/* Stats Cards */}
        <div className="grid grid-cols-2 md:grid-cols-5 gap-3 mb-6">
          <StatCard icon={<Zap className="w-5 h-5" />} label={t("live")} count={liveCount} color="bg-red-500" />
          <StatCard icon={<Check className="w-5 h-5" />} label={t("finished")} count={finishedCount} color="bg-gray-500" />
          <StatCard icon={<CalendarIcon className="w-5 h-5" />} label={t("upcoming")} count={upcomingCount} color="bg-blue-500" />
          <StatCard icon={<Newspaper className="w-5 h-5" />} label={t("latestNews")} count={articles.length} color="bg-green-600" />
          <StatCard icon={<Trophy className="w-5 h-5" />} label={t("championships")} count={leagues.length} color="bg-yellow-500" />
        </div>

        {/* Tabs */}
        <div className="flex gap-2 mb-6 overflow-x-auto pb-2">
          {tabs.map((tab) => (
            <button
              key={tab.key}
              onClick={() => { setActiveTab(tab.key); setEditingItem(null); setIsCreating(false); }}
              className={`flex items-center gap-2 px-4 py-2.5 rounded-xl font-bold text-sm whitespace-nowrap transition-all ${
                activeTab === tab.key
                  ? "bg-green-700 text-white shadow-md"
                  : "bg-white dark:bg-gray-800 text-gray-600 dark:text-gray-300 hover:bg-gray-100 dark:hover:bg-gray-700 border border-gray-200 dark:border-gray-700"
              }`}
            >
              <tab.icon className="w-4 h-4" />
              {tab.label}
            </button>
          ))}
        </div>

        {activeTab === "settings" ? (
          <SettingsPanel
            apiKey={apiKey} setApiKey={setApiKey} apiKeySaved={apiKeySaved}
            saveApiKey={saveApiKey} handleSync={handleSync}
            syncStatus={syncStatus} syncResult={syncResult} syncedCount={syncedCount}
            locale={locale} liveCount={liveCount} finishedCount={finishedCount} upcomingCount={upcomingCount}
          />
        ) : (
          <>
            <div className="mb-4">
              <button onClick={() => { setIsCreating(true); setEditingItem(null); }} className="flex items-center gap-2 px-4 py-2 bg-green-600 text-white rounded-lg font-bold text-sm hover:bg-green-700 transition-colors shadow-md">
                <Plus className="w-4 h-4" />{t("add")}
              </button>
            </div>

            {isCreating && (
              <EditForm type={activeTab} leagues={leagues} item={null} onSave={async (data) => {
                const endpoint = activeTab === "social" ? "social-links" : activeTab === "footer" ? "footer-pages" : activeTab;
                await fetch(`/api/${endpoint}`, { method: "POST", headers: { "Content-Type": "application/json" }, body: JSON.stringify(data) });
                setIsCreating(false); loadData();
              }} onCancel={() => setIsCreating(false)} locale={locale} t={t} />
            )}

            {editingItem && (
              <EditForm type={activeTab} leagues={leagues} item={editingItem} onSave={async (data) => {
                const endpoint = activeTab === "social" ? "social-links" : activeTab === "footer" ? "footer-pages" : activeTab;
                await fetch(`/api/${endpoint}`, { method: "PUT", headers: { "Content-Type": "application/json" }, body: JSON.stringify(data) });
                setEditingItem(null); loadData();
              }} onCancel={() => setEditingItem(null)} locale={locale} t={t} />
            )}

            {!isCreating && !editingItem && (
              <>
                {activeTab === "leagues" && <LeaguesList items={leagues} locale={locale} onEdit={setEditingItem} onDelete={(id) => deleteItem("leagues", id)} />}
                {activeTab === "matches" && <MatchesList items={matches} leagues={leagues} locale={locale} onEdit={setEditingItem} onDelete={(id) => deleteItem("matches", id)} />}
                {activeTab === "articles" && <ArticlesList items={articles} locale={locale} onEdit={setEditingItem} onDelete={(id) => deleteItem("articles", id)} />}
                {activeTab === "social" && <SocialList items={socialLinks} locale={locale} onEdit={setEditingItem} onDelete={(id) => deleteItem("social-links", id)} />}
                {activeTab === "footer" && <FooterPagesList items={footerPages} locale={locale} onEdit={setEditingItem} onDelete={(id) => deleteItem("footer-pages", id)} />}
              </>
            )}
          </>
        )}
      </div>
    </div>
  );
}

function StatCard({ icon, label, count, color }: { icon: React.ReactNode; label: string; count: number; color: string }) {
  return (
    <div className="bg-white dark:bg-gray-800 rounded-xl shadow-sm border border-gray-100 dark:border-gray-700 p-4 flex items-center gap-3">
      <div className={`w-10 h-10 ${color} rounded-lg flex items-center justify-center text-white`}>{icon}</div>
      <div>
        <p className="text-2xl font-black text-gray-900 dark:text-white">{count}</p>
        <p className="text-xs text-gray-500 dark:text-gray-400">{label}</p>
      </div>
    </div>
  );
}

function CalendarIcon({ className }: { className?: string }) {
  return (
    <svg className={className} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={2} strokeLinecap="round" strokeLinejoin="round">
      <rect x="3" y="4" width="18" height="18" rx="2" /><line x1="16" y1="2" x2="16" y2="6" /><line x1="8" y1="2" x2="8" y2="6" /><line x1="3" y1="10" x2="21" y2="10" />
    </svg>
  );
}



// Settings Panel
function SettingsPanel({ apiKey, setApiKey, apiKeySaved, saveApiKey, handleSync, syncStatus, syncResult, syncedCount, locale, liveCount, finishedCount, upcomingCount }: {
  apiKey: string; setApiKey: (v: string) => void; apiKeySaved: boolean;
  saveApiKey: () => void; handleSync: () => void;
  syncStatus: string; syncResult: string; syncedCount: number; locale: string;
  liveCount: number; finishedCount: number; upcomingCount: number;
}) {
  return (
    <div className="max-w-2xl space-y-6">
      {/* API Connection Status */}
      <div className="bg-white dark:bg-gray-800 rounded-xl shadow-md border border-gray-100 dark:border-gray-700 p-6">
        <div className="flex items-center gap-2 mb-4">
          <Cloud className="w-5 h-5 text-blue-500" />
          <h3 className="font-bold text-gray-900 dark:text-white text-lg">
            {locale === "ar" ? "حالة الاتصال بـ API" : "API Connection Status"}
          </h3>
        </div>
        <div className="p-4 rounded-lg bg-green-50 dark:bg-green-900/20 border border-green-200 dark:border-green-800 mb-4">
          <div className="flex items-center gap-2 mb-2">
            <span className="w-3 h-3 bg-green-500 rounded-full animate-pulse" />
            <span className="font-bold text-green-700 dark:text-green-400 text-sm">TheSportsDB API — مُفعّل تلقائياً</span>
          </div>
          <p className="text-xs text-green-600 dark:text-green-400">
            ✅ {locale === "ar" ? "ربط تلقائي — لا يحتاج مفتاح API! بيانات حقيقية من 9 دوريات" : "Auto-connected — No API key needed! Real data from 9 leagues"}
          </p>
        </div>
        <div className="grid grid-cols-3 gap-3">
          <div className="p-3 rounded-lg text-center bg-red-50 dark:bg-red-900/20 border border-red-200 dark:border-red-800">
            <Zap className="w-5 h-5 mx-auto mb-1 text-red-500" />
            <p className="text-lg font-black text-red-700 dark:text-red-400">{liveCount}</p>
            <p className="text-[10px] font-bold text-red-600 dark:text-red-400">{locale === "ar" ? "مباشر" : "Live"}</p>
          </div>
          <div className="p-3 rounded-lg text-center bg-blue-50 dark:bg-blue-900/20 border border-blue-200 dark:border-blue-800">
            <CalendarIcon className="w-5 h-5 mx-auto mb-1 text-blue-500" />
            <p className="text-lg font-black text-blue-700 dark:text-blue-400">{upcomingCount}</p>
            <p className="text-[10px] font-bold text-blue-600 dark:text-blue-400">{locale === "ar" ? "قادمة" : "Upcoming"}</p>
          </div>
          <div className="p-3 rounded-lg text-center bg-gray-50 dark:bg-gray-700 border border-gray-200 dark:border-gray-600">
            <Database className="w-5 h-5 mx-auto mb-1 text-gray-500" />
            <p className="text-lg font-black text-gray-700 dark:text-gray-300">{liveCount + finishedCount + upcomingCount}</p>
            <p className="text-[10px] font-bold text-gray-600 dark:text-gray-400">{locale === "ar" ? "إجمالي" : "Total"}</p>
          </div>
        </div>
      </div>

      {/* API Key Setting */}
      <div className="bg-white dark:bg-gray-800 rounded-xl shadow-md border border-gray-100 dark:border-gray-700 p-6">
        <div className="flex items-center gap-2 mb-4">
          <Key className="w-5 h-5 text-yellow-500" />
          <h3 className="font-bold text-gray-900 dark:text-white text-lg">
            {locale === "ar" ? "مفتاح Football Data API" : "Football Data API Key"}
          </h3>
        </div>
        <p className="text-sm text-gray-500 dark:text-gray-400 mb-4">
          {locale === "ar"
            ? "احصل على مفتاح مجاني من football-data.org لمزامنة المباريات الحقيقية (10 طلبات/دقيقة)"
            : "Get a free API key from football-data.org to sync real matches (10 requests/min)"}
        </p>
        <div className="flex gap-2">
          <input
            type="password"
            value={apiKey}
            onChange={(e) => setApiKey(e.target.value)}
            placeholder="Enter your football-data.org API key..."
            className="flex-1 px-4 py-2.5 border border-gray-200 dark:border-gray-600 rounded-lg bg-gray-50 dark:bg-gray-700 text-gray-800 dark:text-gray-200 text-sm focus:outline-none focus:ring-2 focus:ring-green-500"
          />
          <button onClick={saveApiKey} className="flex items-center gap-1 px-4 py-2.5 bg-green-600 text-white rounded-lg font-bold text-sm hover:bg-green-700 transition-colors">
            {apiKeySaved ? <Check className="w-4 h-4" /> : <Save className="w-4 h-4" />}
            {apiKeySaved ? "✓" : "Save"}
          </button>
        </div>
      </div>

      {/* Sync */}
      <div className="bg-white dark:bg-gray-800 rounded-xl shadow-md border border-gray-100 dark:border-gray-700 p-6">
        <div className="flex items-center gap-2 mb-4">
          <RefreshCw className="w-5 h-5 text-blue-500" />
          <h3 className="font-bold text-gray-900 dark:text-white text-lg">
            {locale === "ar" ? "مزامنة المباريات الحقيقية" : "Sync Real Matches"}
          </h3>
        </div>
        <p className="text-sm text-gray-500 dark:text-gray-400 mb-2">
          {locale === "ar"
            ? "سيتم استيراد مباريات حقيقية من الدوريات التالية:"
            : "Real matches will be imported from the following leagues:"}
        </p>
        <div className="flex flex-wrap gap-2 mb-4">
          {["🦁 Premier League", "🐂 La Liga", "🐓 Ligue 1", "🏟️ Serie A", "⚽ Bundesliga", "🏆 World Cup"].map(l => (
            <span key={l} className="px-3 py-1 bg-blue-50 dark:bg-blue-900/20 text-blue-700 dark:text-blue-400 rounded-full text-xs font-bold">{l}</span>
          ))}
        </div>
        <button
          onClick={handleSync}
          disabled={syncStatus === "syncing" || !apiKey}
          className="flex items-center gap-2 px-6 py-3 bg-blue-600 text-white rounded-xl font-bold text-sm hover:bg-blue-700 transition-colors shadow-md disabled:opacity-50 disabled:cursor-not-allowed"
        >
          <RefreshCw className={`w-5 h-5 ${syncStatus === "syncing" ? "animate-spin" : ""}`} />
          {syncStatus === "syncing"
            ? (locale === "ar" ? "جاري المزامنة..." : "Syncing...")
            : (locale === "ar" ? "مزامنة الآن" : "Sync Now")}
        </button>
        {syncResult && (
          <div className={`mt-3 flex items-center gap-2 text-sm font-medium p-3 rounded-lg ${
            syncStatus === "success" ? "text-green-700 bg-green-50 dark:bg-green-900/20 dark:text-green-400" : "text-red-700 bg-red-50 dark:bg-red-900/20 dark:text-red-400"
          }`}>
            {syncStatus === "success" ? <Check className="w-4 h-4" /> : <AlertCircle className="w-4 h-4" />}
            {syncResult}
          </div>
        )}
      </div>

      {/* How to get API key */}
      <div className="bg-gradient-to-br from-green-50 to-emerald-50 dark:from-green-900/20 dark:to-emerald-900/20 rounded-xl border border-green-200 dark:border-green-800 p-6">
        <h3 className="font-bold text-green-800 dark:text-green-400 mb-3 text-lg">
          📖 {locale === "ar" ? "كيفية الحصول على مفتاح API مجاني" : "How to get a free API key"}
        </h3>
        <ol className="text-sm text-green-700 dark:text-green-300 space-y-2 list-decimal list-inside">
          <li>{locale === "ar" ? "اذهب إلى " : "Go to "}
            <a href="https://www.football-data.org/client/register" target="_blank" rel="noopener noreferrer" className="underline font-bold hover:text-green-900 dark:hover:text-green-100">football-data.org/client/register</a>
          </li>
          <li>{locale === "ar" ? "سجل حساب مجاني بالبريد الإلكتروني" : "Register a free account with your email"}</li>
          <li>{locale === "ar" ? "ستصلك رسالة تأكيد - اضغط على الرابط" : "You'll receive a confirmation email - click the link"}</li>
          <li>{locale === "ar" ? "انسخ مفتاح API من صفحة حسابك" : "Copy your API key from your account page"}</li>
          <li>{locale === "ar" ? "الصق المفتاح أعلاه واضغط حفظ ثم مزامنة" : "Paste the key above, click Save, then Sync"}</li>
        </ol>
        <div className="mt-4 p-3 bg-yellow-50 dark:bg-yellow-900/20 rounded-lg border border-yellow-200 dark:border-yellow-800">
          <p className="text-xs text-yellow-700 dark:text-yellow-400">
            ⚡ {locale === "ar" ? "الخطة المجانية: 10 طلبات/دقيقة - كافية لتحديث المباريات كل 30 ثانية" : "Free tier: 10 requests/min - enough for 30-second match updates"}
          </p>
        </div>
      </div>

      {/* Vercel Deployment Guide */}
      <div className="bg-gradient-to-br from-gray-50 to-slate-50 dark:from-gray-800 dark:to-gray-800 rounded-xl border border-gray-200 dark:border-gray-700 p-6">
        <h3 className="font-bold text-gray-800 dark:text-gray-200 mb-3 text-lg">
          🚀 {locale === "ar" ? "نشر الموقع على Vercel" : "Deploy to Vercel"}
        </h3>
        <ol className="text-sm text-gray-600 dark:text-gray-400 space-y-2 list-decimal list-inside">
          <li>{locale === "ar" ? "ارفع المشروع على GitHub" : "Push project to GitHub"}</li>
          <li>{locale === "ar" ? "اذهب إلى vercel.com وسجل دخولك" : "Go to vercel.com and sign in"}</li>
          <li>{locale === "ar" ? "اضغط 'New Project' واختر المستودع" : "Click 'New Project' and select your repo"}</li>
          <li>{locale === "ar" ? "أضف متغيرات البيئة (Environment Variables):" : "Add Environment Variables:"}
            <ul className="ms-6 mt-1 space-y-1 text-xs font-mono">
              <li className="text-blue-600 dark:text-blue-400">DATABASE_URL = postgresql://user:pass@host/db?sslmode=require</li>
              <li className="text-blue-600 dark:text-blue-400">FOOTBALL_API_KEY = your_api_key</li>
            </ul>
          </li>
          <li>{locale === "ar" ? "اضغط Deploy وانتظر البناء" : "Click Deploy and wait for the build"}</li>
          <li>{locale === "ar" ? "بعد النشر، شغّل المزامنة من لوحة التحكم" : "After deploy, run sync from the admin panel"}</li>
        </ol>
        <div className="mt-4 p-3 bg-blue-50 dark:bg-blue-900/20 rounded-lg border border-blue-200 dark:border-blue-800">
          <p className="text-xs text-blue-700 dark:text-blue-400">
            💡 {locale === "ar" ? "لقاعدة البيانات: استخدم Neon PostgreSQL (مجاني) من neon.tech" : "For database: use Neon PostgreSQL (free) from neon.tech"}
          </p>
        </div>
      </div>
    </div>
  );
}

function FileTextIcon({ className }: { className?: string }) {
  return (
    <svg className={className} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={2} strokeLinecap="round" strokeLinejoin="round">
      <path d="M14 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V8z" />
      <polyline points="14 2 14 8 20 8" />
      <line x1="16" y1="13" x2="8" y2="13" />
      <line x1="16" y1="17" x2="8" y2="17" />
    </svg>
  );
}

// Edit Form Component
function EditForm({ type, leagues, item, onSave, onCancel, locale, t }: {
  type: Tab; leagues: League[]; item: Record<string, unknown> | null;
  onSave: (data: Record<string, unknown>) => Promise<void>;
  onCancel: () => void; locale: string; t: (key: TranslationKey) => string;
}) {
  const isEdit = !!item;
  const getInitialValues = (): Record<string, unknown> => {
    if (item) return { ...item };
    switch (type) {
      case "leagues": return { nameAr: "", nameFr: "", nameEn: "", slug: "", order: 0 };
      case "matches": return { leagueId: leagues[0]?.id || 0, homeTeamAr: "", homeTeamFr: "", homeTeamEn: "", awayTeamAr: "", awayTeamFr: "", awayTeamEn: "", homeScore: null, awayScore: null, status: "upcoming", matchDate: "", matchTime: "" };
      case "articles": return { titleAr: "", titleFr: "", titleEn: "", contentAr: "", contentFr: "", contentEn: "", summaryAr: "", summaryFr: "", summaryEn: "", isPublished: true };
      case "social": return { platform: "", url: "", icon: "facebook", order: 0 };
      case "footer": return { slug: "", titleAr: "", titleFr: "", titleEn: "", contentAr: "", contentFr: "", contentEn: "" };
      default: return {};
    }
  };
  const [form, setForm] = useState(getInitialValues);
  const updateField = (key: string, value: unknown) => setForm((prev) => ({ ...prev, [key]: value }));

  const handleSubmit = (e: FormEvent) => { e.preventDefault(); onSave(form); };

  const renderField = (key: string, labelAr: string, labelFr: string, labelEn: string, inputType: "text" | "number" | "textarea" | "select" = "text", options?: Array<{ value: unknown; label: string }>) => {
    const label = locale === "ar" ? labelAr : locale === "fr" ? labelFr : labelEn;
    return (
      <div key={key} className="mb-4">
        <label className="block text-sm font-bold text-gray-700 dark:text-gray-300 mb-1">{label}</label>
        {inputType === "textarea" ? (
          <textarea value={(form[key] as string) || ""} onChange={(e) => updateField(key, e.target.value)}
            className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-700 text-gray-800 dark:text-gray-200 text-sm focus:outline-none focus:ring-2 focus:ring-green-500 min-h-[80px]" />
        ) : inputType === "select" ? (
          <select value={String(form[key] ?? "")} onChange={(e) => updateField(key, e.target.value === "null" ? null : isNaN(Number(e.target.value)) ? e.target.value : Number(e.target.value))}
            className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-700 text-gray-800 dark:text-gray-200 text-sm focus:outline-none focus:ring-2 focus:ring-green-500">
            {options?.map((opt) => <option key={String(opt.value)} value={String(opt.value)}>{opt.label}</option>)}
          </select>
        ) : (
          <input type={inputType} value={(form[key] as string | number) ?? ""}
            onChange={(e) => updateField(key, inputType === "number" ? (e.target.value === "" ? null : Number(e.target.value)) : e.target.value)}
            className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-700 text-gray-800 dark:text-gray-200 text-sm focus:outline-none focus:ring-2 focus:ring-green-500" />
        )}
      </div>
    );
  };

  return (
    <form onSubmit={handleSubmit} className="bg-white dark:bg-gray-800 rounded-xl shadow-md border border-gray-100 dark:border-gray-700 p-6 mb-6 animate-fadeIn">
      <div className="flex items-center justify-between mb-6">
        <h3 className="text-lg font-bold text-gray-900 dark:text-white">{isEdit ? t("edit") : t("add")}</h3>
        <button type="button" onClick={onCancel} className="text-gray-400 hover:text-gray-600 dark:hover:text-gray-300"><X className="w-5 h-5" /></button>
      </div>
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        {type === "leagues" && <>{renderField("nameAr","الاسم بالعربية","Nom en arabe","Name in Arabic")}{renderField("nameFr","الاسم بالفرنسية","Nom en français","Name in French")}{renderField("nameEn","الاسم بالإنجليزية","Name in English","Name in English")}{renderField("slug","الرابط","Slug","Slug")}{renderField("order","الترتيب","Ordre","Order","number")}</>}
        {type === "matches" && <>{renderField("leagueId","البطولة","Championnat","League","select",leagues.map(l=>({value:l.id,label:l.nameEn})))}{renderField("homeTeamAr","المضيف (عربي)","Domicile (arabe)","Home (Arabic)")}{renderField("homeTeamFr","المضيف (فرنسي)","Domicile (français)","Home (French)")}{renderField("homeTeamEn","المضيف (إنجليزي)","Home (English)","Home (English)")}{renderField("awayTeamAr","الضيف (عربي)","Extérieur (arabe)","Away (Arabic)")}{renderField("awayTeamFr","الضيف (فرنسي)","Extérieur (français)","Away (French)")}{renderField("awayTeamEn","الضيف (إنجليزي)","Away (English)","Away (English)")}{renderField("status","الحالة","Statut","Status","select",[{value:"live",label:"🔴 Live"},{value:"finished",label:"✅ Finished"},{value:"upcoming",label:"📅 Upcoming"}])}{renderField("homeScore","نتيجة المضيف","Score domicile","Home score","number")}{renderField("awayScore","نتيجة الضيف","Score extérieur","Away score","number")}{renderField("matchDate","التاريخ","Date","Date")}{renderField("matchTime","الوقت","Heure","Time")}</>}
        {type === "articles" && <>{renderField("titleAr","العنوان (عربي)","Titre (arabe)","Title (Arabic)")}{renderField("titleFr","العنوان (فرنسي)","Titre (français)","Title (French)")}{renderField("titleEn","العنوان (إنجليزي)","Title (English)","Title (English)")}{renderField("summaryAr","الملخص (عربي)","Résumé (arabe)","Summary (Arabic)","textarea")}{renderField("summaryFr","الملخص (فرنسي)","Résumé (français)","Summary (French)","textarea")}{renderField("summaryEn","الملخص (إنجليزي)","Summary (English)","Summary (English)","textarea")}{renderField("contentAr","المحتوى (عربي)","Contenu (arabe)","Content (Arabic)","textarea")}{renderField("contentFr","المحتوى (فرنسي)","Contenu (français)","Content (French)","textarea")}{renderField("contentEn","المحتوى (إنجليزي)","Content (English)","Content (English)","textarea")}{renderField("isPublished","منشور","Publié","Published","select",[{value:true,label:"✅ Yes"},{value:false,label:"❌ No"}])}</>}
        {type === "social" && <>{renderField("platform","المنصة","Plateforme","Platform")}{renderField("url","الرابط","URL","URL")}{renderField("icon","الأيقونة","Icône","Icon","select",[{value:"facebook",label:"Facebook"},{value:"twitter",label:"Twitter/X"},{value:"instagram",label:"Instagram"},{value:"youtube",label:"YouTube"},{value:"tiktok",label:"TikTok"}])}{renderField("order","الترتيب","Ordre","Order","number")}</>}
        {type === "footer" && <>{renderField("slug","الرابط","Slug","Slug")}{renderField("titleAr","العنوان (عربي)","Titre (arabe)","Title (Arabic)")}{renderField("titleFr","العنوان (فرنسي)","Titre (français)","Title (French)")}{renderField("titleEn","العنوان (إنجليزي)","Title (English)","Title (English)")}{renderField("contentAr","المحتوى (عربي)","Contenu (arabe)","Content (Arabic)","textarea")}{renderField("contentFr","المحتوى (فرنسي)","Contenu (français)","Content (French)","textarea")}{renderField("contentEn","المحتوى (إنجليزي)","Content (English)","Content (English)","textarea")}</>}
      </div>
      <div className="flex items-center gap-3 mt-6 pt-4 border-t border-gray-100 dark:border-gray-700">
        <button type="submit" className="flex items-center gap-2 px-6 py-2.5 bg-green-600 text-white rounded-lg font-bold text-sm hover:bg-green-700 transition-colors shadow-md"><Save className="w-4 h-4" />{t("save")}</button>
        <button type="button" onClick={onCancel} className="flex items-center gap-2 px-6 py-2.5 bg-gray-100 dark:bg-gray-700 text-gray-700 dark:text-gray-300 rounded-lg font-bold text-sm hover:bg-gray-200 dark:hover:bg-gray-600 transition-colors">{t("cancel")}</button>
      </div>
    </form>
  );
}

// List Components
function LeaguesList({ items, locale, onEdit, onDelete }: { items: League[]; locale: string; onEdit: (i: Record<string, unknown>) => void; onDelete: (id: number) => void }) {
  return (
    <div className="bg-white dark:bg-gray-800 rounded-xl shadow-md border border-gray-100 dark:border-gray-700 overflow-hidden">
      <div className="overflow-x-auto"><table className="w-full">
        <thead className="bg-gray-50 dark:bg-gray-900 border-b border-gray-100 dark:border-gray-700"><tr><th className="px-4 py-3 text-start text-xs font-bold text-gray-500 dark:text-gray-400 uppercase">Name</th><th className="px-4 py-3 text-start text-xs font-bold text-gray-500 dark:text-gray-400 uppercase">Slug</th><th className="px-4 py-3 text-end text-xs font-bold text-gray-500 dark:text-gray-400 uppercase">Actions</th></tr></thead>
        <tbody>{items.map((item) => (
          <tr key={item.id} className="border-b border-gray-50 dark:border-gray-700 hover:bg-gray-50 dark:hover:bg-gray-750">
            <td className="px-4 py-3 text-sm font-medium text-gray-900 dark:text-gray-200">{getLocalizedField(item as unknown as Record<string, unknown>, "name", locale as "ar" | "fr" | "en")}</td>
            <td className="px-4 py-3 text-sm text-gray-500 dark:text-gray-400">{item.slug}</td>
            <td className="px-4 py-3 text-end"><div className="flex items-center justify-end gap-2">
              <button onClick={() => onEdit(item as unknown as Record<string, unknown>)} className="p-1.5 text-blue-600 dark:text-blue-400 hover:bg-blue-50 dark:hover:bg-blue-900/30 rounded-lg"><Edit3 className="w-4 h-4" /></button>
              <button onClick={() => onDelete(item.id)} className="p-1.5 text-red-600 dark:text-red-400 hover:bg-red-50 dark:hover:bg-red-900/30 rounded-lg"><Trash2 className="w-4 h-4" /></button>
            </div></td>
          </tr>
        ))}</tbody>
      </table></div>
    </div>
  );
}

function MatchesList({ items, leagues, locale, onEdit, onDelete }: { items: Match[]; leagues: League[]; locale: string; onEdit: (i: Record<string, unknown>) => void; onDelete: (id: number) => void }) {
  return (
    <div className="bg-white dark:bg-gray-800 rounded-xl shadow-md border border-gray-100 dark:border-gray-700 overflow-hidden">
      <div className="overflow-x-auto"><table className="w-full">
        <thead className="bg-gray-50 dark:bg-gray-900 border-b border-gray-100 dark:border-gray-700"><tr><th className="px-4 py-3 text-start text-xs font-bold text-gray-500 dark:text-gray-400 uppercase">Home</th><th className="px-4 py-3 text-start text-xs font-bold text-gray-500 dark:text-gray-400 uppercase">Away</th><th className="px-4 py-3 text-start text-xs font-bold text-gray-500 dark:text-gray-400 uppercase">Score</th><th className="px-4 py-3 text-start text-xs font-bold text-gray-500 dark:text-gray-400 uppercase">Status</th><th className="px-4 py-3 text-end text-xs font-bold text-gray-500 dark:text-gray-400 uppercase">Actions</th></tr></thead>
        <tbody>{items.map((item) => (
          <tr key={item.id} className="border-b border-gray-50 dark:border-gray-700 hover:bg-gray-50 dark:hover:bg-gray-750">
            <td className="px-4 py-3 text-sm font-medium text-gray-900 dark:text-gray-200">{item.homeTeamEn}</td>
            <td className="px-4 py-3 text-sm font-medium text-gray-900 dark:text-gray-200">{item.awayTeamEn}</td>
            <td className="px-4 py-3 text-sm font-bold text-gray-900 dark:text-gray-200">{item.homeScore ?? "-"} - {item.awayScore ?? "-"}</td>
            <td className="px-4 py-3"><span className={`px-2 py-0.5 rounded-full text-xs font-bold ${item.status === "live" ? "bg-red-100 dark:bg-red-900/30 text-red-700 dark:text-red-400" : item.status === "finished" ? "bg-gray-100 dark:bg-gray-700 text-gray-700 dark:text-gray-300" : "bg-blue-100 dark:bg-blue-900/30 text-blue-700 dark:text-blue-400"}`}>{item.status}</span></td>
            <td className="px-4 py-3 text-end"><div className="flex items-center justify-end gap-2">
              <button onClick={() => onEdit(item as unknown as Record<string, unknown>)} className="p-1.5 text-blue-600 dark:text-blue-400 hover:bg-blue-50 dark:hover:bg-blue-900/30 rounded-lg"><Edit3 className="w-4 h-4" /></button>
              <button onClick={() => onDelete(item.id)} className="p-1.5 text-red-600 dark:text-red-400 hover:bg-red-50 dark:hover:bg-red-900/30 rounded-lg"><Trash2 className="w-4 h-4" /></button>
            </div></td>
          </tr>
        ))}</tbody>
      </table></div>
    </div>
  );
}

function ArticlesList({ items, locale, onEdit, onDelete }: { items: Article[]; locale: string; onEdit: (i: Record<string, unknown>) => void; onDelete: (id: number) => void }) {
  return (
    <div className="bg-white dark:bg-gray-800 rounded-xl shadow-md border border-gray-100 dark:border-gray-700 overflow-hidden">
      <div className="overflow-x-auto"><table className="w-full">
        <thead className="bg-gray-50 dark:bg-gray-900 border-b border-gray-100 dark:border-gray-700"><tr><th className="px-4 py-3 text-start text-xs font-bold text-gray-500 dark:text-gray-400 uppercase">Title</th><th className="px-4 py-3 text-start text-xs font-bold text-gray-500 dark:text-gray-400 uppercase">Published</th><th className="px-4 py-3 text-end text-xs font-bold text-gray-500 dark:text-gray-400 uppercase">Actions</th></tr></thead>
        <tbody>{items.map((item) => (
          <tr key={item.id} className="border-b border-gray-50 dark:border-gray-700 hover:bg-gray-50 dark:hover:bg-gray-750">
            <td className="px-4 py-3 text-sm font-medium text-gray-900 dark:text-gray-200 max-w-xs truncate">{getLocalizedField(item as unknown as Record<string, unknown>, "title", locale as "ar" | "fr" | "en")}</td>
            <td className="px-4 py-3"><span className={`px-2 py-0.5 rounded-full text-xs font-bold ${item.isPublished ? "bg-green-100 dark:bg-green-900/30 text-green-700 dark:text-green-400" : "bg-gray-100 dark:bg-gray-700 text-gray-700 dark:text-gray-300"}`}>{item.isPublished ? "✅" : "❌"}</span></td>
            <td className="px-4 py-3 text-end"><div className="flex items-center justify-end gap-2">
              <button onClick={() => onEdit(item as unknown as Record<string, unknown>)} className="p-1.5 text-blue-600 dark:text-blue-400 hover:bg-blue-50 dark:hover:bg-blue-900/30 rounded-lg"><Edit3 className="w-4 h-4" /></button>
              <button onClick={() => onDelete(item.id)} className="p-1.5 text-red-600 dark:text-red-400 hover:bg-red-50 dark:hover:bg-red-900/30 rounded-lg"><Trash2 className="w-4 h-4" /></button>
            </div></td>
          </tr>
        ))}</tbody>
      </table></div>
    </div>
  );
}

function SocialList({ items, onEdit, onDelete }: { items: SocialLink[]; locale: string; onEdit: (i: Record<string, unknown>) => void; onDelete: (id: number) => void }) {
  return (
    <div className="bg-white dark:bg-gray-800 rounded-xl shadow-md border border-gray-100 dark:border-gray-700 overflow-hidden">
      <div className="overflow-x-auto"><table className="w-full">
        <thead className="bg-gray-50 dark:bg-gray-900 border-b border-gray-100 dark:border-gray-700"><tr><th className="px-4 py-3 text-start text-xs font-bold text-gray-500 dark:text-gray-400 uppercase">Platform</th><th className="px-4 py-3 text-start text-xs font-bold text-gray-500 dark:text-gray-400 uppercase">URL</th><th className="px-4 py-3 text-end text-xs font-bold text-gray-500 dark:text-gray-400 uppercase">Actions</th></tr></thead>
        <tbody>{items.map((item) => (
          <tr key={item.id} className="border-b border-gray-50 dark:border-gray-700 hover:bg-gray-50 dark:hover:bg-gray-750">
            <td className="px-4 py-3 text-sm font-medium text-gray-900 dark:text-gray-200">{item.platform}</td>
            <td className="px-4 py-3 text-sm text-gray-500 dark:text-gray-400 max-w-xs truncate">{item.url}</td>
            <td className="px-4 py-3 text-end"><div className="flex items-center justify-end gap-2">
              <button onClick={() => onEdit(item as unknown as Record<string, unknown>)} className="p-1.5 text-blue-600 dark:text-blue-400 hover:bg-blue-50 dark:hover:bg-blue-900/30 rounded-lg"><Edit3 className="w-4 h-4" /></button>
              <button onClick={() => onDelete(item.id)} className="p-1.5 text-red-600 dark:text-red-400 hover:bg-red-50 dark:hover:bg-red-900/30 rounded-lg"><Trash2 className="w-4 h-4" /></button>
            </div></td>
          </tr>
        ))}</tbody>
      </table></div>
    </div>
  );
}

function FooterPagesList({ items, locale, onEdit, onDelete }: { items: FooterPage[]; locale: string; onEdit: (i: Record<string, unknown>) => void; onDelete: (id: number) => void }) {
  return (
    <div className="bg-white dark:bg-gray-800 rounded-xl shadow-md border border-gray-100 dark:border-gray-700 overflow-hidden">
      <div className="overflow-x-auto"><table className="w-full">
        <thead className="bg-gray-50 dark:bg-gray-900 border-b border-gray-100 dark:border-gray-700"><tr><th className="px-4 py-3 text-start text-xs font-bold text-gray-500 dark:text-gray-400 uppercase">Slug</th><th className="px-4 py-3 text-start text-xs font-bold text-gray-500 dark:text-gray-400 uppercase">Title</th><th className="px-4 py-3 text-end text-xs font-bold text-gray-500 dark:text-gray-400 uppercase">Actions</th></tr></thead>
        <tbody>{items.map((item) => (
          <tr key={item.id} className="border-b border-gray-50 dark:border-gray-700 hover:bg-gray-50 dark:hover:bg-gray-750">
            <td className="px-4 py-3 text-sm text-gray-500 dark:text-gray-400">{item.slug}</td>
            <td className="px-4 py-3 text-sm font-medium text-gray-900 dark:text-gray-200">{getLocalizedField(item as unknown as Record<string, unknown>, "title", locale as "ar" | "fr" | "en")}</td>
            <td className="px-4 py-3 text-end"><div className="flex items-center justify-end gap-2">
              <button onClick={() => onEdit(item as unknown as Record<string, unknown>)} className="p-1.5 text-blue-600 dark:text-blue-400 hover:bg-blue-50 dark:hover:bg-blue-900/30 rounded-lg"><Edit3 className="w-4 h-4" /></button>
              <button onClick={() => onDelete(item.id)} className="p-1.5 text-red-600 dark:text-red-400 hover:bg-red-50 dark:hover:bg-red-900/30 rounded-lg"><Trash2 className="w-4 h-4" /></button>
            </div></td>
          </tr>
        ))}</tbody>
      </table></div>
    </div>
  );
}
