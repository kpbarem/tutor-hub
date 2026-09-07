import { Resend } from "resend";

const resend = new Resend(process.env.RESEND_API_KEY);

// Using Resend's shared testing address for now — swap this once a real
// domain is verified in Resend, so emails come from your own name instead.
const FROM_ADDRESS = "Tutor Hub <onboarding@resend.dev>";

export async function sendEmail({
  to,
  subject,
  html,
}: {
  to: string;
  subject: string;
  html: string;
}) {
  console.log(`Attempting to send email to ${to}: "${subject}"`);

  const { data, error } = await resend.emails.send({
    from: FROM_ADDRESS,
    to,
    subject,
    html,
  });

  if (error) {
    console.error("Failed to send email:", error.message);
    return { success: false, error: error.message };
  }

  console.log("Email sent successfully, id:", data?.id);
  return { success: true, id: data?.id };
}