import { createHash, randomBytes } from "node:crypto";
import { NextResponse } from "next/server";

import { getGoogleConfig, GOOGLE_SCOPES, googleSetupError } from "@/features/google/server/config";

export const runtime = "nodejs";

function base64Url(value: Buffer): string {
  return value.toString("base64url");
}

export async function GET(request: Request) {
  const setupError = googleSetupError();
  if (setupError) return NextResponse.redirect(new URL(`/google?error=${encodeURIComponent(setupError)}`, request.url));

  const config = getGoogleConfig();
  const state = base64Url(randomBytes(32));
  const verifier = base64Url(randomBytes(48));
  const challenge = createHash("sha256").update(verifier).digest("base64url");
  const authorize = new URL("https://accounts.google.com/o/oauth2/v2/auth");
  authorize.search = new URLSearchParams({
    client_id: config.clientId,
    redirect_uri: config.redirectUri,
    response_type: "code",
    scope: GOOGLE_SCOPES.join(" "),
    access_type: "offline",
    prompt: "consent",
    include_granted_scopes: "true",
    state,
    code_challenge: challenge,
    code_challenge_method: "S256"
  }).toString();
  const response = NextResponse.redirect(authorize);
  response.cookies.set("dailynews_google_oauth", JSON.stringify({ state, verifier }), { httpOnly: true, sameSite: "lax", secure: false, path: "/", maxAge: 600 });
  return response;
}
