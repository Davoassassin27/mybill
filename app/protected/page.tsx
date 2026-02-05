import { createClient } from "@/utils/supabase/server";
import { redirect } from "next/navigation";
import { revalidatePath } from "next/cache";
import { Suspense } from "react";
import NotesSection from "@/components/NotesSection";
import DashboardClient from "@/components/DashboardClient"; // Importa el nuevo componente

export default async function ProtectedPage() {
  const supabase = await createClient();
  const { data: { user } } = await supabase.auth.getUser();

  if (!user) {
    redirect("/auth/login");
  }

  // Fetch de transacciones (SERVER SIDE)
  const { data: transactions } = await supabase
    .from("transactions")
    .select("*")
    .eq("user_id", user.id)
    .order("created_at", { ascending: false })
    .limit(50); // Traemos más para ver historial

  // Acción para añadir (Sigue siendo Server Action)
  const addTransaction = async (formData: FormData) => {
    "use server";
    const supabase = await createClient();
    const { data: { user } } = await supabase.auth.getUser();
    if(!user) return;

    const amount = formData.get("amount");
    const description = formData.get("description");
    const type = formData.get("type");
    const isPending = formData.get("isPending") === "on";

    await supabase.from("transactions").insert({
      amount: Number(amount),
      description: String(description),
      type: String(type),
      status: isPending ? 'pendiente' : 'pagado',
      category: "General",
      user_id: user.id,
    });
    revalidatePath("/protected");
  };

  return (
    <div className="min-h-screen relative flex flex-col md:flex-row">
        {/* IZQUIERDA: NOTAS (Componente de Servidor Independiente) */}
        <div className="w-full md:w-80 md:h-screen md:sticky md:top-0 p-4 z-10">
          <Suspense fallback={<div className="h-full bg-gray-100 rounded-[2rem] animate-pulse"/>}>
            <NotesSection />
          </Suspense>
        </div>

        {/* CENTRO Y DERECHA: DASHBOARD CLIENTE (Maneja la conversión y borrado) */}
        <div className="flex-1">
            <DashboardClient 
                transactions={transactions || []} 
                user={user} 
                addTransactionAction={addTransaction}
            />
        </div>
    </div>
  );
}