import { ConvexHttpClient } from "convex/browser";
import { api } from "../../convex/_generated/api";

const COOKIE = "hj_session";
const MAX_AGE = 15 * 24 * 60 * 60;

type Env = { CONVEX_URL?: string; VITE_CONVEX_URL?: string };

function readCookie(request: Request) {
  const match = request.headers.get("cookie")?.match(new RegExp(`(?:^|; )${COOKIE}=([^;]+)`));
  return match?.[1] ?? "";
}

function cookie(value: string, request: Request, clear = false) {
  const secure = new URL(request.url).protocol === "https:" ? "; Secure" : "";
  return `${COOKIE}=${value}; Path=/; HttpOnly; SameSite=Strict${secure}; Max-Age=${clear ? 0 : MAX_AGE}`;
}

export async function handleAuthRequest(request: Request, env: Env) {
  const requestOrigin = request.headers.get("origin");
  const origin = new URL(request.url).origin;
  if (request.method !== "POST" || requestOrigin !== origin) {
    return Response.json({ error: "Invalid request." }, { status: 403 });
  }

  const convexUrl = env.CONVEX_URL ?? env.VITE_CONVEX_URL;
  if (!convexUrl) return Response.json({ error: "Authentication is not configured." }, { status: 503 });
  const client = new ConvexHttpClient(convexUrl);
  const body = await request.json() as { op?: string; challengeId?: string; response?: unknown; recovery?: { userId?: string; recoveryKey?: string } };
  const sessionToken = readCookie(request);
  let result: Record<string, unknown>;
  let session = sessionToken;
  let clear = false;

  switch (body.op) {
    case "register-options":
      result = await client.action(api.authNode.beginRegistration, { origin });
      break;
    case "register-verify":
      result = await client.action(api.authNode.finishRegistration, { origin, challengeId: body.challengeId ?? "", response: body.response });
      session = result.sessionToken as string;
      break;
    case "login-options":
      result = await client.action(api.authNode.beginLogin, { origin });
      break;
    case "login-verify":
      result = await client.action(api.authNode.finishLogin, { origin, challengeId: body.challengeId ?? "", response: body.response });
      session = result.sessionToken as string;
      break;
    case "session":
      if (!sessionToken) throw new Error("Please sign in again.");
      result = await client.action(api.authNode.session, { sessionToken });
      break;
    case "device-options":
      if (!sessionToken) throw new Error("Please sign in again.");
      result = await client.action(api.authNode.beginRegistration, { origin, sessionToken });
      break;
    case "device-verify":
      if (!sessionToken) throw new Error("Please sign in again.");
      result = await client.action(api.authNode.finishRegistration, { origin, challengeId: body.challengeId ?? "", response: body.response, sessionToken });
      break;
    case "recover":
      result = await client.action(api.authNode.recoverAccount, {
        userId: body.recovery?.userId ?? "",
        recoveryKey: body.recovery?.recoveryKey ?? "",
      });
      session = result.sessionToken as string;
      break;
    case "logout":
      if (sessionToken) await client.action(api.authNode.logout, { sessionToken });
      result = { ok: true };
      session = "";
      clear = true;
      break;
    default:
      return Response.json({ error: "Unknown operation." }, { status: 400 });
  }

  delete result.sessionToken;
  const headers = new Headers({ "Cache-Control": "no-store" });
  if (session || clear) headers.set("Set-Cookie", cookie(session, request, clear));
  return Response.json(result, { headers });
}

export async function onRequestPost(context: { request: Request; env: Env }) {
  try {
    return await handleAuthRequest(context.request, context.env);
  } catch (error) {
    return Response.json({ error: error instanceof Error ? error.message : "Authentication failed." }, { status: 400, headers: { "Cache-Control": "no-store" } });
  }
}
