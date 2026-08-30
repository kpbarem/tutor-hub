"use client";

import { useState } from "react";

export function LessonDateTimeFields() {
    const [date, setDate] = useState("");
    const [time, setTime] = useState("");

    const startsAtIso = date && time ? new Date(`${date}T${time}`).toISOString() : "";

    return (
        <>
            <input type="hidden" name="startsAtIso" value={startsAtIso} />
            <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
                <div>
                    <label className="block text-sm font-semibold text-slate-700">Date</label>
                    <input
                        type="date" required value={date} onChange={(e) => setDate(e.target.value)}
                        className="mt-2 w-full rounded-xl border border-slate-200 px-4 py-3 outline-none focus:border-blue-700 focus:ring-4 focus:ring-blue-100"
                    />
                </div>
                <div>
                    <label className="block text-sm font-semibold text-slate-700">Start time</label>
                    <input
                        type="time" required value={time} onChange={(e) => setTime(e.target.value)}
                        className="mt-2 w-full rounded-xl border border-slate-200 px-4 py-3 outline-none focus:border-blue-700 focus:ring-4 focus:ring-blue-100"
                    />
                </div>
            </div>
        </>
    );
}