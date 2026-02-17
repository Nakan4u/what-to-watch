const TMDB_BASE = "https://api.themoviedb.org/3";

function getApiKey(): string | null {
  return process.env.TMDB_API_KEY ?? process.env.NEXT_PUBLIC_TMDB_KEY ?? null;
}

export type MediaType = "movie" | "tv";

export interface TmdbTitle {
  id: number;
  title: string;
  type: MediaType;
  poster_path: string | null;
  release_date: string;
  overview: string;
  vote_average?: number;
  genre_ids?: number[];
}

interface TmdbMovieResult {
  id: number;
  title: string;
  poster_path: string | null;
  release_date: string;
  overview: string;
  vote_average: number;
  genre_ids?: number[];
}

interface TmdbTvResult {
  id: number;
  name: string;
  poster_path: string | null;
  first_air_date: string;
  overview: string;
  vote_average: number;
  genre_ids?: number[];
}

interface TmdbMultiResult {
  id: number;
  media_type: "movie" | "tv";
  title?: string;
  name?: string;
  poster_path: string | null;
  release_date?: string;
  first_air_date?: string;
  overview: string;
  vote_average?: number;
  genre_ids?: number[];
}

function toTitle(
  item: TmdbMovieResult | TmdbTvResult | TmdbMultiResult,
  type: MediaType
): TmdbTitle {
  const multi = item as TmdbMultiResult;
  const rawTitle = "title" in item ? item.title : "name" in item ? item.name : multi.title ?? multi.name;
  const title = String(rawTitle ?? "");
  const date =
    "release_date" in item && item.release_date
      ? item.release_date
      : "first_air_date" in item && item.first_air_date
        ? item.first_air_date
        : "";
  const genreIds = "genre_ids" in item && Array.isArray(item.genre_ids) ? item.genre_ids : undefined;
  return {
    id: item.id,
    title,
    type: type === "movie" ? "movie" : "tv",
    poster_path: item.poster_path,
    release_date: date,
    overview: item.overview ?? "",
    vote_average: item.vote_average,
    genre_ids: genreIds,
  };
}

export interface DiscoverOptions {
  type?: "movie" | "tv" | "all";
  genreId?: number;
  year?: number;
  page?: number;
}

export async function discoverTitles(
  options: DiscoverOptions = {}
): Promise<{ results: TmdbTitle[]; total_pages: number }> {
  const { type = "all", genreId, year, page = 1 } = options;
  const key = getApiKey();
  if (!key) return { results: [], total_pages: 0 };

  const params = new URLSearchParams({
    api_key: key,
    page: String(page),
    language: "en-US",
  });
  if (genreId != null) params.set("with_genres", String(genreId));
  if (year != null) {
    params.set("primary_release_date.gte", `${year}-01-01`);
    params.set("primary_release_date.lte", `${year}-12-31`);
  }

  const results: TmdbTitle[] = [];
  let total_pages = 1;

  if (type === "movie" || type === "all") {
    const url = `${TMDB_BASE}/discover/movie?${params}`;
    const res = await fetch(url);
    if (!res.ok) throw new Error(`TMDB error: ${res.status}`);
    const data = await res.json();
    total_pages = data.total_pages ?? 1;
    const list = (data.results ?? []) as TmdbMovieResult[];
    results.push(...list.map((m) => toTitle(m, "movie")));
  }

  if (type === "tv" || type === "all") {
    const tvParams = new URLSearchParams({
      api_key: key,
      page: String(page),
      language: "en-US",
    });
    if (genreId != null) tvParams.set("with_genres", String(genreId));
    if (year != null) {
      tvParams.set("first_air_date.gte", `${year}-01-01`);
      tvParams.set("first_air_date.lte", `${year}-12-31`);
    }
    const url = `${TMDB_BASE}/discover/tv?${tvParams}`;
    const res = await fetch(url);
    if (!res.ok) throw new Error(`TMDB error: ${res.status}`);
    const data = await res.json();
    const list = (data.results ?? []) as TmdbTvResult[];
    results.push(...list.map((t) => toTitle(t, "tv")));
  }

  if (type === "all") {
    results.sort(
      (a, b) => (b.vote_average ?? 0) - (a.vote_average ?? 0)
    );
  }

  return { results, total_pages };
}

export async function searchMulti(
  query: string,
  page = 1
): Promise<{ results: TmdbTitle[]; total_pages: number }> {
  if (!query.trim()) return { results: [], total_pages: 0 };
  const key = getApiKey();
  if (!key) return { results: [], total_pages: 0 };
  const params = new URLSearchParams({
    api_key: key,
    query: query.trim(),
    page: String(page),
    language: "en-US",
  });
  const url = `${TMDB_BASE}/search/multi?${params}`;
  const res = await fetch(url);
  if (!res.ok) throw new Error(`TMDB error: ${res.status}`);
  const data = await res.json();
  const list = (data.results ?? []) as TmdbMultiResult[];
  const results = list
    .filter((r) => r.media_type === "movie" || r.media_type === "tv")
    .map((r) => toTitle(r, r.media_type));
  return { results, total_pages: data.total_pages ?? 1 };
}

export function posterUrl(path: string | null, size: "w185" | "w342" | "original" = "w342"): string | null {
  if (!path) return null;
  return `https://image.tmdb.org/t/p/${size}${path}`;
}

const fetchOptions: RequestInit = { cache: "no-store" };

export async function getPopularMovies(limit = 10): Promise<TmdbTitle[]> {
  const key = getApiKey();
  if (!key) return [];
  const res = await fetch(
    `${TMDB_BASE}/movie/popular?api_key=${key}&language=en-US&page=1`,
    fetchOptions
  );
  if (!res.ok) return [];
  const data = await res.json();
  const list = (data.results ?? []) as TmdbMovieResult[];
  return list.slice(0, limit).map((m) => toTitle(m, "movie"));
}

/** Movies currently in theaters (now playing) */
export async function getNowPlayingMovies(limit = 10): Promise<TmdbTitle[]> {
  const key = getApiKey();
  if (!key) return [];
  const res = await fetch(
    `${TMDB_BASE}/movie/now_playing?api_key=${key}&language=en-US&page=1`,
    fetchOptions
  );
  if (!res.ok) return [];
  const data = await res.json();
  const list = (data.results ?? []) as TmdbMovieResult[];
  return list.slice(0, limit).map((m) => toTitle(m, "movie"));
}

export async function getPopularTvShows(limit = 10): Promise<TmdbTitle[]> {
  const key = getApiKey();
  if (!key) return [];
  const res = await fetch(
    `${TMDB_BASE}/tv/popular?api_key=${key}&language=en-US&page=1`,
    fetchOptions
  );
  if (!res.ok) return [];
  const data = await res.json();
  const list = (data.results ?? []) as TmdbTvResult[];
  return list.slice(0, limit).map((t) => toTitle(t, "tv"));
}

export interface Genre {
  id: number;
  name: string;
}

export async function getMovieGenres(): Promise<Genre[]> {
  const key = getApiKey();
  if (!key) return [];
  const res = await fetch(`${TMDB_BASE}/genre/movie/list?api_key=${key}&language=en-US`);
  if (!res.ok) return [];
  const data = await res.json();
  return data.genres ?? [];
}

export async function getTvGenres(): Promise<Genre[]> {
  const key = getApiKey();
  if (!key) return [];
  const res = await fetch(`${TMDB_BASE}/genre/tv/list?api_key=${key}&language=en-US`);
  if (!res.ok) return [];
  const data = await res.json();
  return data.genres ?? [];
}

export interface TmdbMovieDetail {
  id: number;
  title: string;
  overview: string;
  poster_path: string | null;
  release_date: string;
  vote_average: number;
  genres: { id: number; name: string }[];
}

export interface TmdbTvDetail {
  id: number;
  name: string;
  overview: string;
  poster_path: string | null;
  first_air_date: string;
  vote_average: number;
  genres: { id: number; name: string }[];
}

export async function getMovieDetail(id: number): Promise<TmdbMovieDetail | null> {
  const key = getApiKey();
  if (!key) return null;
  const res = await fetch(`${TMDB_BASE}/movie/${id}?api_key=${key}&language=en-US`);
  if (!res.ok) return null;
  const data = await res.json();
  return {
    id: data.id,
    title: data.title,
    overview: data.overview ?? "",
    poster_path: data.poster_path ?? null,
    release_date: data.release_date ?? "",
    vote_average: data.vote_average ?? 0,
    genres: data.genres ?? [],
  };
}

export async function getTvDetail(id: number): Promise<TmdbTvDetail | null> {
  const key = getApiKey();
  if (!key) return null;
  const res = await fetch(`${TMDB_BASE}/tv/${id}?api_key=${key}&language=en-US`);
  if (!res.ok) return null;
  const data = await res.json();
  return {
    id: data.id,
    name: data.name,
    overview: data.overview ?? "",
    poster_path: data.poster_path ?? null,
    first_air_date: data.first_air_date ?? "",
    vote_average: data.vote_average ?? 0,
    genres: data.genres ?? [],
  };
}

export interface WatchProviderItem {
  logo_path: string | null;
  provider_id: number;
  provider_name: string;
}

export interface WatchProvidersResult {
  link: string;
  flatrate?: WatchProviderItem[];
  rent?: WatchProviderItem[];
  buy?: WatchProviderItem[];
}

export async function getMovieWatchProviders(
  movieId: number
): Promise<WatchProvidersResult | null> {
  const key = getApiKey();
  if (!key) return null;
  const res = await fetch(
    `${TMDB_BASE}/movie/${movieId}/watch/providers?api_key=${key}`
  );
  if (!res.ok) return null;
  const data = await res.json();
  const us = data.results?.US ?? data.results?.GB ?? Object.values(data.results ?? {})[0];
  return us ?? null;
}

export async function getTvWatchProviders(
  tvId: number
): Promise<WatchProvidersResult | null> {
  const key = getApiKey();
  if (!key) return null;
  const res = await fetch(
    `${TMDB_BASE}/tv/${tvId}/watch/providers?api_key=${key}`
  );
  if (!res.ok) return null;
  const data = await res.json();
  const us = data.results?.US ?? data.results?.GB ?? Object.values(data.results ?? {})[0];
  return us ?? null;
}

export function getTmdbWatchPageUrl(type: "movie" | "tv", id: number, slug: string): string {
  const path = type === "movie" ? "movie" : "tv";
  const safeSlug = slug || (type === "movie" ? "movie" : "show");
  return `https://www.themoviedb.org/${path}/${id}-${safeSlug}/watch`;
}
