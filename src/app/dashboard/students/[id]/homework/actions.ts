"use server";

import { revalidatePath } from "next/cache";
import { createClient } from "@/lib/supabase/server";
import { getTutorAccountId } from "@/lib/get-tutor-account";
import { setHomeworkStatus } from "@/lib/set-homework-status";
import { sendEmail } from "@/lib/email";

export async function assignHomework(formData: FormData) {
  const supabase = await createClient();
  const tutorAccountId = await getTutorAccountId(supabase);
  if (!tutorAccountId) return;

  const studentId = formData.get("studentId") as string;
  const title = formData.get("title") as string;
  const description = formData.get("description") as string;
  const dueDate = formData.get("dueDate") as string;

  const { error } = await supabase.from("homework").insert({
    tutor_account_id: tutorAccountId,
    student_id: studentId,
    title,
    description: description || null,
    due_date: dueDate || null,
  });

  if (error) throw new Error(error.message);

  const { data: student } = await supabase
    .from("students")
    .select("email, name")
    .eq("id", studentId)
    .single();

  if (student?.email) {
    await sendEmail({
      to: student.email,
      subject: `New homework assigned: ${title}`,
      html: `
        <p>Hi ${student.name},</p>
        <p>Your tutor just assigned new homework:</p>
        <p><strong>${title}</strong></p>
        ${description ? `<p>${description}</p>` : ""}
        ${dueDate ? `<p>Due: ${dueDate}</p>` : ""}
        <p><a href="${process.env.NEXT_PUBLIC_SITE_URL}/portal/homework">View in your student portal →</a></p>
      `,
    });
  }
  revalidatePath(`/dashboard/students/${studentId}`);
}

export async function toggleHomeworkStatusTutor(homeworkId: string, studentId: string, status: "assigned" | "completed") {
  await setHomeworkStatus(homeworkId, status);
  revalidatePath(`/dashboard/students/${studentId}`);
}