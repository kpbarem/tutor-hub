"use client";

import Link from "next/link";
import { useState } from "react";
import { createLesson } from "@/app/dashboard/calendar/new/actions";
import { LessonDateTimeFields } from "@/components/lesson-datetime-fields";

export function NewLessonForm({ students }: { students: { id: string; name: string }[] }) {
  const [status, setStatus] = useState<"idle" | "saving" | "error">("idle");
  const [errorMsg, setErrorMsg] = useState("");

  async function handleSubmit(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault();
    setStatus("saving");
    const formData = new FormData(e.currentTarget);
    try {
      await createLesson(formData);
    } catch (err) {
      setErrorMsg(err instanceof Error ? err.message : "Something went wrong.");
      setStatus("error");
    }
  }

  return (
    <form onSubmit={handleSubmit} className="space-y-6">
      <div>
        <label htmlFor="studentId" className="block text-sm font-semibold text-slate-700">
          Student
        </label>
        <select
          id="studentId"
          name="studentId"
          required
          className="mt-2 w-full rounded-xl border border-slate-200 px-4 py-3 outline-none focus:border-blue-700 focus:ring-4 focus:ring-blue-100"
        >
          {students.map((s) => (
            <option key={s.id} value={s.id}>{s.name}</option>
          ))}
        </select>
      </div>

      <LessonDateTimeFields />

      <div>
        <label htmlFor="duration" className="block text-sm font-semibold text-slate-700">
          Duration
        </label>
        <select
          id="duration" name="duration" defaultValue="60"
          className="mt-2 w-full rounded-xl border border-slate-200 px-4 py-3 outline-none focus:border-blue-700 focus:ring-4 focus:ring-blue-100"
        >
          <option value="30">30 minutes</option>
          <option value="45">45 minutes</option>
          <option value="60">60 minutes</option>
          <option value="90">90 minutes</option>
        </select>
      </div>

      <div>
        <label htmlFor="topic" className="block text-sm font-semibold text-slate-700">
          Topic (optional)
        </label>
        <input
          id="topic" name="topic" type="text" placeholder="Conversational practice"
          className="mt-2 w-full rounded-xl border border-slate-200 px-4 py-3 outline-none focus:border-blue-700 focus:ring-4 focus:ring-blue-100"
        />
      </div>

      {status === "error" && (
        <p className="rounded-xl bg-red-50 p-3 text-sm font-semibold text-red-700">{errorMsg}</p>
      )}

      <div className="flex justify-end gap-3 border-t border-slate-100 pt-6">
        <Link href="/dashboard/calendar" className="rounded-xl border border-slate-200 px-4 py-3 text-sm font-semibold text-slate-700 hover:bg-slate-50">
          Cancel
        </Link>
        <button type="submit" disabled={status === "saving"} className="rounded-xl bg-blue-800 px-4 py-3 text-sm font-semibold text-white hover:bg-blue-900 disabled:opacity-50">
          {status === "saving" ? "Scheduling…" : "Schedule lesson"}
        </button>
      </div>
    </form>
  );
}