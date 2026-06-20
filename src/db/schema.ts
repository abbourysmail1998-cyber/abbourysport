import { pgTable, serial, text, varchar, integer, timestamp, boolean, jsonb } from "drizzle-orm/pg-core";

// Leagues / Championships
export const leagues = pgTable("leagues", {
  id: serial("id").primaryKey(),
  nameAr: varchar("name_ar", { length: 255 }).notNull(),
  nameFr: varchar("name_fr", { length: 255 }).notNull(),
  nameEn: varchar("name_en", { length: 255 }).notNull(),
  slug: varchar("slug", { length: 255 }).notNull().unique(),
  logo: text("logo"),
  order: integer("order").default(0),
});

// Matches
export const matches = pgTable("matches", {
  id: serial("id").primaryKey(),
  leagueId: integer("league_id").references(() => leagues.id),
  homeTeamAr: varchar("home_team_ar", { length: 255 }).notNull(),
  homeTeamFr: varchar("home_team_fr", { length: 255 }).notNull(),
  homeTeamEn: varchar("home_team_en", { length: 255 }).notNull(),
  awayTeamAr: varchar("away_team_ar", { length: 255 }).notNull(),
  awayTeamFr: varchar("away_team_fr", { length: 255 }).notNull(),
  awayTeamEn: varchar("away_team_en", { length: 255 }).notNull(),
  homeScore: integer("home_score"),
  awayScore: integer("away_score"),
  status: varchar("status", { length: 20 }).notNull(), // live, finished, upcoming
  matchDate: timestamp("match_date"),
  matchTime: varchar("match_time", { length: 10 }),
  homeLogo: text("home_logo"),
  awayLogo: text("away_logo"),
});

// Articles / News
export const articles = pgTable("articles", {
  id: serial("id").primaryKey(),
  titleAr: text("title_ar").notNull(),
  titleFr: text("title_fr").notNull(),
  titleEn: text("title_en").notNull(),
  contentAr: text("content_ar").notNull(),
  contentFr: text("content_fr").notNull(),
  contentEn: text("content_en").notNull(),
  summaryAr: text("summary_ar"),
  summaryFr: text("summary_fr"),
  summaryEn: text("summary_en"),
  image: text("image"),
  category: varchar("category", { length: 100 }),
  publishedAt: timestamp("published_at").defaultNow(),
  isPublished: boolean("is_published").default(true),
});

// Social Links
export const socialLinks = pgTable("social_links", {
  id: serial("id").primaryKey(),
  platform: varchar("platform", { length: 50 }).notNull(), // facebook, twitter, instagram, youtube, tiktok
  url: text("url").notNull(),
  icon: varchar("icon", { length: 50 }),
  order: integer("order").default(0),
});

// Site Settings (for CMS-like editing)
export const siteSettings = pgTable("site_settings", {
  id: serial("id").primaryKey(),
  key: varchar("key", { length: 255 }).notNull().unique(),
  valueAr: text("value_ar"),
  valueFr: text("value_fr"),
  valueEn: text("value_en"),
  value: text("value"), // for non-translatable settings
  category: varchar("category", { length: 100 }),
});

// Footer Pages (About, Privacy, Contact)
export const footerPages = pgTable("footer_pages", {
  id: serial("id").primaryKey(),
  slug: varchar("slug", { length: 255 }).notNull().unique(),
  titleAr: varchar("title_ar", { length: 255 }).notNull(),
  titleFr: varchar("title_fr", { length: 255 }).notNull(),
  titleEn: varchar("title_en", { length: 255 }).notNull(),
  contentAr: text("content_ar").notNull(),
  contentFr: text("content_fr").notNull(),
  contentEn: text("content_en").notNull(),
});
