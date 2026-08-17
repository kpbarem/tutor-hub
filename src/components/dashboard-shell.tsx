import type { ReactNode } from "react";
import { Bell, Search } from "lucide-react";
import { Sidebar } from "./sidebar";

export function DashboardShell({ children }: { children: ReactNode }) {
  return (
    <div className="min-h-screen bg-slate-50 text-slate-950 lg:flex">
      <Sidebar />
      <div className="min-w-0 flex-1">
        <header className="flex h-20 items-center justify-between border-b border-slate-200 bg-white px-5 md:px-8">
          <div className="relative hidden md:block">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" size={17} />
            <input className="w-80 rounded-xl border border-slate-200 bg-slate-50 py-2.5 pl-10 pr-4 text-sm outline-none focus:border-blue-600 focus:ring-4 focus:ring-blue-100" placeholder="Search students, lessons, notes…" />
          </div>
          <div className="ml-auto flex items-center gap-3">
            <button className="grid h-10 w-10 place-items-center rounded-xl border border-slate-200 bg-white text-slate-600"><Bell size={18} /></button>
            {/* <div className="grid h-10 w-10 place-items-center rounded-full bg-amber-100 text-sm font-semibold text-amber-800">AT</div> */}
          </div>
        </header>
        <main className="p-5 md:p-8">{children}</main>
      </div>
    </div>
  );
}
