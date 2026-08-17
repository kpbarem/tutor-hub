"use server";

import { redirect } from "next/navigation";
import { headers } from "next/headers";
import { stripe } from "@/lib/stripe";
import { createClient } from "@/lib/supabase/server";
import { getTutorAccountId } from "@/lib/get-tutor-account";

export async function createPaymentRequest(formData: FormData) {
  const supabase = await createClient();
  const tutorAccountId = await getTutorAccountId(supabase);
  if (!tutorAccountId) redirect("/login");

  const studentId = formData.get("studentId") as string;
  const amountDollars = Number(formData.get("amount"));
  const amountCents = Math.round(amountDollars * 100);

  const { data: student } = await supabase
    .from("students")
    .select("name, email")
    .eq("id", studentId)
    .single();

  if (!student) throw new Error("Student not found");

  const headersList = await headers();
  const origin = process.env.NEXT_PUBLIC_SITE_URL ?? `http://${headersList.get("host")}`;

  const session = await stripe.checkout.sessions.create({
    mode: "payment",
    line_items: [
      {
        price_data: {
          currency: "usd",
          product_data: { name: `Tutoring session – ${student.name}` },
          unit_amount: amountCents,
        },
        quantity: 1,
      },
    ],
    customer_email: student.email,
    success_url: `${origin}/dashboard/students/${studentId}?payment=success`,
    cancel_url: `${origin}/dashboard/students/${studentId}?payment=cancelled`,
  });

  const { error } = await supabase.from("payments").insert({
    tutor_account_id: tutorAccountId,
    student_id: studentId,
    amount_cents: amountCents,
    currency: "usd",
    status: "pending",
    payment_method: "stripe",
    external_reference: session.id,
  });

  if (error) throw new Error(error.message);

    redirect(`/dashboard/students/${studentId}?payment=link&url=${encodeURIComponent(session.url!)}`);
}