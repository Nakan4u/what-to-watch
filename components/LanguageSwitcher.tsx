"use client";

import {
  Box,
  FormControl,
  InputLabel,
  Select,
  MenuItem,
  SelectChangeEvent,
} from "@mui/material";
import { useRouter, usePathname } from "@/i18n/navigation";
import { useLocale } from "next-intl";
import { setStoredLocale } from "./LocaleStorageSync";

const locales = [
  { value: "en", label: "English", flag: "🇬🇧" },
  { value: "pl", label: "Polski", flag: "🇵🇱" },
  { value: "uk", label: "Українська", flag: "🇺🇦" },
] as const;

interface LanguageSwitcherProps {
  /** Use theme (dark) colors instead of white; for use on light backgrounds (e.g. mobile drawer) */
  light?: boolean;
}

export default function LanguageSwitcher({ light }: LanguageSwitcherProps) {
  const router = useRouter();
  const pathname = usePathname();
  const locale = useLocale();

  const handleChange = (event: SelectChangeEvent<string>) => {
    const newLocale = event.target.value as "en" | "pl" | "uk";
    setStoredLocale(newLocale);
    router.replace(pathname, { locale: newLocale });
  };

  const lightSx = light
    ? {}
    : {
        "& .MuiInputLabel-root": { color: "white" },
        "& .MuiInputLabel-root.Mui-focused": { color: "white" },
        "& .MuiOutlinedInput-notchedOutline": { borderColor: "rgba(255,255,255,0.5)" },
        "&:hover .MuiOutlinedInput-notchedOutline": { borderColor: "rgba(255,255,255,0.8)" },
        "& .Mui-focused .MuiOutlinedInput-notchedOutline": { borderColor: "white" },
        "& .MuiSvgIcon-root": { color: "white" },
        "& .MuiSelect-select": { color: "white" },
      };

  return (
    <FormControl
      size="small"
      sx={{
        minWidth: 120,
        ...lightSx,
      }}
    >
      <InputLabel id="locale-select-label">Language</InputLabel>
      <Select
        labelId="locale-select-label"
        id="locale-select"
        value={locale}
        label="Language"
        onChange={handleChange}
        renderValue={(value) => {
          const loc = locales.find((l) => l.value === value);
          return loc ? (
            <Box component="span" sx={{ display: "flex", alignItems: "center", gap: 1 }}>
              <span>{loc.flag}</span>
              <span>{loc.label}</span>
            </Box>
          ) : (
            value
          );
        }}
      >
        {locales.map((loc) => (
          <MenuItem key={loc.value} value={loc.value}>
            <Box sx={{ display: "flex", alignItems: "center", gap: 1 }}>
              <span>{loc.flag}</span>
              <span>{loc.label}</span>
            </Box>
          </MenuItem>
        ))}
      </Select>
    </FormControl>
  );
}
