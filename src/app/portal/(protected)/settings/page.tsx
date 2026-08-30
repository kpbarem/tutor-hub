import Link from "next/link";
import { ArrowLeft } from "lucide-react";
import { createClient } from "@/lib/supabase/server";
import { getStudentRecord } from "@/lib/get-student-record";
import { TimezoneForm } from "@/components/timezone-form";
import { updateStudentTimezone } from "./actions";

export default async function PortalSettingsPage() {
    const supabase = await createClient();
    const student = await getStudentRecord(supabase);
    if (!student) return null;

    const { data: fullStudent } = await supabase
        .from("students")
        .select("timezone")
        .eq("id", student.id)
        .single();

    return (
        <div className="mx-auto max-w-lg">
            <div className="flex items-center gap-3 pb-5">
                <Link href="/portal" className="text-slate-500 hover:text-slate-800">
                    <ArrowLeft size={20} />
                </Link>
                <h1 className="text-xl font-bold">Settings</h1>
            </div>

            <div className="rounded-2xl border border-slate-200 bg-white p-6 shadow-sm">
                <h2 className="font-semibold">Your timezone</h2>
                <p className="mt-1 text-sm text-slate-500">Lesson times will display in this timezone.</p>
                <TimezoneForm defaultValue={fullStudent?.timezone} action={updateStudentTimezone} />
            </div>
        </div>
    );
}