"use server";

import { redirect } from "next/navigation";
import { revalidatePath } from "next/cache";
import { createClient } from "@/lib/supabase/server";
import { getTutorAccountId } from "@/lib/get-tutor-account";
import { checkScheduleConflict } from "@/lib/check-schedule-conflict";
import { pushLessonToGoogle } from "@/lib/google-calendar";
import { sendEmail } from "@/lib/email";
import { formatInTimezone } from "@/lib/format-in-timezone";

export async function createLesson(formData: FormData) {
  const supabase = await createClient();
  const tutorAccountId = await getTutorAccountId(supabase);

  if (!tutorAccountId) {
    redirect("/login");
  }

  const studentId = formData.get("studentId") as string;
  // const date = formData.get("date") as string;
  // const time = formData.get("time") as string;
  // const duration = Number(formData.get("duration"));
  // const topic = formData.get("topic") as string;

  // const startsAt = new Date(`${date}T${time}`);
  // const endsAt = new Date(startsAt.getTime() + duration * 60_000);
  const startsAtIso = formData.get("startsAtIso") as string;
  const duration = Number(formData.get("duration"));
  const topic = formData.get("topic") as string;

  const startsAt = new Date(startsAtIso);
  const endsAt = new Date(startsAt.getTime() + duration * 60_000);
  const conflict = await checkScheduleConflict(supabase, tutorAccountId, startsAt, endsAt);
  if (conflict) {
    throw new Error(conflict);
  }

  const { data: lesson, error } = await supabase
    .from("lessons")
    .insert({
      tutor_account_id: tutorAccountId,
      student_id: studentId,
      starts_at: startsAt.toISOString(),
      ends_at: endsAt.toISOString(),
      topic: topic || null,
    })
    .select("id")
    .single();

  if (error) {
    throw new Error(error.message);
  }
  let videoRoomUrl: string | null = null;
  try {
    const roomResponse = await fetch("https://api.daily.co/v1/rooms", {
      method: "POST",
      headers: {
        Authorization: `Bearer ${process.env.DAILY_API_KEY}`,
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        name: `lesson-${lesson.id}`,
        properties: {
          exp: Math.floor(endsAt.getTime() / 1000) + 60 * 60, // expires 1hr after lesson ends
          enable_chat: true,
        },
      }),
    });

    if (roomResponse.ok) {
      const room = await roomResponse.json();
      videoRoomUrl = room.url;
      await supabase.from("lessons").update({ video_room_url: room.url }).eq("id", lesson.id);
    } else {
      console.error("Daily room creation failed:", await roomResponse.text());
    }
  } catch (err) {
    console.error("Daily room creation failed:", err);
  }

    const { data: studentForEvent } = await supabase
    .from("students")
    .select("name, email, timezone")
    .eq("id", studentId)
    .single();

  if (studentForEvent?.email) {
    const formattedTime = formatInTimezone(startsAt, studentForEvent.timezone, {
      weekday: "long", month: "short", day: "numeric", hour: "numeric", minute: "2-digit",
    });

    await sendEmail({
      to: studentForEvent.email,
      subject: `Lesson scheduled: ${formattedTime}`,
      html: `
        <p>Hi ${studentForEvent.name},</p>
        <p>Your tutor scheduled a lesson:</p>
        <p><strong>${formattedTime}</strong></p>
        ${topic ? `<p>Topic: ${topic}</p>` : ""}
        ${videoRoomUrl ? `<p><a href="${videoRoomUrl}">Join the call →</a></p>` : ""}
        <p><a href="${process.env.NEXT_PUBLIC_SITE_URL}/portal">View in your student portal →</a></p>
      `,
    });
  }
  await pushLessonToGoogle(
    supabase,
    tutorAccountId,
    lesson.id,
    `Lesson with ${studentForEvent?.name ?? "student"}`,
    topic || "",
    startsAt,
    endsAt
  );


  revalidatePath("/dashboard/calendar");
  revalidatePath("/dashboard");
  redirect("/dashboard/calendar");
}