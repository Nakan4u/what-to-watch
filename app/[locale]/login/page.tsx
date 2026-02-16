import { setRequestLocale } from "next-intl/server";
import { Container, Typography, Paper, Box } from "@mui/material";
import { routing } from "@/i18n/routing";
import LoginForm from "@/components/LoginForm";

type Props = { params: Promise<{ locale: string }> };

export function generateStaticParams() {
  return routing.locales.map((locale) => ({ locale }));
}

export default async function LoginPage({ params }: Props) {
  const { locale } = await params;
  setRequestLocale(locale);

  return (
    <Container maxWidth="sm" sx={{ py: 4 }}>
      <Paper elevation={2} sx={{ p: 3 }}>
        <Typography variant="h4" component="h1" gutterBottom>
          Sign in
        </Typography>
        <LoginForm locale={locale} />
      </Paper>
    </Container>
  );
}
