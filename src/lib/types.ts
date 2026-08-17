export type Student = {
  id: string;
  name: string;
  email: string;
  timezone: string;
  language: string;
  level: string;
  nextLesson: string;
  balance: number;
  avatar: string;
};

export type Lesson = {
  id: string;
  studentId: string;
  studentName: string;
  startsAt: string;
  durationMinutes: number;
  status: "confirmed" | "completed" | "cancelled";
  topic: string;
};
