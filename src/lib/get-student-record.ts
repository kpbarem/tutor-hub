import type { SupabaseClient } from "@supabase/supabase-js";

export async function getStudentRecord(supabase: SupabaseClient) {
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) return null;

  const { data: student } = await supabase
    .from("students")
    .select("id, name, tutor_account_id")
    .eq("profile_id", user.id)
    .single();

  return student ?? null;
}