import type { APIRoute } from "astro";

export const prerender = false;

type ExerciseGif = { name: string; gifUrl: string };
type CacheEntry = { expiresAt: number; exercises: ExerciseGif[] };

const CACHE_TTL_MS = 55 * 60 * 1000;
const MAX_CACHE_ENTRIES = 200;
const exerciseCache = new Map<string, CacheEntry>();

const json = (body: Record<string, unknown>, status = 200, cacheSeconds = 0) =>
  new Response(JSON.stringify(body), {
    status,
    headers: {
      "Content-Type": "application/json; charset=utf-8",
      "Cache-Control": cacheSeconds > 0 ? `private, max-age=${cacheSeconds}, must-revalidate` : "no-store"
    }
  });

const allowed = (value: string) => {
  try {
    const url = new URL(value);
    return url.protocol === "https:" && url.hostname === "static.exercisedb.dev" && url.pathname.startsWith("/media/");
  } catch {
    return false;
  }
};

const norm = (value: string) => value.toLowerCase().replace(/[^a-z0-9 ]/g, "").trim();

function getCached(key: string): ExerciseGif[] | null {
  const entry = exerciseCache.get(key);
  if (!entry) return null;
  if (entry.expiresAt <= Date.now()) {
    exerciseCache.delete(key);
    return null;
  }
  return entry.exercises;
}

function setCached(key: string, exercises: ExerciseGif[]) {
  if (exerciseCache.size >= MAX_CACHE_ENTRIES) {
    const oldestKey = exerciseCache.keys().next().value;
    if (oldestKey) exerciseCache.delete(oldestKey);
  }
  exerciseCache.set(key, { exercises, expiresAt: Date.now() + CACHE_TTL_MS });
}

const SEARCH_ATTEMPTS = 3;
const sleep = (ms: number) => new Promise((resolve) => setTimeout(resolve, ms));

async function search(query: string): Promise<ExerciseGif[]> {
  const endpoint =
    "https://oss.exercisedb.dev/api/v1/exercises/search?search=" + encodeURIComponent(query);
  let lastError: unknown = new Error("Exercise reference search unavailable.");

  // The free provider throttles bursts (Cloudflare 1102, returned as plain text),
  // so a single failed request must not fail the whole demo lookup.
  for (let attempt = 0; attempt < SEARCH_ATTEMPTS; attempt++) {
    try {
      const response = await fetch(endpoint, {
        headers: { Accept: "application/json" },
        cache: "no-store"
      });
      const body = await response.json() as {
        success?: boolean;
        data?: Array<{ name?: string; gifUrl?: string }>;
      };
      if (!response.ok || body?.success === false) throw new Error("Exercise reference search unavailable.");
      return (Array.isArray(body.data) ? body.data : [])
        .filter((item) => typeof item.name === "string" && typeof item.gifUrl === "string" && allowed(item.gifUrl))
        .slice(0, 12)
        .map((item) => ({ name: item.name!, gifUrl: item.gifUrl! }));
    } catch (error) {
      lastError = error;
      if (attempt < SEARCH_ATTEMPTS - 1) await sleep(350 * (attempt + 1));
    }
  }

  throw lastError;
}

export const GET: APIRoute = async ({ url }) => {
  const query = (url.searchParams.get("search") || "").trim().slice(0, 80);
  if (query.length < 2) return json({ error: "Enter an exercise name." }, 400);

  const key = norm(query);
  const refresh = url.searchParams.get("refresh") === "1";
  if (!refresh) {
    const cached = getCached(key);
    if (cached) return json({ exercises: cached, cached: true }, 200, 3600);
  }

  try {
    const exercises = await search(query);
    if (!exercises.length) return json({ exercises: [], cached: false }, 200, 300);
    setCached(key, exercises);
    return json({ exercises, cached: false }, 200, 3600);
  } catch {
    return json({ error: "Could not load exercise demonstrations." }, 502);
  }
};
