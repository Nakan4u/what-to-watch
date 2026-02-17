"use server";

import { auth } from "@/auth";
import { prisma } from "@/lib/db";
import { revalidatePath } from "next/cache";

export async function addToWatchlist(
  tmdbId: number,
  type: "movie" | "tv",
  title?: string,
  posterPath?: string | null,
  pathToRevalidate?: string
) {
  const session = await auth();
  if (!session?.user?.id) return { error: "Unauthorized" };
  await prisma.watchlistItem.upsert({
    where: {
      userId_tmdbId_type: {
        userId: session.user.id,
        tmdbId,
        type,
      },
    },
    create: {
      userId: session.user.id,
      tmdbId,
      type,
      title: title ?? null,
      posterPath: posterPath ?? null,
    },
    update: {},
  });
  revalidatePath("/[locale]/watchlist");
  revalidatePath("/[locale]/profile");
  revalidatePath("/[locale]/browse");
  if (pathToRevalidate) revalidatePath(pathToRevalidate);
  return { ok: true };
}

export async function removeFromWatchlist(
  itemId: string,
  pathToRevalidate?: string
) {
  const session = await auth();
  if (!session?.user?.id) return { error: "Unauthorized" };
  await prisma.watchlistItem.deleteMany({
    where: { id: itemId, userId: session.user.id },
  });
  revalidatePath("/[locale]/watchlist");
  revalidatePath("/[locale]/profile");
  revalidatePath("/[locale]/browse");
  if (pathToRevalidate) revalidatePath(pathToRevalidate);
  return { ok: true };
}

export async function toggleWatched(
  itemId: string,
  watched: boolean,
  comment?: string | null
) {
  const session = await auth();
  if (!session?.user?.id) return { error: "Unauthorized" };
  await prisma.watchlistItem.updateMany({
    where: { id: itemId, userId: session.user.id },
    data: {
      watched,
      watchedAt: watched ? new Date() : null,
      comment: comment ?? undefined,
    },
  });
  revalidatePath("/[locale]/watchlist");
  revalidatePath("/[locale]/profile");
  return { ok: true };
}

export async function getWatchlist() {
  const session = await auth();
  if (!session?.user?.id) return [];
  const items = await prisma.watchlistItem.findMany({
    where: { userId: session.user.id },
    orderBy: { createdAt: "desc" },
  });
  return items;
}

export async function getWatchlistItemId(
  tmdbId: number,
  type: "movie" | "tv"
): Promise<string | null> {
  const session = await auth();
  if (!session?.user?.id) return null;
  const item = await prisma.watchlistItem.findUnique({
    where: {
      userId_tmdbId_type: {
        userId: session.user.id,
        tmdbId,
        type,
      },
    },
    select: { id: true },
  });
  return item?.id ?? null;
}
