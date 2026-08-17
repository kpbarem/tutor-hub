import Link from "next/link";
import { ArrowLeft } from "lucide-react";
import { createClient } from "@/lib/supabase/server";
import { getTutorAccountId } from "@/lib/get-tutor-account";
import { ChatThread } from "@/components/chat-thread";

export default async function StudentMessagesPage({ params }: { params: Promise<{ id: string }> }) {
  const { id } = await params;
  const supabase = await createClient();
  const tutorAccountId = await getTutorAccountId(supabase);

  const { data: student } = await supabase
    .from("students")
    .select("id, name")
    .eq("id", id)
    .single();

  const { data: messages } = await supabase
    .from("messages")
    .select("id, sender_role, body, created_at")
    .eq("student_id", id)
    .order("created_at", { ascending: true });

  if (!student || !tutorAccountId) {
    return <p className="p-10 text-center text-slate-500">Student not found.</p>;
  }

  return (
    <div className="mx-auto flex h-[calc(100vh-8rem)] max-w-3xl flex-col">
      <div className="flex items-center gap-3 border-b border-slate-200 pb-4">
        <Link href={`/dashboard/students/${id}`} className="text-slate-500 hover:text-slate-800">
          <ArrowLeft size={20} />
        </Link>
        <div>
          <h1 className="text-xl font-bold">{student.name}</h1>
          <p className="text-sm text-slate-500">Message thread</p>
        </div>
      </div>
      <ChatThread
        studentId={student.id}
        tutorAccountId={tutorAccountId}
        initialMessages={messages ?? []}
        role="tutor"
      />
    </div>
  );
}