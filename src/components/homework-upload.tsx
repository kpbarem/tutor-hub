"use client";

import { useState } from "react";
import { Check, Upload } from "lucide-react";
import { submitHomeworkFile } from "@/app/portal/(protected)/homework/upload-actions";

export function HomeworkUpload({ homeworkId, currentFileName }: { homeworkId: string; currentFileName?: string | null }) {
  const [status, setStatus] = useState<"idle" | "uploading" | "done" | "error">("idle");
  const [message, setMessage] = useState<string | null>(null);
  const [fileName, setFileName] = useState<string | null | undefined>(currentFileName);

  async function handleChange(e: React.ChangeEvent<HTMLInputElement>) {
    const file = e.target.files?.[0];
    if (!file) return;

    setStatus("uploading");
    const result = await submitHomeworkFile(homeworkId, file);

    if (result.success) {
      setStatus("done");
      setFileName(file.name);
    } else {
      setStatus("error");
      setMessage(result.message);
    }
  }

  return (
    <div className="mt-2 flex flex-wrap items-center gap-2">
      <label className="inline-flex cursor-pointer items-center gap-2 rounded-full bg-slate-100 px-3 py-1.5 text-xs font-semibold text-slate-700 hover:bg-slate-200">
        <Upload size={14} />
        {fileName ? "Replace file" : "Attach file"}
        <input type="file" className="hidden" onChange={handleChange} disabled={status === "uploading"} />
      </label>
      {status === "uploading" && <span className="text-xs text-slate-500">Uploading…</span>}
      {status === "done" && (
        <span className="inline-flex items-center gap-1 text-xs font-semibold text-emerald-600">
          <Check size={14} /> {fileName}
        </span>
      )}
      {status === "error" && <span className="text-xs text-red-600">{message}</span>}
      {status === "idle" && fileName && <span className="text-xs text-slate-500">Current: {fileName}</span>}
    </div>
  );
}