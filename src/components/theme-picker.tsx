"use client";

import { useState } from "react";
import { Check } from "lucide-react";
import { updateTheme } from "@/lib/theme-actions";

const THEMES = [
  { value: "ocean", label: "Ocean", color: "#1e3a8a" },
  { value: "forest", label: "Forest", color: "#166534" },
  { value: "plum", label: "Plum", color: "#6b21a8" },
  { value: "sunset", label: "Sunset", color: "#c2410c" },
  { value: "slate", label: "Slate", color: "#334155" },
];

export function ThemePicker({ defaultValue }: { defaultValue?: string | null }) {
  const [current, setCurrent] = useState(defaultValue || "ocean");
  const [saving, setSaving] = useState<string | null>(null);

  async function handleSelect(theme: string) {
    setSaving(theme);
    try {
      await updateTheme(theme);
      setCurrent(theme);
    } catch (err) {
      console.error("Theme save failed:", err);
    } finally {
      setSaving(null);
    }
  }

  return (
    <div className="grid grid-cols-2 gap-3 sm:grid-cols-5">
      {THEMES.map((t) => (
        <button
          key={t.value}
          onClick={() => handleSelect(t.value)}
          disabled={saving !== null}
          className={
            "flex flex-col items-center gap-2 rounded-xl border-2 p-3 disabled:opacity-50 " +
            (current === t.value ? "border-slate-900" : "border-slate-200 hover:border-slate-300")
          }
        >
          <span className="relative grid h-10 w-10 place-items-center rounded-full" style={{ backgroundColor: t.color }}>
            {current === t.value && <Check size={18} className="text-white" />}
          </span>
          <span className="text-xs font-semibold text-slate-700">{saving === t.value ? "Saving…" : t.label}</span>
        </button>
      ))}
    </div>
  );
}