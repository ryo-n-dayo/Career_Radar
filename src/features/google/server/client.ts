import { encryptGoogleToken, decryptGoogleToken } from "./tokenCipher";
import { getGoogleConfig } from "./config";
import { prisma } from "@/lib/prisma";

type TokenResponse = { access_token?: string; refresh_token?: string; expires_in?: number; error?: string; error_description?: string };

export class GoogleConnectionError extends Error {}

async function refreshAccessToken() {
  const connection = await prisma.googleConnection.findUnique({ where: { id: "google" } });
  if (!connection?.refreshTokenCiphertext) throw new GoogleConnectionError("Google連携が未完了、または再接続が必要です");
  const config = getGoogleConfig();
  if (!config.configured) throw new GoogleConnectionError("Google OAuthの設定が未完了です");
  const response = await fetch("https://oauth2.googleapis.com/token", {
    method: "POST",
    headers: { "content-type": "application/x-www-form-urlencoded" },
    body: new URLSearchParams({
      client_id: config.clientId,
      client_secret: config.clientSecret,
      grant_type: "refresh_token",
      refresh_token: decryptGoogleToken(connection.refreshTokenCiphertext)
    }),
    cache: "no-store"
  });
  const data = await response.json().catch(() => ({})) as TokenResponse;
  if (!response.ok || !data.access_token) throw new GoogleConnectionError(data.error_description ?? "Googleトークンを更新できませんでした");
  const expiresAt = new Date(Date.now() + Math.max(60, data.expires_in ?? 3600) * 1000);
  await prisma.googleConnection.update({
    where: { id: "google" },
    data: { accessTokenCiphertext: encryptGoogleToken(data.access_token), tokenExpiresAt: expiresAt, lastError: null }
  });
  return data.access_token;
}

export async function getGoogleAccessToken(forceRefresh = false): Promise<string> {
  const connection = await prisma.googleConnection.findUnique({ where: { id: "google" } });
  if (!connection) throw new GoogleConnectionError("Googleアカウントが未連携です");
  if (!forceRefresh && connection.tokenExpiresAt && connection.tokenExpiresAt.getTime() > Date.now() + 60_000) {
    return decryptGoogleToken(connection.accessTokenCiphertext);
  }
  return refreshAccessToken();
}

export async function googleFetch(url: string, init?: RequestInit): Promise<Response> {
  let token = await getGoogleAccessToken();
  let response = await fetch(url, { ...init, headers: { ...init?.headers, Authorization: `Bearer ${token}` }, cache: "no-store" });
  if (response.status !== 401) return response;
  token = await getGoogleAccessToken(true);
  response = await fetch(url, { ...init, headers: { ...init?.headers, Authorization: `Bearer ${token}` }, cache: "no-store" });
  return response;
}
