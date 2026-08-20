
import { InviteButton } from "@/components/invite-button";
import { assignHomework, toggleHomeworkStatusTutor } from "./homework/actions";
import { notFound } from "next/navigation";
import { CalendarDays, Mail, MapPin, Pencil, WalletCards, MessageCircle } from "lucide-react";
import { createClient } from "@/lib/supabase/server";
import { createPaymentRequest } from "./charge/actions";
import { CopyLinkButton } from "@/components/copy-link-button";
import Link from "next/link"
import { NotesEditor } from "@/components/notes-editor";

export default async function StudentPage({
  params,
  searchParams,
}: {
  params: Promise<{ id: string }>;
  searchParams: Promise<{ payment?: string; url?: string }>;
}) {
  const { id } = await params;
  const { payment, url } = await searchParams;
  const supabase = await createClient();

  const { data: student } = await supabase
    .from("students")
    .select("id, name, email, timezone, language, level, goals, private_notes")
    .eq("id", id)
    .single();

  if (!student) notFound();

  const avatar = student.name.split(" ").map((n: string) => n[0]).join("").slice(0, 2).toUpperCase();

  const { data: payments } = await supabase
    .from("payments")
    .select("id, amount_cents, status, created_at")
    .eq("student_id", id)
    .order("created_at", { ascending: false });

  const outstandingCents = (payments ?? [])
    .filter((p) => p.status === "pending")
    .reduce((sum, p) => sum + p.amount_cents, 0);
  const { data: homework } = await supabase
    .from("homework")
    .select("id, title, description, due_date, status, submission_path")
    .eq("student_id", id)
    .order("created_at", { ascending: false });

  const homeworkWithUrls = await Promise.all(
    (homework ?? []).map(async (hw) => {
      let submissionUrl: string | null = null;
      if (hw.submission_path) {
        const { data } = await supabase.storage
          .from("homework-submissions")
          .createSignedUrl(hw.submission_path, 60 * 60); // valid for 1 hour
        submissionUrl = data?.signedUrl ?? null;
      }
      return { ...hw, submissionUrl };
    })
  );

  return (
    <div className="mx-auto max-w-6xl space-y-6">
      <div className="rounded-2xl border border-blue-900 bg-blue-900 p-6 text-white shadow-sm">
        <div className="flex flex-col gap-5 sm:flex-row sm:items-center">
          <span className="grid h-20 w-20 place-items-center rounded-3xl bg-blue-100 text-xl font-bold text-blue-900">
            {avatar}
          </span>
          <div className="flex-1">
            <div className="flex flex-wrap items-center gap-3">
              <h1 className="text-3xl font-bold">{student.name}</h1>
              <span className="rounded-full bg-emerald-50 px-3 py-1 text-xs font-semibold text-emerald-700">
                Active
              </span>
            </div>
            <div className="mt-3 flex flex-wrap gap-4 text-sm text-slate-500">
              <span className="flex items-center gap-1.5"><Mail size={15} />{student.email}</span>
              <span className="flex items-center gap-1.5"><MapPin size={15} />{student.timezone}</span>
            </div>
          </div>
          <button className="inline-flex items-center justify-center gap-2 rounded-xl border border-slate-200 px-4 py-2.5 text-sm font-semibold">
            <Pencil size={16} /> Edit
          </button>
          <Link
            href={`/dashboard/students/${student.id}/messages`}
            className="inline-flex items-center justify-center gap-2 rounded-xl bg-blue-800 px-4 py-2.5 text-sm font-semibold text-white hover:bg-blue-900"
          >
            <MessageCircle size={16} /> Messages
          </Link>
        </div>
      </div>

      <div className="grid gap-6 lg:grid-cols-5">
        <div className="space-y-6 lg:col-span-3">
          <section className="rounded-2xl border border-slate-200 bg-white p-6 shadow-sm">
            <h2 className="font-semibold">Learning profile</h2>
            <div className="mt-5 grid gap-4 sm:grid-cols-2">
              <div className="rounded-xl bg-slate-50 p-4">
                <p className="text-xs uppercase tracking-wide text-slate-500">Language</p>
                <p className="mt-1 font-semibold">{student.language ?? "Not set"}</p>
              </div>
              <div className="rounded-xl bg-slate-50 p-4">
                <p className="text-xs uppercase tracking-wide text-slate-500">Current level</p>
                <p className="mt-1 font-semibold">{student.level ?? "Not set"}</p>
              </div>
            </div>
            <div className="mt-4">
              <p className="text-sm font-semibold">Goals</p>
              <p className="mt-2 text-sm leading-6 text-slate-600">
                {student.goals || "No goals added yet."}
              </p>
            </div>
          </section>
          <section className="rounded-2xl border border-slate-200 bg-white p-6 shadow-sm">
            <h2 className="font-semibold">Private tutor notes</h2>
            <NotesEditor studentId={student.id} initialNotes={student.private_notes ?? ""} />
          </section>
          <section className="rounded-2xl border border-slate-200 bg-white p-6 shadow-sm">
            <h2 className="font-semibold">Homework</h2>

            <form action={assignHomework} className="mt-4 space-y-3 border-b border-slate-100 pb-5">
              <input type="hidden" name="studentId" value={student.id} />
              <input
                name="title" type="text" required placeholder="Assignment title"
                className="w-full rounded-xl border border-slate-200 px-4 py-2.5 text-sm outline-none focus:border-blue-700 focus:ring-4 focus:ring-blue-100"
              />
              <textarea
                name="description" rows={2} placeholder="Instructions (optional)"
                className="w-full resize-none rounded-xl border border-slate-200 px-4 py-2.5 text-sm outline-none focus:border-blue-700 focus:ring-4 focus:ring-blue-100"
              />
              <div className="flex gap-2">
                <input
                  name="dueDate" type="date"
                  className="rounded-xl border border-slate-200 px-4 py-2.5 text-sm outline-none focus:border-blue-700 focus:ring-4 focus:ring-blue-100"
                />
                <button type="submit" className="ml-auto rounded-xl bg-blue-800 px-4 py-2.5 text-sm font-semibold text-white hover:bg-blue-900">
                  Assign
                </button>
              </div>
            </form>

            <div className="mt-4 space-y-2">
              {!homework || homework.length === 0 ? (
                <p className="text-sm text-slate-500">No homework assigned yet.</p>
              ) : (
                homeworkWithUrls.map((hw) => (
                  <div key={hw.id} className="rounded-xl bg-slate-50 p-4">
                    <div className="flex items-start justify-between gap-3">
                      <div>
                        <p className={"font-semibold " + (hw.status === "completed" ? "text-slate-400 line-through" : "")}>
                          {hw.title}
                        </p>
                        {hw.description && <p className="mt-1 text-sm text-slate-500">{hw.description}</p>}
                        {hw.due_date && (
                          <p className="mt-1 text-xs text-slate-400">
                            Due {new Intl.DateTimeFormat("en-US", { month: "short", day: "numeric" }).format(new Date(hw.due_date))}
                          </p>
                        )}
                        {hw.submissionUrl && (
                          <a
                            href={hw.submissionUrl}
                            target="_blank"
                            rel="noopener noreferrer"
                            className="mt-2 inline-block text-xs font-semibold text-blue-800 hover:text-blue-900"
                          >
                            View submission →
                          </a>
                        )}
                      </div>
                      <form
                        action={async () => {
                          "use server";
                          await toggleHomeworkStatusTutor(hw.id, student.id, hw.status === "completed" ? "assigned" : "completed");
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
          </section>
        </div>

        <div className="space-y-6 lg:col-span-2">
          <section className="rounded-2xl border border-slate-200 bg-white p-6 shadow-sm">
            <h2 className="font-semibold">Account snapshot</h2>
            <div className="mt-5 space-y-4">
              <div className="flex gap-3">
                <span className="grid h-10 w-10 place-items-center rounded-xl bg-blue-50 text-blue-800"><CalendarDays size={18} /></span>
                <div>
                  <p className="text-sm text-slate-500">Next lesson</p>
                  <p className="font-semibold">No lessons scheduled yet</p>
                </div>
              </div>
              <div className="flex gap-3">
                <span className="grid h-10 w-10 place-items-center rounded-xl bg-amber-50 text-amber-600"><WalletCards size={18} /></span>
                <div>
                  <p className="text-sm text-slate-500">Outstanding balance</p>
                  <p className="font-semibold">${(outstandingCents / 100).toFixed(2)}</p>
                </div>
              </div>
            </div>

            {payment === "success" && (
              <p className="mt-4 rounded-xl bg-emerald-50 p-3 text-sm font-semibold text-emerald-700">
                Checkout completed — payment will show as confirmed once processing finishes.
              </p>
            )}
            {payment === "cancelled" && (
              <p className="mt-4 rounded-xl bg-slate-50 p-3 text-sm font-semibold text-slate-600">
                Checkout was cancelled — no charge was made.
              </p>
            )}

            {payment === "link" && url && (
              <div className="mt-4 space-y-2 rounded-xl bg-blue-50 p-4">
                <p className="text-sm font-semibold text-blue-900">Payment link ready to send</p>
                <p className="truncate text-xs text-blue-700">{url}</p>
                <CopyLinkButton url={url} />
              </div>
            )}

            <form action={createPaymentRequest} className="mt-5 border-t border-slate-100 pt-5">
              <input type="hidden" name="studentId" value={student.id} />
              <label htmlFor="amount" className="block text-sm font-semibold text-slate-700">
                Request payment (USD)
              </label>
              <div className="mt-2 flex gap-2">
                <input
                  id="amount" name="amount" type="number" min="1" step="0.01" required
                  placeholder="50.00"
                  className="w-full rounded-xl border border-slate-200 px-4 py-2.5 text-sm outline-none focus:border-blue-700 focus:ring-4 focus:ring-blue-100"
                />
                <button type="submit" className="whitespace-nowrap rounded-xl bg-blue-800 px-4 py-2.5 text-sm font-semibold text-white hover:bg-blue-900">
                  Send request
                </button>
              </div>
            </form>
          </section>

          <section className="rounded-2xl border border-slate-200 bg-white p-6 shadow-sm">
            <h2 className="font-semibold">Payment history</h2>
            <div className="mt-4 space-y-2">
              {!payments || payments.length === 0 ? (
                <p className="text-sm text-slate-500">No payment requests yet.</p>
              ) : (
                payments.map((p) => (
                  <div key={p.id} className="flex items-center justify-between rounded-xl bg-slate-50 px-4 py-3">
                    <div>
                      <p className="text-sm font-semibold">${(p.amount_cents / 100).toFixed(2)}</p>
                      <p className="text-xs text-slate-500">
                        {new Intl.DateTimeFormat("en-US", { month: "short", day: "numeric", year: "numeric" }).format(new Date(p.created_at))}
                      </p>
                    </div>
                    <span
                      className={
                        "rounded-full px-3 py-1 text-xs font-semibold " +
                        (p.status === "paid"
                          ? "bg-emerald-50 text-emerald-700"
                          : p.status === "pending"
                            ? "bg-amber-50 text-amber-700"
                            : "bg-red-50 text-red-700")
                      }
                    >
                      {p.status}
                    </span>
                  </div>
                ))
              )}
            </div>
          </section>

          <section className="rounded-2xl border border-slate-200 bg-blue-800 p-6 text-white shadow-sm">
            <p className="text-sm text-blue-100">Student portal</p>
            <h2 className="mt-2 text-xl font-bold">Invite {student.name.split(" ")[0]}</h2>
            <p className="mt-2 text-sm leading-6 text-blue-100">
              Give this student access to upcoming lessons, homework, files, and payment history.
            </p>
            <InviteButton studentId={student.id} email={student.email} />
          </section>
        </div>
      </div >
    </div >
  );
}