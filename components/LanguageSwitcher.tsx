"use client";

import {
  FormControl,
  InputLabel,
  Select,
  MenuItem,
  SelectChangeEvent,
} from "@mui/material";
import { useRouter, usePathname } from "@/i18n/navigation";
import { useLocale } from "next-intl";

const locales = [
  { value: "en", label: "English" },
  { value: "pl", label: "Polski" },
  { value: "uk", label: "Українська" },
] as const;

export default function LanguageSwitcher() {
  const router = useRouter();
  const pathname = usePathname();
  const locale = useLocale();

  const handleChange = (event: SelectChangeEvent<string>) => {
    const newLocale = event.target.value as "en" | "pl" | "uk";
    router.replace(pathname, { locale: newLocale });
  };

  return (
    <FormControl size="small" sx={{ minWidth: 120 }}>
      <InputLabel id="locale-select-label">Language</InputLabel>
      <Select
        labelId="locale-select-label"
        id="locale-select"
        value={locale}
        label="Language"
        onChange={handleChange}
      >
        {locales.map((loc) => (
          <MenuItem key={loc.value} value={loc.value}>
            {loc.label}
          </MenuItem>
        ))}
      </Select>
    </FormControl>
  );
}
