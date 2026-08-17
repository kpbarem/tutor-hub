"use server";

import { headers } from "next/headers";
import { createClient } from "@/lib/supabase/server";

export async function inviteStudent(studentId: string, email: string) {
  const supabase = await createClient();
  const headersList = await headers();
  const origin = process.env.NEXT_PUBLIC_SITE_URL ?? `http://${headersList.get("host")}`;

  const { error } = await supabase.auth.signInWithOtp({
    email,
    options: {
      emailRedirectTo: `${origin}/auth/callback?student_id=${studentId}`,
      shouldCreateUser: true,
    },
  });

  if (error) {
    return { success: false, message: error.message };
  }

  return { success: true, message: `Invitation sent to ${email}.` };
}