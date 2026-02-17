import { getTranslations, setRequestLocale } from "next-intl/server";
import { Box, Container, Typography } from "@mui/material";
import { Link } from "@/i18n/navigation";
import { routing } from "@/i18n/routing";
import { getPopularMovies, getPopularTvShows, getNowPlayingMovies, getMovieGenres, getTvGenres, localeToTmdbLanguage } from "@/lib/tmdb";
import HomeSectionSlider from "@/components/HomeSectionSlider";

type Props = { params: Promise<{ locale: string }> };

// Always fetch fresh popular titles (needs TMDB_API_KEY at request time)
export const dynamic = "force-dynamic";

export function generateStaticParams() {
  return routing.locales.map((locale) => ({ locale }));
}

export default async function HomePage({ params }: Props) {
  const { locale } = await params;
  setRequestLocale(locale);
  const lang = localeToTmdbLanguage(locale);
  const t = await getTranslations("common");
  const tHome = await getTranslations("home");

  const [nowPlaying, popularMovies, popularTvShows, movieGenres, tvGenres] = await Promise.all([
    getNowPlayingMovies(10, lang),
    getPopularMovies(10, lang),
    getPopularTvShows(10, lang),
    getMovieGenres(lang),
    getTvGenres(lang),
  ]);
  const movieGenreMap = new Map(movieGenres.map((g) => [g.id, g.name]));
  const tvGenreMap = new Map(tvGenres.map((g) => [g.id, g.name]));

  const toMovieGenres = (ids: number[] | undefined) =>
    (ids?.map((id) => movieGenreMap.get(id)).filter((n): n is string => n != null)) ?? [];
  const toTvGenres = (ids: number[] | undefined) =>
    (ids?.map((id) => tvGenreMap.get(id)).filter((n): n is string => n != null)) ?? [];

  const nowPlayingItems = nowPlaying.map((title) => ({
    title,
    genreNames: toMovieGenres(title.genre_ids),
  }));
  const popularMoviesItems = popularMovies.map((title) => ({
    title,
    genreNames: toMovieGenres(title.genre_ids),
  }));
  const popularTvItems = popularTvShows.map((title) => ({
    title,
    genreNames: toTvGenres(title.genre_ids),
  }));

  return (
    <Container maxWidth="lg">
      <Box sx={{ py: 4, textAlign: "center" }}>
        <Typography variant="h3" component="h1" gutterBottom>
          {t("appName")}
        </Typography>
        <Typography variant="body1" color="text.secondary" paragraph>
          {tHome("description")}
        </Typography>
        <Typography component="span">
          <Link href="/browse">Browse movies and TV shows</Link>
        </Typography>
      </Box>

      <HomeSectionSlider
        title={tHome("inTheaters")}
        items={nowPlayingItems}
        sectionKey="now"
      />

      <HomeSectionSlider
        title={tHome("popularMovies")}
        items={popularMoviesItems}
        sectionKey="movie"
      />

      <HomeSectionSlider
        title={tHome("popularTvShows")}
        items={popularTvItems}
        sectionKey="tv"
      />
    </Container>
  );
}
