import type { APIRoute } from "astro";
import { getMongoDb } from "../../../lib/mongodb";
import { ensureAuthIndexes, hashPassword, issueSession, newUserId } from "../../../lib/auth";

export const prerender = false;

const json = (body: Record<string, unknown>, status = 200, cookie?: string) => new Response(JSON.stringify(body), {
  status, headers: { "Content-Type": "application/json; charset=utf-8", "Cache-Control": "no-store", ...(cookie ? { "Set-Cookie": cookie } : {}) }
});

export const POST: APIRoute = async ({ request }) => {
  let body: { name?: unknown; email?: unknown; password?: unknown };
  try { body = await request.json() as typeof body; }
  catch { return json({ error: "Enter your name, email and password." }, 400); }
  const name = typeof body.name === "string" ? body.name.trim().replace(/\s+/g, " ") : "";
  const email = typeof body.email === "string" ? body.email.trim().toLowerCase() : "";
  const password = typeof body.password === "string" ? body.password : "";
  if (name.length < 2 || name.length > 80) return json({ error: "Your name must be between 2 and 80 characters." }, 400);
  if (email.length > 254 || !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)) return json({ error: "Enter a valid email address." }, 400);
  if (password.length < 8 || password.length > 128) return json({ error: "Your password must be between 8 and 128 characters." }, 400);
  try {
    const db = await getMongoDb();
    await ensureAuthIndexes(db);
    if (await db.collection("users").findOne({ email }, { projection: { _id: 1 } })) {
      return json({ error: "An account with this email already exists. Sign in instead." }, 409);
    }
    const credentials = await hashPassword(password);
    const user = { id: newUserId(), name, email, ...credentials, createdAt: new Date(), updatedAt: new Date() };
    await db.collection("users").insertOne(user);
    const cookie = await issueSession(request, user.id);
    return json({ user: { id: user.id, name, email } }, 201, cookie);
  } catch (error) {
    if (error && typeof error === "object" && "code" in error && (error as { code?: number }).code === 11000) {
      return json({ error: "An account with this email already exists. Sign in instead." }, 409);
    }
    console.error("[auth/signup]", error);
    return json({ error: "We couldn't create your account right now. Please try again." }, 503);
  }
};
