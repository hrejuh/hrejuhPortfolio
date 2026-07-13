import { ConvexHttpClient } from "convex/browser";
import { api } from "../../convex/_generated/api";
import { readCookie } from "./auth";

async function userId(request: Request, env: Env) {
  const token = readCookie(request);
  if (!token) throw new Error("Please sign in again.");
  return (await new ConvexHttpClient(env.CONVEX_URL).action(api.authNode.session, { sessionToken: token })).userId;
}

export const onRequest: PagesFunction<Env> = async ({ request, env }) => {
  try {
    const origin = new URL(request.url).origin;
    if (request.method !== "GET" && request.headers.get("origin") !== origin) return new Response("Invalid request.", { status: 403 });
    const id = new URL(request.url).searchParams.get("id") ?? "";
    if (!/^[A-Za-z0-9_-]{1,100}$/.test(id)) return new Response("Invalid object.", { status: 400 });
    const key = `${await userId(request, env)}/${id}`;

    if (request.method === "GET") {
      const object = await env.VAULT.get(key);
      if (!object) return new Response(null, { status: 404 });
      return new Response(object.body, { headers: { "Cache-Control": "no-store", "Content-Type": "application/octet-stream", ETag: object.httpEtag } });
    }
    if (request.method === "PUT") {
      const size = Number(request.headers.get("content-length") ?? 0);
      if (!request.body || size > 100 * 1024 * 1024) return new Response("File is too large.", { status: 413 });
      const object = await env.VAULT.put(key, request.body);
      return Response.json({ etag: object.httpEtag }, { headers: { "Cache-Control": "no-store" } });
    }
    if (request.method === "DELETE") {
      await env.VAULT.delete(key);
      return new Response(null, { status: 204 });
    }
    return new Response("Method not allowed.", { status: 405 });
  } catch (error) {
    return Response.json({ error: error instanceof Error ? error.message : "Vault request failed." }, { status: 401, headers: { "Cache-Control": "no-store" } });
  }
};
