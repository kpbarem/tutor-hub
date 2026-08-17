import type { SupabaseClient } from "@supabase/supabase-js";

export async function getTutorAccountId(supabase: SupabaseClient) {
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) return null;

  const { data: tutorAccount } = await supabase
    .from("tutor_accounts")
    .select("id")
    .eq("owner_profile_id", user.id)
    .single();

  return tutorAccount?.id ?? null;
}