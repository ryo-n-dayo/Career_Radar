export const GOOGLE_SCOPES = [
  "openid",
  "email",
  "profile",
  "https://www.googleapis.com/auth/gmail.readonly",
  "https://www.googleapis.com/auth/calendar.readonly"
] as const;

export type GoogleConfig = {
  clientId: string;
  clientSecret: string;
  redirectUri: string;
  configured: boolean;
};

export function getGoogleConfig(): GoogleConfig {
  const clientId = process.env.GOOGLE_CLIENT_ID?.trim() ?? "";
  const clientSecret = process.env.GOOGLE_CLIENT_SECRET?.trim() ?? "";
  const redirectUri = process.env.GOOGLE_OAUTH_REDIRECT_URI?.trim() || "http://localhost:3000/api/google/callback";
  const hasEncryptionKey = Boolean(process.env.GOOGLE_TOKEN_ENCRYPTION_KEY?.trim());
  return { clientId, clientSecret, redirectUri, configured: Boolean(clientId && clientSecret && hasEncryptionKey) };
}

export function googleSetupError(): string | null {
  const config = getGoogleConfig();
  if (config.configured) return null;
  return "GOOGLE_CLIENT_ID、GOOGLE_CLIENT_SECRET、GOOGLE_TOKEN_ENCRYPTION_KEYを .env.local に設定してください。";
}
