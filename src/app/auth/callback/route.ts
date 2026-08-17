import { NextRequest, NextResponse } from "next/server";
import { createClient } from "@/lib/supabase/server";

export async function GET(request: NextRequest) {
  const { searchParams, origin } = new URL(request.url);
  const code = searchParams.get("code");
  const studentId = searchParams.get("student_id");

  if (!code) {
    return NextResponse.redirect(`${origin}/login`);
  }

  const supabase = await createClient();
  const { data, error } = await supabase.auth.exchangeCodeForSession(code);

  if (error || !data.user) {
    return NextResponse.redirect(`${origin}/login`);
  }

  const userId = data.user.id;

  // Ensure a profile exists for this student login
  const { data: existingProfile } = await supabase
    .from("profiles")
    .select("id")
    .eq("id", userId)
    .single();

  if (!existingProfile) {
    await supabase.from("profiles").insert({
      id: userId,
      role: "student",
      display_name: data.user.email?.split("@")[0] ?? "Student",
    });
  }

  // Link this login to the specific student record the invite was for
  if (studentId) {
    await supabase
      .from("students")
      .update({ profile_id: userId })
      .eq("id", studentId);
  }

  return NextResponse.redirect(`${origin}/portal`);
}