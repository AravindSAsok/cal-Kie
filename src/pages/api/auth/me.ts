import type { APIRoute } from "astro";
import { readSessionToken } from "../../../lib/auth";
import { authenticateRequest } from "../../../lib/server-auth";

export const prerender = false;

const json = (body: Record<string, unknown>, status = 200) => new Response(JSON.stringify(body), {
  status, headers: { "Content-Type": "application/json; charset=utf-8", "Cache-Control": "no-store" }
});

export const GET: APIRoute = async ({ request }) => {
  if (!readSessionToken(request)) return json({ user: null });
  try {
    const { user } = await authenticateRequest(request);
    return json({ user });
  } catch (error) {
    const message = error instanceof Error ? error.message : "Could not verify your account session.";
    if (/session expired|sign in to continue|account could not be found/i.test(message)) return json({ user: null });
    console.error("[auth/me]", error);
    return json({ error: "Account service is temporarily unavailable. Please try again." }, 503);
  }
};
