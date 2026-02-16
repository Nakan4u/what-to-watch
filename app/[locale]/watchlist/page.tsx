import { setRequestLocale } from "next-intl/server";
import { auth } from "@/auth";
import { redirect } from "next/navigation";
import { Container, Typography, Grid, Card, CardContent, CardMedia, CardActions, Box } from "@mui/material";
import { routing } from "@/i18n/routing";
import { getWatchlist } from "@/app/actions/watchlist";
import { posterUrl } from "@/lib/tmdb";
import { Link } from "@/i18n/navigation";
import WatchlistActions from "@/components/WatchlistActions";

type Props = { params: Promise<{ locale: string }> };

export function generateStaticParams() {
  return routing.locales.map((locale) => ({ locale }));
}

export default async function WatchlistPage({ params }: Props) {
  const { locale } = await params;
  setRequestLocale(locale);
  const session = await auth();
  if (!session?.user) {
    redirect(`/${locale}/login`);
  }
  const items = await getWatchlist();

  return (
    <Container maxWidth="lg" sx={{ py: 4 }}>
      <Typography variant="h4" gutterBottom>
        My watchlist
      </Typography>
      {items.length === 0 ? (
        <Typography color="text.secondary">
          Your watchlist is empty. Browse movies and TV shows to add some.
        </Typography>
      ) : (
        <Grid container spacing={2}>
          {items.map((item) => (
            <Grid size={{ xs: 12, sm: 6, md: 4, lg: 3 }} key={item.id}>
              <Card sx={{ height: "100%", display: "flex", flexDirection: "column" }}>
                <Link href={item.type === "movie" ? `/movie/${item.tmdbId}` : `/tv/${item.tmdbId}`} style={{ textDecoration: "none" }}>
                  <CardMedia
                    component="img"
                    height="200"
                    image={posterUrl(item.posterPath) ?? undefined}
                    alt={item.title ?? ""}
                    sx={{ objectFit: "cover", bgcolor: "grey.300" }}
                  />
                  <CardContent sx={{ flexGrow: 1 }}>
                    <Typography variant="subtitle2" color="text.secondary">
                      {item.type === "movie" ? "Movie" : "TV"}
                    </Typography>
                    <Typography variant="h6" noWrap>
                      {item.title ?? `#${item.tmdbId}`}
                    </Typography>
                    {item.watched && (
                      <Typography variant="body2" color="primary">
                        Watched {item.comment ? `· ${item.comment}` : ""}
                      </Typography>
                    )}
                  </CardContent>
                </Link>
                <CardActions>
                  <WatchlistActions
                    itemId={item.id}
                    watched={item.watched}
                    comment={item.comment}
                  />
                </CardActions>
              </Card>
            </Grid>
          ))}
        </Grid>
      )}
    </Container>
  );
}
