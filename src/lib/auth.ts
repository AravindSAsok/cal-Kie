import { createHash, randomBytes, randomUUID, scrypt as scryptCallback, timingSafeEqual } from "node:crypto";
import type { Db, Document } from "mongodb";
import { getMongoDb } from "./mongodb";

const SESSION_COOKIE = "calkie_session";
const SESSION_TTL_MS = 30 * 24 * 60 * 60 * 1000;
const PASSWORD_BYTES = 64;

function derivePassword(password: string, salt: string): Promise<Buffer> {
  return new Promise((resolve, reject) => {
    scryptCallback(password, salt, PASSWORD_BYTES, (error, key) => error ? reject(error) : resolve(key as Buffer));
  });
}

export async function hashPassword(password: string) {
  const salt = randomBytes(16).toString("hex");
  const hash = await derivePassword(password, salt);
  return { passwordSalt: salt, passwordHash: hash.toString("hex") };
}

export async function verifyPassword(password: string, salt: string, expectedHash: string): Promise<boolean> {
  if (!salt || !expectedHash || !/^[a-f0-9]{128}$/i.test(expectedHash)) return false;
  const actual = await derivePassword(password, salt);
  const expected = Buffer.from(expectedHash, "hex");
  return actual.length === expected.length && timingSafeEqual(actual, expected);
}

export function sessionTokenHash(token: string): string {
  return createHash("sha256").update(token).digest("hex");
}

export function readSessionToken(request: Request): string | null {
  const cookie = request.headers.get("cookie") || "";
  const item = cookie.split(";").map((part) => part.trim()).find((part) => part.startsWith(SESSION_COOKIE + "="));
  if (!item) return null;
  try { return decodeURIComponent(item.slice(SESSION_COOKIE.length + 1)) || null; } catch { return null; }
}

function sessionCookie(token: string, request: Request): string {
  const secure = new URL(request.url).protocol === "https:" ? "; Secure" : "";
  return SESSION_COOKIE + "=" + encodeURIComponent(token) + "; Path=/; HttpOnly; SameSite=Lax; Max-Age=" + Math.floor(SESSION_TTL_MS / 1000) + secure;
}

export function clearSessionCookie(request: Request): string {
  const secure = new URL(request.url).protocol === "https:" ? "; Secure" : "";
  return SESSION_COOKIE + "=; Path=/; HttpOnly; SameSite=Lax; Max-Age=0; Expires=Thu, 01 Jan 1970 00:00:00 GMT" + secure;
}

export async function issueSession(request: Request, userId: string): Promise<string> {
  const db = await getMongoDb();
  const token = randomBytes(32).toString("base64url");
  const now = new Date();
  const expiresAt = new Date(now.getTime() + SESSION_TTL_MS);
  const sessions = db.collection("auth_sessions");
  await Promise.all([
    sessions.createIndex({ tokenHash: 1 }, { unique: true, name: "auth_session_token_unique" }),
    sessions.createIndex({ expiresAt: 1 }, { expireAfterSeconds: 0, name: "auth_session_expiry" }),
    sessions.createIndex({ userId: 1 }, { name: "auth_sessions_by_user" })
  ]);
  await sessions.insertOne({ tokenHash: sessionTokenHash(token), userId, createdAt: now, expiresAt });
  return sessionCookie(token, request);
}

export async function revokeSession(request: Request): Promise<void> {
  const token = readSessionToken(request);
  if (!token) return;
  const db = await getMongoDb();
  await db.collection("auth_sessions").deleteOne({ tokenHash: sessionTokenHash(token) });
}

export async function ensureAuthIndexes(db: Db): Promise<void> {
  await Promise.all([
    db.collection("users").createIndex({ email: 1 }, { unique: true, name: "user_email_unique" }),
    db.collection("auth_sessions").createIndex({ tokenHash: 1 }, { unique: true, name: "auth_session_token_unique" }),
    db.collection("auth_sessions").createIndex({ expiresAt: 1 }, { expireAfterSeconds: 0, name: "auth_session_expiry" }),
    db.collection("auth_sessions").createIndex({ userId: 1 }, { name: "auth_sessions_by_user" })
  ]);
}

export async function authenticateRequest(request: Request) {
  const token = readSessionToken(request);
  if (!token) throw new Error("Sign in to continue.");
  const db = await getMongoDb();
  await ensureAuthIndexes(db);
  const now = new Date();
  const session = await db.collection("auth_sessions").findOne({
    tokenHash: sessionTokenHash(token),
    expiresAt: { $gt: now }
  });
  if (!session || typeof session.userId !== "string") throw new Error("Your session expired. Please sign in again.");
  const user = await db.collection("users").findOne(
    { id: session.userId },
    { projection: { _id: 0, id: 1, name: 1, email: 1, createdAt: 1 } }
  ) as (Document & { id: string; name: string; email: string }) | null;
  if (!user) {
    await db.collection("auth_sessions").deleteOne({ _id: session._id });
    throw new Error("Your account could not be found. Please sign in again.");
  }
  return { user, db };
}

export function newUserId(): string {
  return randomUUID();
}
