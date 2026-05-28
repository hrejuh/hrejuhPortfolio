import type { Plugin, PreviewServer } from "vite";
import type { Connect } from "vite";
import { resolveYoutubeQuery, summarizeWithLlmAttempts } from "./src/lib/youtube/transcript";

function attachYoutubeRoutes(middlewares: Connect.Server) {
  middlewares.use(async (req, res, next) => {
    const url = new URL(req.url ?? "/", "http://localhost");

    if (url.pathname === "/api/youtube/transcript" && req.method === "GET") {
      const q = url.searchParams.get("q") ?? "";
      res.setHeader("Content-Type", "application/json");
      try {
        const result = await resolveYoutubeQuery(q);
        res.statusCode = 200;
        res.end(JSON.stringify(result));
      } catch (err) {
        res.statusCode = 400;
        res.end(JSON.stringify({ error: err instanceof Error ? err.message : "Failed" }));
      }
      return;
    }

    if (url.pathname === "/api/youtube/summarize" && req.method === "POST") {
      let body = "";
      req.on("data", (chunk) => {
        body += chunk;
      });
      req.on("end", async () => {
        res.setHeader("Content-Type", "application/json");
        try {
              const { text, attempts, apiKeys } = JSON.parse(body) as {
                text?: string;
                attempts?: Array<{ apiKey: string; provider: string; label?: string }>;
                apiKeys?: string[];
              };
              if (!text) throw new Error("text required");
              const list =
                attempts?.length
                  ? attempts
                  : apiKeys?.map((apiKey) => ({ apiKey, provider: "auto" as const }));
              if (!list?.length) throw new Error("attempts or apiKeys required");
              const summary = await summarizeWithLlmAttempts(text, list);
          res.statusCode = 200;
          res.end(JSON.stringify({ summary }));
        } catch (err) {
          res.statusCode = 400;
          res.end(JSON.stringify({ error: err instanceof Error ? err.message : "Failed" }));
        }
      });
      return;
    }

    next();
  });
}

/** Local dev + preview API for YouTube tools (no Convex required). */
export function youtubeToolsApi(): Plugin {
  return {
    name: "youtube-tools-api",
    configureServer(server) {
      attachYoutubeRoutes(server.middlewares);
    },
    configurePreviewServer(server: PreviewServer) {
      attachYoutubeRoutes(server.middlewares);
    },
  };
}
