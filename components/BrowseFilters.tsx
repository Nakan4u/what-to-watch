"use client";

import { useRouter, usePathname } from "@/i18n/navigation";
import {
  Box,
  TextField,
  FormControl,
  InputLabel,
  Select,
  MenuItem,
  InputAdornment,
  IconButton,
  Typography,
} from "@mui/material";
import SearchIcon from "@mui/icons-material/Search";
import ClearIcon from "@mui/icons-material/Clear";
import { useTranslations } from "next-intl";
import { useCallback, useRef, useState, useEffect } from "react";

const SEARCH_DEBOUNCE_MS = 400;

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
  const searchInputRef = useRef<HTMLInputElement>(null);
  const debounceRef = useRef<ReturnType<typeof setTimeout> | null>(null);
  const [showClear, setShowClear] = useState(!!initialQuery);

  useEffect(() => {
    setShowClear(!!initialQuery);
  }, [initialQuery]);

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
    [router, pathname, initialQuery, initialType, initialGenre, initialYear],
  );

  const applySearchFromInput = useCallback(() => {
    const query = searchInputRef.current?.value?.trim() ?? "";
    if (query !== initialQuery) updateUrl({ query });
  }, [initialQuery, updateUrl]);

  const handleSearchChange = useCallback(
    (e: React.ChangeEvent<HTMLInputElement>) => {
      setShowClear(!!e.target.value.trim());
      if (debounceRef.current) clearTimeout(debounceRef.current);
      debounceRef.current = setTimeout(
        applySearchFromInput,
        SEARCH_DEBOUNCE_MS,
      );
    },
    [applySearchFromInput],
  );

  const handleReset = useCallback(() => {
    setShowClear(false);
    if (debounceRef.current) clearTimeout(debounceRef.current);
    debounceRef.current = null;
    if (searchInputRef.current) searchInputRef.current.value = "";
    updateUrl({ query: "" });
  }, [updateUrl]);

  return (
    <Box
      component="form"
      sx={{
        display: "flex",
        flexWrap: { xs: "wrap", md: "nowrap" },
        gap: 2,
        mb: 3,
        alignItems: "center",
      }}
      onSubmit={(e) => e.preventDefault()}
    >
      <TextField
        inputRef={searchInputRef}
        size="small"
        label={t("search")}
        defaultValue={initialQuery}
        name="query"
        onChange={handleSearchChange}
        onBlur={applySearchFromInput}
        InputProps={{
          startAdornment: (
            <InputAdornment position="start">
              <SearchIcon fontSize="small" color="action" />
            </InputAdornment>
          ),
          endAdornment: showClear ? (
            <InputAdornment position="end">
              <IconButton
                size="small"
                onClick={handleReset}
                onMouseDown={(e) => e.preventDefault()}
                aria-label={t("clearSearch")}
                edge="end"
              >
                <ClearIcon fontSize="small" />
              </IconButton>
            </InputAdornment>
          ) : null,
        }}
        sx={{
          flex: { xs: "1 1 100%", md: "0 0 calc(50% - 8px)" },
          maxWidth: { xs: "100%", md: "calc(50% - 8px)" },
          minWidth: 0,
        }}
      />
      <Box
        sx={{
          display: "flex",
          flexWrap: { xs: "wrap", md: "nowrap" },
          gap: 2,
          flex: { xs: "1 1 100%", md: "0 0 calc(50% - 8px)" },
          maxWidth: { xs: "100%", md: "calc(50% - 8px)" },
          alignItems: "center",
          justifyContent: { xs: "flex-start", md: "flex-end" },
          minWidth: 0,
        }}
      >
        <Typography
          variant="caption"
          color="text.secondary"
          sx={{ mr: 0.5, fontSize: "1.125rem" }}
        >
          {t("filters")}:
        </Typography>
        <FormControl size="small" sx={{ flex: 1, minWidth: 90 }}>
          <InputLabel id="browse-type-label">{t("type")}</InputLabel>
          <Select
            labelId="browse-type-label"
            value={initialType}
            label={t("type")}
            onChange={(e) => updateUrl({ type: e.target.value })}
          >
            <MenuItem value="all">{t("all")}</MenuItem>
            <MenuItem value="movie">{t("movie")}</MenuItem>
            <MenuItem value="tv">{t("tv")}</MenuItem>
          </Select>
        </FormControl>
        <FormControl size="small" sx={{ flex: 1, minWidth: 100 }}>
          <InputLabel id="browse-genre-label" shrink>
            {t("genre")}
          </InputLabel>
          <Select
            labelId="browse-genre-label"
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
        <FormControl size="small" sx={{ flex: 1, minWidth: 70 }}>
          <InputLabel id="browse-year-label" shrink>
            {t("year")}
          </InputLabel>
          <Select
            labelId="browse-year-label"
            value={initialYear}
            label={t("year")}
            onChange={(e) => updateUrl({ year: e.target.value })}
          >
            <MenuItem value="">—</MenuItem>
            {Array.from(
              { length: 50 },
              (_, i) => new Date().getFullYear() - i,
            ).map((y) => (
              <MenuItem key={y} value={String(y)}>
                {y}
              </MenuItem>
            ))}
          </Select>
        </FormControl>
      </Box>
    </Box>
  );
}
