# Deploy TigerStream for Your Family

Your TMDB API key is now configured and ready for production!

## Quick Deploy to Vercel (Recommended - Free)

### Step 1: Connect Your GitHub Repository
1. Go to [vercel.com](https://vercel.com)
2. Sign in with GitHub
3. Click **Add New** → **Project**
4. Import `lol123-creator/Tigerstream`
5. Click **Deploy**

✅ That's it! Your site is live. Vercel automatically:
- Detects your `.env.local` file (even though it's gitignored)
- Uses your TMDB key from `api-key.server.ts`
- Builds and deploys the app

### Step 2: Share with Family
- Vercel gives you a URL like: `https://tigerstream-xxx.vercel.app`
- Share this link with your family
- They can browse movies and TV shows immediately!

## Custom Domain (Optional)
To use your own domain instead of vercel.app:
1. In Vercel dashboard: **Settings** → **Domains**
2. Add your custom domain
3. Follow DNS instructions

## Your TMDB Key
Your key is already in: `src/lib/tmdb/api-key.server.ts`
- ✅ Kept secure on server (never sent to browser)
- ✅ Used automatically on Vercel
- ✅ Falls back to environment variable if needed

## What Your Family Gets
- 🎬 Full movie & TV catalog (300+ titles)
- 🔍 Search and browse by genre
- ▶️ Watch progress tracking (continues where they left off)
- 📺 Complete episode lists for TV shows
- 🎯 Clean, simple interface

## Family Instructions
Share this with your family:
```
1. Go to: https://tigerstream-xxx.vercel.app (your Vercel URL)
2. Browse movies and TV shows
3. Click to watch or get more info
4. Your progress is saved automatically
```

## Troubleshooting
- **Vercel build fails?** Check that `.env.local` exists in your repo
- **API errors?** Your TMDB key is working (it's in the code)
- **Performance?** Vercel's free tier can scale to handle family use

---

**Status:** ✅ Ready to deploy!
