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

  const { data: ownProfile } = await supabase
    .from("profiles")
    .select("role")
    .eq("id", user.id)
    .single();

  if (ownProfile?.role === "tutor") {
    redirect("/dashboard");
  }

  let student = await getStudentRecord(supabase);

  if (!student) {
    // First time this login has ever reached the portal: make sure a
    // profile exists, then try to claim a matching, unclaimed student row.
    const { data: existingProfile } = await supabase
      .from("profiles")
      .select("id")
      .eq("id", user.id)
      .single();

    if (!existingProfile) {
      await supabase.from("profiles").insert({
        id: user.id,
        role: "student",
        display_name: user.email?.split("@")[0] ?? "Student",
      });
    }

    if (user.email) {
      await supabase
        .from("students")
        .update({ profile_id: user.id })
        .eq("email", user.email)
        .is("profile_id", null);
    }

    student = await getStudentRecord(supabase);
  }

  if (!student) {
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