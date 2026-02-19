"use server";

import {
  discoverTitles,
  searchMulti,
  localeToTmdbLanguage,
  type TmdbTitle,
} from "@/lib/tmdb";

export type BrowsePageParams = {
  query: string;
  type: "movie" | "tv" | "all";
  genreId: number | undefined;
  year: number | undefined;
  page: number;
  locale: string;
};

export async function getBrowsePage(
  params: BrowsePageParams
): Promise<{ results: TmdbTitle[]; totalPages: number }> {
  const { query, type, genreId, year, page, locale } = params;
  const lang = localeToTmdbLanguage(locale);

  try {
    if (query.trim()) {
      const searchResult = await searchMulti(query.trim(), page, lang);
      return {
        results: searchResult.results,
        totalPages: searchResult.total_pages,
      };
    }
    const discoverResult = await discoverTitles({
      type: type === "all" ? "all" : type,
      genreId: genreId ?? undefined,
      year: year ?? undefined,
      page,
      language: lang,
    });
    return {
      results: discoverResult.results,
      totalPages: discoverResult.total_pages,
    };
  } catch (e) {
    console.error("TMDB fetch error:", e);
    return { results: [], totalPages: 0 };
  }
}
