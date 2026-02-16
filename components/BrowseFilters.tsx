"use client";

import { useRouter, usePathname } from "@/i18n/navigation";
import {
  Box,
  TextField,
  FormControl,
  InputLabel,
  Select,
  MenuItem,
} from "@mui/material";
import { useTranslations } from "next-intl";
import { useCallback } from "react";

type FilterState = {
  query: string;
  type: string;
  genre: string;
  year: string;
};

interface BrowseFiltersProps {
  initialQuery: string;
  initialType: string;
  initialGenre: string;
  initialYear: string;
  genreOptions: { id: number; name: string }[];
}

export default function BrowseFilters({
  initialQuery,
  initialType,
  initialGenre,
  initialYear,
  genreOptions,
}: BrowseFiltersProps) {
  const router = useRouter();
  const pathname = usePathname();
  const t = useTranslations("browse");

  const updateUrl = useCallback(
    (state: Partial<FilterState>) => {
      const params = new URLSearchParams();
      const query = state.query ?? initialQuery;
      const type = state.type ?? initialType;
      const genre = state.genre ?? initialGenre;
      const year = state.year ?? initialYear;
      if (query) params.set("query", query);
      if (type && type !== "all") params.set("type", type);
      if (genre) params.set("genre", genre);
      if (year) params.set("year", year);
      const qs = params.toString();
      router.replace(qs ? `${pathname}?${qs}` : pathname);
    },
    [router, pathname, initialQuery, initialType, initialGenre, initialYear]
  );

  return (
    <Box
      component="form"
      sx={{ display: "flex", flexWrap: "wrap", gap: 2, mb: 3 }}
      onSubmit={(e) => e.preventDefault()}
    >
      <TextField
        size="small"
        label={t("search")}
        defaultValue={initialQuery}
        onBlur={(e) => {
          const v = e.target.value.trim();
          if (v !== initialQuery) updateUrl({ query: v });
        }}
        onKeyDown={(e) => {
          if (e.key === "Enter") {
            const v = (e.target as HTMLInputElement).value.trim();
            updateUrl({ query: v });
          }
        }}
        sx={{ minWidth: 200 }}
      />
      <FormControl size="small" sx={{ minWidth: 120 }}>
        <InputLabel>{t("filters")} (type)</InputLabel>
        <Select
          value={initialType}
          label={t("filters") + " (type)"}
          onChange={(e) => updateUrl({ type: e.target.value })}
        >
          <MenuItem value="all">{t("all")}</MenuItem>
          <MenuItem value="movie">{t("movie")}</MenuItem>
          <MenuItem value="tv">{t("tv")}</MenuItem>
        </Select>
      </FormControl>
      <FormControl size="small" sx={{ minWidth: 140 }}>
        <InputLabel>{t("genre")}</InputLabel>
        <Select
          value={initialGenre}
          label={t("genre")}
          onChange={(e) => updateUrl({ genre: e.target.value })}
        >
          <MenuItem value="">—</MenuItem>
          {genreOptions.map((g) => (
            <MenuItem key={g.id} value={String(g.id)}>
              {g.name}
            </MenuItem>
          ))}
        </Select>
      </FormControl>
      <FormControl size="small" sx={{ minWidth: 100 }}>
        <InputLabel>{t("year")}</InputLabel>
        <Select
          value={initialYear}
          label={t("year")}
          onChange={(e) => updateUrl({ year: e.target.value })}
        >
          <MenuItem value="">—</MenuItem>
          {Array.from({ length: 50 }, (_, i) => new Date().getFullYear() - i).map(
            (y) => (
              <MenuItem key={y} value={String(y)}>
                {y}
              </MenuItem>
            )
          )}
        </Select>
      </FormControl>
    </Box>
  );
}
