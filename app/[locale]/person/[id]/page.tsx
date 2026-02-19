import { setRequestLocale, getTranslations } from "next-intl/server";
import { notFound } from "next/navigation";
import {
  Container,
  Typography,
  Box,
  Card,
  CardContent,
  Button,
  Stack,
} from "@mui/material";
import OpenInNewIcon from "@mui/icons-material/OpenInNew";
import PublicIcon from "@mui/icons-material/Public";
import MovieCreationIcon from "@mui/icons-material/MovieCreation";
import {
  getPersonDetail,
  getPersonMovieCredits,
  profileImageUrl,
  posterUrl,
  localeToTmdbLanguage,
} from "@/lib/tmdb";
import { Link } from "@/i18n/navigation";

type Props = {
  params: Promise<{ locale: string; id: string }>;
};

function slugify(s: string): string {
  return s
    .toLowerCase()
    .replace(/\s+/g, "-")
    .replace(/[^a-z0-9-]/g, "");
}

export default async function PersonDetailPage({ params }: Props) {
  const { locale, id } = await params;
  setRequestLocale(locale);
  const personId = parseInt(id, 10);
  if (Number.isNaN(personId)) notFound();

  const lang = localeToTmdbLanguage(locale);
  const [person, movieCredits] = await Promise.all([
    getPersonDetail(personId, lang),
    getPersonMovieCredits(personId, lang),
  ]);

  if (!person) notFound();

  const t = await getTranslations("person");

  const birthYear = person.birthday ? person.birthday.slice(0, 4) : null;
  const deathYear = person.deathday ? person.deathday.slice(0, 4) : null;

  return (
    <Container maxWidth="md" sx={{ py: 4 }}>
      <Card
        sx={{
          display: "flex",
          flexDirection: { xs: "column", md: "row" },
          overflow: "hidden",
        }}
      >
        <Box
          component="img"
          src={profileImageUrl(person.profile_path, "h632") ?? undefined}
          alt={person.name}
          sx={{
            width: { md: 320 },
            minHeight: 400,
            objectFit: "cover",
            bgcolor: "grey.300",
          }}
        />
        <CardContent sx={{ flex: 1 }}>
          <Typography variant="h4" gutterBottom>
            {person.name}
          </Typography>
          {person.known_for_department && (
            <Typography variant="subtitle2" color="text.secondary" gutterBottom>
              {t("knownForDepartment")}: {person.known_for_department}
            </Typography>
          )}
          <Stack spacing={0.5} sx={{ mt: 2 }}>
            {(birthYear || deathYear) && (
              <Typography variant="body2" color="text.secondary">
                {t("birthday")}:{" "}
                {person.birthday
                  ? `${person.birthday}${deathYear ? ` – ${person.deathday}` : ""}`
                  : "—"}
              </Typography>
            )}
            {person.place_of_birth && (
              <Typography variant="body2" color="text.secondary">
                {t("placeOfBirth")}: {person.place_of_birth}
              </Typography>
            )}
          </Stack>

          {person.biography && (
            <Box sx={{ mt: 2 }}>
              <Typography variant="subtitle2" color="text.secondary" gutterBottom>
                {t("biography")}
              </Typography>
              <Typography
                variant="body1"
                sx={{
                  whiteSpace: "pre-line",
                  maxHeight: 320,
                  overflow: "auto",
                }}
              >
                {person.biography}
              </Typography>
            </Box>
          )}

          <Stack
            direction="row"
            flexWrap="wrap"
            useFlexGap
            gap={1}
            sx={{ mt: 2 }}
          >
            {person.homepage && (
              <Button
                size="small"
                variant="outlined"
                color="secondary"
                href={person.homepage}
                target="_blank"
                rel="noopener noreferrer"
                startIcon={<PublicIcon />}
                sx={{ textTransform: "none" }}
              >
                {t("officialWebsite")}
              </Button>
            )}
            {person.imdb_id && (
              <Button
                size="small"
                variant="outlined"
                color="secondary"
                href={`https://www.imdb.com/name/${person.imdb_id}/`}
                target="_blank"
                rel="noopener noreferrer"
                startIcon={<MovieCreationIcon />}
                sx={{ textTransform: "none" }}
              >
                IMDb
              </Button>
            )}
            <Button
              size="small"
              variant="outlined"
              color="secondary"
              href={`https://www.themoviedb.org/person/${person.id}-${slugify(person.name)}`}
              target="_blank"
              rel="noopener noreferrer"
              startIcon={<OpenInNewIcon />}
              sx={{ textTransform: "none" }}
            >
              TMDB
            </Button>
          </Stack>
        </CardContent>
      </Card>

      {movieCredits.length > 0 && (
        <Box sx={{ mt: 4 }}>
          <Typography variant="h5" component="h2" gutterBottom>
            {t("knownFor")}
          </Typography>
          <Box
            sx={{
              display: "flex",
              flexWrap: "wrap",
              gap: 2,
              mt: 2,
            }}
          >
            {movieCredits.map((movie) => (
              <Link
                key={movie.id}
                href={`/movie/${movie.id}`}
                style={{ textDecoration: "none", color: "inherit" }}
              >
                <Card
                  sx={{
                    width: 140,
                    transition: "transform 0.2s",
                    "&:hover": { transform: "scale(1.03)" },
                  }}
                >
                  <Box
                    component="img"
                    src={posterUrl(movie.poster_path, "w185") ?? undefined}
                    alt={movie.title}
                    sx={{
                      width: "100%",
                      aspectRatio: "2/3",
                      objectFit: "cover",
                      bgcolor: "grey.300",
                      display: "block",
                    }}
                  />
                  <CardContent sx={{ py: 1, px: 1.5, "&:last-child": { pb: 1.5 } }}>
                    <Typography variant="subtitle2" noWrap title={movie.title}>
                      {movie.title}
                    </Typography>
                    {movie.release_date && (
                      <Typography variant="caption" color="text.secondary">
                        {movie.release_date.slice(0, 4)}
                      </Typography>
                    )}
                    {movie.character && (
                      <Typography
                        variant="caption"
                        display="block"
                        color="text.secondary"
                        noWrap
                        title={movie.character}
                      >
                        {movie.character}
                      </Typography>
                    )}
                  </CardContent>
                </Card>
              </Link>
            ))}
          </Box>
        </Box>
      )}
    </Container>
  );
}
