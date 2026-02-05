"use server";

import { createClient } from "@/utils/supabase/server";
import { revalidatePath } from "next/cache";
import { redirect } from "next/navigation"; // <--- ASEGÚRATE DE IMPORTAR ESTO

export async function deleteTransaction(formData: FormData) {
  const supabase = await createClient();
  const id = formData.get("id");
  if (!id) return;
  await supabase.from("transactions").delete().eq("id", id);
  revalidatePath("/protected");
}

export async function deleteNote(formData: FormData) {
  const supabase = await createClient();
  const id = formData.get("id");
  await supabase.from("notes").delete().eq("id", id);
  revalidatePath("/protected");
}

// --- NUEVA FUNCIÓN AGREGADA ---
export async function signOutAction() {
  const supabase = await createClient();
  await supabase.auth.signOut();
  return redirect("/auth/login");
}