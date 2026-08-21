import { NextRequest, NextResponse } from "next/server";
import type Stripe from "stripe";
import { stripe } from "@/lib/stripe";
import { createAdminClient } from "@/lib/supabase/admin";

// This is the ONLY source of truth for whether a payment actually succeeded.
// The success_url redirect in the checkout flow just means "the browser came
// back" — it says nothing about whether the card was actually charged. Never
// mark a payment as paid from a redirect; only ever do it here, from Stripe
// itself, after verifying the request really came from Stripe.
export async function POST(request: NextRequest) {
  const body = await request.text();
  const signature = request.headers.get("stripe-signature");

  if (!signature) {
    return NextResponse.json({ error: "Missing signature" }, { status: 400 });
  }

  let event: Stripe.Event;
  try {
    event = stripe.webhooks.constructEvent(body, signature, process.env.STRIPE_WEBHOOK_SECRET!);
  } catch (err) {
    console.error("Stripe webhook signature verification failed:", err);
    return NextResponse.json({ error: "Invalid signature" }, { status: 400 });
  }

  const supabase = createAdminClient();

  switch (event.type) {
    case "checkout.session.completed": {
      const session = event.data.object as Stripe.Checkout.Session;

      const { error } = await supabase
        .from("payments")
        .update({ status: "paid" })
        .eq("external_reference", session.id);

      if (error) {
        console.error("Failed to mark payment as paid:", error.message);
        return NextResponse.json({ error: "Database update failed" }, { status: 500 });
      }
      break;
    }

    case "checkout.session.expired": {
      const session = event.data.object as Stripe.Checkout.Session;

      await supabase
        .from("payments")
        .update({ status: "failed" })
        .eq("external_reference", session.id);
      break;
    }
    case "account.updated": {
      const account = event.data.object as Stripe.Account;

      await supabase
        .from("tutor_accounts")
        .update({ stripe_payouts_enabled: account.payouts_enabled ?? false })
        .eq("stripe_connect_account_id", account.id);
      break;
    }

    default:
      // Other event types are ignored for now.
      break;
  }

  return NextResponse.json({ received: true });
}
