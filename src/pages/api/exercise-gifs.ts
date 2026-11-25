import type { APIRoute } from "astro";
import { Binary, type Document } from "mongodb";
import { isIP } from "node:net";
import { randomUUID } from "node:crypto";
import { authenticateRequest } from "../../lib/server-auth";
export const prerender = false;
const MAX_UPLOAD_BYTES = 4 * 1024 * 1024;
const ALLOWED_TYPES = new Set(["image/gif", "image/png", "image/jpeg", "image/webp"]);
const json = (body: Record<string, unknown>, status = 200) => new Response(JSON.stringify(body), { status, headers: { "Content-Type": "application/json; charset=utf-8", "Cache-Control": "no-store" } });
function authStatus(error: unknown): number {
  const message = error instanceof Error ? error.message : "";
  return /sign in|session expired|account could not be found/i.test(message) ? 401 : 503;
}
function exerciseDetails(value: unknown) {
  const exerciseName = typeof value === "string" ? value.trim().replace(/\s+/g, " ").slice(0, 90) : "";
  if (exerciseName.length < 2) throw new Error("Enter a valid exercise name.");
  const exerciseKey = exerciseName.toLowerCase().replace(/[^a-z0-9 ]/g, "").trim().replace(/\s+/g, " ");
  return { exerciseName, exerciseKey };
}
function safeImageUrl(value: unknown): string {
  if (typeof value !== "string" || value.length > 2048) throw new Error("Paste a valid HTTPS image or GIF URL.");
  let url: URL;
  try { url = new URL(value.trim()); } catch { throw new Error("Paste a valid HTTPS image or GIF URL."); }
  const host = url.hostname.toLowerCase().replace(/^\[|\]$/g, "");
  if (url.protocol !== "https:" || url.username || url.password || !host || host === "localhost" || host.endsWith(".localhost") ||
      host === "local" || host.endsWith(".local") || host === "exercisedb.dev" || host.endsWith(".exercisedb.dev") || isIP(host) !== 0) {
    throw new Error("Use a public HTTPS image or GIF URL. ExerciseDB URLs cannot be saved as custom media.");
  }
  return url.toString();
}
function matchesFileType(bytes: Buffer, mimeType: string): boolean {
  if (mimeType === "image/gif") return bytes.length >= 6 && ["GIF87a", "GIF89a"].includes(bytes.subarray(0, 6).toString("ascii"));
  if (mimeType === "image/png") return bytes.subarray(0, 8).equals(Buffer.from([137, 80, 78, 71, 13, 10, 26, 10]));
  if (mimeType === "image/jpeg") return bytes.length >= 3 && bytes[0] === 0xff && bytes[1] === 0xd8 && bytes[2] === 0xff;
  if (mimeType === "image/webp") return bytes.length >= 12 && bytes.subarray(0, 4).toString("ascii") === "RIFF" && bytes.subarray(8, 12).toString("ascii") === "WEBP";
  return false;
}
async function getCollection(db: Awaited<ReturnType<typeof authenticateRequest>>["db"]) {
  const collection = db.collection("exercise_gifs");
  await collection.createIndex({ userId: 1, exerciseKey: 1 }, { unique: true, name: "user_exercise_gif_unique" });
  await collection.createIndex({ userId: 1, updatedAt: -1 }, { name: "user_exercise_gifs_updated" });
  return collection;
}
function responseGif(record: Document) {
  const id = typeof record.id === "string" ? record.id : "";
  const source = record.source === "upload" ? "upload" : "url";
  return { id, exerciseName: String(record.exerciseName || ""), source, gifUrl: source === "upload" ? "/api/exercise-gifs?id=" + encodeURIComponent(id) : String(record.gifUrl || ""), updatedAt: record.updatedAt instanceof Date ? record.updatedAt.toISOString() : null };
}
export const GET: APIRoute = async ({ request }) => {
  let auth: Awaited<ReturnType<typeof authenticateRequest>>;
  try { auth = await authenticateRequest(request); }
  catch (error) { return json({ error: error instanceof Error ? error.message : "Sign in to view saved demos." }, authStatus(error)); }
  try {
    const collection = await getCollection(auth.db);
    const id = new URL(request.url).searchParams.get("id");
    if (id) {
      if (!/^[0-9a-f-]{36}$/i.test(id)) return json({ error: "Invalid demo identifier." }, 400);
      const record = await collection.findOne({ userId: auth.user.id, id });
      if (!record || record.source !== "upload" || !(record.data instanceof Binary)) return json({ error: "Saved demo not found." }, 404);
      const mimeType = ALLOWED_TYPES.has(String(record.mimeType)) ? String(record.mimeType) : "image/gif";
      const binary = record.data as Binary;
      const bytes = Buffer.from(binary.buffer.subarray(0, binary.position));
      return new Response(new Blob([new Uint8Array(bytes)], { type: mimeType }), { headers: { "Content-Type": mimeType, "Content-Length": String(bytes.length), "Cache-Control": "private, no-store", "X-Content-Type-Options": "nosniff", "Content-Security-Policy": "default-src 'none'; sandbox" } });
    }
    const records = await collection.find({ userId: auth.user.id }, { projection: { _id: 0, id: 1, exerciseName: 1, source: 1, gifUrl: 1, updatedAt: 1 } }).sort({ updatedAt: -1 }).limit(200).toArray();
    return json({ gifs: records.map(responseGif) });
  } catch (error) { return json({ error: error instanceof Error ? error.message : "Could not load saved exercise demos." }, 500); }
};
export const POST: APIRoute = async ({ request }) => {
  const origin = request.headers.get("origin");
  if (origin && origin !== new URL(request.url).origin) return json({ error: "Cross-origin requests are not allowed." }, 403);
  let auth: Awaited<ReturnType<typeof authenticateRequest>>;
  try { auth = await authenticateRequest(request); }
  catch (error) { return json({ error: error instanceof Error ? error.message : "Sign in to save a demo." }, authStatus(error)); }
  try {
    const collection = await getCollection(auth.db);
    let exerciseName = "", exerciseKey = "", source: "url" | "upload";
    let gifUrl: string | undefined, mimeType: string | undefined, data: Buffer | undefined;
    if (request.headers.get("content-type")?.includes("multipart/form-data")) {
      const form = await request.formData();
      ({ exerciseName, exerciseKey } = exerciseDetails(form.get("exerciseName")));
      const file = form.get("file");
      if (!(file instanceof File)) return json({ error: "Choose a GIF or image file to upload." }, 400);
      if (!ALLOWED_TYPES.has(file.type)) return json({ error: "Use a GIF, PNG, JPG or WEBP image." }, 400);
      if (file.size < 1 || file.size > MAX_UPLOAD_BYTES) return json({ error: "Image uploads must be 4 MB or smaller." }, 413);
      data = Buffer.from(await file.arrayBuffer());
      if (!matchesFileType(data, file.type)) return json({ error: "The file content does not match its image type." }, 400);
      source = "upload"; mimeType = file.type;
    } else {
      const body = await request.json() as { exerciseName?: unknown; gifUrl?: unknown };
      ({ exerciseName, exerciseKey } = exerciseDetails(body.exerciseName));
      gifUrl = safeImageUrl(body.gifUrl); source = "url";
    }
    const now = new Date(), id = randomUUID();
    const update: Document = {
      $set: { id, userId: auth.user.id, exerciseName, exerciseKey, source, ...(source === "url" ? { gifUrl, updatedAt: now } : { mimeType, data, updatedAt: now }) },
      $setOnInsert: { createdAt: now },
      ...(source === "url" ? { $unset: { data: "", mimeType: "" } } : { $unset: { gifUrl: "" } })
    };
    await collection.updateOne({ userId: auth.user.id, exerciseKey }, update, { upsert: true });
    const saved = await collection.findOne({ userId: auth.user.id, exerciseKey });
    if (!saved) throw new Error("The demo could not be saved.");
    return json({ gif: responseGif(saved) }, 201);
  } catch (error) {
    const message = error instanceof Error ? error.message : "Could not save this exercise demo.";
    return json({ error: message }, /valid exercise|HTTPS image|public HTTPS|Choose a GIF|Use a GIF|file content/i.test(message) ? 400 : 500);
  }
};
export const DELETE: APIRoute = async ({ request }) => {
  const origin = request.headers.get("origin");
  if (origin && origin !== new URL(request.url).origin) return json({ error: "Cross-origin requests are not allowed." }, 403);
  let auth: Awaited<ReturnType<typeof authenticateRequest>>;
  try { auth = await authenticateRequest(request); }
  catch (error) { return json({ error: error instanceof Error ? error.message : "Sign in to remove a demo." }, authStatus(error)); }
  try {
    const body = await request.json() as { exerciseName?: unknown };
    const { exerciseKey } = exerciseDetails(body.exerciseName);
    const collection = await getCollection(auth.db);
    await collection.deleteOne({ userId: auth.user.id, exerciseKey });
    return json({ success: true });
  } catch (error) { return json({ error: error instanceof Error ? error.message : "Could not remove this demo." }, 400); }
};
