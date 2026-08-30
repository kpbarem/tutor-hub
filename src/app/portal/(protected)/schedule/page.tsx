import Link from "next/link";
import { ArrowLeft } from "lucide-react";
import { createLessonAsStudent } from "./actions";
import { LessonDateTimeFields } from "@/components/lesson-datetime-fields";


export default function ScheduleLessonPage() {
  return (
    <div className="mx-auto max-w-lg">
      <div className="flex items-center gap-3 pb-5">
        <Link href="/portal" className="text-slate-500 hover:text-slate-800">
          <ArrowLeft size={20} />
        </Link>
        <h1 className="text-xl font-bold">Schedule a lesson</h1>
      </div>

      <div className="rounded-2xl border border-slate-200 bg-white p-6 shadow-sm">
        <form action={createLessonAsStudent} className="space-y-5">
            <LessonDateTimeFields />
          <div>
            <label className="block text-sm font-semibold text-slate-700">Duration</label>
            <select name="duration" defaultValue="60" className="mt-2 w-full rounded-xl border border-slate-200 px-4 py-3 outline-none focus:border-blue-700 focus:ring-4 focus:ring-blue-100">
              <option value="30">30 minutes</option>
              <option value="45">45 minutes</option>
              <option value="60">60 minutes</option>
              <option value="90">90 minutes</option>
            </select>
          </div>
          <div>
            <label className="block text-sm font-semibold text-slate-700">Topic (optional)</label>
            <input name="topic" type="text" placeholder="What do you want to work on?" className="mt-2 w-full rounded-xl border border-slate-200 px-4 py-3 outline-none focus:border-blue-700 focus:ring-4 focus:ring-blue-100" />
          </div>
          <button type="submit" className="w-full rounded-xl bg-blue-800 px-4 py-3 text-sm font-semibold text-white hover:bg-blue-900">
            Schedule
          </button>
        </form>
      </div>
    </div>
  );
}