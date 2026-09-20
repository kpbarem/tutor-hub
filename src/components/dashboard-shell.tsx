import type { ReactNode } from "react";
import { Search } from "lucide-react";
import { Sidebar } from "./sidebar";
import { NotificationBell } from "./notification-bell";
import { createClient } from "@/lib/supabase/server";

export async function DashboardShell({ children }: { children: ReactNode }) {
  const supabase = await createClient();
  const { data: { user } } = await supabase.auth.getUser();

  const { data: notifications } = user
    ? await supabase
        .from("notifications")
        .select("id, type, message, link, read_at, created_at")
        .eq("profile_id", user.id)
        .order("created_at", { ascending: false })
        .limit(20)
    : { data: [] };

  return (
    <div className="min-h-screen bg-slate-50 text-slate-950 lg:flex">
      <Sidebar />
      <div className="min-w-0 flex-1">
        <header className="flex h-20 items-center justify-between border-b border-slate-200 bg-white px-5 md:px-8">
          <div className="relative hidden md:block">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" size={17} />
            <input className="w-80 rounded-xl border border-slate-200 bg-slate-50 py-2.5 pl-10 pr-4 text-sm outline-none focus:border-primary focus:ring-4 focus:ring-primary-light" placeholder="Search students, lessons, notes…" />
          </div>
          <div className="ml-auto flex items-center gap-3">
            {user && <NotificationBell profileId={user.id} initialNotifications={notifications ?? []} />}
          </div>
        </header>
        <main className="p-5 md:p-8">{children}</main>
      </div>
    </div>
  );
}