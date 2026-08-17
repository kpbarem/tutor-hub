import Link from "next/link";
import { createClient } from "@/lib/supabase/server";
import { getTutorAccountId } from "@/lib/get-tutor-account";
import { createLesson } from "./actions";

export default async function NewLessonPage() {
  const supabase = await createClient();
  const tutorAccountId = await getTutorAccountId(supabase);

  const { data: students } = await supabase
    .from("students")
    .select("id, name")
    .eq("tutor_account_id", tutorAccountId)
    .order("name");

  return (
    <div className="mx-auto max-w-2xl">
      <div>
        <Link href="/dashboard/calendar" className="text-sm font-semibold text-blue-800 hover:text-blue-900">
          ← Back to calendar
        </Link>
        <h1 className="mt-4 text-3xl font-bold text-slate-900">Schedule lesson</h1>
        <p className="mt-2 text-slate-500">Book a session with one of your students.</p>
      </div>

      <div className="mt-8 rounded-2xl border border-slate-200 bg-white p-6 shadow-sm">
        {!students || students.length === 0 ? (
          <p className="text-sm text-slate-500">
            You need at least one student before you can schedule a lesson.{" "}
            <Link href="/dashboard/students/new" className="font-semibold text-blue-800">
              Add a student
            </Link>
            .
          </p>
        ) : (
          <form action={createLesson} className="space-y-6">
            <div>
              <label htmlFor="studentId" className="block text-sm font-semibold text-slate-700">
                Student
              </label>
              <select
                id="studentId"
                name="studentId"
                required
                className="mt-2 w-full rounded-xl border border-slate-200 px-4 py-3 outline-none focus:border-blue-700 focus:ring-4 focus:ring-blue-100"
              >
                {students.map((s) => (
                  <option key={s.id} value={s.id}>{s.name}</option>
                ))}
              </select>
            </div>

            <div className="grid grid-cols-2 gap-4">
              <div>
                <label htmlFor="date" className="block text-sm font-semibold text-slate-700">
                  Date
                </label>
                <input
                  id="date" name="date" type="date" required
                  className="mt-2 w-full rounded-xl border border-slate-200 px-4 py-3 outline-none focus:border-blue-700 focus:ring-4 focus:ring-blue-100"
                />
              </div>
              <div>
                <label htmlFor="time" className="block text-sm font-semibold text-slate-700">
                  Start time
                </label>
                <input
                  id="time" name="time" type="time" required
                  className="mt-2 w-full rounded-xl border border-slate-200 px-4 py-3 outline-none focus:border-blue-700 focus:ring-4 focus:ring-blue-100"
                />
              </div>
            </div>

            <div>
              <label htmlFor="duration" className="block text-sm font-semibold text-slate-700">
                Duration
              </label>
              <select
                id="duration" name="duration" defaultValue="60"
                className="mt-2 w-full rounded-xl border border-slate-200 px-4 py-3 outline-none focus:border-blue-700 focus:ring-4 focus:ring-blue-100"
              >
                <option value="30">30 minutes</option>
                <option value="45">45 minutes</option>
                <option value="60">60 minutes</option>
                <option value="90">90 minutes</option>
              </select>
            </div>

            <div>
              <label htmlFor="topic" className="block text-sm font-semibold text-slate-700">
                Topic (optional)
              </label>
              <input
                id="topic" name="topic" type="text" placeholder="Conversational practice"
                className="mt-2 w-full rounded-xl border border-slate-200 px-4 py-3 outline-none focus:border-blue-700 focus:ring-4 focus:ring-blue-100"
              />
            </div>

            <div className="flex justify-end gap-3 border-t border-slate-100 pt-6">
              <Link href="/dashboard/calendar" className="rounded-xl border border-slate-200 px-4 py-3 text-sm font-semibold text-slate-700 hover:bg-slate-50">
                Cancel
              </Link>
              <button type="submit" className="rounded-xl bg-blue-800 px-4 py-3 text-sm font-semibold text-white hover:bg-blue-900">
                Schedule lesson
              </button>
            </div>
          </form>
        )}
      </div>
    </div>
  );
}