import { type Locale } from "./i18n";

export function getLocalizedField(obj: Record<string, unknown>, field: string, locale: Locale): string {
  const suffix = locale === "ar" ? "Ar" : locale === "fr" ? "Fr" : "En";
  const key = field + suffix;
  return (obj[key] as string) || (obj[field] as string) || "";
}

export function formatDate(date: Date | string | null, locale: Locale): string {
  if (!date) return "";
  const d = new Date(date);
  const localeMap = { ar: "ar-SA", fr: "fr-FR", en: "en-US" };
  return d.toLocaleDateString(localeMap[locale], {
    year: "numeric",
    month: "long",
    day: "numeric",
  });
}

export function formatTime(time: string | null): string {
  if (!time) return "";
  return time;
}
