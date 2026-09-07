import { createClient } from "@/lib/supabase/server";
import { getTutorAccountId } from "@/lib/get-tutor-account";
import { getTutorTimezone } from "@/lib/get-tutor-timezone";
import { formatInTimezone } from "@/lib/format-in-timezone";
import { AvailabilityForm } from "@/components/availability-form";
import { DeleteBlockButton } from "@/components/delete-block-button";

export default async function AvailabilityPage() {
  const supabase = await createClient();
  const tutorAccountId = await getTutorAccountId(supabase);
  const tutorTimezone = await getTutorTimezone(supabase);

  const { data: blocks } = await supabase
    .from("availability_blocks")
    .select("id, starts_at, ends_at, note")
    .eq("tutor_account_id", tutorAccountId)
    .gte("ends_at", new Date().toISOString())
    .order("starts_at", { ascending: true });

  return (
    <div className="mx-auto max-w-2xl">
      <h1 className="text-3xl font-bold">Availability</h1>
      <p className="mt-2 text-slate-500">Block off times students can't book, alongside your normal lessons.</p>

      <div className="mt-8 rounded-2xl border border-slate-200 bg-white p-6 shadow-sm">
        <h2 className="font-semibold">Add a blocked time</h2>
        <AvailabilityForm />
      </div>

      <div className="mt-6 rounded-2xl border border-slate-200 bg-white p-6 shadow-sm">
        <h2 className="font-semibold">Upcoming blocks</h2>
        <div className="mt-4 space-y-2">
          {!blocks || blocks.length === 0 ? (
            <p className="text-sm text-slate-500">No blocked times set.</p>
          ) : (
            blocks.map((block) => (
              <div key={block.id} className="flex items-center justify-between rounded-xl bg-slate-50 px-4 py-3">
                <div>
                  <p className="text-sm font-semibold">
                    {formatInTimezone(new Date(block.starts_at), tutorTimezone, { month: "short", day: "numeric", hour: "numeric", minute: "2-digit" })}
                    {" – "}
                    {formatInTimezone(new Date(block.ends_at), tutorTimezone, { hour: "numeric", minute: "2-digit" })}
                  </p>
                  {block.note && <p className="text-xs text-slate-500">{block.note}</p>}
                </div>
                <DeleteBlockButton blockId={block.id} />
              </div>
            ))
          )}
        </div>
      </div>
    </div>
  );
}