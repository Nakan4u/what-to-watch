"use client";

import { AppBar, Toolbar, Typography, Button, Box } from "@mui/material";
import { useTranslations } from "next-intl";
import { useSession, signOut } from "next-auth/react";
import { Link } from "@/i18n/navigation";
import LanguageSwitcher from "./LanguageSwitcher";

export default function AppHeader() {
  const t = useTranslations("nav");
  const { data: session, status } = useSession();

  return (
    <AppBar position="static">
      <Toolbar>
        <Typography variant="h6" component="div" sx={{ flexGrow: 1 }}>
          <Link href="/" style={{ color: "inherit", textDecoration: "none" }}>
            What to watch
          </Link>
        </Typography>
        <Box sx={{ display: "flex", alignItems: "center", gap: 2 }}>
          <Button color="inherit" component={Link} href="/browse">
            {t("browse")}
          </Button>
          <Button color="inherit" component={Link} href="/watchlist">
            {t("myWatchlist")}
          </Button>
          {status === "loading" ? null : session ? (
            <>
              <Typography variant="body2">{session.user?.name ?? session.user?.email}</Typography>
              <Button color="inherit" onClick={() => signOut()}>
                {t("signOut")}
              </Button>
            </>
          ) : (
            <Button color="inherit" component={Link} href="/login">
              {t("signIn")}
            </Button>
          )}
          <LanguageSwitcher />
        </Box>
      </Toolbar>
    </AppBar>
  );
}
