import Link from "next/link";
import { createStudent } from "./actions";

export default function NewStudentPage() {
  return (
    <div className="mx-auto max-w-3xl">
      <div>
        <Link
          href="/dashboard/students"
          className="text-sm font-semibold text-blue-800 hover:text-blue-900"
        >
          ← Back to students
        </Link>

        <h1 className="mt-4 text-3xl font-bold text-slate-900">Add student</h1>
        <p className="mt-2 text-slate-500">Add the basic information for a new student.</p>
      </div>

      <div className="mt-8 rounded-2xl border border-slate-200 bg-white p-6 shadow-sm">
        <form action={createStudent} className="space-y-6">
          <div>
            <label htmlFor="name" className="block text-sm font-semibold text-slate-700">
              Full name
            </label>
            <input
              id="name"
              name="name"
              type="text"
              required
              placeholder="Piper Puppy"
              className="mt-2 w-full rounded-xl border border-slate-200 px-4 py-3 outline-none focus:border-blue-700 focus:ring-4 focus:ring-blue-100"
            />
          </div>

          <div>
            <label htmlFor="email" className="block text-sm font-semibold text-slate-700">
              Email
            </label>
            <input
              id="email"
              name="email"
              type="email"
              required
              placeholder="piper@example.com"
              className="mt-2 w-full rounded-xl border border-slate-200 px-4 py-3 outline-none focus:border-blue-700 focus:ring-4 focus:ring-blue-100"
            />
          </div>

          <div>
            <label htmlFor="timezone" className="block text-sm font-semibold text-slate-700">
              Timezone
            </label>
            <input
              id="timezone"
              name="timezone"
              type="text"
              placeholder="GET"
              className="mt-2 w-full rounded-xl border border-slate-200 px-4 py-3 outline-none focus:border-blue-700 focus:ring-4 focus:ring-blue-100"
            />
          </div>

          <div>
            <label htmlFor="goals" className="block text-sm font-semibold text-slate-700">
              Learning goals
            </label>
            <textarea
              id="goals"
              name="goals"
              rows={4}
              placeholder="Improve conversational English"
              className="mt-2 w-full resize-none rounded-xl border border-slate-200 px-4 py-3 outline-none focus:border-blue-700 focus:ring-4 focus:ring-blue-100"
            />
          </div>

          <div className="flex justify-end gap-3 border-t border-slate-100 pt-6">
            <Link
              href="/dashboard/students"
              className="rounded-xl border border-slate-200 px-4 py-3 text-sm font-semibold text-slate-700 hover:bg-slate-50"
            >
              Cancel
            </Link>
            <button
              type="submit"
              className="rounded-xl bg-blue-800 px-4 py-3 text-sm font-semibold text-white hover:bg-blue-900"
            >
              Save student
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}