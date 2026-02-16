"use client";

import { useState } from "react";
import { Button, Dialog, DialogTitle, DialogContent, DialogActions, TextField } from "@mui/material";
import { useTranslations } from "next-intl";
import { removeFromWatchlist, toggleWatched } from "@/app/actions/watchlist";

interface WatchlistActionsProps {
  itemId: string;
  watched: boolean;
  comment: string | null;
}

export default function WatchlistActions({
  itemId,
  watched,
  comment,
}: WatchlistActionsProps) {
  const t = useTranslations("watchlist");
  const [open, setOpen] = useState(false);
  const [commentText, setCommentText] = useState(comment ?? "");

  const handleMarkWatched = async () => {
    await toggleWatched(itemId, true, commentText || null);
    setOpen(false);
  };

  const handleRemove = async () => {
    await removeFromWatchlist(itemId);
  };

  return (
    <>
      <Button
        size="small"
        variant={watched ? "outlined" : "contained"}
        onClick={() => setOpen(true)}
      >
        {watched ? t("editComment") : t("markWatched")}
      </Button>
      <Button size="small" color="error" onClick={handleRemove}>
        {t("remove")}
      </Button>
      <Dialog open={open} onClose={() => setOpen(false)}>
        <DialogTitle>{t("markWatched")}</DialogTitle>
        <DialogContent>
          <TextField
            fullWidth
            multiline
            rows={3}
            label={t("comment")}
            value={commentText}
            onChange={(e) => setCommentText(e.target.value)}
            sx={{ mt: 1 }}
          />
        </DialogContent>
        <DialogActions>
          <Button onClick={() => setOpen(false)}>Cancel</Button>
          <Button onClick={handleMarkWatched} variant="contained">
            Save
          </Button>
        </DialogActions>
      </Dialog>
    </>
  );
}
