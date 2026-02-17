"use client";

import { useState } from "react";
import {
  Box,
  TextField,
  Button,
  Typography,
  Alert,
  Stack,
} from "@mui/material";
import { signIn } from "next-auth/react";
import { useTranslations } from "next-intl";
import { useRouter } from "@/i18n/navigation";
import { register } from "@/app/actions/auth";
import { useNotification } from "@/components/NotificationContext";

interface LoginFormProps {
  locale: string;
}

export default function LoginForm({ locale }: LoginFormProps) {
  const t = useTranslations("auth");
  const router = useRouter();
  const { showNotification } = useNotification();
  const [isRegister, setIsRegister] = useState(false);
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [name, setName] = useState("");
  const [error, setError] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);

  // Full path with locale for next-auth redirect (e.g. Google OAuth); ?signedIn=1 triggers success toast on browse
  const callbackUrl = `/${locale}/browse?signedIn=1`;
  // Path without locale for i18n router (it adds the locale automatically)
  const browsePath = "/browse";

  const handleCredentialsSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);
    setLoading(true);
    try {
      if (isRegister) {
        const result = await register(email, password, name || undefined);
        if ("error" in result) {
          setError(result.error ?? "Error");
          setLoading(false);
          return;
        }
      }
      const result = await signIn("credentials", {
        email,
        password,
        redirect: false,
        callbackUrl,
      });
      if (result?.error) {
        setError("Invalid email or password");
        setLoading(false);
        return;
      }
      if (result?.ok) {
        showNotification(
          isRegister ? t("registerSuccess") : t("signInSuccess"),
          "success"
        );
        router.push(browsePath);
      }
    } catch {
      setError("Something went wrong");
    }
    setLoading(false);
  };

  const handleGoogleSignIn = () => {
    signIn("google", { callbackUrl });
  };

  return (
    <Box component="form" onSubmit={handleCredentialsSubmit} noValidate sx={{ mt: 2 }}>
      {error && (
        <Alert severity="error" sx={{ mb: 2 }} onClose={() => setError(null)}>
          {error}
        </Alert>
      )}
      <Stack spacing={2}>
        {isRegister && (
          <TextField
            fullWidth
            label="Display name (optional)"
            value={name}
            onChange={(e) => setName(e.target.value)}
          />
        )}
        <TextField
          fullWidth
          required
          label={t("email")}
          type="email"
          autoComplete="email"
          value={email}
          onChange={(e) => setEmail(e.target.value)}
        />
        <TextField
          fullWidth
          required
          label={t("password")}
          type="password"
          autoComplete={isRegister ? "new-password" : "current-password"}
          value={password}
          onChange={(e) => setPassword(e.target.value)}
        />
        <Button
          type="submit"
          fullWidth
          variant="contained"
          size="large"
          disabled={loading}
        >
          {isRegister ? t("register") : t("signIn")}
        </Button>
        <Button
          fullWidth
          variant="outlined"
          size="large"
          onClick={handleGoogleSignIn}
          disabled={loading}
        >
          {t("signInWithGoogle")}
        </Button>
        <Typography variant="body2" color="text.secondary" textAlign="center">
          <button
            type="button"
            onClick={() => setIsRegister(!isRegister)}
            style={{
              background: "none",
              border: "none",
              color: "inherit",
              textDecoration: "underline",
              cursor: "pointer",
              padding: 0,
              font: "inherit",
            }}
          >
            {isRegister ? "Already have an account? Sign in" : "No account? Register"}
          </button>
        </Typography>
      </Stack>
    </Box>
  );
}
