"use server";

import { redirect } from "next/navigation";
import { headers } from "next/headers";
import { stripe } from "@/lib/stripe";
import { createClient } from "@/lib/supabase/server";
import { getStudentRecord } from "@/lib/get-student-record";

export async function createPaymentAsStudent(formData: FormData) {
  const supabase = await createClient();
  const student = await getStudentRecord(supabase);
  if (!student) redirect("/portal/login");

  const { data: tutorAccount, error: tutorError } = await supabase
    .from("tutor_accounts")
    .select("stripe_connect_account_id, stripe_payouts_enabled")
    .eq("id", student.tutor_account_id)
    .single();

  if (tutorError) {
    console.error("Failed to load tutor account for student payment:", tutorError.message);
    throw new Error("Could not find your tutor's payment settings.");
  }
  if (!tutorAccount?.stripe_connect_account_id || !tutorAccount.stripe_payouts_enabled) {
    throw new Error("Your tutor hasn't finished setting up payments yet.");
  }

  const amountCents = Math.round(Number(formData.get("amount")) * 100);
  if (!amountCents || amountCents <= 0) {
    throw new Error("Enter a valid payment amount.");
  }

  const headersList = await headers();
  const origin = process.env.NEXT_PUBLIC_SITE_URL ?? `http://${headersList.get("host")}`;

  const session = await stripe.checkout.sessions.create({
    mode: "payment",
    line_items: [
      {
        price_data: {
          currency: "usd",
          product_data: { name: "Payment to your tutor" },
          unit_amount: amountCents,
        },
        quantity: 1,
      },
    ],
    payment_intent_data: {
      transfer_data: { destination: tutorAccount.stripe_connect_account_id },
    },
    success_url: `${origin}/portal/payments?payment=success`,
    cancel_url: `${origin}/portal/payments?payment=cancelled`,
  });

  const { data: insertedRows, error: insertError } = await supabase
    .from("payments")
    .insert({
      tutor_account_id: student.tutor_account_id,
      student_id: student.id,
      amount_cents: amountCents,
      currency: "usd",
      status: "pending",
      payment_method: "stripe",
      external_reference: session.id,
    })
    .select("id");

  if (insertError) {
    console.error("Failed to record student-initiated payment:", insertError.message);
    throw new Error(insertError.message);
  }
  if (!insertedRows || insertedRows.length === 0) {
    console.error("Payment insert matched ZERO rows — likely an RLS policy gap");
    throw new Error("Could not record payment — please try again.");
  }

  console.log("Student payment session created:", session.id, "for", amountCents, "cents");
  redirect(session.url!);
}