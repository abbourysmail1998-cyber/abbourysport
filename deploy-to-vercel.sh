#!/bin/bash
echo "🚀 Abbourysport - Deploy to Vercel"
echo "===================================="
echo ""
echo "Step 1: Installing Vercel CLI..."
npm install -g vercel
echo ""
echo "Step 2: Logging in to Vercel..."
vercel login
echo ""
echo "Step 3: Deploying to Vercel..."
vercel --prod
echo ""
echo "✅ Done! Your site is live on Vercel!"
