import type { Metadata } from "next";
import "./globals.css";
import { createClient } from "@/lib/supabase/server";

export const metadata: Metadata = {
  title: "Tutor Hub — A software for independent educators",
  description: "A lightweight business portal for independent tutors.",
};

export default async function RootLayout({ children }: Readonly<{ children: React.ReactNode }>) {
  const supabase = await createClient();
  const { data: { user } } = await supabase.auth.getUser();

  let theme = "ocean";
  if (user) {
    const { data: profile } = await supabase.from("profiles").select("theme").eq("id", user.id).single();
    theme = profile?.theme ?? "ocean";
  }

  return (
    <html lang="en" data-theme={theme}>
      <body>{children}</body>
    </html>
  );
}