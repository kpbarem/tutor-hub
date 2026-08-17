import Link from "next/link";
import { CalendarDays, MessageCircle, WalletCards, BookOpen } from "lucide-react";
import { createClient } from "@/lib/supabase/server";
import { getStudentRecord } from "@/lib/get-student-record";

export default async function PortalPage() {
    const supabase = await createClient();
    const student = await getStudentRecord(supabase);
    if (!student) return null; // layout already guards this; satisfies TypeScript

    const { data: upcomingLessons } = await supabase
        .from("lessons")
        .select("id, starts_at, topic")
        .eq("student_id", student.id)
        .gte("starts_at", new Date().toISOString())
        .order("starts_at", { ascending: true })
        .limit(5);

    const { data: payments } = await supabase
        .from("payments")
        .select("amount_cents, status")
        .eq("student_id", student.id);

    const outstandingCents = (payments ?? [])
        .filter((p) => p.status === "pending")
        .reduce((sum, p) => sum + p.amount_cents, 0);

    return (
        <div className="space-y-6">
            <div className="grid gap-4 sm:grid-cols-2">
                <div className="rounded-2xl border border-slate-200 bg-white p-5 shadow-sm">
                    <div className="flex items-center gap-3">
                        <span className="grid h-10 w-10 place-items-center rounded-xl bg-blue-50 text-blue-800"><CalendarDays size={18} /></span>
                        <p className="font-semibold">Next lesson</p>
                    </div>
                    <p className="mt-3 text-sm text-slate-600">
                        {upcomingLessons && upcomingLessons.length > 0
                            ? new Intl.DateTimeFormat("en-US", { weekday: "long", month: "short", day: "numeric", hour: "numeric", minute: "2-digit" }).format(new Date(upcomingLessons[0].starts_at))
                            : "No lessons scheduled yet"}
                    </p>
                </div>

                <div className="rounded-2xl border border-slate-200 bg-white p-5 shadow-sm">
                    <div className="flex items-center gap-3">
                        <span className="grid h-10 w-10 place-items-center rounded-xl bg-amber-50 text-amber-600"><WalletCards size={18} /></span>
                        <p className="font-semibold">Balance due</p>
                    </div>
                    <p className="mt-3 text-2xl font-bold">${(outstandingCents / 100).toFixed(2)}</p>
                </div>
            </div>

            <div className="rounded-2xl border border-slate-200 bg-white shadow-sm">
                <div className="border-b border-slate-100 p-5">
                    <h2 className="font-semibold">Upcoming lessons</h2>
                </div>
                <div className="divide-y divide-slate-100">
                    {!upcomingLessons || upcomingLessons.length === 0 ? (
                        <p className="p-6 text-center text-sm text-slate-500">No upcoming lessons.</p>
                    ) : (
                        upcomingLessons.map((lesson) => (
                            <div key={lesson.id} className="flex items-center justify-between p-5">
                                <div>
                                    <p className="font-semibold">
                                        {new Intl.DateTimeFormat("en-US", { weekday: "short", month: "short", day: "numeric" }).format(new Date(lesson.starts_at))}
                                    </p>
                                    {lesson.topic && <p className="text-sm text-slate-500">{lesson.topic}</p>}
                                </div>
                                <p className="text-sm text-slate-500">
                                    {new Intl.DateTimeFormat("en-US", { hour: "numeric", minute: "2-digit" }).format(new Date(lesson.starts_at))}
                                </p>
                            </div>
                        ))
                    )}
                </div>
            </div>

            <Link
                href="/portal/messages"
                className="flex items-center justify-center gap-2 rounded-2xl bg-blue-800 px-4 py-4 text-sm font-semibold text-white hover:bg-blue-900"
            >
                <MessageCircle size={18} /> Message your tutor
            </Link>
            <Link
                href="/portal/homework"
                className="flex items-center justify-center gap-2 rounded-2xl border border-slate-200 bg-white px-4 py-4 text-sm font-semibold text-slate-700 hover:bg-slate-50"
            >
                <BookOpen size={18} /> View homework
            </Link>
        </div>
    );
}