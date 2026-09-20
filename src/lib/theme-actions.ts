"use server";

import { revalidatePath } from "next/cache";
import { createClient } from "@/lib/supabase/server";

export async function updateTheme(theme: string) {
  const supabase = await createClient();
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) throw new Error("Not logged in");

  const { data, error } = await supabase.from("profiles").update({ theme }).eq("id", user.id).select("id");

  if (error) {
    console.error("Failed to update theme:", error.message);
    throw new Error(error.message);
  }
  if (!data || data.length === 0) {
    console.error("Theme update matched ZERO rows");
    throw new Error("Could not save — please try again.");
  }

  revalidatePath("/", "layout");
}