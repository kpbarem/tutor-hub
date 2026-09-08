"use client";

import { useState, useEffect } from "react";
import { Check } from "lucide-react";

const FALLBACK_TIMEZONES = ["UTC", "America/New_York", "America/Denver", "Europe/London", "Asia/Tbilisi"];

export function TimezoneForm({
  defaultValue,
  action,
}: {
  defaultValue?: string | null;
  action: (timezone: string) => Promise<void>;
}) {
  const [timezones, setTimezones] = useState<string[]>(FALLBACK_TIMEZONES);
  const [value, setValue] = useState(defaultValue || "UTC");
  const [status, setStatus] = useState<"idle" | "saving" | "saved" | "error">("idle");

  useEffect(() => {
    if (typeof Intl.supportedValuesOf === "function") {
      setTimezones(Intl.supportedValuesOf("timeZone"));
    }
  }, []);

  async function handleSave() {
    setStatus("saving");
    try {
      await action(value);
      setStatus("saved");
      setTimeout(() => setStatus("idle"), 2000);
    } catch (err) {
      console.error("Failed to save timezone:", err);
      setStatus("error");
    }
  }

  return (
    <div>
      <select
        value={value}
        onChange={(e) => setValue(e.target.value)}
        className="mt-2 w-full rounded-xl border border-slate-200 px-4 py-3 outline-none focus:border-blue-700 focus:ring-4 focus:ring-blue-100"
      >
        {timezones.map((tz) => (
          <option key={tz} value={tz}>{tz.replace(/_/g, " ")}</option>
        ))}
      </select>
      <div className="mt-3 flex items-center gap-3">
        <button
          onClick={handleSave}
          disabled={status === "saving"}
          className="rounded-xl bg-blue-800 px-4 py-2.5 text-sm font-semibold text-white hover:bg-blue-900 disabled:opacity-50"
        >
          {status === "saving" ? "Saving…" : "Save"}
        </button>
        {status === "saved" && (
          <span className="flex items-center gap-1 text-sm font-semibold text-emerald-600">
            <Check size={16} /> Saved
          </span>
        )}
        {status === "error" && <span className="text-sm font-semibold text-red-600">Failed to save — try again</span>}
      </div>
    </div>
  );
}