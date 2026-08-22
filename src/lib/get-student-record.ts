import type { SupabaseClient } from "@supabase/supabase-js";

// export async function getStudentRecord(supabase: SupabaseClient) {
//   const { data: { user } } = await supabase.auth.getUser();
//   if (!user) return null;

//   const { data: student } = await supabase
//     .from("students")
//     .select("id, name, tutor_account_id")
//     .eq("profile_id", user.id)
//     .single();

//   return student ?? null;
// }


export async function getStudentRecord(supabase: SupabaseClient) {
  const {
    data: { user },
    error: userError,
  } = await supabase.auth.getUser();

  console.log("USER ID:", user?.id);
  console.log("USER EMAIL:", user?.email);
  console.log("USER ERROR:", userError);

  if (!user) {
    console.log("NO USER FOUND");
    return null;
  }

  const { data: student, error } = await supabase
    .from("students")
    .select("id, name, tutor_account_id, profile_id")
    .eq("profile_id", user.id)
    .maybeSingle();

  console.log("STUDENT RESULT:", student);
  console.log("STUDENT ERROR:", error);

  return student ?? null;
}