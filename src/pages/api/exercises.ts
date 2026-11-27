import type { APIRoute } from "astro";

export const prerender = false;

type ExerciseGif = { name: string; gifUrl: string; source: string; sourceUrl?: string };
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

const allowedExerciseDb = (value: string) => {
  try {
    const url = new URL(value);
    return url.protocol === "https:" && url.hostname === "static.exercisedb.dev" && url.pathname.startsWith("/media/");
  } catch {
    return false;
  }
};

const allowedGif = (value: string) => {
  try {
    const url = new URL(value);
    return url.protocol === "https:" && url.port === "" &&
      !["localhost", "127.0.0.1", "::1"].includes(url.hostname) &&
      (/\.gif$/i.test(url.pathname) || /[?&](?:format|fm)=gif(?:&|$)/i.test(url.search));
  } catch {
    return false;
  }
};

const norm = (value: string) => value.toLowerCase().replace(/[^a-z0-9 ]/g, " ").replace(/\s+/g, " ").trim();
const tokens = (value: string) => norm(value).split(" ").filter(Boolean)
  .map(word => word.length > 2 && word.endsWith("s") && !word.endsWith("ss") ? word.slice(0, -1) : word);

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

function shuffle<T>(items: T[]): T[] {
  const result = [...items];
  for (let i = result.length - 1; i > 0; i--) {
    const j = Math.floor(Math.random() * (i + 1));
    [result[i], result[j]] = [result[j], result[i]];
  }
  return result;
}

/** Firecrawl image search is preferred. Only direct HTTPS GIF assets with exercise-matching titles are returned. */
async function searchFirecrawl(query: string): Promise<ExerciseGif[]> {
  const response = await fetch("https://api.firecrawl.dev/v2/search", {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
      ...(process.env.FIRECRAWL_API_KEY ? { Authorization: `Bearer ${process.env.FIRECRAWL_API_KEY}` } : {})
    },
    body: JSON.stringify({
      query: `${query} exercise demonstration animated GIF filetype:gif`,
      sources: ["images"],
      limit: 12,
      safe: true
    }),
    signal: AbortSignal.timeout(12000),
    cache: "no-store"
  });
  if (!response.ok) throw new Error(`Firecrawl image search returned ${response.status}.`);
  const body = await response.json() as {
    success?: boolean;
    data?: { images?: Array<{ title?: string; imageUrl?: string; url?: string }> };
  };
  if (body.success === false) throw new Error("Firecrawl image search failed.");

  const wanted = tokens(query);
  const seen = new Set<string>();
  const matches = (body.data?.images || []).flatMap((item): ExerciseGif[] => {
    const name = (item.title || "").trim();
    const gifUrl = (item.imageUrl || "").trim();
    if (!name || !allowedGif(gifUrl) || seen.has(gifUrl)) return [];
    const available = new Set(tokens(name));
    // No fuzzy substitution: every requested movement/equipment term must appear in the result title.
    if (!wanted.length || !wanted.every(token => available.has(token))) return [];
    seen.add(gifUrl);
    return [{ name, gifUrl, source: "Firecrawl image search", ...(item.url ? { sourceUrl: item.url } : {}) }];
  });
  return shuffle(matches).slice(0, 8);
}

const SEARCH_ATTEMPTS = 3;
const sleep = (ms: number) => new Promise((resolve) => setTimeout(resolve, ms));

async function searchExerciseDb(query: string): Promise<ExerciseGif[]> {
  const endpoint = "https://oss.exercisedb.dev/api/v1/exercises/search?search=" + encodeURIComponent(query);
  let lastError: unknown = new Error("Exercise reference search unavailable.");

  for (let attempt = 0; attempt < SEARCH_ATTEMPTS; attempt++) {
    try {
      const response = await fetch(endpoint, {
        headers: { Accept: "application/json" },
        cache: "no-store",
        signal: AbortSignal.timeout(10000)
      });
      const body = await response.json() as {
        success?: boolean;
        data?: Array<{ name?: string; gifUrl?: string }>;
      };
      if (!response.ok || body?.success === false) throw new Error("Exercise reference search unavailable.");
      return (Array.isArray(body.data) ? body.data : [])
        .filter((item) => typeof item.name === "string" && typeof item.gifUrl === "string" && allowedExerciseDb(item.gifUrl))
        .slice(0, 12)
        .map((item) => ({ name: item.name!, gifUrl: item.gifUrl!, source: "ExerciseDB by AscendAPI" }));
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
    let exercises: ExerciseGif[] = [];
    let provider: "firecrawl" | "exercisedb" = "firecrawl";
    try {
      exercises = await searchFirecrawl(query);
    } catch {
      // Provider outages and rate limits must not prevent the existing ExerciseDB fallback.
    }
    if (!exercises.length) {
      provider = "exercisedb";
      exercises = await searchExerciseDb(query);
    }
    if (!exercises.length) return json({ exercises: [], cached: false, provider }, 200, 300);
    setCached(key, exercises);
    return json({ exercises, cached: false, provider }, 200, 3600);
  } catch {
    return json({ error: "Could not load exercise demonstrations from Firecrawl or ExerciseDB." }, 502);
  }
};
