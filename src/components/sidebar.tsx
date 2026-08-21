import Link from "next/link";
import { BookOpen, CalendarDays, CreditCard, LayoutDashboard, Settings, Users } from "lucide-react";
import { LogOut } from "lucide-react";
import { signOut } from "@/app/logout/actions";

const links = [
  ["Overview", "/dashboard", LayoutDashboard],
  ["Calendar", "/dashboard/calendar", CalendarDays],
  ["Students", "/dashboard/students", Users],
  ["Lessons", "/dashboard", BookOpen],
  ["Payments", "/dashboard", CreditCard],
];

export function Sidebar() {
  return (
    <aside className="hidden w-64 shrink-0 border-r border-slate-200 bg-white p-5 lg:flex lg:flex-col">
      <Link href="/" className="mb-8 flex items-center gap-3 text-lg font-semibold text-slate-950">
        <span className="grid h-10 w-10 place-items-center rounded-2xl bg-blue-800 text-white">T</span>
        Tutor Hub
      </Link>
      <nav className="space-y-1">
        {links.map(([label, href, Icon]) => (
          <Link key={label as string} href={href as string} className="flex items-center gap-3 rounded-xl px-3 py-2.5 text-sm font-medium text-slate-600 transition hover:bg-slate-100 hover:text-slate-950">
            <Icon size={18} /> {label as string}
          </Link>
        ))}
      </nav>
      <div className="mt-auto">
        <Link href="/dashboard/settings" className="flex items-center gap-3 rounded-xl px-3 py-2.5 text-sm font-medium text-slate-600 hover:bg-slate-100">
          <Settings size={18} /> Settings
        </Link>
        <form action={signOut}>
          <button type="submit" className="flex w-full items-center gap-3 rounded-xl px-3 py-2.5 text-sm font-medium text-slate-600 hover:bg-slate-100">
            <LogOut size={18} /> Sign out
          </button>
        </form>
        {/* <div className="mt-4 rounded-2xl bg-slate-950 p-4 text-white">
          <p className="text-xs text-slate-400">Current plan</p>
          <p className="mt-1 font-semibold">Founding Tutor</p>
          <p className="mt-2 text-xs leading-5 text-slate-300">Everything you need to run your tutoring business.</p>
        </div> */}
      </div>
    </aside>
  );
}
