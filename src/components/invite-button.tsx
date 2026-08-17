"use client";

import { useState } from "react";
import { inviteStudent } from "@/app/dashboard/students/[id]/invite/actions";

export function InviteButton({ studentId, email }: { studentId: string; email: string }) {
  const [status, setStatus] = useState<{ success: boolean; message: string } | null>(null);
  const [loading, setLoading] = useState(false);

  async function handleClick() {
    setLoading(true);
    const result = await inviteStudent(studentId, email);
    setStatus(result);
    setLoading(false);
  }

  return (
    <div>
      <button
        onClick={handleClick}
        disabled={loading}
        className="mt-5 w-full rounded-xl bg-white px-4 py-3 text-sm font-semibold text-blue-900 disabled:opacity-50"
      >
        {loading ? "Sending…" : "Send invitation"}
      </button>
      {status && (
        <p className={"mt-2 text-xs " + (status.success ? "text-blue-100" : "text-red-200")}>
          {status.message}
        </p>
      )}
    </div>
  );
}