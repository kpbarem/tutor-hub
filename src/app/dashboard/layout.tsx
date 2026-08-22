import type { ReactNode } from "react";
import { redirect } from "next/navigation";
import { DashboardShell } from "@/components/dashboard-shell";
import { createClient } from "@/lib/supabase/server";

export default async function DashboardLayout({ children }: { children: ReactNode }) {
  const supabase = await createClient();
  const { data: { user } } = await supabase.auth.getUser();

  if (!user) {
    redirect("/login");
  }

  // Does this user already have a profile?
  const { data: profile } = await supabase
    .from("profiles")
    .select("id, role")
    .eq("id", user.id)
    .single();

  if (profile && profile.role === "student") {
    redirect("/portal");
  }

  if (!profile) {
    // First login ever — create their profile + tutor account
    const { error: profileError } = await supabase.from("profiles").insert({
      id: user.id,
      role: "tutor",
      display_name: user.email?.split("@")[0] ?? "Tutor",
    });

    // Postgres error 23505 = unique constraint violation. If this fired because
    // the profile already exists (e.g. two requests raced to create it), that's
    // totally fine — someone just beat us to it by a split second. Only log
    // anything genuinely unexpected.
    if (profileError && profileError.code !== "23505") {
      console.error("Failed to create profile:", profileError.message);
    }

    await supabase.from("tutor_accounts").insert({
      owner_profile_id: user.id,
      business_name: "My Tutoring Business",
      booking_slug: `tutor-${user.id.slice(0, 8)}`,
    });
  }

  return <DashboardShell>{children}</DashboardShell>;
}