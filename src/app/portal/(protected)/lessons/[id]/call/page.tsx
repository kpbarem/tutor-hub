import { notFound } from "next/navigation";
import Link from "next/link";
import { ArrowLeft } from "lucide-react";
import { createClient } from "@/lib/supabase/server";

export default async function PortalLessonCallPage({ params }: { params: Promise<{ id: string }> }) {
  const { id } = await params;
  const supabase = await createClient();

  const { data: lesson } = await supabase
    .from("lessons")
    .select("id, video_room_url, topic")
    .eq("id", id)
    .single();

  if (!lesson) notFound();

  return (
    <div className="flex h-[calc(100vh-10rem)] flex-col">
      <div className="flex items-center gap-3 pb-4">
        <Link href="/portal" className="text-slate-500 hover:text-slate-800">
          <ArrowLeft size={20} />
        </Link>
        <h1 className="text-lg font-bold">{lesson.topic || "Lesson"}</h1>
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