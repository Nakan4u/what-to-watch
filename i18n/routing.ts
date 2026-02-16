import { defineRouting } from "next-intl/routing";

export const routing = defineRouting({
  locales: ["en", "pl", "uk"],
  defaultLocale: "en",
  localePrefix: "always",
});
