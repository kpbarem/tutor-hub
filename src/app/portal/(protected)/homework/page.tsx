import Link from "next/link";
import { ArrowLeft } from "lucide-react";
import { createClient } from "@/lib/supabase/server";
import { getStudentRecord } from "@/lib/get-student-record";
import { toggleHomeworkStatusStudent } from "./actions";
import { HomeworkUpload } from "@/components/homework-upload";

export default async function PortalHomeworkPage() {
  const supabase = await createClient();
  const student = await getStudentRecord(supabase);
  if (!student) return null;

  const { data: homework } = await supabase
    .from("homework")
    .select("id, title, description, due_date, status, submission_path")
    .eq("student_id", student.id)
    .order("created_at", { ascending: false });

  return (
    <div>
      <div className="flex items-center gap-3 pb-5">
        <Link href="/portal" className="text-slate-500 hover:text-slate-800">
          <ArrowLeft size={20} />
        </Link>
        <h1 className="text-xl font-bold">Homework</h1>
      </div>

      <div className="space-y-3">
        {!homework || homework.length === 0 ? (
          <p className="text-sm text-slate-500">Nothing assigned yet.</p>
        ) : (
          homework.map((hw) => (
            <div key={hw.id} className="rounded-2xl border border-slate-200 bg-white p-5 shadow-sm">
              <div className="flex items-start justify-between gap-3">
                <div>
                  <p className={"font-semibold " + (hw.status === "completed" ? "text-slate-400 line-through" : "")}>
                    {hw.title}
                  </p>
                  {hw.description && <p className="mt-1 text-sm text-slate-600">{hw.description}</p>}
                  {hw.due_date && (
                    <p className="mt-1 text-xs text-slate-400">
                      Due {new Intl.DateTimeFormat("en-US", { month: "short", day: "numeric" }).format(new Date(hw.due_date))}
                    </p>
                  )}
                  <HomeworkUpload
                    homeworkId={hw.id}
                    currentFileName={hw.submission_path ? hw.submission_path.split("/").slice(1).join("/") : null}
                  />
                </div>
                <form
                  action={async () => {
                    "use server";
                    await toggleHomeworkStatusStudent(hw.id, hw.status === "completed" ? "assigned" : "completed");
                  }}
                >
                  <button
                    type="submit"
                    className={
                      "whitespace-nowrap rounded-full px-3 py-1 text-xs font-semibold " +
                      (hw.status === "completed" ? "bg-emerald-50 text-emerald-700" : "bg-amber-50 text-amber-700")
                    }
                  >
                    {hw.status === "completed" ? "Completed" : "Mark done"}
                  </button>
                </form>
              </div>
            </div>
          ))
        )}
      </div>
    </div>
  );
}