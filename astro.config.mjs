import { defineConfig } from "astro/config";
import vercel from "@astrojs/vercel";
import node from "@astrojs/node";

// Keep Vercel as the default production adapter. Render opts into the
// standalone Node adapter with CALKIE_HOST=render at build time.
const adapter = process.env.CALKIE_HOST === "render"
  ? node({ mode: "standalone" })
  : vercel();

export default defineConfig({
  output: "server",
  adapter,
  server: {
    host: true
  }
});
