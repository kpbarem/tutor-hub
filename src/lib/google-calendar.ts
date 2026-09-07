//token exchange/refresh helper file.  Same pattern is used for Daily vid integration
const GOOGLE_TOKEN_URL = "https://oauth2.googleapis.com/token";


export function getGoogleAuthUrl(redirectUri: string) {
  const params = new URLSearchParams({
    client_id: process.env.GOOGLE_CLIENT_ID!,
    redirect_uri: redirectUri,
    response_type: "code",
    scope: "https://www.googleapis.com/auth/calendar.events",
    access_type: "offline",
    prompt: "consent",
  });
  return `https://accounts.google.com/o/oauth2/v2/auth?${params.toString()}`;
}

export async function exchangeGoogleCode(code: string, redirectUri: string) {
  const response = await fetch(GOOGLE_TOKEN_URL, {
    method: "POST",
    headers: { "Content-Type": "application/x-www-form-urlencoded" },
    body: new URLSearchParams({
      code,
      client_id: process.env.GOOGLE_CLIENT_ID!,
      client_secret: process.env.GOOGLE_CLIENT_SECRET!,
      redirect_uri: redirectUri,
      grant_type: "authorization_code",
    }),
  });

  if (!response.ok) {
    console.error("Google token exchange failed:", await response.text());
    return null;
  }
  return response.json() as Promise<{ access_token: string; refresh_token?: string; expires_in: number }>;
}

export async function getGoogleAccessToken(refreshToken: string) {
  const response = await fetch(GOOGLE_TOKEN_URL, {
    method: "POST",
    headers: { "Content-Type": "application/x-www-form-urlencoded" },
    body: new URLSearchParams({
      refresh_token: refreshToken,
      client_id: process.env.GOOGLE_CLIENT_ID!,
      client_secret: process.env.GOOGLE_CLIENT_SECRET!,
      grant_type: "refresh_token",
    }),
  });

  if (!response.ok) {
    console.error("Google access token refresh failed:", await response.text());
    return null;
  }
  const data = await response.json();
  return data.access_token as string;
}

import type { SupabaseClient } from "@supabase/supabase-js";

const CALENDAR_API_BASE = "https://www.googleapis.com/calendar/v3/calendars/primary/events";

async function createGoogleEvent(accessToken: string, event: { summary: string; description?: string; startsAt: Date; endsAt: Date }) {
  const response = await fetch(CALENDAR_API_BASE, {
    method: "POST",
    headers: { Authorization: `Bearer ${accessToken}`, "Content-Type": "application/json" },
    body: JSON.stringify({
      summary: event.summary,
      description: event.description,
      start: { dateTime: event.startsAt.toISOString() },
      end: { dateTime: event.endsAt.toISOString() },
    }),
  });
  if (!response.ok) {
    console.error("Failed to create Google Calendar event:", await response.text());
    return null;
  }
  return response.json() as Promise<{ id: string }>;
}

async function deleteGoogleEvent(accessToken: string, eventId: string) {
  const response = await fetch(`${CALENDAR_API_BASE}/${eventId}`, {
    method: "DELETE",
    headers: { Authorization: `Bearer ${accessToken}` },
  });
  // 410 Gone means it was already deleted on Google's side — treat as success, not an error.
  if (!response.ok && response.status !== 410) {
    console.error("Failed to delete Google Calendar event:", await response.text());
    return false;
  }
  return true;
}

async function getValidAccessTokenForTutor(supabase: SupabaseClient, tutorAccountId: string): Promise<string | null> {
  const { data: tutorAccount } = await supabase
    .from("tutor_accounts")
    .select("google_refresh_token, google_calendar_connected")
    .eq("id", tutorAccountId)
    .single();

  if (!tutorAccount?.google_calendar_connected || !tutorAccount.google_refresh_token) {
    return null; // not connected — nothing to sync, not an error
  }

  const accessToken = await getGoogleAccessToken(tutorAccount.google_refresh_token);
  if (!accessToken) {
    console.error("Could not refresh Google access token for tutor", tutorAccountId);
  }
  return accessToken;
}

export async function pushLessonToGoogle(
  supabase: SupabaseClient,
  tutorAccountId: string,
  lessonId: string,
  summary: string,
  description: string,
  startsAt: Date,
  endsAt: Date
) {
  const accessToken = await getValidAccessTokenForTutor(supabase, tutorAccountId);
  if (!accessToken) return;

  const event = await createGoogleEvent(accessToken, { summary, description, startsAt, endsAt });
  if (event?.id) {
    const { error } = await supabase.from("lessons").update({ google_event_id: event.id }).eq("id", lessonId);
    if (error) console.error("Failed to save google_event_id on lesson:", error.message);
    else console.log("Lesson synced to Google Calendar:", event.id);
  }
}

export async function removeLessonFromGoogle(supabase: SupabaseClient, tutorAccountId: string, googleEventId: string) {
  const accessToken = await getValidAccessTokenForTutor(supabase, tutorAccountId);
  if (!accessToken) return;
  const ok = await deleteGoogleEvent(accessToken, googleEventId);
  if (ok) console.log("Lesson removed from Google Calendar:", googleEventId);
}

export async function pushBlockToGoogle(
  supabase: SupabaseClient,
  tutorAccountId: string,
  blockId: string,
  summary: string,
  startsAt: Date,
  endsAt: Date
) {
  const accessToken = await getValidAccessTokenForTutor(supabase, tutorAccountId);
  if (!accessToken) return;

  const event = await createGoogleEvent(accessToken, { summary, startsAt, endsAt });
  if (event?.id) {
    const { error } = await supabase.from("availability_blocks").update({ google_event_id: event.id }).eq("id", blockId);
    if (error) console.error("Failed to save google_event_id on block:", error.message);
    else console.log("Block synced to Google Calendar:", event.id);
  }
}

export async function removeBlockFromGoogle(supabase: SupabaseClient, tutorAccountId: string, googleEventId: string) {
  const accessToken = await getValidAccessTokenForTutor(supabase, tutorAccountId);
  if (!accessToken) return;
  const ok = await deleteGoogleEvent(accessToken, googleEventId);
  if (ok) console.log("Block removed from Google Calendar:", googleEventId);
}