"use server";

import { revalidatePath } from "next/cache";
import { createClient } from "@/lib/supabase/server";
import { getStudentRecord } from "@/lib/get-student-record";
import { removeLessonFromGoogle } from "@/lib/google-calendar";

export async function cancelLessonAsStudent(lessonId: string) {
  const supabase = await createClient();
  const student = await getStudentRecord(supabase);
  if (!student) throw new Error("Not logged in as a student");

  const { data: updatedLesson, error } = await supabase
    .from("lessons")
    .update({ status: "cancelled" })
    .eq("id", lessonId)
    .eq("student_id", student.id) // belt-and-suspenders on top of RLS
    .select("google_event_id, tutor_account_id")
    .single();

  if (error) {
    console.error("Failed to cancel lesson:", error.message);
    throw new Error(error.message);
  }

  if (updatedLesson?.google_event_id) {
    await removeLessonFromGoogle(supabase, updatedLesson.tutor_account_id, updatedLesson.google_event_id);
  }

  console.log("Lesson cancelled by student:", lessonId);
  revalidatePath("/portal");
}