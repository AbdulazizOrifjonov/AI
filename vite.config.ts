// @lovable.dev/vite-tanstack-config already includes the following — do NOT add them manually
// or the app will break with duplicate plugins:
//   - tanstackStart, viteReact, tailwindcss, tsConfigPaths, nitro (build-only using cloudflare as a default target),
//     componentTagger (dev-only), VITE_* env injection, @ path alias, React/TanStack dedupe,
//     error logger plugins, and sandbox detection (port/host/strictPort).
// You can pass additional config via defineConfig({ vite: { ... }, etc... }) if needed.
import { defineConfig } from "@lovable.dev/vite-tanstack-config";

export default defineConfig({
  tanstackStart: {
    // Redirect TanStack Start's bundled server entry to src/server.ts (our SSR error wrapper).
    // nitro/vite builds from this
    server: { entry: "server" },
  },
  // Without this, nitro's deploy plugin is skipped outside the Lovable sandbox,
  // so `vite build` on Vercel produces a plain dist/ that Vercel can't serve
  // (every route 404s). The "vercel" preset makes nitro emit a proper
  // .vercel/output (Build Output API v3) that Vercel runs natively.
  nitro: {
    preset: "vercel",
  },
});
