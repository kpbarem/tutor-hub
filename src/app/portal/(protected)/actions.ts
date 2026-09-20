"use server";

import { revalidatePath } from "next/cache";
import { createClient } from "@/lib/supabase/server";
import { getStudentRecord } from "@/lib/get-student-record";
import { removeLessonFromGoogle } from "@/lib/google-calendar";
import { sendEmail } from "@/lib/email";
import { createAdminClient } from "@/lib/supabase/admin";
import { formatInTimezone} from "@/lib/format-in-timezone";


export async function cancelLessonAsStudent(lessonId: string) {
  const supabase = await createClient();
  const student = await getStudentRecord(supabase);
  if (!student) throw new Error("Not logged in as a student");

  const { data: updatedLesson, error } = await supabase
    .from("lessons")
    .update({ status: "cancelled" })
    .eq("id", lessonId)
    .eq("student_id", student.id)
    .select("google_event_id, tutor_account_id, starts_at")
    .single();

  if (error) {
    console.error("Failed to cancel lesson:", error.message);
    throw new Error(error.message);
  }

  if (updatedLesson?.google_event_id) {
    await removeLessonFromGoogle(supabase, updatedLesson.tutor_account_id, updatedLesson.google_event_id);
  }

  const { data: tutorAccount } = await supabase
    .from("tutor_accounts")
    .select("owner_profile_id")
    .eq("id", updatedLesson.tutor_account_id)
    .single();

  if (tutorAccount?.owner_profile_id) {
    const adminClient = createAdminClient();
    const { data: tutorUser, error: tutorLookupError } = await adminClient.auth.admin.getUserById(tutorAccount.owner_profile_id);

    if (tutorLookupError) {
      console.error("Failed to look up tutor email for cancellation notice:", tutorLookupError.message);
    } else if (tutorUser?.user?.email) {
      const { data: tutorProfile } = await supabase
        .from("profiles")
        .select("timezone")
        .eq("id", tutorAccount.owner_profile_id)
        .single();

      const formattedTime = formatInTimezone(new Date(updatedLesson.starts_at), tutorProfile?.timezone || "UTC", {
        weekday: "long", month: "short", day: "numeric", hour: "numeric", minute: "2-digit",
      });

      await sendEmail({
        to: tutorUser.user.email,
        subject: `${student.name} cancelled a lesson`,
        html: `
          <p>${student.name} cancelled their lesson scheduled for:</p>
          <p><strong>${formattedTime}</strong></p>
          <p><a href="${process.env.NEXT_PUBLIC_SITE_URL}/dashboard/calendar">View your calendar →</a></p>
        `,
      });
    }
  }

  console.log("Lesson cancelled by student:", lessonId);
  revalidatePath("/portal");
}