import { defineConfig } from "vite";
import react from "@vitejs/plugin-react";
import tailwindcss from "@tailwindcss/vite";
import { TanStackRouterVite } from "@tanstack/router-plugin/vite";
import { VitePWA } from "vite-plugin-pwa";
import path from "path";
import { youtubeToolsApi } from "./vite-youtube-api";
import { authApi } from "./vite-auth-api";

export default defineConfig({
  plugins: [
    TanStackRouterVite({
      routesDirectory: "./src/routes",
      generatedRouteTree: "./src/routeTree.gen.ts",
    }),
    react(),
    tailwindcss(),
    youtubeToolsApi(),
    authApi(),
    VitePWA({
      registerType: "autoUpdate",
      workbox: {
        cleanupOutdatedCaches: true,
        navigateFallback: "/index.html",
        navigateFallbackDenylist: [/^\/api\//],
      },
      includeAssets: [
        "favicon.svg",
        "favicon-192.png",
        "favicon-512.png",
        "apple-touch-icon.png",
      ],
      manifest: {
        name: "Abdul Ahad | hrejuh",
        short_name: "hrejuh",
        description:
          "Abdul Ahad — Founder & Managing Director of DosRicke Ventures. Portfolio and free tools.",
        start_url: "/",
        scope: "/",
        id: "/",
        display: "standalone",
        orientation: "portrait-primary",
        background_color: "#1A1814",
        theme_color: "#92400E",
        categories: ["portfolio", "business", "utilities"],
        icons: [
          {
            src: "/favicon-192.png",
            sizes: "192x192",
            type: "image/png",
            purpose: "any",
          },
          {
            src: "/favicon-512.png",
            sizes: "512x512",
            type: "image/png",
            purpose: "any",
          },
          {
            src: "/favicon-512.png",
            sizes: "512x512",
            type: "image/png",
            purpose: "maskable",
          },
        ],
        shortcuts: [
          {
            name: "Tools",
            short_name: "Tools",
            url: "/tools",
            icons: [{ src: "/favicon-192.png", sizes: "192x192" }],
          },
          {
            name: "YouTube Transcript",
            short_name: "Transcript",
            url: "/tools/youtube",
            icons: [{ src: "/favicon-192.png", sizes: "192x192" }],
          },
          {
            name: "Finance Calculator",
            short_name: "Finance",
            url: "/tools/finance",
            icons: [{ src: "/favicon-192.png", sizes: "192x192" }],
          },
        ],
      },
    }),
  ],
  resolve: {
    alias: {
      "@": path.resolve(__dirname, "./src"),
    },
  },
  build: {
    rollupOptions: {
      output: {
        manualChunks: {
          "react-vendor": ["react", "react-dom"],
          router: ["@tanstack/react-router"],
          motion: ["framer-motion"],
          convex: ["convex"],
        },
      },
    },
  },
});
