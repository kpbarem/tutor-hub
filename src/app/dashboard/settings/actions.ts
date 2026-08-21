"use server";

import { redirect } from "next/navigation";
import { headers } from "next/headers";
import { stripe } from "@/lib/stripe";
import { createClient } from "@/lib/supabase/server";
import { getTutorAccountId } from "@/lib/get-tutor-account";

export async function connectStripeAccount() {
  const supabase = await createClient();
  const tutorAccountId = await getTutorAccountId(supabase);
  if (!tutorAccountId) redirect("/login");

  const { data: tutorAccount } = await supabase
    .from("tutor_accounts")
    .select("stripe_connect_account_id")
    .eq("id", tutorAccountId)
    .single();

  let connectAccountId = tutorAccount?.stripe_connect_account_id;

  // First time connecting: create the Express account
  if (!connectAccountId) {
    const account = await stripe.accounts.create({
      type: "express",
      capabilities: {
        card_payments: { requested: true },
        transfers: { requested: true },
      },
    });
    connectAccountId = account.id;

    await supabase
      .from("tutor_accounts")
      .update({ stripe_connect_account_id: connectAccountId })
      .eq("id", tutorAccountId);
  }

  // Generate a fresh, one-time-use onboarding link
  const headersList = await headers();
  const origin = process.env.NEXT_PUBLIC_SITE_URL ?? `http://${headersList.get("host")}`;

  const accountLink = await stripe.accountLinks.create({
    account: connectAccountId,
    refresh_url: `${origin}/dashboard/settings?stripe=refresh`,
    return_url: `${origin}/dashboard/settings?stripe=return`,
    type: "account_onboarding",
  });

  redirect(accountLink.url);
}