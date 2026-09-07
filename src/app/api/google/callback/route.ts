import { NextRequest, NextResponse } from "next/server";
import { createClient } from "@/lib/supabase/server";
import { getTutorAccountId } from "@/lib/get-tutor-account";
import { exchangeGoogleCode } from "@/lib/google-calendar";

export async function GET(request: NextRequest) {
  const { searchParams, origin } = new URL(request.url);
  const code = searchParams.get("code");

  if (!code) {
    console.error("Google callback hit with no code — likely user denied access");
    return NextResponse.redirect(`${origin}/dashboard/settings?google=denied`);
  }

  const supabase = await createClient();
  const tutorAccountId = await getTutorAccountId(supabase);
  if (!tutorAccountId) {
    return NextResponse.redirect(`${origin}/login`);
  }

  const redirectUri = `${origin}/api/google/callback`;
  const tokens = await exchangeGoogleCode(code, redirectUri);

  if (!tokens?.refresh_token) {
    console.error("No refresh_token returned from Google — connection failed");
    return NextResponse.redirect(`${origin}/dashboard/settings?google=error`);
  }

  const { error } = await supabase
    .from("tutor_accounts")
    .update({ google_refresh_token: tokens.refresh_token, google_calendar_connected: true })
    .eq("id", tutorAccountId);

  if (error) {
    console.error("Failed to save Google refresh token:", error.message);
    return NextResponse.redirect(`${origin}/dashboard/settings?google=error`);
  }

  console.log("Google Calendar successfully connected for tutor account", tutorAccountId);
  return NextResponse.redirect(`${origin}/dashboard/settings?google=success`);
}