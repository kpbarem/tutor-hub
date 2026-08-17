import Link from "next/link";
import { CalendarPlus, ChevronRight, Clock3, CreditCard, Users } from "lucide-react";
import { createClient } from "@/lib/supabase/server";
import { getTutorAccountId } from "@/lib/get-tutor-account";

const dateFormatter = new Intl.DateTimeFormat("en-US", { weekday: "long", month: "long", day: "numeric" });

export default async function DashboardPage() {
  const supabase = await createClient();
  const { data: { user } } = await supabase.auth.getUser();
  const tutorAccountId = await getTutorAccountId(supabase);

  const { data: profile } = await supabase
    .from("profiles")
    .select("display_name")
    .eq("id", user!.id)
    .single();

  const { data: studentRows } = await supabase
    .from("students")
    .select("id, name, language, level")
    .eq("tutor_account_id", tutorAccountId)
    .order("created_at", { ascending: false });

  const { data: upcomingLessons } = await supabase
    .from("lessons")
    .select("id, starts_at, topic, students(name)")
    .eq("tutor_account_id", tutorAccountId)
    .gte("starts_at", new Date().toISOString())
    .order("starts_at", { ascending: true })
    .limit(5);

  const { data: payments } = await supabase
    .from("payments")
    .select("amount_cents, status, created_at")
    .eq("tutor_account_id", tutorAccountId);

  const outstandingCents = (payments ?? [])
    .filter((p) => p.status === "pending")
    .reduce((sum, p) => sum + p.amount_cents, 0);

  const now = new Date();
  const monthlyRevenueCents = (payments ?? [])
    .filter((p) => {
      const createdAt = new Date(p.created_at);
      return p.status === "paid" && createdAt.getMonth() === now.getMonth() && createdAt.getFullYear() === now.getFullYear();
    })
    .reduce((sum, p) => sum + p.amount_cents, 0);

  const students = (studentRows ?? []).map((s) => ({
    ...s,
    avatar: s.name.split(" ").map((n: string) => n[0]).join("").slice(0, 2).toUpperCase(),
  }));

  return (
    <div className="mx-auto max-w-7xl space-y-7">
      <div className="flex flex-col justify-between gap-4 sm:flex-row sm:items-end">
        <div>
          <p className="text-sm font-medium text-blue-800">{dateFormatter.format(new Date())}</p>
          <h1 className="mt-1 text-3xl font-bold tracking-tight">
            Good morning, {profile?.display_name ?? "there"}
          </h1>
          <p className="mt-2 text-slate-500">Here is what is happening with your tutoring business.</p>
        </div>
        <Link
          href="/dashboard/calendar/new"
          className="inline-flex items-center gap-2 rounded-xl bg-blue-800 px-4 py-3 text-sm font-semibold text-white hover:bg-blue-900"
        >
          <CalendarPlus size={18} /> Schedule lesson
        </Link>
      </div>

      <section className="grid gap-4 sm:grid-cols-2 xl:grid-cols-4">
        {[
          ["Active students", students.length.toString(), Users, ""],
          ["Lessons this week", (upcomingLessons?.length ?? 0).toString(), Clock3, ""],
          ["Outstanding", `$${(outstandingCents / 100).toFixed(2)}`, CreditCard, ""],
          ["Monthly revenue", `$${(monthlyRevenueCents / 100).toFixed(2)}`, CreditCard, ""],
        ].map(([label, value, Icon, detail]) => (
          <div key={label as string} className="rounded-2xl border border-slate-200 bg-white p-5 shadow-sm">
            <div className="flex items-center justify-between">
              <p className="text-sm font-medium text-slate-500">{label as string}</p>
              <span className="grid h-9 w-9 place-items-center rounded-xl bg-blue-50 text-blue-800">
                <Icon size={18} />
              </span>
            </div>
            <p className="mt-4 text-3xl font-bold">{value as string}</p>
            <p className="mt-2 text-xs text-slate-500">{detail as string}</p>
          </div>
        ))}
      </section>

      <section className="grid gap-6 xl:grid-cols-5">
        <div className="rounded-2xl border border-slate-200 bg-white shadow-sm xl:col-span-3">
          <div className="flex items-center justify-between border-b border-slate-100 p-5">
            <div>
              <h2 className="font-semibold">Upcoming lessons</h2>
              <p className="mt-1 text-sm text-slate-500">Your next scheduled sessions</p>
            </div>
            <Link href="/dashboard/calendar" className="text-sm font-semibold text-blue-800">
              View calendar
            </Link>
          </div>
          <div className="divide-y divide-slate-100">
            {!upcomingLessons || upcomingLessons.length === 0 ? (
              <div className="p-10 text-center text-sm text-slate-500">
                No upcoming lessons — schedule one to see it here.
              </div>
            ) : (
              upcomingLessons.map((lesson) => {
                const startsAt = new Date(lesson.starts_at);
                const studentName =
                  (lesson.students as unknown as { name: string } | null)?.name ?? "Unknown student";

                return (
                  <div key={lesson.id} className="flex items-center gap-4 p-5">
                    <div className="min-w-20 rounded-xl bg-slate-100 px-3 py-2 text-center">
                      <p className="text-xs font-semibold uppercase text-slate-500">
                        {new Intl.DateTimeFormat("en-US", { weekday: "short", month: "short", day: "numeric" }).format(startsAt)}
                      </p>
                      <p className="mt-1 text-sm font-bold">
                        {new Intl.DateTimeFormat("en-US", { hour: "numeric", minute: "2-digit" }).format(startsAt)}
                      </p>
                    </div>
                    <div className="min-w-0 flex-1">
                      <p className="font-semibold">{studentName}</p>
                      {lesson.topic && <p className="truncate text-sm text-slate-500">{lesson.topic}</p>}
                    </div>
                    <span className="rounded-full bg-emerald-50 px-3 py-1 text-xs font-semibold text-emerald-700">
                      Confirmed
                    </span>
                  </div>
                );
              })
            )}
          </div>
        </div>

        <div className="rounded-2xl border border-slate-200 bg-white p-5 shadow-sm xl:col-span-2">
          <div className="flex items-center justify-between">
            <div>
              <h2 className="font-semibold">Students</h2>
              <p className="mt-1 text-sm text-slate-500">Recent activity</p>
            </div>
            <Link href="/dashboard/students" className="text-sm font-semibold text-blue-800">
              View all
            </Link>
          </div>
          <div className="mt-5 space-y-2">
            {students.length === 0 ? (
              <p className="p-3 text-sm text-slate-500">No students yet.</p>
            ) : (
              students.slice(0, 5).map((student) => (
                <Link
                  key={student.id}
                  href={`/dashboard/students/${student.id}`}
                  className="flex items-center gap-3 rounded-xl p-3 hover:bg-slate-50"
                >
                  <span className="grid h-10 w-10 place-items-center rounded-full bg-blue-100 text-xs font-bold text-blue-900">
                    {student.avatar}
                  </span>
                  <div className="min-w-0 flex-1">
                    <p className="truncate text-sm font-semibold">{student.name}</p>
                    <p className="text-xs text-slate-500">
                      {student.language ?? "—"} · {student.level ?? "—"}
                    </p>
                  </div>
                  <ChevronRight size={17} className="text-slate-400" />
                </Link>
              ))
            )}
          </div>
        </div>
      </section>
    </div>
  );
}