import { createClient as createSupabaseClient } from "@supabase/supabase-js";

/**
 * Admin client that bypasses Row Level Security entirely.
 *
 * Only use this in trusted, server-only code that has no logged-in user to
 * check against — e.g. the Stripe webhook, where the caller is Stripe's
 * servers, not one of our users. Never import this into anything that runs
 * in the browser, and never use it for a request that's supposed to be
 * scoped to "the current user's own data" — use the regular server client
 * (src/lib/supabase/server.ts) for that, so RLS keeps doing its job.
 */
export function createAdminClient() {
  return createSupabaseClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.SUPABASE_SECRET_KEY!,
    { auth: { autoRefreshToken: false, persistSession: false } }
  );
}
