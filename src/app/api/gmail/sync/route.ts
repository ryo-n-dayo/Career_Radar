import { NextRequest, NextResponse } from 'next/server';
import { google } from 'googleapis';
import { prisma } from '@/lib/prisma';
import { getOauth2Client } from '@/lib/google';

export async function GET(request: NextRequest) {
  const searchParams = request.nextUrl.searchParams;
  const userId = searchParams.get('userId');

  if (!userId) {
    return NextResponse.json({ error: 'userId required' }, { status: 400 });
  }

  try {
    // Get user's Google tokens
    const user = await prisma.user.findUnique({
      where: { id: userId }
    });

    if (!user || !user.googleAccessToken) {
      return NextResponse.json({ error: 'Not authenticated with Google' }, { status: 401 });
    }

    // Set credentials
    const oauth2Client = getOauth2Client();
    oauth2Client.setCredentials({
      access_token: user.googleAccessToken,
      refresh_token: user.googleRefreshToken,
      expiry_date: user.googleTokenExpiry?.getTime()
    });

    // Get Gmail client
    const gmail = google.gmail({ version: 'v1', auth: oauth2Client });

    // Fetch recent emails
    const response = await gmail.users.messages.list({
      userId: 'me',
      maxResults: 10,
      q: 'is:unread'
    });

    const messages = response.data.messages || [];
    const emailDetails = [];

    // Get full message details
    for (const message of messages) {
      if (!message.id) continue;
      
      const fullMessage = await gmail.users.messages.get({
        userId: 'me',
        id: message.id,
        format: 'full'
      });

      const headers = fullMessage.data.payload?.headers as Array<{ name?: string; value?: string }> || [];
      const from = headers.find(h => h.name === 'From')?.value || '';
      const to = headers.find(h => h.name === 'To')?.value || '';
      const subject = headers.find(h => h.name === 'Subject')?.value || '(no subject)';
      const snippet = fullMessage.data.snippet || '';
      const timestamp = new Date(parseInt(fullMessage.data.internalDate || '0'));

      emailDetails.push({
        gmailId: message.id,
        from,
        to,
        subject,
        snippet,
        timestamp
      });

      // Save to database
      await prisma.email.upsert({
        where: { gmailId: message.id },
        update: {},
        create: {
          userId,
          gmailId: message.id,
          from,
          to,
          subject,
          body: snippet,
          snippet,
          timestamp,

          isRead: false,
          isStarred: false
        }
      });
    }

    return NextResponse.json({ emails: emailDetails });
  } catch (error) {
    console.error('Gmail sync error:', error);
    return NextResponse.json({ error: 'Failed to sync emails' }, { status: 500 });
  }
}
