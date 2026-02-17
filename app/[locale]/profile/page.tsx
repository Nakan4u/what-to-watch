import { setRequestLocale } from "next-intl/server";
import { getTranslations } from "next-intl/server";
import { auth } from "@/auth";
import { redirect } from "next/navigation";
import { Container, Typography, Box } from "@mui/material";
import { routing } from "@/i18n/routing";
import { prisma } from "@/lib/db";
import ProfileForm from "@/components/ProfileForm";

type Props = { params: Promise<{ locale: string }> };

export function generateStaticParams() {
  return routing.locales.map((locale) => ({ locale }));
}

export default async function ProfilePage({ params }: Props) {
  const { locale } = await params;
  setRequestLocale(locale);
  const session = await auth();
  if (!session?.user?.id) {
    redirect(`/${locale}/login`);
  }
  const user = await prisma.user.findUnique({
    where: { id: session.user.id },
    select: { email: true, name: true, passwordHash: true, image: true },
  });
  if (!user) {
    redirect(`/${locale}/login`);
  }

  const t = await getTranslations("profile");

  return (
    <Container maxWidth="sm" sx={{ py: 4 }}>
      <Typography variant="h4" component="h1" gutterBottom>
        {t("title")}
      </Typography>
      <Box>
        <ProfileForm
          initialName={user.name}
          initialImageUrl={user.image}
          email={user.email}
          canChangePassword={!!user.passwordHash}
        />
      </Box>
    </Container>
  );
}
