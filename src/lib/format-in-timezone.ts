export function formatInTimezone(date: Date, timezone: string | null | undefined, options: Intl.DateTimeFormatOptions) {
  const zone = timezone || "UTC";
  try {
    return new Intl.DateTimeFormat("en-US", { ...options, timeZone: zone }).format(date);
  } catch (err) {
    console.error(`Invalid timezone "${zone}" — falling back to UTC.`, err);
    return new Intl.DateTimeFormat("en-US", { ...options, timeZone: "UTC" }).format(date);
  }
}