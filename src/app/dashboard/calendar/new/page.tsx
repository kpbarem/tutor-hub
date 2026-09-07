import Link from "next/link";
import { createClient } from "@/lib/supabase/server";
import { getTutorAccountId } from "@/lib/get-tutor-account";
import { NewLessonForm } from "@/components/new-lesson-form";

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
          <NewLessonForm students={students} />
        )}
      </div>
    </div>
  );
}