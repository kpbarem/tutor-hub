import { notFound } from "next/navigation";
import Link from "next/link";
import { ArrowLeft } from "lucide-react";
import { createClient } from "@/lib/supabase/server";

export default async function LessonCallPage({ params }: { params: Promise<{ id: string }> }) {
  const { id } = await params;
  const supabase = await createClient();

  const { data: lesson } = await supabase
    .from("lessons")
    .select("id, video_room_url, topic, students(name)")
    .eq("id", id)
    .single();

  if (!lesson) notFound();

  const studentName = (lesson.students as unknown as { name: string } | null)?.name ?? "Student";

  return (
    <div className="flex h-[calc(100vh-6rem)] flex-col">
      <div className="flex items-center gap-3 pb-4">
        <Link href="/dashboard/calendar" className="text-slate-500 hover:text-slate-800">
          <ArrowLeft size={20} />
        </Link>
        <div>
          <h1 className="text-lg font-bold">Lesson with {studentName}</h1>
          {lesson.topic && <p className="text-sm text-slate-500">{lesson.topic}</p>}
        </div>
      </div>

      {lesson.video_room_url ? (
        <iframe
          src={lesson.video_room_url}
          allow="camera; microphone; fullscreen; display-capture; autoplay"
          className="flex-1 rounded-2xl border border-slate-200"
        />
      ) : (
        <div className="flex flex-1 items-center justify-center rounded-2xl border border-slate-200 bg-slate-50">
          <p className="text-sm text-slate-500">No video room available for this lesson.</p>
        </div>
      )}
    </div>
  );
}