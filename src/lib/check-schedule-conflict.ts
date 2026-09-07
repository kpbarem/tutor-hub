import type { SupabaseClient } from "@supabase/supabase-js";

export async function checkScheduleConflict(
  supabase: SupabaseClient,
  tutorAccountId: string,
  startsAt: Date,
  endsAt: Date
): Promise<string | null> {
  const { data: conflictingLessons, error: lessonsError } = await supabase
    .from("lessons")
    .select("id")
    .eq("tutor_account_id", tutorAccountId)
    .neq("status", "cancelled")
    .lt("starts_at", endsAt.toISOString())
    .gt("ends_at", startsAt.toISOString());

  if (lessonsError) {
    console.error("Failed to check lesson conflicts:", lessonsError.message);
    return "Could not verify availability — please try again.";
  }
  if (conflictingLessons && conflictingLessons.length > 0) {
    return "That time overlaps with an existing lesson.";
  }

  const { data: conflictingBlocks, error: blocksError } = await supabase
    .from("availability_blocks")
    .select("id")
    .eq("tutor_account_id", tutorAccountId)
    .lt("starts_at", endsAt.toISOString())
    .gt("ends_at", startsAt.toISOString());

  if (blocksError) {
    console.error("Failed to check availability blocks:", blocksError.message);
    return "Could not verify availability — please try again.";
  }
  if (conflictingBlocks && conflictingBlocks.length > 0) {
    return "Your tutor isn't available at that time.";
  }

  return null; // no conflict
}