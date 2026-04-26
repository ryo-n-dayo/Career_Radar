import { NextRequest, NextResponse } from 'next/server';
import { google } from 'googleapis';
import { prisma } from '@/lib/prisma';
import { getOauth2Client } from '@/lib/google';

// Google Calendar color IDs by category
const CATEGORY_COLOR_MAP: Record<string, string> = {
  "インターン": "9",   // Blueberry
  "早期選考":   "6",   // Tangerine
  "セミナー":   "2",   // Sage
  "本選考":     "11",  // Tomato
  "説明会":     "3",   // Grape
};

export async function POST(request: NextRequest) {
  const { userId, title, description, date, category } = await request.json();

  if (!userId || !title || !date) {
    return NextResponse.json({ error: 'userId, title, date required' }, { status: 400 });
  }

  const user = await prisma.user.findUnique({ where: { id: userId } });

  if (!user?.googleAccessToken) {
    return NextResponse.json({ error: 'Google未連携', needsAuth: true }, { status: 401 });
  }

  try {
    const oauth2Client = getOauth2Client();
    oauth2Client.setCredentials({
      access_token: user.googleAccessToken,
      refresh_token: user.googleRefreshToken,
      expiry_date: user.googleTokenExpiry?.getTime(),
    });

    const calendar = google.calendar({ version: 'v3', auth: oauth2Client });

    // Google の終日イベントは end.date を翌日にする必要がある
    const endDate = new Date(date);
    endDate.setDate(endDate.getDate() + 1);
    const endDateStr = endDate.toISOString().split('T')[0];

    const event = await calendar.events.insert({
      calendarId: 'primary',
      requestBody: {
        summary: title,
        description: description || undefined,
        start: { date },
        end: { date: endDateStr },
        colorId: CATEGORY_COLOR_MAP[category] ?? '1',
      },
    });

    return NextResponse.json({
      eventId: event.data.id,
      htmlLink: event.data.htmlLink,
    });
  } catch (error) {
    console.error('Calendar add-event error:', error);
    return NextResponse.json({ error: 'Failed to add event' }, { status: 500 });
  }
}
