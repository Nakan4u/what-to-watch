import { setRequestLocale } from "next-intl/server";
import { getTranslations } from "next-intl/server";
import { Container, Typography } from "@mui/material";
import { routing } from "@/i18n/routing";
import { discoverTitles, searchMulti, getMovieGenres, getTvGenres, localeToTmdbLanguage } from "@/lib/tmdb";
import { getWatchlist } from "@/app/actions/watchlist";
import BrowseFilters from "@/components/BrowseFilters";
import BrowseResults from "@/components/BrowseResults";
import SignInSuccessToast from "@/components/SignInSuccessToast";

type Props = {
  params: Promise<{ locale: string }>;
  searchParams: Promise<{ query?: string; type?: string; genre?: string; year?: string; page?: string }>;
};

export function generateStaticParams() {
  return routing.locales.map((locale) => ({ locale }));
}

export default async function BrowsePage({ params, searchParams }: Props) {
  const { locale } = await params;
  setRequestLocale(locale);
  const t = await getTranslations("browse");
  const sp = await searchParams;
  const query = sp.query ?? "";
  const type = (sp.type as "movie" | "tv" | "all") ?? "all";
  const genreId = sp.genre ? parseInt(sp.genre, 10) : undefined;
  const year = sp.year ? parseInt(sp.year, 10) : undefined;
  const page = sp.page ? parseInt(sp.page, 10) : 1;
  const lang = localeToTmdbLanguage(locale);

  let results: Awaited<ReturnType<typeof discoverTitles>>["results"] = [];
  let totalPages = 1;

  try {
    if (query.trim()) {
      const searchResult = await searchMulti(query.trim(), page, lang);
      results = searchResult.results;
      totalPages = searchResult.total_pages;
    } else {
      const discoverResult = await discoverTitles({
        type: type === "all" ? "all" : type,
        genreId: Number.isNaN(genreId!) ? undefined : genreId,
        year: Number.isNaN(year!) ? undefined : year,
        page,
        language: lang,
      });
      results = discoverResult.results;
      totalPages = discoverResult.total_pages;
    }
  } catch (e) {
    console.error("TMDB fetch error:", e);
  }

  const [movieGenres, tvGenres, watchlist] = await Promise.all([
    getMovieGenres(lang),
    getTvGenres(lang),
    getWatchlist(),
  ]);
  const watchlistIdByTmdb = new Map(
    watchlist.map((item) => [`${item.tmdbId}-${item.type}`, item.id])
  );
  const genreOptions = type === "tv" ? tvGenres : movieGenres;
  const allGenres = [...movieGenres];
  const seen = new Set(movieGenres.map((g) => g.id));
  tvGenres.forEach((g) => {
    if (!seen.has(g.id)) {
      seen.add(g.id);
      allGenres.push(g);
    }
  });
  const genreIdToName = new Map(allGenres.map((g) => [g.id, g.name]));

  return (
    <Container maxWidth="lg" sx={{ py: 4 }}>
      <SignInSuccessToast />
      <Typography variant="h4" gutterBottom>
        Browse
      </Typography>
      <BrowseFilters
        initialQuery={query}
        initialType={type}
        initialGenre={sp.genre ?? ""}
        initialYear={sp.year ?? ""}
        genreOptions={type === "all" ? allGenres : genreOptions}
      />
      <BrowseResults
        key={`${query}-${type}-${sp.genre ?? ""}-${sp.year ?? ""}`}
        initialResults={results}
        initialTotalPages={totalPages}
        params={{
          query,
          type,
          genreId: Number.isNaN(genreId!) ? undefined : genreId,
          year: Number.isNaN(year!) ? undefined : year,
          locale,
        }}
        genreIdToName={Object.fromEntries(genreIdToName)}
        watchlistIdByTmdb={Object.fromEntries(watchlistIdByTmdb)}
        noResultsMessage={t("noResults")}
      />
    </Container>
  );
}
