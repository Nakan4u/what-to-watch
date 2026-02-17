import { getTranslations, setRequestLocale } from "next-intl/server";
import { Box, Container, Typography, Grid } from "@mui/material";
import { Link } from "@/i18n/navigation";
import { routing } from "@/i18n/routing";
import { getPopularMovies, getPopularTvShows, getNowPlayingMovies, getMovieGenres, getTvGenres } from "@/lib/tmdb";
import TitleCard from "@/components/TitleCard";

type Props = { params: Promise<{ locale: string }> };

// Always fetch fresh popular titles (needs TMDB_API_KEY at request time)
export const dynamic = "force-dynamic";

export function generateStaticParams() {
  return routing.locales.map((locale) => ({ locale }));
}

export default async function HomePage({ params }: Props) {
  const { locale } = await params;
  setRequestLocale(locale);
  const t = await getTranslations("common");
  const tHome = await getTranslations("home");

  const [nowPlaying, popularMovies, popularTvShows, movieGenres, tvGenres] = await Promise.all([
    getNowPlayingMovies(10),
    getPopularMovies(10),
    getPopularTvShows(10),
    getMovieGenres(),
    getTvGenres(),
  ]);
  const movieGenreMap = new Map(movieGenres.map((g) => [g.id, g.name]));
  const tvGenreMap = new Map(tvGenres.map((g) => [g.id, g.name]));

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

      <Typography variant="h5" component="h2" gutterBottom sx={{ mt: 4 }}>
        {tHome("inTheaters")}
      </Typography>
      <Grid container spacing={2} sx={{ mb: 4 }}>
        {nowPlaying.length === 0 ? (
          <Grid size={12}>
            <Typography color="text.secondary" sx={{ py: 2 }}>
              No movies in theaters right now.
            </Typography>
          </Grid>
        ) : (
          nowPlaying.map((title) => (
            <Grid size={{ xs: 12, sm: 6, md: 4, lg: 3 }} key={`now-${title.id}`}>
              <TitleCard
                title={title}
                genreNames={
                  title.genre_ids
                    ?.map((id) => movieGenreMap.get(id))
                    .filter((n): n is string => n != null)
                }
              />
            </Grid>
          ))
        )}
      </Grid>

      <Typography variant="h5" component="h2" gutterBottom sx={{ mt: 4 }}>
        {tHome("popularMovies")}
      </Typography>
      <Grid container spacing={2} sx={{ mb: 4 }}>
        {popularMovies.length === 0 ? (
          <Grid size={12}>
            <Typography color="text.secondary" sx={{ py: 2 }}>
              No movies loaded. Check that TMDB_API_KEY is set in .env and valid at{" "}
              <a href="https://www.themoviedb.org/settings/api" target="_blank" rel="noopener noreferrer">themoviedb.org</a>. Restart the dev server after changing .env.
            </Typography>
          </Grid>
        ) : (
          popularMovies.map((title) => (
            <Grid size={{ xs: 12, sm: 6, md: 4, lg: 3 }} key={`movie-${title.id}`}>
              <TitleCard
                title={title}
                genreNames={
                  title.genre_ids
                    ?.map((id) => movieGenreMap.get(id))
                    .filter((n): n is string => n != null)
                }
              />
            </Grid>
          ))
        )}
      </Grid>

      <Typography variant="h5" component="h2" gutterBottom>
        {tHome("popularTvShows")}
      </Typography>
      <Grid container spacing={2}>
        {popularTvShows.length === 0 ? (
          <Grid size={12}>
            <Typography color="text.secondary" sx={{ py: 2 }}>
              No TV shows loaded. Check TMDB_API_KEY in .env.
            </Typography>
          </Grid>
        ) : (
          popularTvShows.map((title) => (
            <Grid size={{ xs: 12, sm: 6, md: 4, lg: 3 }} key={`tv-${title.id}`}>
              <TitleCard
                title={title}
                genreNames={
                  title.genre_ids
                    ?.map((id) => tvGenreMap.get(id))
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
