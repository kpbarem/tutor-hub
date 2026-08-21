import { CreditCard } from "lucide-react";
import { createClient } from "@/lib/supabase/server";
import { getTutorAccountId } from "@/lib/get-tutor-account";
import { connectStripeAccount } from "./actions";

export default async function SettingsPage() {
  const supabase = await createClient();
  const tutorAccountId = await getTutorAccountId(supabase);

  const { data: tutorAccount } = await supabase
    .from("tutor_accounts")
    .select("stripe_connect_account_id, stripe_payouts_enabled")
    .eq("id", tutorAccountId)
    .single();

  return (
    <div className="mx-auto max-w-3xl">
      <h1 className="text-3xl font-bold">Settings</h1>

      <section className="mt-8 rounded-2xl border border-slate-200 bg-white p-6 shadow-sm">
        <div className="flex items-center gap-3">
          <span className="grid h-10 w-10 place-items-center rounded-xl bg-blue-50 text-blue-800">
            <CreditCard size={18} />
          </span>
          <div>
            <h2 className="font-semibold">Payouts</h2>
            <p className="text-sm text-slate-500">Connect a bank account to receive student payments.</p>
          </div>
        </div>

        <div className="mt-5">
          {tutorAccount?.stripe_payouts_enabled ? (
            <span className="inline-flex items-center gap-2 rounded-full bg-emerald-50 px-3 py-1.5 text-sm font-semibold text-emerald-700">
              ✓ Payouts enabled
            </span>
          ) : (
            <form action={connectStripeAccount}>
              <button
                type="submit"
                className="rounded-xl bg-blue-800 px-4 py-2.5 text-sm font-semibold text-white hover:bg-blue-900"
              >
                {tutorAccount?.stripe_connect_account_id ? "Finish connecting Stripe" : "Connect Stripe account"}
              </button>
            </form>
          )}
        </div>
      </section>
    </div>
  );
}