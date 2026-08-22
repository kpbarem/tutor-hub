"use server";

import { createClient } from "@/lib/supabase/server";
import { createAdminClient } from "@/lib/supabase/admin";

export async function linkStudentAccount() {
  const supabase = await createClient();

  const {
    data: { user },
    error: userError,
  } = await supabase.auth.getUser();

  if (userError || !user || !user.email) {
    return {
      success: false,
      message: "You are not logged in.",
    };
  }

  const admin = createAdminClient();
  const email = user.email.trim().toLowerCase();

  // 1. Find the tutor-created student record.
  const { data: student, error: studentError } = await admin
    .from("students")
    .select("id, profile_id, email")
    .ilike("email", email)
    .maybeSingle();

  if (studentError) {
    console.error("Student lookup failed:", studentError);

    return {
      success: false,
      message: "Could not find your student record.",
    };
  }

  if (!student) {
    return {
      success: false,
      message: "No student account exists for this email.",
    };
  }

  if (student.profile_id && student.profile_id !== user.id) {
    return {
      success: false,
      message: "This student account is already linked to another login.",
    };
  }

  // 2. IMPORTANT: create the profile FIRST.
  const { error: profileError } = await admin
    .from("profiles")
    .upsert(
      {
        id: user.id,
        role: "student",
        display_name: email.split("@")[0],
      },
      {
        onConflict: "id",
      }
    );

  if (profileError) {
    console.error("Student profile creation failed:", profileError);

    return {
      success: false,
      message: "Could not create your student profile.",
    };
  }

  // 3. NOW link the student row to that profile.
  if (!student.profile_id) {
    const { error: linkError } = await admin
      .from("students")
      .update({
        profile_id: user.id,
      })
      .eq("id", student.id);

    if (linkError) {
      console.error("Student linking failed:", linkError);

      return {
        success: false,
        message: "Could not link your student account.",
      };
    }
  }

  return {
    success: true,
  };
}