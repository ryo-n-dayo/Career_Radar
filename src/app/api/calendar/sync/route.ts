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

    // Get Calendar client
    const calendar = google.calendar({ version: 'v3', auth: oauth2Client });

    // Fetch events from next 30 days
    const now = new Date();
    const in30Days = new Date(now.getTime() + 30 * 24 * 60 * 60 * 1000);

    const response = await calendar.events.list({
      calendarId: 'primary',
      timeMin: now.toISOString(),
      timeMax: in30Days.toISOString(),
      maxResults: 100,
      singleEvents: true,
      orderBy: 'startTime'
    });

    const events = response.data.items || [];
    const eventDetails = [];

    for (const event of events) {
      if (!event.id || !event.summary) continue;

      const startTime = new Date(event.start?.dateTime || event.start?.date || '');
      const endTime = new Date(event.end?.dateTime || event.end?.date || '');

      eventDetails.push({
        googleEventId: event.id,
        title: event.summary,
        description: event.description || null,
        startTime,
        endTime,
        location: event.location || null,
        isAllDay: !event.start?.dateTime
      });

      // Save to database
      await prisma.calendarEvent.upsert({
        where: { googleEventId: event.id },
        update: {
          title: event.summary,
          description: event.description || null,
          startTime,
          endTime,
          location: event.location || null
        },
        create: {
          userId,
          googleEventId: event.id,
          title: event.summary,
          description: event.description || null,
          startTime,
          endTime,
          location: event.location || null,
          isAllDay: !event.start?.dateTime,
          attendees: event.attendees ? JSON.parse(JSON.stringify(event.attendees)) : undefined
        }
      });
    }

    return NextResponse.json({ events: eventDetails });
  } catch (error) {
    console.error('Calendar sync error:', error);
    return NextResponse.json({ error: 'Failed to sync calendar' }, { status: 500 });
  }
}
