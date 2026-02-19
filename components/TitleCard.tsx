"use client";

import {
  Card,
  CardContent,
  Typography,
  Chip,
  CardActions,
  Box,
  Tooltip,
} from "@mui/material";
import { useTranslations } from "next-intl";
import { Link } from "@/i18n/navigation";
import type { TmdbTitle } from "@/lib/tmdb";
import { posterUrl } from "@/lib/tmdb";
import AddToWatchlistButton from "./AddToWatchlistButton";

interface TitleCardProps {
  title: TmdbTitle;
  /** When set, the title is in the watchlist (for "Remove from watchlist" button) */
  watchlistItemId?: string | null;
  /** Genre names to show (resolved from title.genre_ids); when not provided, genres are omitted */
  genreNames?: string[];
}

export default function TitleCard({
  title,
  watchlistItemId,
  genreNames,
}: TitleCardProps) {
  const t = useTranslations("browse");
  const href =
    title.type === "movie" ? `/movie/${title.id}` : `/tv/${title.id}`;
  const imgUrl = posterUrl(title.poster_path);
  const year = title.release_date ? title.release_date.slice(0, 4) : null;

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
        <Box
          sx={{
            width: "100%",
            aspectRatio: "2/3",
            overflow: "hidden",
            bgcolor: "grey.300",
          }}
        >
          <Box
            component="img"
            src={imgUrl ?? undefined}
            alt={title.title}
            sx={{
              width: "100%",
              height: "100%",
              objectFit: "cover",
              display: "block",
            }}
          />
        </Box>
        <CardContent
          sx={{
            flexGrow: 1,
            minHeight: 182,
            height: 182,
            display: "flex",
            flexDirection: "column",
            overflow: "hidden",
          }}
        >
          <Typography
            variant="subtitle2"
            color="text.secondary"
            gutterBottom
            noWrap
          >
            {title.type === "movie" ? t("movie") : t("tv")}
            {year ? ` · ${year}` : ""}
          </Typography>
          <Tooltip title={title.title} enterDelay={400} placement="top">
            <Typography
              variant="h6"
              component="h2"
              noWrap
              sx={{ flexShrink: 0 }}
            >
              {title.title}
            </Typography>
          </Tooltip>
          {title.vote_average != null && (
            <Typography variant="body2" sx={{ mt: 0.5 }} component="span">
              ★ {title.vote_average.toFixed(1)}
            </Typography>
          )}
          {genreNames && genreNames.length > 0 && (
            <Box
              sx={{
                display: "flex",
                flexWrap: "wrap",
                alignContent: "flex-start",
                alignItems: "flex-start",
                gap: 0.5,
                mt: 1,
                minHeight: 0,
                flex: 1,
                overflow: "hidden",
              }}
            >
              {genreNames.slice(0, 4).map((name) => (
                <Chip
                  key={name}
                  size="small"
                  label={name}
                  sx={{ height: 22, fontSize: "0.75rem" }}
                />
              ))}
            </Box>
          )}
        </CardContent>
      </Link>
      <CardActions sx={{ justifyContent: "center" }}>
        <AddToWatchlistButton title={title} watchlistItemId={watchlistItemId} />
      </CardActions>
    </Card>
  );
}
