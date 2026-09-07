import { NextRequest, NextResponse } from "next/server";
import { createAdminClient } from "@/lib/supabase/admin";
import { sendEmail } from "@/lib/email";
import { formatInTimezone } from "@/lib/format-in-timezone";

export async function GET(request: NextRequest) {
  const authHeader = request.headers.get("authorization");
  if (authHeader !== `Bearer ${process.env.CRON_SECRET}`) {
    console.error("Unauthorized cron request — missing or wrong CRON_SECRET");
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  console.log("Reminder cron started at", new Date().toISOString());
  const supabase = createAdminClient();

  // ---- Lesson reminders: lessons starting in the next 24 hours ----
  const now = new Date();
  const in24Hours = new Date(now.getTime() + 24 * 60 * 60 * 1000);

  const { data: upcomingLessons, error: lessonsError } = await supabase
    .from("lessons")
    .select("id, starts_at, topic, student_id, students(name, email, timezone)")
    .neq("status", "cancelled")
    .is("reminder_sent_at", null)
    .gte("starts_at", now.toISOString())
    .lte("starts_at", in24Hours.toISOString());

  if (lessonsError) {
    console.error("Failed to query upcoming lessons for reminders:", lessonsError.message);
  } else {
    console.log(`Found ${upcomingLessons?.length ?? 0} lesson(s) needing a reminder`);
  }

  for (const lesson of upcomingLessons ?? []) {
    const student = lesson.students as unknown as { name: string; email: string; timezone: string } | null;
    if (!student?.email) {
      console.error("Skipping lesson reminder — no student email for lesson", lesson.id);
      continue;
    }

    const formattedTime = formatInTimezone(new Date(lesson.starts_at), student.timezone, {
      weekday: "long", month: "short", day: "numeric", hour: "numeric", minute: "2-digit",
    });

    const result = await sendEmail({
      to: student.email,
      subject: `Reminder: lesson tomorrow at ${formattedTime}`,
      html: `
        <p>Hi ${student.name},</p>
        <p>This is a reminder about your upcoming lesson:</p>
        <p><strong>${formattedTime}</strong></p>
        ${lesson.topic ? `<p>Topic: ${lesson.topic}</p>` : ""}
        <p><a href="${process.env.NEXT_PUBLIC_SITE_URL}/portal">View in your student portal →</a></p>
      `,
    });

    if (result.success) {
      const { error: markError } = await supabase
        .from("lessons")
        .update({ reminder_sent_at: new Date().toISOString() })
        .eq("id", lesson.id);
      if (markError) console.error("Failed to mark lesson reminder as sent:", markError.message);
    }
  }

  // ---- Homework reminders: due tomorrow, not completed, not yet reminded ----
  const tomorrow = new Date(now.getTime() + 24 * 60 * 60 * 1000);
  const tomorrowDateString = tomorrow.toISOString().slice(0, 10); // YYYY-MM-DD

  const { data: dueSoonHomework, error: homeworkError } = await supabase
    .from("homework")
    .select("id, title, due_date, student_id, students(name, email)")
    .eq("due_date", tomorrowDateString)
    .neq("status", "completed")
    .is("due_reminder_sent_at", null);

  if (homeworkError) {
    console.error("Failed to query homework for due-soon reminders:", homeworkError.message);
  } else {
    console.log(`Found ${dueSoonHomework?.length ?? 0} homework item(s) needing a due-soon reminder`);
  }

  for (const hw of dueSoonHomework ?? []) {
    const student = hw.students as unknown as { name: string; email: string } | null;
    if (!student?.email) {
      console.error("Skipping homework reminder — no student email for homework", hw.id);
      continue;
    }

    const result = await sendEmail({
      to: student.email,
      subject: `Homework due tomorrow: ${hw.title}`,
      html: `
        <p>Hi ${student.name},</p>
        <p>Just a reminder that this is due tomorrow:</p>
        <p><strong>${hw.title}</strong></p>
        <p><a href="${process.env.NEXT_PUBLIC_SITE_URL}/portal/homework">View in your student portal →</a></p>
      `,
    });

    if (result.success) {
      const { error: markError } = await supabase
        .from("homework")
        .update({ due_reminder_sent_at: new Date().toISOString() })
        .eq("id", hw.id);
      if (markError) console.error("Failed to mark homework reminder as sent:", markError.message);
    }
  }

  console.log("Reminder cron finished at", new Date().toISOString());
  return NextResponse.json({
    lessonsReminded: upcomingLessons?.length ?? 0,
    homeworkReminded: dueSoonHomework?.length ?? 0,
  });
}