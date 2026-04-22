import { google } from 'googleapis';

export const getGoogleCallbackUrl = () => {
  return process.env.GOOGLE_CALLBACK_URL || 'http://localhost:3000/api/auth/google/callback';
};

export const getOauth2Client = () => {
  const clientId = process.env.GOOGLE_CLIENT_ID;
  const clientSecret = process.env.GOOGLE_CLIENT_SECRET;
  const callbackUrl = getGoogleCallbackUrl();

  if (!clientId || !clientSecret) {
    throw new Error('Google OAuth client ID and secret must be configured');
  }

  return new google.auth.OAuth2(clientId, clientSecret, callbackUrl);
};
