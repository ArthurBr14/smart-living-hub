// @lovable.dev/vite-tanstack-config already includes the following — do NOT add them manually
// or the app will break with duplicate plugins:
//   - TanStack devtools (dev-only, first), tanstackStart, viteReact, tailwindcss, tsConfigPaths,
//     nitro (build-only using cloudflare as a default target), VITE_* env injection, @ path alias,
//     React/TanStack dedupe, error logger plugins, and sandbox detection (port/host/strictPort).
// You can pass additional config via defineConfig({ vite: { ... }, etc... }) if needed.
import { defineConfig } from "@lovable.dev/vite-tanstack-config";

// GitHub Pages build (used only by .github/workflows/deploy-pages.yml):
// the site lives under https://<user>.github.io/<repo>/, so every asset and
// route needs that sub-path, and the page must be pre-rendered to static HTML.
const pagesBase = process.env.GITHUB_PAGES_BASE; // e.g. "/smart-living-hub/"

export default defineConfig({
  vite: {
    ...(pagesBase ? { base: pagesBase } : {}),
    optimizeDeps: {
      // Prepare the showcase dependencies alongside React before the first render.
      // Late discovery otherwise replaces React's optimized module graph while
      // an open preview can still be rendering with the previous dispatcher.
      include: [
        "@radix-ui/react-dialog",
        "@radix-ui/react-slot",
        "class-variance-authority",
        "clsx",
        "lucide-react",
        "tailwind-merge",
      ],
    },
  },
  tanstackStart: {
    // Redirect TanStack Start's bundled server entry to src/server.ts (our SSR error wrapper).
    // nitro/vite builds from this
    server: { entry: "server" },
    ...(pagesBase
      ? {
          router: { basepath: pagesBase.replace(/\/$/, "") },
          pages: [{ path: "/" }],
          prerender: { enabled: true, autoStaticPathsDiscovery: false },
        }
      : {}),
  },
});
