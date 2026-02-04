"use server";

import { revalidatePath } from "next/cache";
import { redirect } from "next/navigation";
import { createClient } from "@/utils/supabase/server";

export async function login(formData: FormData) {
  const supabase = await createClient();

  // 1. Capturamos los datos del formulario
  const email = String(formData.get("email"));
  const password = String(formData.get("password"));

  // 2. Intentamos iniciar sesión
  const { error } = await supabase.auth.signInWithPassword({
    email,
    password,
  });

  if (error) {
    // Si falla, redirigimos al login con un parámetro de error (opcional para mostrar alerta)
    return redirect("/auth/login?error=Credenciales incorrectas");
  }

  // 3. Si todo sale bien:
  revalidatePath("/", "layout"); // Refresca la caché de la app
  redirect("/protected"); // Te manda al Dashboard
}

export async function signup(formData: FormData) {
  const supabase = await createClient();

  const email = String(formData.get("email"));
  const password = String(formData.get("password"));

  // 1. Intentamos registrar al usuario
  const { error } = await supabase.auth.signUp({
    email,
    password,
    // Opciones extra si quisieras redirigir a una URL específica tras confirmar email
    options: {
      emailRedirectTo: `${process.env.NEXT_PUBLIC_BASE_URL}/auth/callback`,
    },
  });

  if (error) {
    return redirect("/auth/login?error=Error al registrarse");
  }

  revalidatePath("/", "layout");
  redirect("/protected");
}