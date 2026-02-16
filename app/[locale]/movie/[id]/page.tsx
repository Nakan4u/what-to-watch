import { setRequestLocale } from "next-intl/server";
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
import {
  getMovieDetail,
  getMovieWatchProviders,
  posterUrl,
  getTmdbWatchPageUrl,
} from "@/lib/tmdb";
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

  const [movie, providers] = await Promise.all([
    getMovieDetail(movieId),
    getMovieWatchProviders(movieId),
  ]);

  if (!movie) notFound();

  const watchUrl = getTmdbWatchPageUrl("movie", movie.id, slugify(movie.title));

  return (
    <Container maxWidth="md" sx={{ py: 4 }}>
      <Card sx={{ display: "flex", flexDirection: { xs: "column", md: "row" }, overflow: "hidden" }}>
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
          <Stack direction="row" spacing={1} sx={{ mb: 2 }}>
            <Chip label={`${movie.release_date.slice(0, 4)}`} size="small" />
            <Chip label={`★ ${movie.vote_average.toFixed(1)}`} size="small" />
            {movie.genres.map((g) => (
              <Chip key={g.id} label={g.name} size="small" variant="outlined" />
            ))}
          </Stack>
          <Typography variant="body1" paragraph>
            {movie.overview}
          </Typography>

          <Box sx={{ mt: 2 }}>
            <Typography variant="h6" gutterBottom>
              Where to watch
            </Typography>
            {providers && (
              <>
                {providers.flatrate?.length ? (
                  <Typography variant="body2" color="text.secondary">
                    Stream: {providers.flatrate.map((p) => p.provider_name).join(", ")}
                  </Typography>
                ) : null}
                {providers.rent?.length ? (
                  <Typography variant="body2" color="text.secondary">
                    Rent: {providers.rent.map((p) => p.provider_name).join(", ")}
                  </Typography>
                ) : null}
                {providers.buy?.length ? (
                  <Typography variant="body2" color="text.secondary">
                    Buy: {providers.buy.map((p) => p.provider_name).join(", ")}
                  </Typography>
                ) : null}
              </>
            )}
            <Button
              variant="contained"
              href={watchUrl}
              target="_blank"
              rel="noopener noreferrer"
              sx={{ mt: 2 }}
            >
              See where to watch
            </Button>
            <Typography variant="caption" display="block" color="text.secondary" sx={{ mt: 1 }}>
              Watch options powered by JustWatch
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
            />
          </Box>
        </CardContent>
      </Card>
    </Container>
  );
}
