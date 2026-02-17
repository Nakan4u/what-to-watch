"use client";

import { Card, CardContent, CardMedia, Typography, Chip, CardActions } from "@mui/material";
import { Link } from "@/i18n/navigation";
import type { TmdbTitle } from "@/lib/tmdb";
import { posterUrl } from "@/lib/tmdb";
import AddToWatchlistButton from "./AddToWatchlistButton";

interface TitleCardProps {
  title: TmdbTitle;
  /** When set, the title is in the watchlist (for "Remove from watchlist" button) */
  watchlistItemId?: string | null;
}

export default function TitleCard({ title, watchlistItemId }: TitleCardProps) {
  const href = title.type === "movie" ? `/movie/${title.id}` : `/tv/${title.id}`;
  const imgUrl = posterUrl(title.poster_path);

  return (
    <Card
      sx={{
        height: "100%",
        display: "flex",
        flexDirection: "column",
        transition: "transform 0.2s",
        "&:hover": { transform: "scale(1.02)" },
      }}
    >
      <Link href={href} style={{ textDecoration: "none", color: "inherit" }}>
        <CardMedia
          component="img"
          height="340"
          image={imgUrl ?? undefined}
          alt={title.title}
          sx={{
            objectFit: "cover",
            bgcolor: "grey.300",
          }}
        />
        <CardContent sx={{ flexGrow: 1 }}>
          <Typography variant="subtitle2" color="text.secondary" gutterBottom>
            {title.type === "movie" ? "Movie" : "TV"}
            {title.release_date ? ` · ${title.release_date.slice(0, 4)}` : ""}
          </Typography>
          <Typography variant="h6" component="h2" noWrap>
            {title.title}
          </Typography>
          {title.vote_average != null && (
            <Chip
              size="small"
              label={title.vote_average.toFixed(1)}
              sx={{ mt: 1 }}
            />
          )}
        </CardContent>
      </Link>
      <CardActions>
        <AddToWatchlistButton title={title} watchlistItemId={watchlistItemId} />
      </CardActions>
    </Card>
  );
}
