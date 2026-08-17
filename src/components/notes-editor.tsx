"use client";

import { useState } from "react";
import { Check } from "lucide-react";
import { saveNotes } from "@/app/dashboard/students/[id]/notes/actions";

export function NotesEditor({ studentId, initialNotes }: { studentId: string; initialNotes: string }) {
  const [notes, setNotes] = useState(initialNotes);
  const [status, setStatus] = useState<"idle" | "saving" | "saved" | "error">("idle");

  async function handleSave() {
    setStatus("saving");
    try {
      await saveNotes(studentId, notes);
      setStatus("saved");
      setTimeout(() => setStatus("idle"), 2000);
    } catch {
      setStatus("error");
    }
  }

  return (
    <div>
      <textarea
        value={notes}
        onChange={(e) => setNotes(e.target.value)}
        className="mt-4 min-h-40 w-full rounded-xl border border-slate-200 bg-slate-50 p-4 text-sm outline-none"
        placeholder="Add private notes about this student..."
      />
      <div className="mt-3 flex items-center gap-3">
        <button
          onClick={handleSave}
          disabled={status === "saving"}
          className="rounded-xl bg-slate-950 px-4 py-2.5 text-sm font-semibold text-white disabled:opacity-50"
        >
          {status === "saving" ? "Saving…" : "Save notes"}
        </button>
        {status === "saved" && (
          <span className="flex items-center gap-1 text-sm font-semibold text-emerald-600">
            <Check size={16} /> Saved
          </span>
        )}
        {status === "error" && (
          <span className="text-sm font-semibold text-red-600">Failed to save — try again</span>
        )}
      </div>
    </div>
  );
}