"use client";

import { useEffect, useRef } from "react";
import { useRouter, usePathname } from "@/i18n/navigation";
import { useLocale } from "next-intl";
import { routing } from "@/i18n/routing";

const LOCALE_STORAGE_KEY = "locale-preference";

export function getStoredLocale(): string | null {
  if (typeof window === "undefined") return null;
  try {
    const stored = localStorage.getItem(LOCALE_STORAGE_KEY);
    const locales = routing.locales as readonly string[];
    return stored && locales.includes(stored) ? stored : null;
  } catch {
    return null;
  }
}

export function setStoredLocale(locale: string): void {
  try {
    localStorage.setItem(LOCALE_STORAGE_KEY, locale);
  } catch {
    // ignore
  }
}

/**
 * On mount, redirects to the stored locale if it differs from the current URL.
 * Renders nothing.
 */
export default function LocaleStorageSync() {
  const router = useRouter();
  const pathname = usePathname();
  const locale = useLocale();
  const didRun = useRef(false);

  useEffect(() => {
    if (didRun.current) return;
    didRun.current = true;
    const stored = getStoredLocale();
    if (stored && stored !== locale) {
      router.replace(pathname, { locale: stored as "en" | "pl" | "uk" });
    }
  }, [locale, pathname, router]);

  return null;
}
