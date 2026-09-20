"use server";

import { revalidatePath } from "next/cache";
import { createClient } from "@/lib/supabase/server";
import { createAdminClient } from "@/lib/supabase/admin";
import { sendEmail } from "@/lib/email";
import { createNotification } from "@/lib/create-notification";

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

  // Best-effort notification to the tutor — never blocks the actual submission.
  const { data: homework } = await supabase
    .from("homework")
    .select("title, tutor_account_id, students(name)")
    .eq("id", homeworkId)
    .single();

  if (homework) {
    const { data: tutorAccount } = await supabase
      .from("tutor_accounts")
      .select("owner_profile_id")
      .eq("id", homework.tutor_account_id)
      .single();

    if (tutorAccount?.owner_profile_id) {
      const adminClient = createAdminClient();
      const { data: tutorUser, error: tutorLookupError } = await adminClient.auth.admin.getUserById(tutorAccount.owner_profile_id);

      if (tutorLookupError) {
        console.error("Failed to look up tutor email for homework submission notice:", tutorLookupError.message);
      } else if (tutorUser?.user?.email) {
        const studentName = (homework.students as unknown as { name: string } | null)?.name ?? "A student";

        await sendEmail({
          to: tutorUser.user.email,
          subject: `${studentName} submitted: ${homework.title}`,
          html: `
            <p>${studentName} uploaded a file for:</p>
            <p><strong>${homework.title}</strong></p>
            <p><a href="${process.env.NEXT_PUBLIC_SITE_URL}/dashboard/students">View in your dashboard →</a></p>
          `,
        });

        await createNotification(
          supabase,
          tutorAccount.owner_profile_id,
          "homework_submitted",
          `${studentName} submitted: ${homework.title}`,
          "/dashboard/students"
        );
      }

    }
  }

  revalidatePath("/portal/homework");
  return { success: true, message: "Submitted!" };
}