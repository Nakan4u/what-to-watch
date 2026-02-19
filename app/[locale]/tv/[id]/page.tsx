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
import { routing } from "@/i18n/routing";
import {
  getTvDetail,
  getTvWatchProviders,
  posterUrl,
  getTmdbWatchPageUrl,
  localeToTmdbLanguage,
} from "@/lib/tmdb";
import { Link } from "@/i18n/navigation";
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

export default async function TvDetailPage({ params }: Props) {
  const { locale, id } = await params;
  setRequestLocale(locale);
  const tvId = parseInt(id, 10);
  if (Number.isNaN(tvId)) notFound();

  const lang = localeToTmdbLanguage(locale);
  const [show, providers, watchlistItemId] = await Promise.all([
    getTvDetail(tvId, lang),
    getTvWatchProviders(tvId),
    getWatchlistItemId(tvId, "tv"),
  ]);

  if (!show) notFound();

  const t = await getTranslations("detail");
  const tWatch = await getTranslations("whereToWatch");

  const watchUrl = getTmdbWatchPageUrl("tv", show.id, slugify(show.name));
  const firstYear = show.first_air_date
    ? show.first_air_date.slice(0, 4)
    : null;
  const lastYear = show.last_air_date ? show.last_air_date.slice(0, 4) : null;
  const yearRange =
    firstYear && lastYear && firstYear !== lastYear
      ? `${firstYear} – ${lastYear}`
      : (firstYear ?? lastYear);

  const statusKeyMap: Record<string, string> = {
    Released: "statusReleased",
    Rumored: "statusRumored",
    Planned: "statusPlanned",
    "In Production": "statusInProduction",
    "Post Production": "statusPostProduction",
    Canceled: "statusCanceled",
    Ended: "statusEnded",
    "Returning Series": "statusReturningSeries",
    Pilot: "statusPilot",
  };
  const statusLabel = show.status
    ? (statusKeyMap[show.status] ? t(statusKeyMap[show.status]) : show.status)
    : "";
  const mediaType = "tv" as const;

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
            image={posterUrl(show.poster_path, "w342") ?? undefined}
            alt={show.name}
          />
          <CardContent sx={{ flex: 1 }}>
            <Typography variant="h4" gutterBottom>
              {show.name}
            </Typography>
            {show.original_name && show.original_name !== show.name && (
              <Typography
                variant="subtitle2"
                color="text.secondary"
                gutterBottom
              >
                {show.original_name}
              </Typography>
            )}
            <Stack
              direction="row"
              spacing={1}
              sx={{ mb: 2 }}
              flexWrap="wrap"
              useFlexGap
            >
              {yearRange && <Chip label={yearRange} size="small" />}
              <Chip label={`★ ${show.vote_average.toFixed(1)}`} size="small" />
              {show.vote_count > 0 && (
                <Chip
                  label={`${show.vote_count.toLocaleString()} ${t("votes")}`}
                  size="small"
                  variant="outlined"
                />
              )}
              {show.number_of_seasons > 0 && (
                <Chip
                  label={`${show.number_of_seasons} ${show.number_of_seasons === 1 ? t("season") : t("seasons")}`}
                  size="small"
                  variant="outlined"
                />
              )}
              {show.number_of_episodes > 0 && (
                <Chip
                  label={`${show.number_of_episodes} ${t("episodes")}`}
                  size="small"
                  variant="outlined"
                />
              )}
              {show.type && (
                <Chip label={show.type} size="small" variant="outlined" />
              )}
              {show.genres.map((g) => (
                <Link
                  key={g.id}
                  href={`/browse?genre=${g.id}&type=${mediaType}`}
                  style={{ textDecoration: "none" }}
                >
                  <Chip
                    label={g.name}
                    size="small"
                    variant="outlined"
                    clickable
                  />
                </Link>
              ))}
            </Stack>
            {show.tagline && (
              <Typography
                variant="body2"
                fontStyle="italic"
                color="text.secondary"
                paragraph
              >
                {show.tagline}
              </Typography>
            )}
            <Typography variant="body1" paragraph>
              {show.overview}
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
                {show.status && (
                  <Typography variant="body2" color="text.secondary">
                    {t("status")}: {statusLabel}
                  </Typography>
                )}
                {show.production_countries.length > 0 && (
                  <Typography variant="body2" color="text.secondary">
                    {t("country")}:{" "}
                    {show.production_countries.map((c) => c.name).join(", ")}
                  </Typography>
                )}
                {show.spoken_languages.length > 0 && (
                  <Typography variant="body2" color="text.secondary">
                    {t("language")}:{" "}
                    {show.spoken_languages
                      .map((l) => l.english_name || l.name)
                      .join(", ")}
                  </Typography>
                )}
                {show.homepage && (
                  <Button
                    size="small"
                    variant="outlined"
                    color="secondary"
                    href={show.homepage}
                    target="_blank"
                    rel="noopener noreferrer"
                    startIcon={<PublicIcon />}
                    sx={{ alignSelf: "flex-start", textTransform: "none" }}
                  >
                    {t("officialWebsite")}
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
                  id: show.id,
                  title: show.name,
                  type: "tv",
                  poster_path: show.poster_path,
                  release_date: show.first_air_date,
                  overview: show.overview,
                  vote_average: show.vote_average,
                }}
                watchlistItemId={watchlistItemId}
              />
            </Box>
        </CardContent>
      </Card>
    </Container>
  );
}
