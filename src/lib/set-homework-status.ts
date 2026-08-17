import { createClient } from "@/lib/supabase/server";

export async function setHomeworkStatus(homeworkId: string, status: "assigned" | "completed") {
  const supabase = await createClient();
  const { error } = await supabase.from("homework").update({ status }).eq("id", homeworkId);
  if (error) throw new Error(error.message);
}