"use server";

import { redirect } from "next/navigation";
import { revalidatePath } from "next/cache";
import { createClient } from "@/lib/supabase/server";
import { getTutorAccountId } from "@/lib/get-tutor-account";

export async function createStudent(formData: FormData) {
  const supabase = await createClient();
  const tutorAccountId = await getTutorAccountId(supabase);

  if (!tutorAccountId) {
    redirect("/login");
  }

  const name = formData.get("name") as string;
  const email = (formData.get("email") as string).trim().toLowerCase();
  const timezone = formData.get("timezone") as string;
  const goals = formData.get("goals") as string;

  const { error } = await supabase.from("students").insert({
    tutor_account_id: tutorAccountId,
    name,
    email,
    timezone: timezone || "UTC",
    goals: goals || null,
  });

  if (error) {
    // throwing simplest possible error for now..
    throw new Error(error.message);
  }

  revalidatePath("/dashboard/students");
  redirect("/dashboard/students");
}