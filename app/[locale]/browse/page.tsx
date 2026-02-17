import { setRequestLocale } from "next-intl/server";
import { getTranslations } from "next-intl/server";
import { Container, Typography, Grid, Box } from "@mui/material";
import { routing } from "@/i18n/routing";
import { discoverTitles, searchMulti, getMovieGenres, getTvGenres, localeToTmdbLanguage } from "@/lib/tmdb";
import { getWatchlist } from "@/app/actions/watchlist";
import TitleCard from "@/components/TitleCard";
import BrowseFilters from "@/components/BrowseFilters";
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
      <Grid container spacing={2}>
        {results.length === 0 ? (
          <Grid size={12}>
            <Box py={4} textAlign="center">
              <Typography color="text.secondary">
                {t("noResults")}
              </Typography>
            </Box>
          </Grid>
        ) : (
          results.map((title) => (
            <Grid size={{ xs: 12, sm: 6, md: 4, lg: 3 }} key={`${title.type}-${title.id}`}>
              <TitleCard
                title={title}
                watchlistItemId={
                  watchlistIdByTmdb.get(`${title.id}-${title.type}`) ?? null
                }
                genreNames={
                  title.genre_ids
                    ?.map((id) => genreIdToName.get(id))
                    .filter((n): n is string => n != null)
                }
              />
            </Grid>
          ))
        )}
      </Grid>
    </Container>
  );
}
