import { NextResponse } from "next/server";

export const dynamic = "force-dynamic";

export async function GET() {
  const key = process.env.TMDB_API_KEY ?? process.env.NEXT_PUBLIC_TMDB_KEY;
  if (!key) {
    return NextResponse.json(
      { ok: false, error: "TMDB_API_KEY (or NEXT_PUBLIC_TMDB_KEY) is not set in .env" },
      { status: 500 }
    );
  }
  const url = `https://api.themoviedb.org/3/movie/popular?api_key=${key}&language=en-US&page=1`;
  const res = await fetch(url, { cache: "no-store" });
  const text = await res.text();
  let body: unknown = null;
  try {
    body = JSON.parse(text);
  } catch {
    body = text;
  }
  if (!res.ok) {
    return NextResponse.json(
      { ok: false, status: res.status, statusText: res.statusText, body },
      { status: 502 }
    );
  }
  const data = body as { results?: unknown[] };
  return NextResponse.json({
    ok: true,
    status: res.status,
    resultsCount: data.results?.length ?? 0,
  });
}
