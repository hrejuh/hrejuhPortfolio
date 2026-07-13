import { ConvexHttpClient } from "convex/browser";
import { api } from "../../convex/_generated/api";

const COOKIE = "hj_session";
const MAX_AGE = 15 * 24 * 60 * 60;

type Env = { CONVEX_URL?: string; VITE_CONVEX_URL?: string };

export function readCookie(request: Request) {
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
  const body = await request.json() as { op?: string; challengeId?: string; response?: unknown; recoveryHash?: string; recovery?: { userId?: string; recoveryHash?: string; newRecoveryHash?: string }; pairingId?: string; claimToken?: string; code?: string; deviceLabel?: string; requesterPublicKey?: string; vaultEnvelope?: string; approve?: boolean };
  const sessionToken = readCookie(request);
  let result: Record<string, unknown>;
  let session = sessionToken;
  let clear = false;

  switch (body.op) {
    case "register-options":
      result = await client.action(api.authNode.beginRegistration, { origin });
      break;
    case "register-verify":
      result = await client.action(api.authNode.finishRegistration, { origin, challengeId: body.challengeId ?? "", response: body.response, recoveryHash: body.recoveryHash });
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
    case "pair-create":
      if (!sessionToken) throw new Error("Please sign in again.");
      result = await client.action(api.authNode.createPairing, { sessionToken });
      break;
    case "pair-owner-status":
      if (!sessionToken) throw new Error("Please sign in again.");
      result = await client.action(api.authNode.pairingOwnerStatus, { sessionToken, pairingId: body.pairingId ?? "" });
      break;
    case "pair-claim":
      result = await client.action(api.authNode.claimPairing, { code: body.code ?? "", deviceLabel: body.deviceLabel ?? "New device", requesterPublicKey: body.requesterPublicKey ?? "", rateKey: request.headers.get("CF-Connecting-IP") ?? "local" });
      break;
    case "pair-claim-status":
      result = await client.action(api.authNode.pairingClaimStatus, { pairingId: body.pairingId ?? "", claimToken: body.claimToken ?? "" });
      break;
    case "pair-decide":
      if (!sessionToken) throw new Error("Please sign in again.");
      result = await client.action(api.authNode.decidePairing, { sessionToken, pairingId: body.pairingId ?? "", approve: Boolean(body.approve), vaultEnvelope: body.vaultEnvelope });
      break;
    case "pair-register-options":
      result = await client.action(api.authNode.beginPairedRegistration, { origin, pairingId: body.pairingId ?? "", claimToken: body.claimToken ?? "" });
      break;
    case "pair-register-verify":
      result = await client.action(api.authNode.finishPairedRegistration, { origin, challengeId: body.challengeId ?? "", pairingId: body.pairingId ?? "", claimToken: body.claimToken ?? "", response: body.response });
      session = result.sessionToken as string;
      break;
    case "recover":
      result = await client.action(api.authNode.recoverAccount, {
        userId: body.recovery?.userId ?? "",
        recoveryHash: body.recovery?.recoveryHash ?? "",
        newRecoveryHash: body.recovery?.newRecoveryHash ?? "",
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
