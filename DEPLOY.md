# 🚀 Abbourysport - Deploy to Vercel

## Quick Deploy (1 Click)

Click the button below to deploy to Vercel:

[![Deploy with Vercel](https://vercel.com/button)](https://vercel.com/new/clone?repository-url=https://github.com/abbourysport/abbourysport&env=DATABASE_URL,FOOTBALL_API_KEY&envDescription=Database%20and%20API%20keys&envLink=https://neon.tech)

## Manual Deploy Steps

### 1. Push to GitHub
```bash
git remote add origin https://github.com/YOUR_USERNAME/abbourysport.git
git push -u origin main
```

### 2. Deploy on Vercel
1. Go to [vercel.com/new](https://vercel.com/new)
2. Import your GitHub repository
3. Add Environment Variables:
   - `DATABASE_URL` = `postgresql://neondb_owner:npg_XbajFl3mI1EP@ep-rough-fog-ajr2ldpc-pooler.c-3.us-east-2.aws.neon.tech/neondb?sslmode=require`
   - `FOOTBALL_API_KEY` = (optional - TheSportsDB works without a key)
4. Click **Deploy**

### 3. After Deploy
1. Visit your site
2. Click 4 times on "Abbourysport" logo
3. Enter password: `ismail1998`
4. Go to Settings → Click "Sync Now" to import real matches

## Features
- ⚽ Real match data from TheSportsDB (free, no API key)
- 🌍 Arabic, French, English support
- 🌙 Dark mode
- 🔐 Admin panel (4-click access + password)
- 📱 Responsive design
- 🔄 Auto-refresh every 30 seconds
