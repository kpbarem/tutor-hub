import Link from "next/link";
import { ChevronLeft, ChevronRight } from "lucide-react";
import { createClient } from "@/lib/supabase/server";
import { getStudentRecord } from "@/lib/get-student-record";
import { formatInTimezone } from "@/lib/format-in-timezone";

function getWeekDates(offset: number, timezone: string) {
  const todayInTz = new Date(new Date().toLocaleString("en-US", { timeZone: timezone }));
  const dayOfWeek = todayInTz.getDay();
  const mondayOffset = dayOfWeek === 0 ? -6 : 1 - dayOfWeek;
  const monday = new Date(todayInTz);
  monday.setDate(todayInTz.getDate() + mondayOffset + offset * 7);
  monday.setHours(0, 0, 0, 0);

  return Array.from({ length: 7 }, (_, i) => {
    const d = new Date(monday);
    d.setDate(monday.getDate() + i);
    return d;
  });
}

export default async function PortalCalendarPage({
  searchParams,
}: {
  searchParams: Promise<{ offset?: string }>;
}) {
  const { offset: offsetParam } = await searchParams;
  const offset = Number(offsetParam ?? "0") || 0;

  const supabase = await createClient();
  const student = await getStudentRecord(supabase);
  if (!student) return null;

  const weekDates = getWeekDates(offset, student.timezone);
  const weekStart = weekDates[0];
  const weekEnd = new Date(weekDates[6]);
  weekEnd.setHours(23, 59, 59, 999);

  const { data: lessons } = await supabase
    .from("lessons")
    .select("id, starts_at, ends_at, topic, video_room_url")
    .eq("student_id", student.id)
    .neq("status", "cancelled")
    .gte("starts_at", weekStart.toISOString())
    .lte("starts_at", weekEnd.toISOString())
    .order("starts_at");

  const { data: blocks } = await supabase
    .from("availability_blocks")
    .select("id, starts_at, ends_at, note")
    .eq("tutor_account_id", student.tutor_account_id)
    .lte("starts_at", weekEnd.toISOString())
    .gte("ends_at", weekStart.toISOString());

  const dayLabelFormatter = (date: Date) => formatInTimezone(date, student.timezone, { weekday: "short" });
  const timeFormatter = (date: Date) => formatInTimezone(date, student.timezone, { hour: "numeric", minute: "2-digit" });
  const rangeFormatter = (date: Date) => formatInTimezone(date, student.timezone, { month: "short", day: "numeric" });

  const now = new Date();

  return (
    <div>
      <h1 className="text-2xl font-bold">Calendar</h1>

      <div className="mt-6 flex items-center justify-between">
        <div className="flex items-center gap-2">
          <Link href={`/portal/calendar?offset=${offset - 1}`} className="grid h-9 w-9 place-items-center rounded-xl border border-slate-200 hover:bg-slate-50">
            <ChevronLeft size={18} />
          </Link>
          <Link href={`/portal/calendar?offset=${offset + 1}`} className="grid h-9 w-9 place-items-center rounded-xl border border-slate-200 hover:bg-slate-50">
            <ChevronRight size={18} />
          </Link>
          {offset !== 0 && (
            <Link href="/portal/calendar" className="ml-1 text-sm font-semibold text-blue-800">
              Today
            </Link>
          )}
        </div>
        <p className="text-sm font-semibold text-slate-600">
          {rangeFormatter(weekDates[0])} – {rangeFormatter(weekDates[6])}
        </p>
      </div>

      <div className="mt-4 overflow-hidden rounded-2xl border border-slate-200 bg-white shadow-sm">
        <div className="grid min-w-[900px] grid-cols-7 border-b border-slate-200 bg-slate-50">
          {weekDates.map((date) => (
            <div key={date.toISOString()} className="border-r border-slate-200 p-4 last:border-r-0">
              <p className="text-xs font-semibold uppercase text-slate-500">{dayLabelFormatter(date)}</p>
              <p className="mt-1 text-lg font-bold">{date.getDate()}</p>
            </div>
          ))}
        </div>

        <div className="grid min-h-[500px] min-w-[900px] grid-cols-7">
          {weekDates.map((date) => {
            const dayLessons = (lessons ?? []).filter((lesson) => {
              const lessonLocalDate = formatInTimezone(new Date(lesson.starts_at), student.timezone, { year: "numeric", month: "2-digit", day: "2-digit" });
              const columnLocalDate = formatInTimezone(date, student.timezone, { year: "numeric", month: "2-digit", day: "2-digit" });
              return lessonLocalDate === columnLocalDate;
            });

            const dayBlocks = (blocks ?? []).filter((block) => {
              const blockLocalDate = formatInTimezone(new Date(block.starts_at), student.timezone, { year: "numeric", month: "2-digit", day: "2-digit" });
              const columnLocalDate = formatInTimezone(date, student.timezone, { year: "numeric", month: "2-digit", day: "2-digit" });
              return blockLocalDate === columnLocalDate;
            });

            return (
              <div key={date.toISOString()} className="space-y-2 border-r border-slate-100 p-3 last:border-r-0">
                {dayLessons.map((lesson) => {
                  const startsAt = new Date(lesson.starts_at);
                  const endsAt = new Date(lesson.ends_at);
                  const isLive = startsAt <= now && now <= endsAt;

                  return (
                    <div key={lesson.id} className="rounded-xl border border-blue-200 bg-blue-50 p-3">
                      <p className={"text-xs font-semibold " + (isLive ? "text-emerald-600" : "text-blue-900")}>
                        {isLive ? "● Live now" : timeFormatter(startsAt)}
                      </p>
                      {lesson.topic && <p className="mt-1 text-xs text-slate-500">{lesson.topic}</p>}
                      {lesson.video_room_url && (
                        <Link href={`/portal/lessons/${lesson.id}/call`} className="mt-2 inline-block text-xs font-semibold text-blue-800 hover:text-blue-900">
                          Join call →
                        </Link>
                      )}
                    </div>
                  );
                })}
                {dayBlocks.map((block) => (
                  <div key={block.id} className="rounded-xl border border-slate-300 bg-slate-100 p-3">
                    <p className="text-xs font-semibold text-slate-600">
                      {timeFormatter(new Date(block.starts_at))} – {timeFormatter(new Date(block.ends_at))}
                    </p>
                    <p className="mt-1 text-xs text-slate-500">{block.note || "Unavailable"}</p>
                  </div>
                ))}
              </div>
            );
          })}
        </div>
      </div>
    </div>
  );
}