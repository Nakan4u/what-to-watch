import { setRequestLocale, getTranslations } from "next-intl/server";
import { notFound } from "next/navigation";
import {
  Container,
  Typography,
  Box,
  Card,
  CardContent,
  CardMedia,
  Button,
  Chip,
  Stack,
} from "@mui/material";
import OpenInNewIcon from "@mui/icons-material/OpenInNew";
import PublicIcon from "@mui/icons-material/Public";
import MovieCreationIcon from "@mui/icons-material/MovieCreation";
import {
  getMovieDetail,
  getMovieWatchProviders,
  posterUrl,
  getTmdbWatchPageUrl,
  localeToTmdbLanguage,
} from "@/lib/tmdb";
import { getWatchlistItemId } from "@/app/actions/watchlist";
import AddToWatchlistButton from "@/components/AddToWatchlistButton";

type Props = {
  params: Promise<{ locale: string; id: string }>;
};

function slugify(s: string): string {
  return s
    .toLowerCase()
    .replace(/\s+/g, "-")
    .replace(/[^a-z0-9-]/g, "");
}

export default async function MovieDetailPage({ params }: Props) {
  const { locale, id } = await params;
  setRequestLocale(locale);
  const movieId = parseInt(id, 10);
  if (Number.isNaN(movieId)) notFound();

  const lang = localeToTmdbLanguage(locale);
  const [movie, providers, watchlistItemId] = await Promise.all([
    getMovieDetail(movieId, lang),
    getMovieWatchProviders(movieId),
    getWatchlistItemId(movieId, "movie"),
  ]);

  if (!movie) notFound();

  const t = await getTranslations("detail");
  const tWatch = await getTranslations("whereToWatch");

  const watchUrl = getTmdbWatchPageUrl("movie", movie.id, slugify(movie.title));
  const releaseYear = movie.release_date
    ? movie.release_date.slice(0, 4)
    : null;

  const statusKeyMap: Record<string, string> = {
    Released: "statusReleased",
    Rumored: "statusRumored",
    Planned: "statusPlanned",
    "In Production": "statusInProduction",
    "Post Production": "statusPostProduction",
    Canceled: "statusCanceled",
  };
  const statusLabel = movie.status
    ? (statusKeyMap[movie.status] ? t(statusKeyMap[movie.status]) : movie.status)
    : "";

  function formatCurrency(value: number): string {
    if (value <= 0) return "—";
    if (value >= 1_000_000_000)
      return `$${(value / 1_000_000_000).toFixed(1)}B`;
    if (value >= 1_000_000) return `$${(value / 1_000_000).toFixed(1)}M`;
    if (value >= 1_000) return `$${(value / 1_000).toFixed(1)}K`;
    return `$${value.toLocaleString()}`;
  }

  return (
    <Container maxWidth="md" sx={{ py: 4 }}>
        <Card
          sx={{
            display: "flex",
            flexDirection: { xs: "column", md: "row" },
            overflow: "hidden",
          }}
        >
          <CardMedia
            component="img"
            sx={{ width: { md: 320 }, minHeight: 400 }}
            image={posterUrl(movie.poster_path, "w342") ?? undefined}
            alt={movie.title}
          />
          <CardContent sx={{ flex: 1 }}>
            <Typography variant="h4" gutterBottom>
              {movie.title}
            </Typography>
            {movie.original_title && movie.original_title !== movie.title && (
              <Typography
                variant="subtitle2"
                color="text.secondary"
                gutterBottom
              >
                {movie.original_title}
              </Typography>
            )}
            <Stack
              direction="row"
              spacing={1}
              sx={{ mb: 2 }}
              flexWrap="wrap"
              useFlexGap
            >
              {releaseYear && <Chip label={releaseYear} size="small" />}
              <Chip label={`★ ${movie.vote_average.toFixed(1)}`} size="small" />
              {movie.vote_count > 0 && (
                <Chip
                  label={`${movie.vote_count.toLocaleString()} ${t("votes")}`}
                  size="small"
                  variant="outlined"
                />
              )}
              {movie.runtime != null && movie.runtime > 0 && (
                <Chip
                  label={`${Math.floor(movie.runtime / 60)}h ${movie.runtime % 60}m`}
                  size="small"
                  variant="outlined"
                />
              )}
              {movie.genres.map((g) => (
                <Chip
                  key={g.id}
                  label={g.name}
                  size="small"
                  variant="outlined"
                />
              ))}
            </Stack>
            {movie.tagline && (
              <Typography
                variant="body2"
                fontStyle="italic"
                color="text.secondary"
                paragraph
              >
                {movie.tagline}
              </Typography>
            )}
            <Typography variant="body1" paragraph>
              {movie.overview}
            </Typography>

            <Box sx={{ mt: 2 }}>
              <Typography
                variant="subtitle2"
                color="text.secondary"
                gutterBottom
              >
                {t("moreInfo")}
              </Typography>
              <Stack
                spacing={0.5}
                sx={{ fontSize: "0.875rem", color: "text.secondary" }}
              >
                {movie.status && (
                  <Typography variant="body2" color="text.secondary">
                    {t("status")}: {statusLabel}
                  </Typography>
                )}
                {movie.budget > 0 && (
                  <Typography variant="body2" color="text.secondary">
                    {t("budget")}: {formatCurrency(movie.budget)}
                  </Typography>
                )}
                {movie.revenue > 0 && (
                  <Typography variant="body2" color="text.secondary">
                    {t("revenue")}: {formatCurrency(movie.revenue)}
                  </Typography>
                )}
                {movie.production_countries.length > 0 && (
                  <Typography variant="body2" color="text.secondary">
                    {t("country")}:{" "}
                    {movie.production_countries.map((c) => c.name).join(", ")}
                  </Typography>
                )}
                {movie.spoken_languages.length > 0 && (
                  <Typography variant="body2" color="text.secondary">
                    {t("language")}:{" "}
                    {movie.spoken_languages
                      .map((l) => l.english_name || l.name)
                      .join(", ")}
                  </Typography>
                )}
                {movie.homepage && (
                  <Button
                    size="small"
                    variant="outlined"
                    color="secondary"
                    href={movie.homepage}
                    target="_blank"
                    rel="noopener noreferrer"
                    startIcon={<PublicIcon />}
                    sx={{ alignSelf: "flex-start", textTransform: "none" }}
                  >
                    {t("officialWebsite")}
                  </Button>
                )}
                {movie.imdb_id && (
                  <Button
                    size="small"
                    variant="outlined"
                    color="secondary"
                    href={`https://www.imdb.com/title/${movie.imdb_id}/`}
                    target="_blank"
                    rel="noopener noreferrer"
                    startIcon={<MovieCreationIcon />}
                    sx={{ alignSelf: "flex-start", textTransform: "none" }}
                  >
                    {t("imdb")}
                  </Button>
                )}
              </Stack>
            </Box>

            <Box sx={{ mt: 2 }}>
              <Typography variant="h6" gutterBottom>
                {tWatch("title")}
              </Typography>
              {providers && (
                <>
                  {providers.flatrate?.length ? (
                    <Typography variant="body2" color="text.secondary">
                      {tWatch("stream")}:{" "}
                      {providers.flatrate
                        .map((p) => p.provider_name)
                        .join(", ")}
                    </Typography>
                  ) : null}
                  {providers.rent?.length ? (
                    <Typography variant="body2" color="text.secondary">
                      {tWatch("rent")}:{" "}
                      {providers.rent.map((p) => p.provider_name).join(", ")}
                    </Typography>
                  ) : null}
                  {providers.buy?.length ? (
                    <Typography variant="body2" color="text.secondary">
                      {tWatch("buy")}:{" "}
                      {providers.buy.map((p) => p.provider_name).join(", ")}
                    </Typography>
                  ) : null}
                </>
              )}
              <Button
                variant="contained"
                href={watchUrl}
                target="_blank"
                rel="noopener noreferrer"
                startIcon={<OpenInNewIcon />}
                sx={{ mt: 2 }}
              >
                {tWatch("seeWhereToWatch")}
              </Button>
              <Typography
                variant="caption"
                display="block"
                color="text.secondary"
                sx={{ mt: 1 }}
              >
                {t("watchOptionsPoweredBy")}
              </Typography>
            </Box>

            <Box sx={{ mt: 3 }}>
              <AddToWatchlistButton
                title={{
                  id: movie.id,
                  title: movie.title,
                  type: "movie",
                  poster_path: movie.poster_path,
                  release_date: movie.release_date,
                  overview: movie.overview,
                  vote_average: movie.vote_average,
                }}
                watchlistItemId={watchlistItemId}
              />
            </Box>
        </CardContent>
      </Card>
    </Container>
  );
}
