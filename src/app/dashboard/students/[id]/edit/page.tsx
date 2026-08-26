import Link from "next/link";
import { notFound } from "next/navigation";
import { createClient } from "@/lib/supabase/server";
import { updateStudent } from "./actions";

export default async function EditStudentPage({ params }: { params: Promise<{ id: string }> }) {
  const { id } = await params;
  const supabase = await createClient();

  const { data: student } = await supabase
    .from("students")
    .select("id, name, email, timezone, language, level, goals")
    .eq("id", id)
    .single();

  if (!student) notFound();

  return (
    <div className="mx-auto max-w-2xl">
      <Link href={`/dashboard/students/${id}`} className="text-sm font-semibold text-blue-800 hover:text-blue-900">
        ← Back to student
      </Link>
      <h1 className="mt-4 text-3xl font-bold">Edit {student.name}</h1>

      <div className="mt-8 rounded-2xl border border-slate-200 bg-white p-6 shadow-sm">
        <form action={updateStudent} className="space-y-5">
          <input type="hidden" name="studentId" value={student.id} />

          <div>
            <label className="block text-sm font-semibold text-slate-700">Full name</label>
            <input
              name="name" type="text" required defaultValue={student.name}
              className="mt-2 w-full rounded-xl border border-slate-200 px-4 py-3 outline-none focus:border-blue-700 focus:ring-4 focus:ring-blue-100"
            />
          </div>
          <div>
            <label className="block text-sm font-semibold text-slate-700">Email</label>
            <input
              name="email" type="email" required defaultValue={student.email}
              className="mt-2 w-full rounded-xl border border-slate-200 px-4 py-3 outline-none focus:border-blue-700 focus:ring-4 focus:ring-blue-100"
            />
          </div>
          <div>
            <label className="block text-sm font-semibold text-slate-700">Timezone</label>
            <input
              name="timezone" type="text" defaultValue={student.timezone}
              className="mt-2 w-full rounded-xl border border-slate-200 px-4 py-3 outline-none focus:border-blue-700 focus:ring-4 focus:ring-blue-100"
            />
          </div>
          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-semibold text-slate-700">Language</label>
              <input
                name="language" type="text" defaultValue={student.language ?? ""}
                className="mt-2 w-full rounded-xl border border-slate-200 px-4 py-3 outline-none focus:border-blue-700 focus:ring-4 focus:ring-blue-100"
              />
            </div>
            <div>
              <label className="block text-sm font-semibold text-slate-700">Level</label>
              <input
                name="level" type="text" defaultValue={student.level ?? ""}
                className="mt-2 w-full rounded-xl border border-slate-200 px-4 py-3 outline-none focus:border-blue-700 focus:ring-4 focus:ring-blue-100"
              />
            </div>
          </div>
          <div>
            <label className="block text-sm font-semibold text-slate-700">Goals</label>
            <textarea
              name="goals" rows={3} defaultValue={student.goals ?? ""}
              className="mt-2 w-full resize-none rounded-xl border border-slate-200 px-4 py-3 outline-none focus:border-blue-700 focus:ring-4 focus:ring-blue-100"
            />
          </div>

          <div className="flex justify-end gap-3 border-t border-slate-100 pt-5">
            <Link href={`/dashboard/students/${id}`} className="rounded-xl border border-slate-200 px-4 py-3 text-sm font-semibold text-slate-700 hover:bg-slate-50">
              Cancel
            </Link>
            <button type="submit" className="rounded-xl bg-blue-800 px-4 py-3 text-sm font-semibold text-white hover:bg-blue-900">
              Save changes
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}