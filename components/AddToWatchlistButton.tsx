"use client";

import { useState } from "react";
import { Button } from "@mui/material";
import { useTranslations } from "next-intl";
import { addToWatchlist } from "@/app/actions/watchlist";
import type { TmdbTitle } from "@/lib/tmdb";

interface AddToWatchlistButtonProps {
  title: TmdbTitle;
}

export default function AddToWatchlistButton({ title }: AddToWatchlistButtonProps) {
  const t = useTranslations("watchlist");
  const [loading, setLoading] = useState(false);

  const handleAdd = async () => {
    setLoading(true);
    await addToWatchlist(
      title.id,
      title.type,
      title.title,
      title.poster_path
    );
    setLoading(false);
  };

  return (
    <Button
      size="small"
      variant="outlined"
      onClick={handleAdd}
      disabled={loading}
    >
      {t("addToWatchlist")}
    </Button>
  );
}
