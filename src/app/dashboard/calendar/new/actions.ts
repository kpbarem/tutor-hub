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
      await supabase.from("lessons").update({ video_room_url: room.url }).eq("id", lesson.id);
    } else {
      console.error("Daily room creation failed:", await roomResponse.text());
    }
  } catch (err) {
    console.error("Daily room creation failed:", err);
  }

  revalidatePath("/dashboard/calendar");
  revalidatePath("/dashboard");
  redirect("/dashboard/calendar");
}