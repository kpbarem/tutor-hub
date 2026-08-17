"use client";

import { useState } from "react";
import { createClient } from "@/lib/supabase/client";

export default function PortalLoginPage() {
  const supabase = createClient();
  const [email, setEmail] = useState("");
  const [status, setStatus] = useState<"idle" | "sent" | "error">("idle");

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    const { error } = await supabase.auth.signInWithOtp({
      email,
      options: { emailRedirectTo: `${window.location.origin}/auth/callback` },
    });
    setStatus(error ? "error" : "sent");
  }

  return (
    <div className="flex min-h-screen items-center justify-center bg-slate-50 px-4">
      <div className="w-full max-w-sm rounded-2xl border border-slate-200 bg-white p-6 shadow-sm">
        <h1 className="text-xl font-bold">Student login</h1>
        <p className="mt-2 text-sm text-slate-500">
          Enter your email and we&apos;ll send you a login link — no password needed.
        </p>

        {status === "sent" ? (
          <p className="mt-5 rounded-xl bg-emerald-50 p-3 text-sm font-semibold text-emerald-700">
            Check your inbox for a login link.
          </p>
        ) : (
          <form onSubmit={handleSubmit} className="mt-5 space-y-4">
            <input
              type="email"
              required
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              placeholder="you@example.com"
              className="w-full rounded-xl border border-slate-200 px-3 py-2 text-sm outline-none focus:border-blue-600 focus:ring-4 focus:ring-blue-100"
            />
            <button
              type="submit"
              className="w-full rounded-xl bg-blue-800 py-2.5 text-sm font-semibold text-white hover:bg-blue-900"
            >
              Send login link
            </button>
            {status === "error" && (
              <p className="text-sm text-red-600">Something went wrong — try again.</p>
            )}
          </form>
        )}
      </div>
    </div>
  );
}