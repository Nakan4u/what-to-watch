"use client";

import { useState } from "react";
import { usePathname } from "next/navigation";
import { Button } from "@mui/material";
import { useTranslations } from "next-intl";
import { addToWatchlist, removeFromWatchlist } from "@/app/actions/watchlist";
import { useNotification } from "@/components/NotificationContext";
import type { TmdbTitle } from "@/lib/tmdb";

interface AddToWatchlistButtonProps {
  title: TmdbTitle;
  /** When set, the title is in the watchlist and the button will show "Remove from watchlist" */
  watchlistItemId?: string | null;
}

export default function AddToWatchlistButton({
  title,
  watchlistItemId,
}: AddToWatchlistButtonProps) {
  const t = useTranslations("watchlist");
  const tCommon = useTranslations("common");
  const { showNotification } = useNotification();
  const pathname = usePathname();
  const [loading, setLoading] = useState(false);
  const inWatchlist = Boolean(watchlistItemId);

  const handleAdd = async () => {
    setLoading(true);
    const result = await addToWatchlist(
      title.id,
      title.type,
      title.title,
      title.poster_path,
      pathname
    );
    setLoading(false);
    if (result?.error) {
      const message =
        result.error === "Unauthorized"
          ? t("signInToAddToWatchlist")
          : tCommon("error");
      showNotification(message, "error");
    } else {
      showNotification(t("addedToWatchlist"), "success");
    }
  };

  const handleRemove = async () => {
    if (!watchlistItemId) return;
    setLoading(true);
    const result = await removeFromWatchlist(watchlistItemId, pathname);
    setLoading(false);
    if (result?.error) {
      const message =
        result.error === "Unauthorized"
          ? t("signInToAddToWatchlist")
          : tCommon("error");
      showNotification(message, "error");
    } else {
      showNotification(t("removedFromWatchlist"), "success");
    }
  };

  return (
    <Button
      size="small"
      variant={inWatchlist ? "contained" : "outlined"}
      color={inWatchlist ? "error" : "primary"}
      onClick={inWatchlist ? handleRemove : handleAdd}
      disabled={loading}
    >
      {inWatchlist ? t("removeFromWatchlist") : t("addToWatchlist")}
    </Button>
  );
}
