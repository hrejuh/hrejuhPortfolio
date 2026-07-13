import { StrictMode } from "react";
import { createRoot } from "react-dom/client";
import { createRouter, RouterProvider } from "@tanstack/react-router";
import { ConvexProvider, ConvexReactClient } from "convex/react";
import { routeTree } from "./routeTree.gen";
import "@/styles/globals.css";

document.documentElement.dataset.build = "2026-07-14-vault-hotfix";

async function retireStaleAppShell() {
  if (!("serviceWorker" in navigator)) return;
  const controlled = Boolean(navigator.serviceWorker.controller);
  const registrations = await navigator.serviceWorker.getRegistrations();
  await Promise.all(registrations.map((registration) => registration.unregister()));
  if ("caches" in window) {
    const names = await caches.keys();
    await Promise.all(names.filter((name) => name.startsWith("workbox-")).map((name) => caches.delete(name)));
  }
  if (controlled && !sessionStorage.getItem("hrejuh-pwa-retired")) {
    sessionStorage.setItem("hrejuh-pwa-retired", "1");
    location.reload();
  }
}

void retireStaleAppShell();

const convex = new ConvexReactClient(import.meta.env.VITE_CONVEX_URL as string);

const router = createRouter({
  routeTree,
  defaultPreload: "intent",
  defaultPreloadDelay: 100,
});

declare module "@tanstack/react-router" {
  interface Register {
    router: typeof router;
  }
}

const rootEl = document.getElementById("root")!;
createRoot(rootEl).render(
  <StrictMode>
    <ConvexProvider client={convex}>
      <RouterProvider router={router} />
    </ConvexProvider>
  </StrictMode>
);
