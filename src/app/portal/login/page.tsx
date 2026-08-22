"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { createClient } from "@/lib/supabase/client";
import { linkStudentAccount } from "./actions";

export default function PortalLoginPage() {
  const router = useRouter();
  const supabase = createClient();

  const [mode, setMode] = useState<"signin" | "signup">("signin");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();

    setError(null);
    setLoading(true);

    const normalizedEmail = email.trim().toLowerCase();

    const { error: authError } =
      mode === "signin"
        ? await supabase.auth.signInWithPassword({
          email: normalizedEmail,
          password,
        })
        : await supabase.auth.signUp({
          email: normalizedEmail,
          password,
        });

    if (authError) {
      setLoading(false);
      setError(authError.message);
      return;
    }

    const result = await linkStudentAccount();

    if (!result.success) {
      setLoading(false);
      setError(result.message ?? "Could not link student account.");
      return;
    }

    setLoading(false);

    // router.push("/portal");
    // router.refresh();
    window.location.href = "/portal";
  }

  return (
    <div className="flex min-h-screen items-center justify-center bg-slate-50 px-4">
      <div className="w-full max-w-sm rounded-2xl border border-slate-200 bg-white p-6 shadow-sm">
        <h1 className="text-xl font-bold">
          {mode === "signin" ? "Student log in" : "Create your student account"}
        </h1>
        <p className="mt-2 text-sm text-slate-500">
          Use the same email your tutor has on file for you.
        </p>

        <form onSubmit={handleSubmit} className="mt-5 space-y-4">
          <div>
            <label className="text-sm font-medium text-slate-700">Email</label>
            <input
              type="email"
              required
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              className="mt-1 w-full rounded-xl border border-slate-200 px-3 py-2 text-sm outline-none focus:border-blue-600 focus:ring-4 focus:ring-blue-100"
            />
          </div>
          <div>
            <label className="text-sm font-medium text-slate-700">Password</label>
            <input
              type="password"
              required
              minLength={6}
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              className="mt-1 w-full rounded-xl border border-slate-200 px-3 py-2 text-sm outline-none focus:border-blue-600 focus:ring-4 focus:ring-blue-100"
            />
          </div>

          {error && <p className="text-sm text-red-600">{error}</p>}

          <button
            type="submit"
            disabled={loading}
            className="w-full rounded-xl bg-blue-800 py-2.5 text-sm font-semibold text-white hover:bg-blue-900 disabled:opacity-50"
          >
            {loading ? "Please wait…" : mode === "signin" ? "Log in" : "Sign up"}
          </button>
        </form>

        <button
          onClick={() => setMode(mode === "signin" ? "signup" : "signin")}
          className="mt-4 text-sm font-medium text-blue-800"
        >
          {mode === "signin" ? "Need an account? Sign up" : "Already have an account? Log in"}
        </button>

        {mode === "signup" && (
          <p className="mt-4 text-xs text-slate-400">
            Your tutor needs to have already added you as a student with this exact email before you sign up.
          </p>
        )}
      </div>
    </div>
  );
}