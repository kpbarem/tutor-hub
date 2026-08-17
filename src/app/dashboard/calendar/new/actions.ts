"use server";

import { redirect } from "next/navigation";
import { revalidatePath } from "next/cache";
import { createClient } from "@/lib/supabase/server";
import { getTutorAccountId } from "@/lib/get-tutor-account";

export async function createLesson(formData: FormData) {
  const supabase = await createClient();
  const tutorAccountId = await getTutorAccountId(supabase);

  if (!tutorAccountId) {
    redirect("/login");
  }

  const studentId = formData.get("studentId") as string;
  const date = formData.get("date") as string;
  const time = formData.get("time") as string;
  const duration = Number(formData.get("duration"));
  const topic = formData.get("topic") as string;

  const startsAt = new Date(`${date}T${time}`);
  const endsAt = new Date(startsAt.getTime() + duration * 60_000);

  const { error } = await supabase.from("lessons").insert({
    tutor_account_id: tutorAccountId,
    student_id: studentId,
    starts_at: startsAt.toISOString(),
    ends_at: endsAt.toISOString(),
    topic: topic || null,
  });

  if (error) {
    throw new Error(error.message);
  }

  revalidatePath("/dashboard/calendar");
  revalidatePath("/dashboard");
  redirect("/dashboard/calendar");
}