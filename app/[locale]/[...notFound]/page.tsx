import { notFound } from "next/navigation";

/**
 * Catch-all for unmatched paths under [locale] (e.g. /en/tv2/1396).
 * Triggers the custom not-found.tsx so our 404 page is shown.
 */
export default function LocaleCatchAll() {
  notFound();
}
