import type { APIRoute } from "astro";
import { clearSessionCookie, revokeSession } from "../../../lib/auth";

export const prerender = false;

export const POST: APIRoute = async ({ request }) => {
  try { await revokeSession(request); }
  catch (error) { console.error("[auth/logout]", error); }
  return new Response(JSON.stringify({ signedOut: true }), {
    status: 200, headers: {
      "Content-Type": "application/json; charset=utf-8", "Cache-Control": "no-store",
      "Set-Cookie": clearSessionCookie(request)
    }
  });
};
