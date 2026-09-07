"use server";

import { revalidatePath } from "next/cache";
import { createClient } from "@/lib/supabase/server";
import { getTutorAccountId } from "@/lib/get-tutor-account";
import { pushBlockToGoogle, removeBlockFromGoogle } from "@/lib/google-calendar";

export async function createAvailabilityBlock(startsAtIso: string, endsAtIso: string, note: string) {
  const supabase = await createClient();
  const tutorAccountId = await getTutorAccountId(supabase);
  if (!tutorAccountId) throw new Error("Not logged in");

  const { data, error } = await supabase
    .from("availability_blocks")
    .insert({ tutor_account_id: tutorAccountId, starts_at: startsAtIso, ends_at: endsAtIso, note: note || null })
    .select("id");

  if (error) {
    console.error("Failed to create availability block:", error.message);
    throw new Error(error.message);
  }
  if (!data || data.length === 0) {
    console.error("Availability block insert matched ZERO rows");
    throw new Error("Could not save — please try again.");
  }

  await pushBlockToGoogle(supabase, tutorAccountId, data[0].id, note || "Unavailable", new Date(startsAtIso), new Date(endsAtIso));

  revalidatePath("/dashboard/availability");
}

export async function deleteAvailabilityBlock(blockId: string) {
  const supabase = await createClient();
  const tutorAccountId = await getTutorAccountId(supabase);
  if (!tutorAccountId) throw new Error("Not logged in");

  const { data: existingBlock } = await supabase
    .from("availability_blocks")
    .select("google_event_id")
    .eq("id", blockId)
    .single();

  const { error } = await supabase.from("availability_blocks").delete().eq("id", blockId);
  if (error) {
    console.error("Failed to delete availability block:", error.message);
    throw new Error(error.message);
  }

  if (existingBlock?.google_event_id) {
    await removeBlockFromGoogle(supabase, tutorAccountId, existingBlock.google_event_id);
  }

  revalidatePath("/dashboard/availability");
}