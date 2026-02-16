# What to watch

A web app for discovering movies and TV shows, managing a personal watchlist, and finding where to stream content. Built with Next.js, Material UI, and the TMDB API.

## Features

- **Browse & search** – Discover movies and TV shows from [The Movie Database (TMDB)](https://www.themoviedb.org). Filter by type (movie/TV), genre, and year. Search by title.
- **Watchlist** – Add titles to your watchlist, mark them as watched, and add comments.
- **Where to watch** – On each movie or TV detail page, see streaming, rent, and buy options (powered by JustWatch via TMDB) with a direct link to TMDB’s watch page.
- **Sign in** – Email/password (with registration) and Google sign-in via NextAuth.js.
- **Languages** – UI available in English, Polish, and Ukrainian with a language switcher in the header.

## Tech stack

- **Next.js 16** (App Router), React 19, TypeScript
- **Material UI (MUI)** for components and layout
- **next-intl** for i18n (en, pl, uk)
- **NextAuth.js v5** with Credentials and Google providers, Prisma adapter
- **Prisma** with SQLite
- **TMDB API** for catalog, search, and watch providers

## Getting started

1. **Install dependencies**

   ```bash
   npm install
   ```

2. **Environment variables**

   Copy `.env.example` to `.env` and set:

   - `TMDB_API_KEY` – [Get a free API key](https://www.themoviedb.org/settings/api)
   - `DATABASE_URL` – SQLite default: `file:./dev.db`
   - For auth: `NEXTAUTH_URL`, `NEXTAUTH_SECRET`, and optionally `GOOGLE_CLIENT_ID` / `GOOGLE_CLIENT_SECRET` for Google sign-in

3. **Database**

   Migrations are already applied if you ran them during setup. Otherwise:

   ```bash
   npx prisma migrate dev
   ```

4. **Run the dev server**

   ```bash
   npm run dev
   ```

   Open [http://localhost:3000](http://localhost:3000). You’ll be redirected to the default locale (e.g. `/en`).

## Scripts

- `npm run dev` – Start the development server
- `npm run build` – Build for production
- `npm run start` – Start the production server
- `npm run lint` – Run ESLint

## Project structure

- `app/[locale]/` – Locale-aware pages (browse, login, watchlist, movie/tv detail)
- `components/` – Shared UI (header, filters, cards, auth, watchlist actions)
- `lib/` – TMDB client, Prisma client, auth config
- `i18n/` – next-intl routing and request config
- `messages/` – Translation JSON (en, pl, uk)
- `prisma/` – Schema and migrations
