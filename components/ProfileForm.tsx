"use client";

import { useState, useRef } from "react";
import {
  Box,
  TextField,
  Button,
  Typography,
  Alert,
  Stack,
  Paper,
  Divider,
  Avatar,
  IconButton,
} from "@mui/material";
import PersonIcon from "@mui/icons-material/Person";
import PhotoCameraIcon from "@mui/icons-material/PhotoCamera";
import DeleteOutlineIcon from "@mui/icons-material/DeleteOutline";
import { useTranslations } from "next-intl";
import { updateProfileName, updatePassword, updateProfileImage, removeProfileImage } from "@/app/actions/profile";
import { useNotification } from "@/components/NotificationContext";

interface ProfileFormProps {
  initialName: string | null;
  initialImageUrl: string | null;
  email: string;
  canChangePassword: boolean;
}

export default function ProfileForm({
  initialName,
  initialImageUrl,
  email,
  canChangePassword,
}: ProfileFormProps) {
  const t = useTranslations("profile");
  const { showNotification } = useNotification();
  const [name, setName] = useState(initialName ?? "");
  const [nameError, setNameError] = useState<string | null>(null);
  const [nameLoading, setNameLoading] = useState(false);

  const [imageUrl, setImageUrl] = useState<string | null>(initialImageUrl);
  const [avatarError, setAvatarError] = useState<string | null>(null);
  const [avatarLoading, setAvatarLoading] = useState(false);
  const fileInputRef = useRef<HTMLInputElement>(null);

  const [currentPassword, setCurrentPassword] = useState("");
  const [newPassword, setNewPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [passwordError, setPasswordError] = useState<string | null>(null);
  const [passwordLoading, setPasswordLoading] = useState(false);

  const handleAvatarChange = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;
    setAvatarError(null);
    setAvatarLoading(true);
    try {
      const formData = new FormData();
      formData.set("avatar", file);
      const result = await updateProfileImage(formData);
      if ("error" in result) {
        setAvatarError(result.error ?? t("error"));
        setAvatarLoading(false);
        return;
      }
      setImageUrl(result.imageUrl ?? null);
      showNotification(t("avatarUpdated"), "success");
    } catch {
      setAvatarError(t("error"));
    }
    setAvatarLoading(false);
    e.target.value = "";
  };

  const handleRemoveAvatar = async () => {
    setAvatarError(null);
    setAvatarLoading(true);
    try {
      const result = await removeProfileImage();
      if ("error" in result) {
        setAvatarError(result.error ?? t("error"));
        setAvatarLoading(false);
        return;
      }
      setImageUrl(null);
      showNotification(t("avatarRemoved"), "success");
    } catch {
      setAvatarError(t("error"));
    }
    setAvatarLoading(false);
  };

  const handleUpdateName = async (e: React.FormEvent) => {
    e.preventDefault();
    setNameError(null);
    setNameLoading(true);
    try {
      const result = await updateProfileName(name);
      if ("error" in result) {
        setNameError(result.error ?? t("error"));
        setNameLoading(false);
        return;
      }
      showNotification(t("nameUpdated"), "success");
    } catch {
      setNameError(t("error"));
    }
    setNameLoading(false);
  };

  const handleUpdatePassword = async (e: React.FormEvent) => {
    e.preventDefault();
    setPasswordError(null);
    if (newPassword !== confirmPassword) {
      setPasswordError(t("passwordsDoNotMatch"));
      return;
    }
    if (newPassword.length < 6) {
      setPasswordError(t("passwordTooShort"));
      return;
    }
    setPasswordLoading(true);
    try {
      const result = await updatePassword(currentPassword, newPassword);
      if ("error" in result) {
        setPasswordError(result.error ?? t("error"));
        setPasswordLoading(false);
        return;
      }
      showNotification(t("passwordUpdated"), "success");
      setCurrentPassword("");
      setNewPassword("");
      setConfirmPassword("");
    } catch {
      setPasswordError(t("error"));
    }
    setPasswordLoading(false);
  };

  return (
    <Stack spacing={4}>
      <Paper variant="outlined" sx={{ p: 3 }}>
        <Typography variant="h6" gutterBottom>
          {t("accountInfo")}
        </Typography>
        <Box sx={{ display: "flex", alignItems: "center", gap: 2, mb: 3 }}>
          <Avatar
            src={imageUrl ?? undefined}
            sx={{ width: 80, height: 80 }}
            alt={name || email}
          >
            {!imageUrl && <PersonIcon sx={{ fontSize: 48 }} />}
          </Avatar>
          <Stack direction="row" spacing={1} alignItems="center">
            <input
              ref={fileInputRef}
              type="file"
              accept="image/jpeg,image/png,image/webp"
              onChange={handleAvatarChange}
              style={{ display: "none" }}
            />
            <Button
              variant="outlined"
              size="small"
              startIcon={<PhotoCameraIcon />}
              onClick={() => fileInputRef.current?.click()}
              disabled={avatarLoading}
            >
              {avatarLoading ? t("saving") : t("uploadAvatar")}
            </Button>
            {imageUrl && (
              <IconButton
                color="error"
                size="small"
                onClick={handleRemoveAvatar}
                disabled={avatarLoading}
                aria-label={t("removeAvatar")}
              >
                <DeleteOutlineIcon />
              </IconButton>
            )}
          </Stack>
        </Box>
        {avatarError && (
          <Alert severity="error" sx={{ mb: 2 }} onClose={() => setAvatarError(null)}>
            {avatarError}
          </Alert>
        )}
        <TextField
          fullWidth
          label={t("email")}
          value={email}
          disabled
          sx={{ mb: 2 }}
          helperText={t("emailReadOnly")}
        />
        <Box component="form" onSubmit={handleUpdateName} noValidate>
          {nameError && (
            <Alert severity="error" sx={{ mb: 2 }} onClose={() => setNameError(null)}>
              {nameError}
            </Alert>
          )}
          <TextField
            fullWidth
            label={t("displayName")}
            value={name}
            onChange={(e) => setName(e.target.value)}
            sx={{ mb: 2 }}
          />
          <Button
            type="submit"
            variant="contained"
            disabled={nameLoading}
          >
            {nameLoading ? t("saving") : t("saveName")}
          </Button>
        </Box>
      </Paper>

      {canChangePassword && (
        <Paper variant="outlined" sx={{ p: 3 }}>
          <Typography variant="h6" gutterBottom>
            {t("changePassword")}
          </Typography>
          <Divider sx={{ mb: 2 }} />
          <Box component="form" onSubmit={handleUpdatePassword} noValidate>
            {passwordError && (
              <Alert severity="error" sx={{ mb: 2 }} onClose={() => setPasswordError(null)}>
                {passwordError}
              </Alert>
            )}
            <Stack spacing={2}>
              <TextField
                fullWidth
                label={t("currentPassword")}
                type="password"
                autoComplete="current-password"
                value={currentPassword}
                onChange={(e) => setCurrentPassword(e.target.value)}
                required
              />
              <TextField
                fullWidth
                label={t("newPassword")}
                type="password"
                autoComplete="new-password"
                value={newPassword}
                onChange={(e) => setNewPassword(e.target.value)}
                required
                helperText={t("passwordMinLength")}
              />
              <TextField
                fullWidth
                label={t("confirmPassword")}
                type="password"
                autoComplete="new-password"
                value={confirmPassword}
                onChange={(e) => setConfirmPassword(e.target.value)}
                required
              />
              <Button
                type="submit"
                variant="contained"
                color="primary"
                disabled={passwordLoading}
              >
                {passwordLoading ? t("saving") : t("updatePassword")}
              </Button>
            </Stack>
          </Box>
        </Paper>
      )}
    </Stack>
  );
}
