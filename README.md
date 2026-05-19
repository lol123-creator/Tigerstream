# TigerStream

Stream movies and TV with TMDB browse/search and continue watching.

## Run locally

```powershell
cd C:\Users\clare\.cursor\projects\empty-window
npm.cmd install
```

The full movie & TV catalog uses your TMDB key on the server — **visitors never set anything up**.

Optional: create `.env.local` with `TMDB_API_KEY=...` to override the built-in key.

```powershell
npm.cmd run dev
```

Open [http://localhost:3000](http://localhost:3000).

## Deploy online

See **[DEPLOY.md](./DEPLOY.md)** for GitHub + Vercel. Add `TMDB_API_KEY` in Vercel environment variables.

## Features

- Home browse rows with scroll arrows
- Movies / TV grids (~300 titles) and genre pages
- Search, detail pages, full TV episode lists
- Watch pages with auto-resume and Continue Watching
