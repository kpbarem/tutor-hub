import type { SupabaseClient } from "@supabase/supabase-js";

export async function getTutorTimezone(supabase: SupabaseClient): Promise<string> {
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) return "UTC";

  const { data } = await supabase.from("profiles").select("timezone").eq("id", user.id).single();
  return data?.timezone || "UTC";
}