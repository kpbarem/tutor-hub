"use client";

import { useState } from "react";
import { createAvailabilityBlock } from "@/app/dashboard/availability/actions";

export function AvailabilityForm() {
  const [startDate, setStartDate] = useState("");
  const [startTime, setStartTime] = useState("");
  const [endDate, setEndDate] = useState("");
  const [endTime, setEndTime] = useState("");
  const [note, setNote] = useState("");
  const [status, setStatus] = useState<"idle" | "saving" | "error">("idle");
  const [errorMsg, setErrorMsg] = useState("");

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setStatus("saving");
    try {
      const startsAt = new Date(`${startDate}T${startTime}`).toISOString();
      const endsAt = new Date(`${endDate}T${endTime}`).toISOString();
      await createAvailabilityBlock(startsAt, endsAt, note);
      setStartDate(""); setStartTime(""); setEndDate(""); setEndTime(""); setNote("");
      setStatus("idle");
    } catch (err) {
      setErrorMsg(err instanceof Error ? err.message : "Something went wrong.");
      setStatus("error");
    }
  }

  return (
    <form onSubmit={handleSubmit} className="mt-4 space-y-4">
      <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
        <div>
          <label className="block text-sm font-semibold text-slate-700">Start</label>
          <div className="mt-2 flex gap-2">
            <input type="date" required value={startDate} onChange={(e) => setStartDate(e.target.value)} className="w-full rounded-xl border border-slate-200 px-3 py-2.5 text-sm outline-none focus:border-blue-700 focus:ring-4 focus:ring-blue-100" />
            <input type="time" required value={startTime} onChange={(e) => setStartTime(e.target.value)} className="w-full rounded-xl border border-slate-200 px-3 py-2.5 text-sm outline-none focus:border-blue-700 focus:ring-4 focus:ring-blue-100" />
          </div>
        </div>
        <div>
          <label className="block text-sm font-semibold text-slate-700">End</label>
          <div className="mt-2 flex gap-2">
            <input type="date" required value={endDate} onChange={(e) => setEndDate(e.target.value)} className="w-full rounded-xl border border-slate-200 px-3 py-2.5 text-sm outline-none focus:border-blue-700 focus:ring-4 focus:ring-blue-100" />
            <input type="time" required value={endTime} onChange={(e) => setEndTime(e.target.value)} className="w-full rounded-xl border border-slate-200 px-3 py-2.5 text-sm outline-none focus:border-blue-700 focus:ring-4 focus:ring-blue-100" />
          </div>
        </div>
      </div>
      <div>
        <label className="block text-sm font-semibold text-slate-700">Note (optional)</label>
        <input type="text" value={note} onChange={(e) => setNote(e.target.value)} placeholder="Traveling, doctor's appointment, etc." className="mt-2 w-full rounded-xl border border-slate-200 px-4 py-3 text-sm outline-none focus:border-blue-700 focus:ring-4 focus:ring-blue-100" />
      </div>
      {status === "error" && <p className="text-sm text-red-600">{errorMsg}</p>}
      <button type="submit" disabled={status === "saving"} className="rounded-xl bg-blue-800 px-4 py-2.5 text-sm font-semibold text-white hover:bg-blue-900 disabled:opacity-50">
        {status === "saving" ? "Saving…" : "Add block"}
      </button>
    </form>
  );
}