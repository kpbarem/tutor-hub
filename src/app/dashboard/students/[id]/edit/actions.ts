"use server";

import { redirect } from "next/navigation";
import { revalidatePath } from "next/cache";
import { createClient } from "@/lib/supabase/server";

export async function updateStudent(formData: FormData) {
  const supabase = await createClient();
  const studentId = formData.get("studentId") as string;

  const { error } = await supabase
    .from("students")
    .update({
      name: formData.get("name") as string,
      email: formData.get("email") as string,
      timezone: (formData.get("timezone") as string) || "UTC",
      language: (formData.get("language") as string) || null,
      level: (formData.get("level") as string) || null,
      goals: (formData.get("goals") as string) || null,
    })
    .eq("id", studentId);

  if (error) throw new Error(error.message);

  revalidatePath(`/dashboard/students/${studentId}`);
  redirect(`/dashboard/students/${studentId}`);
}