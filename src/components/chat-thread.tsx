"use client";

import { useEffect, useRef, useState } from "react";
import { Send } from "lucide-react";
import { createClient } from "@/lib/supabase/client";

type Message = {
  id: string;
  sender_role: "tutor" | "student";
  body: string;
  created_at: string;
};

export function ChatThread({
  studentId,
  tutorAccountId,
  initialMessages,
  role,
}: {
  studentId: string;
  tutorAccountId: string;
  initialMessages: Message[];
  role: "tutor" | "student";
}) {
  const supabase = createClient();
  const [messages, setMessages] = useState<Message[]>(initialMessages);
  const [draft, setDraft] = useState("");
  const [sending, setSending] = useState(false);
  const bottomRef = useRef<HTMLDivElement>(null);

  // Subscribe to new rows landing in `messages` for this student, live.
  useEffect(() => {
    const channel = supabase
      .channel(`messages:${studentId}`)
      .on(
        "postgres_changes",
        {
          event: "INSERT",
          schema: "public",
          table: "messages",
          filter: `student_id=eq.${studentId}`,
        },
        (payload) => {
          const newMessage = payload.new as Message;
          setMessages((current) => {
            if (current.some((m) => m.id === newMessage.id)) return current;
            return [...current, newMessage];
          });
        }
      )
      .subscribe();

    return () => {
      supabase.removeChannel(channel);
    };
  }, [studentId, supabase]);

  useEffect(() => {
    bottomRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [messages]);

  async function sendMessage(e: React.FormEvent) {
    e.preventDefault();
    if (!draft.trim() || sending) return;

    setSending(true);
    const { error } = await supabase.from("messages").insert({
      tutor_account_id: tutorAccountId,
      student_id: studentId,
      sender_role: role,
      body: draft.trim(),
    });
    setSending(false);

    if (error) {
      console.error("Failed to send message:", error.message);
      return;
    }

    setDraft("");
  }

  return (
    <div className="flex flex-1 flex-col overflow-hidden">
      <div className="flex-1 space-y-3 overflow-y-auto py-5">
        {messages.length === 0 ? (
          <p className="text-center text-sm text-slate-500">No messages yet — say hello.</p>
        ) : (
          messages.map((m) => (
            <div key={m.id} className={`flex ${m.sender_role === "tutor" ? "justify-end" : "justify-start"}`}>
              <div
                className={
                  "max-w-[75%] rounded-2xl px-4 py-2.5 text-sm " +
                  (m.sender_role === role
                    ? "bg-blue-800 text-white"
                    : "bg-slate-100 text-slate-900")
                }
              >
                <p>{m.body}</p>
                <p className={"mt-1 text-[11px] " + (m.sender_role === "tutor" ? "text-blue-200" : "text-slate-400")}>
                  {new Intl.DateTimeFormat("en-US", { hour: "numeric", minute: "2-digit" }).format(new Date(m.created_at))}
                </p>
              </div>
            </div>
          ))
        )}
        <div ref={bottomRef} />
      </div>

      <form onSubmit={sendMessage} className="flex gap-2 border-t border-slate-200 pt-4">
        <input
          value={draft}
          onChange={(e) => setDraft(e.target.value)}
          placeholder="Type a message..."
          className="flex-1 rounded-xl border border-slate-200 px-4 py-2.5 text-sm outline-none focus:border-blue-700 focus:ring-4 focus:ring-blue-100"
        />
        <button
          type="submit"
          disabled={sending || !draft.trim()}
          className="rounded-xl bg-blue-800 px-4 py-2.5 text-white hover:bg-blue-900 disabled:opacity-50"
        >
          <Send size={18} />
        </button>
      </form>
    </div>
  );
}