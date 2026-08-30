const FALLBACK_TIMEZONES = ["UTC", "America/New_York", "America/Denver", "Europe/London", "Asia/Tbilisi"];

function getAllTimezones(): string[] {
  if (typeof Intl.supportedValuesOf === "function") {
    return Intl.supportedValuesOf("timeZone");
  }
  return FALLBACK_TIMEZONES;
}

export function TimezoneSelect({ name, defaultValue }: { name: string; defaultValue?: string | null }) {
  const timezones = getAllTimezones();

  return (
    <select
      name={name}
      defaultValue={defaultValue || "UTC"}
      className="mt-2 w-full rounded-xl border border-slate-200 px-4 py-3 outline-none focus:border-blue-700 focus:ring-4 focus:ring-blue-100"
    >
      {timezones.map((tz) => (
        <option key={tz} value={tz}>{tz.replace(/_/g, " ")}</option>
      ))}
    </select>
  );
}