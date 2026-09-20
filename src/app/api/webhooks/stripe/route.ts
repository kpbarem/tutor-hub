import { NextRequest, NextResponse } from "next/server";
import type Stripe from "stripe";
import { stripe } from "@/lib/stripe";
import { createAdminClient } from "@/lib/supabase/admin";
import { sendEmail } from "@/lib/email";
import { createNotification } from "@/lib/create-notification";

// This is the ONLY source of truth for whether a payment actually succeeded.
// The success_url redirect in the checkout flow just means "the browser came
// back". it says nothing about whether the card was actually charged. Never
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

      const { data: payment, error } = await supabase
        .from("payments")
        .update({ status: "paid" })
        .eq("external_reference", session.id)
        .select("amount_cents, student_id, tutor_account_id")
        .single();

      if (error) {
        console.error("Failed to mark payment as paid:", error.message);
        return NextResponse.json({ error: "Database update failed" }, { status: 500 });
      }

      if (payment) {
        const amount = (payment.amount_cents / 100).toFixed(2);

        const { data: student } = await supabase
          .from("students")
          .select("name, email")
          .eq("id", payment.student_id)
          .single();

        if (student?.email) {
          await sendEmail({
            to: student.email,
            subject: `Payment confirmed: $${amount}`,
            html: `<p>Hi ${student.name},</p><p>Your payment of <strong>$${amount}</strong> has been confirmed. Thank you!</p>`,
          });
        }

        const { data: tutorAccount } = await supabase
          .from("tutor_accounts")
          .select("owner_profile_id")
          .eq("id", payment.tutor_account_id)
          .single();

        if (tutorAccount?.owner_profile_id) {
          const { data: tutorUser, error: tutorLookupError } = await supabase.auth.admin.getUserById(tutorAccount.owner_profile_id);

          if (tutorLookupError) {
            console.error("Failed to look up tutor email for payment notice:", tutorLookupError.message);
          } else if (tutorUser?.user?.email) {
            await sendEmail({
              to: tutorUser.user.email,
              subject: `You received a payment: $${amount}`,
              html: `<p>${student?.name ?? "A student"} paid <strong>$${amount}</strong>.</p><p><a href="${process.env.NEXT_PUBLIC_SITE_URL}/dashboard/students/${payment.student_id}">View student →</a></p>`,
            });
          }
          await createNotification(
            supabase,
            tutorAccount.owner_profile_id,
            "payment_received",
            `${student?.name ?? "A student"} paid $${amount}`,
            `/dashboard/students/${payment.student_id}`
          );
        }
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
