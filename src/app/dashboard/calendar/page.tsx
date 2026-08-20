import Link from "next/link";
import { CalendarPlus, ChevronLeft, ChevronRight } from "lucide-react";
import { createClient } from "@/lib/supabase/server";
import { getTutorAccountId } from "@/lib/get-tutor-account";

const dayLabelFormatter = new Intl.DateTimeFormat("en-US", { weekday: "short" });
const timeFormatter = new Intl.DateTimeFormat("en-US", { hour: "numeric", minute: "2-digit" });
const rangeFormatter = new Intl.DateTimeFormat("en-US", { month: "short", day: "numeric" });

function getWeekDates(offset: number) {
  const today = new Date();
  const dayOfWeek = today.getDay();
  const mondayOffset = dayOfWeek === 0 ? -6 : 1 - dayOfWeek;
  const monday = new Date(today);
  monday.setDate(today.getDate() + mondayOffset + offset * 7);
  monday.setHours(0, 0, 0, 0);

  return Array.from({ length: 7 }, (_, i) => {
    const d = new Date(monday);
    d.setDate(monday.getDate() + i);
    return d;
  });
}

export default async function CalendarPage({
  searchParams,
}: {
  searchParams: Promise<{ offset?: string }>;
}) {
  const { offset: offsetParam } = await searchParams;
  const offset = Number(offsetParam ?? "0") || 0;

  const supabase = await createClient();
  const tutorAccountId = await getTutorAccountId(supabase);

  const weekDates = getWeekDates(offset);
  const weekStart = weekDates[0];
  const weekEnd = new Date(weekDates[6]);
  weekEnd.setHours(23, 59, 59, 999);

  const { data: lessons } = await supabase
    .from("lessons")
    .select("id, starts_at, topic, video_room_url, students(name)")
    .eq("tutor_account_id", tutorAccountId)
    .gte("starts_at", weekStart.toISOString())
    .lte("starts_at", weekEnd.toISOString())
    .order("starts_at");

  return (
    <div className="mx-auto max-w-7xl">
      <div className="flex flex-col justify-between gap-4 sm:flex-row sm:items-end">
        <div>
          <h1 className="text-3xl font-bold">Calendar</h1>
          <p className="mt-2 text-slate-500">A first-pass weekly schedule. Google Calendar sync comes later.</p>
        </div>
        <Link
          href="/dashboard/calendar/new"
          className="inline-flex items-center justify-center gap-2 rounded-xl bg-blue-800 px-4 py-3 text-sm font-semibold text-white hover:bg-blue-900"
        >
          <CalendarPlus size={18} /> Schedule lesson
        </Link>
      </div>

      <div className="mt-6 flex items-center justify-between">
        <div className="flex items-center gap-2">
          <Link
            href={`/dashboard/calendar?offset=${offset - 1}`}
            className="grid h-9 w-9 place-items-center rounded-xl border border-slate-200 hover:bg-slate-50"
          >
            <ChevronLeft size={18} />
          </Link>
          <Link
            href={`/dashboard/calendar?offset=${offset + 1}`}
            className="grid h-9 w-9 place-items-center rounded-xl border border-slate-200 hover:bg-slate-50"
          >
            <ChevronRight size={18} />
          </Link>
          {offset !== 0 && (
            <Link href="/dashboard/calendar" className="ml-1 text-sm font-semibold text-blue-800">
              Today
            </Link>
          )}
        </div>
        <p className="text-sm font-semibold text-slate-600">
          {rangeFormatter.format(weekDates[0])} – {rangeFormatter.format(weekDates[6])}
        </p>
      </div>

      <div className="mt-4 overflow-hidden rounded-2xl border border-slate-200 bg-white shadow-sm">
        <div className="grid min-w-[900px] grid-cols-7 border-b border-slate-200 bg-slate-50">
          {weekDates.map((date) => (
            <div key={date.toISOString()} className="border-r border-slate-200 p-4 last:border-r-0">
              <p className="text-xs font-semibold uppercase text-slate-500">{dayLabelFormatter.format(date)}</p>
              <p className="mt-1 text-lg font-bold">{date.getDate()}</p>
            </div>
          ))}
        </div>

        <div className="grid min-h-[560px] min-w-[900px] grid-cols-7">
          {weekDates.map((date) => {
            const dayLessons = (lessons ?? []).filter((lesson) => {
              const lessonDate = new Date(lesson.starts_at);
              return lessonDate.toDateString() === date.toDateString();
            });

            return (
              <div key={date.toISOString()} className="space-y-2 border-r border-slate-100 p-3 last:border-r-0">
                {dayLessons.map((lesson) => (
                  <div key={lesson.id} className="rounded-xl border border-blue-200 bg-blue-50 p-3">
                    <p className="text-xs font-semibold text-blue-900">
                      {timeFormatter.format(new Date(lesson.starts_at))}
                    </p>
                    <p className="mt-1 text-sm font-bold text-slate-950">
                      {(lesson.students as unknown as { name: string } | null)?.name ?? "Unknown student"}
                    </p>
                    {lesson.topic && <p className="mt-1 text-xs text-slate-500">{lesson.topic}</p>}
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