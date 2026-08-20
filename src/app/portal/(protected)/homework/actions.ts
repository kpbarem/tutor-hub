"use server";

import { revalidatePath } from "next/cache";
import { setHomeworkStatus } from "@/lib/set-homework-status";

export async function toggleHomeworkStatusStudent(homeworkId: string, status: "assigned" | "completed") {
  await setHomeworkStatus(homeworkId, status);
  revalidatePath("/portal/homework");
}