"use server";

import { redirect } from "next/navigation";
import { revalidatePath } from "next/cache";
import { createClient } from "@/lib/supabase/server";
import { getStudentRecord } from "@/lib/get-student-record";
import { checkScheduleConflict } from "@/lib/check-schedule-conflict";
import { pushLessonToGoogle } from "@/lib/google-calendar";

export async function createLessonAsStudent(startsAtIso: string, duration: number, topic: string) {
    const supabase = await createClient();
    const student = await getStudentRecord(supabase);
    if (!student) redirect("/portal/login");
    // const startsAtIso = formData.get("startsAtIso") as string;
    // const duration = Number(formData.get("duration"));
    // const topic = formData.get("topic") as string;

    const startsAt = new Date(startsAtIso);
    const endsAt = new Date(startsAt.getTime() + duration * 60_000);
    const conflict = await checkScheduleConflict(supabase, student.tutor_account_id, startsAt, endsAt);
    if (conflict) {
        throw new Error(conflict);
    }

    const { data: lesson, error } = await supabase
        .from("lessons")
        .insert({
            tutor_account_id: student.tutor_account_id,
            student_id: student.id,
            starts_at: startsAt.toISOString(),
            ends_at: endsAt.toISOString(),
            topic: topic || null,
        })
        .select("id")
        .single();

    if (error) throw new Error(error.message);

    try {
        console.log("Attempting Daily room creation. Key present:", !!process.env.DAILY_API_KEY);
        const roomResponse = await fetch("https://api.daily.co/v1/rooms", {
            method: "POST",
            headers: {
                Authorization: `Bearer ${process.env.DAILY_API_KEY}`,
                "Content-Type": "application/json",
            },
            body: JSON.stringify({
                name: `lesson-${lesson.id}`,
                properties: {
                    exp: Math.floor(endsAt.getTime() / 1000) + 60 * 60,
                    enable_chat: true,
                },
            }),
        });

        console.log("Daily response status:", roomResponse.status);

        if (roomResponse.ok) {
            const room = await roomResponse.json();
            console.log("Daily room created:", room.url);
            const { error: updateError } = await supabase
                .from("lessons")
                .update({ video_room_url: room.url })
                .eq("id", lesson.id);

            if (updateError) {
                console.error("Failed to save video_room_url:", updateError.message);
            } else {
                console.log("Successfully saved video_room_url to lesson", lesson.id);
            }
        } else {
            console.error("Daily room creation failed:", await roomResponse.text());
        }
    } catch (err) {
        console.error("Daily room creation threw:", err);
    }

    await pushLessonToGoogle(
        supabase,
        student.tutor_account_id,
        lesson.id,
        `Lesson with ${student.name}`,
        topic || "",
        startsAt,
        endsAt
    );

    revalidatePath("/portal");
    redirect("/portal");
}