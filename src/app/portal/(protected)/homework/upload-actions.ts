"use server";

import { revalidatePath } from "next/cache";
import { createClient } from "@/lib/supabase/server";

const MAX_FILE_SIZE = 20 * 1024 * 1024; // 20MB

export async function submitHomeworkFile(homeworkId: string, file: File) {
  if (file.size > MAX_FILE_SIZE) {
    return { success: false, message: "File is too large (max 20MB)." };
  }

  const supabase = await createClient();
  const path = `${homeworkId}/${file.name}`;

  const { error: uploadError } = await supabase.storage
    .from("homework-submissions")
    .upload(path, file, { upsert: true });

  if (uploadError) {
    return { success: false, message: uploadError.message };
  }

  const { error: updateError } = await supabase
    .from("homework")
    .update({ submission_path: path })
    .eq("id", homeworkId);

  if (updateError) {
    return { success: false, message: updateError.message };
  }

  revalidatePath("/portal/homework");
  return { success: true, message: "Submitted!" };
}