"use client";

import { useEffect } from "react";
import { useSearchParams } from "next/navigation";
import { useTranslations } from "next-intl";
import { usePathname, useRouter } from "@/i18n/navigation";
import { useNotification } from "@/components/NotificationContext";

/** Shows "Signed in successfully" when landing on this page with ?signedIn=1 (e.g. after Google OAuth). */
export default function SignInSuccessToast() {
  const searchParams = useSearchParams();
  const pathname = usePathname();
  const router = useRouter();
  const { showNotification } = useNotification();
  const t = useTranslations("auth");

  useEffect(() => {
    if (searchParams.get("signedIn") === "1") {
      showNotification(t("signInSuccess"), "success");
      router.replace(pathname);
    }
  }, [searchParams, pathname, router, showNotification, t]);

  return null;
}
