# ⚽ Abbourysport - Sports News & Results

موقع رياضي احترافي يغطي أخبار كرة القدم والبطولات العالمية والمحلية

## 🌟 Features

- **9 Leagues**: World Cup, Premier League, La Liga, Ligue 1, Serie A, Bundesliga, Moroccan, Egyptian, Algerian
- **Real Match Data**: Auto-synced from TheSportsDB (free, no API key)
- **3 Languages**: Arabic 🇲🇦, French 🇫🇷, English 🇬🇧
- **Dark Mode**: 🌙 Full dark mode support
- **Admin Panel**: 4-click on logo + password (ismail1998)
- **Live Updates**: Auto-refresh every 30 seconds
- **CMS**: Manage all content without touching code

## 🚀 Deploy to Vercel

### Quick Deploy
```bash
npm install -g vercel
vercel login
vercel --prod
```

### Environment Variables (set in Vercel Dashboard)
```
DATABASE_URL=postgresql://neondb_owner:npg_XbajFl3mI1EP@ep-rough-fog-ajr2ldpc-pooler.c-3.us-east-2.aws.neon.tech/neondb?sslmode=require
FOOTBALL_API_KEY= (optional)
```

## 🔐 Admin Access
1. Click 4 times on "Abbourysport" logo
2. Enter password: `ismail1998`
3. Manage leagues, matches, articles, social links, footer pages

## 🛠 Tech Stack
- Next.js 16 (App Router)
- PostgreSQL (Neon)
- Drizzle ORM
- Tailwind CSS v4
- TheSportsDB API
- TypeScript

## 📱 Pages
| Page | Route |
|------|-------|
| Home | `/` |
| Match Results | `/matches` |
| Latest News | `/news` |
| Championships | `/championships` |
| Championship Detail | `/championships/[slug]` |
| Admin Panel | `/admin` |
| About Us | `/page/about` |
| Privacy Policy | `/page/privacy` |
| Contact | `/page/contact` |
