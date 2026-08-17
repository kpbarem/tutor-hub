import type { ReactNode } from "react";
import { redirect } from "next/navigation";
import { LogOut } from "lucide-react";
import { createClient } from "@/lib/supabase/server";
import { getStudentRecord } from "@/lib/get-student-record";
import { signOutStudent } from "./logout/actions";

export default async function PortalLayout({ children }: { children: ReactNode }) {
  const supabase = await createClient();
  const { data: { user } } = await supabase.auth.getUser();

  if (!user) {
    redirect("/portal/login");
  }

  const student = await getStudentRecord(supabase);

  if (!student) {
    // Logged in, but not linked to any student record — not a valid portal user.
    redirect("/portal/login");
  }

  return (
    <div className="min-h-screen bg-slate-50">
      <header className="flex items-center justify-between border-b border-slate-200 bg-white px-6 py-4">
        <div>
          <p className="text-xs font-semibold uppercase tracking-wide text-blue-800">Student portal</p>
          <h1 className="text-lg font-bold">{student.name}</h1>
        </div>
        <form action={signOutStudent}>
          <button type="submit" className="flex items-center gap-2 text-sm font-medium text-slate-600 hover:text-slate-900">
            <LogOut size={16} /> Sign out
          </button>
        </form>
      </header>
      <main className="mx-auto max-w-3xl px-6 py-8">{children}</main>
    </div>
  );
}