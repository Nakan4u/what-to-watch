"use client";

import { useCallback, useEffect, useRef, useState } from "react";
import { Grid, Box, Typography, CircularProgress } from "@mui/material";
import TitleCard from "@/components/TitleCard";
import { getBrowsePage, type BrowsePageParams } from "@/app/actions/browse";
import type { TmdbTitle } from "@/lib/tmdb";

interface BrowseResultsProps {
  initialResults: TmdbTitle[];
  initialTotalPages: number;
  params: Omit<BrowsePageParams, "page">;
  genreIdToName: Record<string, string>;
  watchlistIdByTmdb: Record<string, string>;
  noResultsMessage: string;
}

export default function BrowseResults({
  initialResults,
  initialTotalPages,
  params,
  genreIdToName,
  watchlistIdByTmdb,
  noResultsMessage,
}: BrowseResultsProps) {
  const [results, setResults] = useState(initialResults);
  const [page, setPage] = useState(1);
  const [loading, setLoading] = useState(false);
  const [hasMore, setHasMore] = useState(initialTotalPages > 1);
  const sentinelRef = useRef<HTMLDivElement>(null);

  // Reset when initial data changes (filters changed)
  useEffect(() => {
    setResults(initialResults);
    setPage(1);
    setHasMore(initialTotalPages > 1);
  }, [
    initialResults,
    initialTotalPages,
    params.query,
    params.type,
    params.genreId,
    params.year,
  ]);

  const loadMore = useCallback(async () => {
    if (loading || !hasMore) return;
    const nextPage = page + 1;
    setLoading(true);
    try {
      const { results: newResults, totalPages } = await getBrowsePage({
        ...params,
        page: nextPage,
      });
      setResults((prev) => [...prev, ...newResults]);
      setPage(nextPage);
      setHasMore(nextPage < totalPages);
    } finally {
      setLoading(false);
    }
  }, [params, page, hasMore, loading]);

  useEffect(() => {
    const sentinel = sentinelRef.current;
    if (!sentinel || !hasMore || loading) return;

    const observer = new IntersectionObserver(
      (entries) => {
        if (entries[0]?.isIntersecting) loadMore();
      },
      { rootMargin: "200px", threshold: 0 }
    );
    observer.observe(sentinel);
    return () => observer.disconnect();
  }, [loadMore, hasMore, loading]);

  if (results.length === 0) {
    return (
      <Grid container spacing={2}>
        <Grid size={12}>
          <Box py={4} textAlign="center">
            <Typography color="text.secondary">{noResultsMessage}</Typography>
          </Box>
        </Grid>
      </Grid>
    );
  }

  return (
    <Grid container spacing={2}>
      {results.map((title) => (
        <Grid size={{ xs: 12, sm: 6, md: 4, lg: 3 }} key={`${title.type}-${title.id}`}>
          <TitleCard
            title={title}
            watchlistItemId={
              watchlistIdByTmdb[`${title.id}-${title.type}`] ?? null
            }
            genreNames={
              title.genre_ids
                ?.map((id) => genreIdToName[String(id)])
                .filter((n): n is string => n != null)
            }
          />
        </Grid>
      ))}
      <Grid size={12}>
        <Box
          ref={sentinelRef}
          sx={{
            display: "flex",
            justifyContent: "center",
            py: 3,
            minHeight: 60,
          }}
        >
          {loading && <CircularProgress size={32} />}
        </Box>
      </Grid>
    </Grid>
  );
}
