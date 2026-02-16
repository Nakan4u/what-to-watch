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
import { routing } from "@/i18n/routing";
import {
  getTvDetail,
  getTvWatchProviders,
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

export default async function TvDetailPage({ params }: Props) {
  const { locale, id } = await params;
  setRequestLocale(locale);
  const tvId = parseInt(id, 10);
  if (Number.isNaN(tvId)) notFound();

  const [show, providers] = await Promise.all([
    getTvDetail(tvId),
    getTvWatchProviders(tvId),
  ]);

  if (!show) notFound();

  const watchUrl = getTmdbWatchPageUrl("tv", show.id, slugify(show.name));

  return (
    <Container maxWidth="md" sx={{ py: 4 }}>
      <Card sx={{ display: "flex", flexDirection: { xs: "column", md: "row" }, overflow: "hidden" }}>
        <CardMedia
          component="img"
          sx={{ width: { md: 320 }, minHeight: 400 }}
          image={posterUrl(show.poster_path, "w342") ?? undefined}
          alt={show.name}
        />
        <CardContent sx={{ flex: 1 }}>
          <Typography variant="h4" gutterBottom>
            {show.name}
          </Typography>
          <Stack direction="row" spacing={1} sx={{ mb: 2 }}>
            <Chip label={`${show.first_air_date.slice(0, 4)}`} size="small" />
            <Chip label={`★ ${show.vote_average.toFixed(1)}`} size="small" />
            {show.genres.map((g) => (
              <Chip key={g.id} label={g.name} size="small" variant="outlined" />
            ))}
          </Stack>
          <Typography variant="body1" paragraph>
            {show.overview}
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
                id: show.id,
                title: show.name,
                type: "tv",
                poster_path: show.poster_path,
                release_date: show.first_air_date,
                overview: show.overview,
                vote_average: show.vote_average,
              }}
            />
          </Box>
        </CardContent>
      </Card>
    </Container>
  );
}
