"use client";

import { Box, Container, Typography, Button } from "@mui/material";
import HomeIcon from "@mui/icons-material/Home";
import { useTranslations } from "next-intl";
import { Link } from "@/i18n/navigation";

export default function NotFound() {
  const t = useTranslations("notFound");

  return (
    <Box
      component="main"
      sx={{
        display: "flex",
        flexDirection: "column",
        alignItems: "center",
        justifyContent: "center",
        minHeight: "60vh",
        py: 4,
      }}
    >
      <Container maxWidth="sm">
        <Typography
          component="h1"
          variant="h2"
          fontWeight={700}
          color="text.primary"
          gutterBottom
          sx={{ fontSize: { xs: "3rem", sm: "4rem" } }}
        >
          404
        </Typography>
        <Typography variant="h5" color="text.secondary" gutterBottom>
          {t("title")}
        </Typography>
        <Typography variant="body1" color="text.secondary" sx={{ mb: 3 }}>
          {t("description")}
        </Typography>
        <Button
          component={Link}
          href="/"
          variant="outlined"
          size="large"
          startIcon={<HomeIcon />}
        >
          {t("backHome")}
        </Button>
      </Container>
    </Box>
  );
}
