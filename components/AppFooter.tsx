"use client";

import { Box, Container, Typography, Link } from "@mui/material";
import { useTranslations } from "next-intl";

const TMDB_URL = "https://www.themoviedb.org";

export default function AppFooter() {
  const t = useTranslations("common");
  const tFooter = useTranslations("footer");
  const year = new Date().getFullYear();

  return (
    <Box
      component="footer"
      sx={{
        mt: "auto",
        py: 3,
        px: 2,
        bgcolor: "#000",
        color: "#fff",
        borderTop: "1px solid #333",
      }}
    >
      <Container
        maxWidth="lg"
        sx={{
          display: "flex",
          justifyContent: "space-between",
          alignItems: "center",
          flexWrap: "wrap",
          gap: 1,
        }}
      >
        <Typography variant="body2" color="inherit">
          {tFooter("copyright", { year, appName: t("appName") })}
        </Typography>
        <Typography variant="body2" color="inherit" component="span">
          {tFooter("dataFrom")}{" "}
          <Link
            href={TMDB_URL}
            target="_blank"
            rel="noopener noreferrer"
            color="inherit"
            underline="hover"
          >
            {tFooter("tmdbSite")}
          </Link>
        </Typography>
      </Container>
    </Box>
  );
}
