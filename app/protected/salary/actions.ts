"use server";

import { createClient } from "@/utils/supabase/server";
import { revalidatePath } from "next/cache";

// --- CONFIGURACIÓN DE SUELDO ---
export async function updateSalaryConfig(formData: FormData) {
  const supabase = await createClient();
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) return;

  const amount = Number(formData.get("amount"));
  const pay_day = Number(formData.get("pay_day"));

  // Upsert: Si existe actualiza, si no crea
  await supabase.from("salary_config").upsert({ 
    user_id: user.id, 
    amount, 
    pay_day 
  });
  
  revalidatePath("/protected/salary");
}

// --- GASTOS FIJOS / CUOTAS ---
export async function addFixedExpense(formData: FormData) {
  const supabase = await createClient();
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) return;

  const title = String(formData.get("title"));
  const amount = Number(formData.get("amount"));
  const installments_current = Number(formData.get("installments_current") || 0);
  const installments_total = Number(formData.get("installments_total") || 0);

  await supabase.from("fixed_expenses").insert({
    user_id: user.id,
    title,
    amount,
    installments_current,
    installments_total
  });
  revalidatePath("/protected/salary");
}

export async function deleteFixedExpense(formData: FormData) {
  const supabase = await createClient();
  const id = formData.get("id");
  await supabase.from("fixed_expenses").delete().eq("id", id);
  revalidatePath("/protected/salary");
}

// --- INGRESOS PASIVOS ---
export async function addPassiveIncome(formData: FormData) {
  const supabase = await createClient();
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) return;

  const title = String(formData.get("title"));
  const amount = Number(formData.get("amount"));

  await supabase.from("passive_incomes").insert({
    user_id: user.id,
    title,
    amount
  });
  revalidatePath("/protected/salary");
}

export async function deletePassiveIncome(formData: FormData) {
  const supabase = await createClient();
  const id = formData.get("id");
  await supabase.from("passive_incomes").delete().eq("id", id);
  revalidatePath("/protected/salary");
}