import type { Connect, Plugin, PreviewServer } from "vite";
import { handleAuthRequest } from "./functions/api/auth";

function attachAuthRoute(middlewares: Connect.Server, convexUrl: () => string | undefined) {
  middlewares.use("/api/auth", (req, res, next) => {
    if (req.method !== "POST") return next();
    let body = "";
    req.on("data", (chunk) => { body += chunk; });
    req.on("end", async () => {
      try {
        const host = req.headers.host ?? "localhost:5173";
        const origin = `http://${host}`;
        const response = await handleAuthRequest(new Request(`${origin}/api/auth`, {
          method: "POST",
          headers: { "content-type": req.headers["content-type"] ?? "application/json", cookie: req.headers.cookie ?? "", origin: req.headers.origin ?? origin },
          body,
        }), { VITE_CONVEX_URL: convexUrl() });
        res.statusCode = response.status;
        response.headers.forEach((value, key) => res.setHeader(key, value));
        res.end(await response.text());
      } catch (error) {
        res.statusCode = 400;
        res.setHeader("Content-Type", "application/json");
        res.setHeader("Cache-Control", "no-store");
        res.end(JSON.stringify({ error: error instanceof Error ? error.message : "Authentication failed." }));
      }
    });
  });
}

export function authApi(): Plugin {
  return {
    name: "auth-api",
    configureServer(server) { attachAuthRoute(server.middlewares, () => server.config.env.VITE_CONVEX_URL); },
    configurePreviewServer(server: PreviewServer) { attachAuthRoute(server.middlewares, () => server.config.env.VITE_CONVEX_URL); },
  };
}
