"use server";

import bcrypt from "bcryptjs";
import { prisma } from "@/lib/db";

export async function register(email: string, password: string, name?: string) {
  const existing = await prisma.user.findUnique({ where: { email } });
  if (existing) {
    return { error: "User already exists with this email" };
  }
  const passwordHash = await bcrypt.hash(password, 10);
  await prisma.user.create({
    data: {
      email,
      passwordHash,
      name: name ?? null,
    },
  });
  return { ok: true };
}
