import type { APIRoute } from "astro";
import { getMongoDb } from "../../../lib/mongodb";
import { ensureAuthIndexes, issueSession, verifyPassword } from "../../../lib/auth";

export const prerender = false;

const json = (body: Record<string, unknown>, status = 200, cookie?: string) => new Response(JSON.stringify(body), {
  status, headers: { "Content-Type": "application/json; charset=utf-8", "Cache-Control": "no-store", ...(cookie ? { "Set-Cookie": cookie } : {}) }
});

export const POST: APIRoute = async ({ request }) => {
  let body: { email?: unknown; password?: unknown };
  try { body = await request.json() as typeof body; }
  catch { return json({ error: "Enter your email and password." }, 400); }
  const email = typeof body.email === "string" ? body.email.trim().toLowerCase() : "";
  const password = typeof body.password === "string" ? body.password : "";
  if (!email || email.length > 254 || !password || password.length > 128) return json({ error: "Enter a valid email and password." }, 400);
  try {
    const db = await getMongoDb();
    await ensureAuthIndexes(db);
    const user = await db.collection("users").findOne({ email });
    const valid = user && typeof user.passwordSalt === "string" && typeof user.passwordHash === "string"
      ? await verifyPassword(password, user.passwordSalt, user.passwordHash) : false;
    if (!valid || !user) return json({ error: "Email or password is incorrect." }, 401);
    const cookie = await issueSession(request, String(user.id));
    return json({ user: { id: user.id, name: user.name, email: user.email } }, 200, cookie);
  } catch (error) {
    console.error("[auth/login]", error);
    return json({ error: "We couldn't sign you in right now. Please try again." }, 503);
  }
};
