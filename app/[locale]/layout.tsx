import { NextIntlClientProvider } from "next-intl";
import { getMessages, setRequestLocale } from "next-intl/server";
import { hasLocale } from "next-intl";
import { notFound } from "next/navigation";
import { AppRouterCacheProvider } from "@mui/material-nextjs/v16-appRouter";
import { routing } from "@/i18n/routing";
import ThemeRegistry from "@/components/ThemeRegistry";
import AppHeader from "@/components/AppHeader";
import AuthProvider from "@/components/AuthProvider";

type Props = {
  children: React.ReactNode;
  params: Promise<{ locale: string }>;
};

export function generateStaticParams() {
  return routing.locales.map((locale) => ({ locale }));
}

export default async function LocaleLayout({ children, params }: Props) {
  const { locale } = await params;
  if (!hasLocale(routing.locales, locale)) {
    notFound();
  }
  setRequestLocale(locale);
  const messages = await getMessages();

  return (
    <AppRouterCacheProvider>
      <NextIntlClientProvider messages={messages}>
        <ThemeRegistry>
          <AuthProvider>
            <AppHeader />
            <main>{children}</main>
          </AuthProvider>
        </ThemeRegistry>
      </NextIntlClientProvider>
    </AppRouterCacheProvider>
  );
}
