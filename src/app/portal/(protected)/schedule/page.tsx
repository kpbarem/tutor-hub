import { createClient } from "@/lib/supabase/server";
import { getStudentRecord } from "@/lib/get-student-record";
import { ScheduleLessonForm } from "@/components/schedule-lesson-form";

export default async function ScheduleLessonPage() {
  const supabase = await createClient();
  const student = await getStudentRecord(supabase);
  if (!student) return null;

  const { data: blocks } = await supabase
    .from("availability_blocks")
    .select("id, starts_at, ends_at, note")
    .eq("tutor_account_id", student.tutor_account_id)
    .gte("ends_at", new Date().toISOString())
    .order("starts_at", { ascending: true })
    .limit(10);

  return <ScheduleLessonForm blocks={blocks ?? []} timezone={student.timezone} />;
}