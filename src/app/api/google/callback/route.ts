import { timingSafeEqual } from "node:crypto";
import { NextRequest, NextResponse } from "next/server";

import { getGoogleConfig, GOOGLE_SCOPES } from "@/features/google/server/config";
import { syncGoogleWorkspace } from "@/features/google/server/sync";
import { encryptGoogleToken } from "@/features/google/server/tokenCipher";
import { prisma } from "@/lib/prisma";

export const runtime = "nodejs";

type TokenResponse = { access_token?: string; refresh_token?: string; expires_in?: number; scope?: string; error?: string; error_description?: string };

function redirect(request: NextRequest, key: "connected" | "error", value: string) {
  const url = new URL("/google", request.url);
  url.searchParams.set(key, value);
  const response = NextResponse.redirect(url);
  response.cookies.delete("dailynews_google_oauth");
  return response;
}

function sameState(actual: string, expected: string): boolean {
  const a = Buffer.from(actual);
  const b = Buffer.from(expected);
  return a.length === b.length && timingSafeEqual(a, b);
}

export async function GET(request: NextRequest) {
  const failure = request.nextUrl.searchParams.get("error");
  if (failure) return redirect(request, "error", "Googleの連携がキャンセルされました。");
  const code = request.nextUrl.searchParams.get("code");
  const state = request.nextUrl.searchParams.get("state");
  const cookie = request.cookies.get("dailynews_google_oauth")?.value;
  let expected: { state?: string; verifier?: string } = {};
  try { expected = cookie ? JSON.parse(cookie) as { state?: string; verifier?: string } : {}; } catch { /* state validation below */ }
  if (!code || !state || !expected.state || !expected.verifier || !sameState(state, expected.state)) return redirect(request, "error", "Google連携の安全確認に失敗しました。もう一度お試しください。");

  const config = getGoogleConfig();
  if (!config.configured) return redirect(request, "error", "Google OAuthの設定が未完了です。");
  const tokenResponse = await fetch("https://oauth2.googleapis.com/token", {
    method: "POST",
    headers: { "content-type": "application/x-www-form-urlencoded" },
    body: new URLSearchParams({ code, client_id: config.clientId, client_secret: config.clientSecret, redirect_uri: config.redirectUri, grant_type: "authorization_code", code_verifier: expected.verifier }),
    cache: "no-store"
  });
  const tokens = await tokenResponse.json().catch(() => ({})) as TokenResponse;
  if (!tokenResponse.ok || !tokens.access_token) return redirect(request, "error", tokens.error_description ?? "Googleトークンを受け取れませんでした。");

  const profile = await fetch("https://gmail.googleapis.com/gmail/v1/users/me/profile", { headers: { Authorization: `Bearer ${tokens.access_token}` }, cache: "no-store" })
    .then((response) => response.ok ? response.json() as Promise<{ emailAddress?: string }> : null)
    .catch(() => null);
  const previous = await prisma.googleConnection.findUnique({ where: { id: "google" } });
  const expiresAt = new Date(Date.now() + Math.max(60, tokens.expires_in ?? 3600) * 1000);
  await prisma.googleConnection.upsert({
    where: { id: "google" },
    update: {
      email: profile?.emailAddress ?? previous?.email ?? null,
      accessTokenCiphertext: encryptGoogleToken(tokens.access_token),
      refreshTokenCiphertext: tokens.refresh_token ? encryptGoogleToken(tokens.refresh_token) : previous?.refreshTokenCiphertext ?? null,
      tokenExpiresAt: expiresAt,
      scopes: tokens.scope?.split(" ").filter(Boolean) ?? [...GOOGLE_SCOPES],
      lastError: null
    },
    create: {
      id: "google",
      email: profile?.emailAddress ?? null,
      accessTokenCiphertext: encryptGoogleToken(tokens.access_token),
      refreshTokenCiphertext: tokens.refresh_token ? encryptGoogleToken(tokens.refresh_token) : null,
      tokenExpiresAt: expiresAt,
      scopes: tokens.scope?.split(" ").filter(Boolean) ?? [...GOOGLE_SCOPES]
    }
  });
  try {
    // ログイン直後に一度だけ同期し、利用者に追加の「同期」操作を求めない。
    await syncGoogleWorkspace();
  } catch {
    return redirect(request, "error", "Googleアカウントの接続は完了しましたが、初回同期に失敗しました。Google連携画面から再試行できます。");
  }
  return redirect(request, "connected", "1");
}
