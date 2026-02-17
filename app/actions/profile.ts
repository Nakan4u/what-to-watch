"use server";

import { auth } from "@/auth";
import bcrypt from "bcryptjs";
import { prisma } from "@/lib/db";
import { writeFile, mkdir, unlink } from "fs/promises";
import path from "path";

const ALLOWED_TYPES = ["image/jpeg", "image/png", "image/webp"];
const MAX_SIZE = 2 * 1024 * 1024; // 2MB

export async function updateProfileImage(formData: FormData) {
  const session = await auth();
  if (!session?.user?.id) {
    return { error: "Unauthorized" };
  }
  const file = formData.get("avatar") as File | null;
  if (!file || file.size === 0) {
    return { error: "No file provided" };
  }
  if (!ALLOWED_TYPES.includes(file.type)) {
    return { error: "Invalid file type. Use JPEG, PNG or WebP." };
  }
  if (file.size > MAX_SIZE) {
    return { error: "File too large. Maximum size is 2MB." };
  }
  const ext = file.type === "image/jpeg" ? "jpg" : file.type === "image/png" ? "png" : "webp";
  const filename = `${session.user.id}.${ext}`;
  const dir = path.join(process.cwd(), "public", "uploads", "avatars");
  await mkdir(dir, { recursive: true });
  const filepath = path.join(dir, filename);
  const bytes = await file.arrayBuffer();
  const buffer = Buffer.from(bytes);
  await writeFile(filepath, buffer);
  const imageUrl = `/uploads/avatars/${filename}`;

  // Remove old uploaded file if it was our upload (not OAuth URL)
  const user = await prisma.user.findUnique({
    where: { id: session.user.id },
    select: { image: true },
  });
  if (user?.image?.startsWith("/uploads/avatars/")) {
    const oldPath = path.join(process.cwd(), "public", user.image);
    await unlink(oldPath).catch(() => {});
  }

  await prisma.user.update({
    where: { id: session.user.id },
    data: { image: imageUrl },
  });
  return { ok: true, imageUrl };
}

export async function removeProfileImage() {
  const session = await auth();
  if (!session?.user?.id) {
    return { error: "Unauthorized" };
  }
  const user = await prisma.user.findUnique({
    where: { id: session.user.id },
    select: { image: true },
  });
  if (user?.image?.startsWith("/uploads/avatars/")) {
    const filepath = path.join(process.cwd(), "public", user.image);
    await unlink(filepath).catch(() => {});
  }
  await prisma.user.update({
    where: { id: session.user.id },
    data: { image: null },
  });
  return { ok: true };
}

export async function updateProfileName(name: string) {
  const session = await auth();
  if (!session?.user?.id) {
    return { error: "Unauthorized" };
  }
  await prisma.user.update({
    where: { id: session.user.id },
    data: { name: name.trim() || null },
  });
  return { ok: true };
}

export async function updatePassword(
  currentPassword: string,
  newPassword: string
) {
  const session = await auth();
  if (!session?.user?.id) {
    return { error: "Unauthorized" };
  }
  const user = await prisma.user.findUnique({
    where: { id: session.user.id },
    select: { passwordHash: true },
  });
  if (!user?.passwordHash) {
    return { error: "Password change not available for this account" };
  }
  const valid = await bcrypt.compare(currentPassword, user.passwordHash);
  if (!valid) {
    return { error: "Current password is incorrect" };
  }
  if (newPassword.length < 6) {
    return { error: "New password must be at least 6 characters" };
  }
  const passwordHash = await bcrypt.hash(newPassword, 10);
  await prisma.user.update({
    where: { id: session.user.id },
    data: { passwordHash },
  });
  return { ok: true };
}
