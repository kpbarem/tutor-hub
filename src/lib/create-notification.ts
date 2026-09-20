import type { SupabaseClient } from "@supabase/supabase-js";

export async function createNotification(
  supabase: SupabaseClient,
  profileId: string,
  type: string,
  message: string,
  link?: string
) {
  const { error } = await supabase.from("notifications").insert({
    profile_id: profileId,
    type,
    message,
    link: link || null,
  });

  if (error) {
    console.error(`Failed to create notification (${type}):`, error.message);
  }
}