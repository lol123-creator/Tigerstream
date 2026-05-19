# Deploy TigerStream online (Vercel — free)

## 1. Push code to GitHub

```powershell
cd C:\Users\clare\.cursor\projects\empty-window
git init
git add .
git commit -m "TigerStream"
```

Create a repo on GitHub, then:

```powershell
git remote add origin https://github.com/YOUR_USERNAME/tigerstream.git
git branch -M main
git push -u origin main
```

`.env.local` is gitignored — your API key is not pushed.

## 2. Deploy on Vercel

1. Go to [vercel.com](https://vercel.com) and sign in with GitHub.
2. **Add New Project** → import your repo.
3. **Deploy** (catalog works out of the box with the built-in key).

   Optional: add `TMDB_API_KEY` in Environment Variables if you want to use a different key or rotate yours.
4. Open the deployment URL.

Live URL example: `https://tigerstream-xxx.vercel.app`

## 3. Custom domain (optional)

Vercel → **Settings** → **Domains**

## CLI deploy (no GitHub)

```powershell
npm.cmd i -g vercel
cd C:\Users\clare\.cursor\projects\empty-window
vercel login
vercel env add TMDB_API_KEY
vercel --prod
```
