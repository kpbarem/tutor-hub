import Link from "next/link";
import { Plus, Search } from "lucide-react";
import { StudentRow } from "@/components/student-row";
import { createClient } from "@/lib/supabase/server";
import { getTutorAccountId } from "@/lib/get-tutor-account";

export default async function StudentsPage() {
  const supabase = await createClient();
  const tutorAccountId = await getTutorAccountId(supabase);

  const { data: rows } = await supabase
    .from("students")
    .select("id, name, email, timezone, language, level")
    .eq("tutor_account_id", tutorAccountId)
    .order("created_at", { ascending: false });

  const { data: pendingPayments } = await supabase
    .from("payments")
    .select("student_id, amount_cents")
    .eq("tutor_account_id", tutorAccountId)
    .eq("status", "pending");

  const balanceByStudent = new Map<string, number>();
  for (const payment of pendingPayments ?? []) {
    const current = balanceByStudent.get(payment.student_id) ?? 0;
    balanceByStudent.set(payment.student_id, current + payment.amount_cents);
  }

  const students = (rows ?? []).map((s) => ({
    ...s,
    language: s.language ?? "—",
    level: s.level ?? "—",
    balance: (balanceByStudent.get(s.id) ?? 0) / 100,
    avatar: s.name.split(" ").map((n: string) => n[0]).join("").slice(0, 2).toUpperCase(),
  }));

  return (
    <div className="mx-auto max-w-7xl">
      <div className="flex flex-col justify-between gap-4 sm:flex-row sm:items-end">
        <div>
          <h1 className="text-3xl font-bold">Students</h1>
          <p className="mt-2 text-slate-500">
            Manage contact details, goals, notes, and account balances.
          </p>
        </div>

        <Link
          href="/dashboard/students/new"
          className="inline-flex items-center justify-center gap-2 rounded-xl bg-blue-800 px-4 py-3 text-sm font-semibold text-white hover:bg-blue-900"
        >
          <Plus size={18} />
          Add student
        </Link>
      </div>

      <div className="mt-7 rounded-2xl border border-slate-200 bg-white shadow-sm">
        <div className="border-b border-slate-100 p-5">
          <div className="relative max-w-sm">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" size={17} />
            <input
              className="w-full rounded-xl border border-slate-200 bg-slate-50 py-2.5 pl-10 pr-4 text-sm outline-none"
              placeholder="Search students"
            />
          </div>
        </div>

        <div className="overflow-x-auto">
          <table className="w-full text-left">
            <thead className="bg-slate-50 text-xs uppercase tracking-wide text-slate-500">
              <tr>
                <th className="px-5 py-3">Student</th>
                <th className="px-5 py-3">Course</th>
                <th className="px-5 py-3">Timezone</th>
                <th className="px-5 py-3">Balance</th>
                <th className="px-5 py-3"></th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100">
              {students.length === 0 ? (
                <tr>
                  <td colSpan={5} className="px-5 py-10 text-center text-slate-500">
                    No students yet — add your first one to get started.
                  </td>
                </tr>
              ) : (
                students.map((student) => <StudentRow key={student.id} student={student} />)
              )}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}