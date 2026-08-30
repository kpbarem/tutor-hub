"use server";

import { revalidatePath } from "next/cache";
import { createClient } from "@/lib/supabase/server";
import { getStudentRecord } from "@/lib/get-student-record";

export async function updateStudentTimezone(timezone: string) {
  const supabase = await createClient();
  const student = await getStudentRecord(supabase);
  if (!student) throw new Error("Not logged in as a student");


  const { data: updatedRows, error } = await supabase
    .from("students")
    .update({ timezone })
    .eq("id", student.id)
    .select("id");

  if (error) {
    console.error("Failed to update student timezone:", error.message);
    throw new Error(error.message);
  }
  if (!updatedRows || updatedRows.length === 0) {
    console.error("Timezone update matched ZERO rows — likely an RLS policy gap");
    throw new Error("Update didn't apply — no matching row found.");
  }
  console.log("Successfully updated timezone for student", student.id, "to", timezone);

  revalidatePath("/portal/settings");
}