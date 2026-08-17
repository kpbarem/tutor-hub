import type { Lesson, Student } from "./types";

export const students: Student[] = [
  { id: "elena", name: "Alexandra C", email: "Alexandra@fake.com", timezone: "GET", language: "Spanish", level: "A2", nextLesson: "2026-07-17T16:00:00", balance: 72, avatar: "EP" },
  { id: "marco", name: "Kevin B", email: "kevin@notreal.com", timezone: "MST", language: "Russian", level: "B1", nextLesson: "2026-07-18T11:30:00", balance: 0, avatar: "MR" },
];

export const lessons: Lesson[] = [
  { id: "l1", studentId: "elena", studentName: "Alexandra C", startsAt: "2026-07-17T16:00:00", durationMinutes: 60, status: "confirmed", topic: "Conversation practice" },
  { id: "l2", studentId: "marco", studentName: "Kevin B", startsAt: "2026-07-18T11:30:00", durationMinutes: 45, status: "confirmed", topic: "Past tense review" },
];
