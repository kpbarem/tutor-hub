"use server";

import { revalidatePath } from "next/cache";
import { createClient } from "@/lib/supabase/server";

export async function saveNotes(studentId: string, notes: string) {
  const supabase = await createClient();

  const { error } = await supabase
    .from("students")
    .update({ private_notes: notes })
    .eq("id", studentId);

  if (error) throw new Error(error.message);
  revalidatePath(`/dashboard/students/${studentId}`);
}