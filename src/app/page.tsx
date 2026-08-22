import Link from "next/link";
import { redirect } from "next/navigation";
import { ArrowRight, CalendarCheck, CreditCard, Files, MessageSquareText } from "lucide-react";
import { createClient } from "@/lib/supabase/server";

export default async function Home() {
const supabase = await createClient();
const { data: { user } } = await supabase.auth.getUser();

if (user) {
  const { data: profile } = await supabase
    .from("profiles")
    .select("role")
    .eq("id", user.id)
    .single();

  redirect(profile?.role === "student" ? "/portal" : "/dashboard");
}

  return <main className="min-h-screen bg-[#f7f7fb] text-slate-950"><nav className="mx-auto flex max-w-7xl items-center justify-between px-6 py-5"><div className="flex items-center gap-3 font-semibold"><span className="grid h-10 w-10 place-items-center rounded-2xl bg-blue-800 text-white">T</span>Tutor Hub</div><div className="flex items-center gap-5"><Link href="/portal/login" className="text-sm font-medium text-slate-500 hover:text-slate-800">Student login</Link><Link href="/login" className="text-sm font-semibold text-slate-600 hover:text-slate-900">Log in</Link></div></nav><section className="mx-auto grid max-w-7xl items-center gap-12 px-6 py-20 lg:grid-cols-2 lg:py-28"><div><span className="rounded-full border border-blue-200 bg-blue-50 px-3 py-1 text-sm font-semibold text-blue-900">A software hub for independent educators</span><h1 className="mt-6 max-w-3xl text-5xl font-bold leading-tight tracking-tight sm:text-6xl">Run your tutoring business without juggling six different apps.</h1><p className="mt-6 max-w-xl text-lg leading-8 text-slate-600">Scheduling, students, lesson notes, homework, files, and payment tracking in one simple workspace.</p><div className="mt-8 flex flex-wrap gap-3"><Link href="/login" className="inline-flex items-center gap-2 rounded-xl bg-blue-800 px-5 py-3 font-semibold text-white">Get started <ArrowRight size={18} /></Link></div></div><div className="rounded-[2rem] border border-slate-200 bg-white p-5 shadow-2xl shadow-blue-100"><div className="rounded-2xl bg-slate-950 p-5 text-white"><p className="mt-1 text-2xl font-bold">Features</p></div><div className="mt-4 grid gap-3 sm:grid-cols-2">{[[CalendarCheck, "Scheduling", "Simple, timezone-aware lessons"], [CreditCard, "Payments", "Track payments"], [Files, "Homework", "Notes and files by student"], [MessageSquareText, "Communication", "Fast and easy communication"]].map(([Icon, title, text]) => <div key={title as string} className="rounded-2xl bg-slate-50 p-4"><Icon className="text-blue-800" /><p className="mt-3 font-semibold">{title as string}</p><p className="mt-1 text-sm leading-6 text-slate-500">{text as string}</p></div>)}</div></div></section></main>;
}