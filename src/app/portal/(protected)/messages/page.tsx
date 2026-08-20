import Link from "next/link";
import { ArrowLeft } from "lucide-react";
import { createClient } from "@/lib/supabase/server";
import { getStudentRecord } from "@/lib/get-student-record";
import { ChatThread } from "@/components/chat-thread";

export default async function PortalMessagesPage() {
  const supabase = await createClient();
  const student = await getStudentRecord(supabase);
  if (!student) return null; // layout already guards this

  const { data: messages } = await supabase
    .from("messages")
    .select("id, sender_role, body, created_at")
    .eq("student_id", student.id)
    .order("created_at", { ascending: true });

  return (
    <div className="flex h-[calc(100vh-10rem)] flex-col">
      <div className="flex items-center gap-3 border-b border-slate-200 pb-4">
        <Link href="/portal" className="text-slate-500 hover:text-slate-800">
          <ArrowLeft size={20} />
        </Link>
        <div>
          <h1 className="text-xl font-bold">Your tutor</h1>
          <p className="text-sm text-slate-500">Message thread</p>
        </div>
      </div>

      <ChatThread
        studentId={student.id}
        tutorAccountId={student.tutor_account_id}
        initialMessages={messages ?? []}
        role="student"
      />
    </div>
  );
}