import Link from "next/link";
import { ArrowLeft } from "lucide-react";
import { createClient } from "@/lib/supabase/server";
import { getStudentRecord } from "@/lib/get-student-record";
import { createPaymentAsStudent } from "./actions";

export default async function PortalPaymentsPage({
  searchParams,
}: {
  searchParams: Promise<{ payment?: string }>;
}) {
  const { payment } = await searchParams;
  const supabase = await createClient();
  const student = await getStudentRecord(supabase);
  if (!student) return null;

  const { data: payments } = await supabase
    .from("payments")
    .select("id, amount_cents, status, created_at")
    .eq("student_id", student.id)
    .order("created_at", { ascending: false });

  const outstandingCents = (payments ?? [])
    .filter((p) => p.status === "pending")
    .reduce((sum, p) => sum + p.amount_cents, 0);

  return (
    <div className="mx-auto max-w-lg">
      <div className="flex items-center gap-3 pb-5">
        <Link href="/portal" className="text-slate-500 hover:text-slate-800">
          <ArrowLeft size={20} />
        </Link>
        <h1 className="text-xl font-bold">Payments</h1>
      </div>

      {payment === "success" && (
        <p className="mb-4 rounded-xl bg-emerald-50 p-3 text-sm font-semibold text-emerald-700">
          Checkout completed — your balance will update once processing finishes.
        </p>
      )}
      {payment === "cancelled" && (
        <p className="mb-4 rounded-xl bg-slate-50 p-3 text-sm font-semibold text-slate-600">
          Checkout was cancelled — no charge was made.
        </p>
      )}

      <div className="rounded-2xl border border-slate-200 bg-white p-6 shadow-sm">
        <p className="text-sm text-slate-500">Outstanding balance</p>
        <p className="mt-1 text-3xl font-bold">${(outstandingCents / 100).toFixed(2)}</p>

        <form action={createPaymentAsStudent} className="mt-5 border-t border-slate-100 pt-5">
          <label htmlFor="amount" className="block text-sm font-semibold text-slate-700">
            Amount to pay (USD)
          </label>
          <div className="mt-2 flex gap-2">
            <input
              id="amount"
              name="amount"
              type="number"
              min="1"
              step="0.01"
              required
              defaultValue={outstandingCents > 0 ? (outstandingCents / 100).toFixed(2) : ""}
              className="w-full rounded-xl border border-slate-200 px-4 py-2.5 text-sm outline-none focus:border-blue-700 focus:ring-4 focus:ring-blue-100"
            />
            <button type="submit" className="whitespace-nowrap rounded-xl bg-blue-800 px-4 py-2.5 text-sm font-semibold text-white hover:bg-blue-900">
              Pay now
            </button>
          </div>
          <p className="mt-2 text-xs text-slate-400">Defaults to your outstanding balance — edit to pay a different amount.</p>
        </form>
      </div>

      <div className="mt-6 rounded-2xl border border-slate-200 bg-white p-6 shadow-sm">
        <h2 className="font-semibold">Payment history</h2>
        <div className="mt-4 space-y-2">
          {!payments || payments.length === 0 ? (
            <p className="text-sm text-slate-500">No payments yet.</p>
          ) : (
            payments.map((p) => (
              <div key={p.id} className="flex items-center justify-between rounded-xl bg-slate-50 px-4 py-3">
                <div>
                  <p className="text-sm font-semibold">${(p.amount_cents / 100).toFixed(2)}</p>
                  <p className="text-xs text-slate-500">
                    {new Intl.DateTimeFormat("en-US", { month: "short", day: "numeric", year: "numeric" }).format(new Date(p.created_at))}
                  </p>
                </div>
                <span
                  className={
                    "rounded-full px-3 py-1 text-xs font-semibold " +
                    (p.status === "paid" ? "bg-emerald-50 text-emerald-700" : p.status === "pending" ? "bg-amber-50 text-amber-700" : "bg-red-50 text-red-700")
                  }
                >
                  {p.status}
                </span>
              </div>
            ))
          )}
        </div>
      </div>
    </div>
  );
}