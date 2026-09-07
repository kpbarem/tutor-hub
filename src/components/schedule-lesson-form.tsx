"use client";

import Link from "next/link";
import { useState } from "react";
import { ArrowLeft } from "lucide-react";
import { createLessonAsStudent } from "@/app/portal/(protected)/schedule/actions";
import { formatInTimezone } from "@/lib/format-in-timezone";

type Block = { id: string; starts_at: string; ends_at: string; note: string | null };

export function ScheduleLessonForm({ blocks, timezone }: { blocks: Block[]; timezone: string }) {
  const [date, setDate] = useState("");
  const [time, setTime] = useState("");
  const [duration, setDuration] = useState("60");
  const [topic, setTopic] = useState("");
  const [status, setStatus] = useState<"idle" | "saving" | "error">("idle");
  const [errorMsg, setErrorMsg] = useState("");

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setStatus("saving");
    try {
      const startsAtIso = new Date(`${date}T${time}`).toISOString();
      await createLessonAsStudent(startsAtIso, Number(duration), topic);
    } catch (err) {
      setErrorMsg(err instanceof Error ? err.message : "Something went wrong.");
      setStatus("error");
    }
  }

  return (
    <div className="mx-auto max-w-lg">
      <div className="flex items-center gap-3 pb-5">
        <Link href="/portal" className="text-slate-500 hover:text-slate-800">
          <ArrowLeft size={20} />
        </Link>
        <h1 className="text-xl font-bold">Schedule a lesson</h1>
      </div>

      {blocks.length > 0 && (
        <div className="mb-5 rounded-2xl border border-slate-200 bg-slate-50 p-5">
          <h2 className="text-sm font-semibold text-slate-700">Your tutor isn't available during these times:</h2>
          <div className="mt-3 space-y-1.5">
            {blocks.map((block) => (
              <p key={block.id} className="text-sm text-slate-600">
                {formatInTimezone(new Date(block.starts_at), timezone, { weekday: "short", month: "short", day: "numeric", hour: "numeric", minute: "2-digit" })}
                {" – "}
                {formatInTimezone(new Date(block.ends_at), timezone, { hour: "numeric", minute: "2-digit" })}
                {block.note ? ` (${block.note})` : ""}
              </p>
            ))}
          </div>
        </div>
      )}

      <div className="rounded-2xl border border-slate-200 bg-white p-6 shadow-sm">
        <form onSubmit={handleSubmit} className="space-y-5">
          <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
            <div>
              <label className="block text-sm font-semibold text-slate-700">Date</label>
              <input type="date" required value={date} onChange={(e) => setDate(e.target.value)} className="mt-2 w-full rounded-xl border border-slate-200 px-4 py-3 outline-none focus:border-blue-700 focus:ring-4 focus:ring-blue-100" />
            </div>
            <div>
              <label className="block text-sm font-semibold text-slate-700">Start time</label>
              <input type="time" required value={time} onChange={(e) => setTime(e.target.value)} className="mt-2 w-full rounded-xl border border-slate-200 px-4 py-3 outline-none focus:border-blue-700 focus:ring-4 focus:ring-blue-100" />
            </div>
          </div>
          <div>
            <label className="block text-sm font-semibold text-slate-700">Duration</label>
            <select value={duration} onChange={(e) => setDuration(e.target.value)} className="mt-2 w-full rounded-xl border border-slate-200 px-4 py-3 outline-none focus:border-blue-700 focus:ring-4 focus:ring-blue-100">
              <option value="30">30 minutes</option>
              <option value="45">45 minutes</option>
              <option value="60">60 minutes</option>
              <option value="90">90 minutes</option>
            </select>
          </div>
          <div>
            <label className="block text-sm font-semibold text-slate-700">Topic (optional)</label>
            <input type="text" value={topic} onChange={(e) => setTopic(e.target.value)} placeholder="What do you want to work on?" className="mt-2 w-full rounded-xl border border-slate-200 px-4 py-3 outline-none focus:border-blue-700 focus:ring-4 focus:ring-blue-100" />
          </div>

          {status === "error" && (
            <p className="rounded-xl bg-red-50 p-3 text-sm font-semibold text-red-700">{errorMsg}</p>
          )}

          <button type="submit" disabled={status === "saving"} className="w-full rounded-xl bg-blue-800 px-4 py-3 text-sm font-semibold text-white hover:bg-blue-900 disabled:opacity-50">
            {status === "saving" ? "Scheduling…" : "Schedule"}
          </button>
        </form>
      </div>
    </div>
  );
}