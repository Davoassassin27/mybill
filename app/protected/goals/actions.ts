"use server";

import { createClient } from "@/utils/supabase/server";
import { revalidatePath } from "next/cache";

export async function addGoal(formData: FormData) {
  const supabase = await createClient();
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) return;

  const name = String(formData.get("name"));
  const target_amount = Number(formData.get("target_amount"));
  const deadline = String(formData.get("deadline")); // Fecha opcional

  await supabase.from("savings_goals").insert({
    user_id: user.id,
    name,
    target_amount,
    saved_amount: 0, // Empieza en 0
    deadline: deadline || null,
  });
  
  revalidatePath("/protected/goals");
}

export async function addFunds(formData: FormData) {
  const supabase = await createClient();
  const goalId = formData.get("id");
  const amountToAdd = Number(formData.get("amount"));
  const currentSaved = Number(formData.get("current_saved"));

  // Sumamos lo nuevo a lo que ya había
  const newTotal = currentSaved + amountToAdd;

  await supabase.from("savings_goals")
    .update({ saved_amount: newTotal })
    .eq("id", goalId);

  revalidatePath("/protected/goals");
}

export async function deleteGoal(formData: FormData) {
  const supabase = await createClient();
  const id = formData.get("id");
  await supabase.from("savings_goals").delete().eq("id", id);
  revalidatePath("/protected/goals");
}