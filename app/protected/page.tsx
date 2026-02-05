import { createClient } from "@/utils/supabase/server";
import { redirect } from "next/navigation";
import { revalidatePath } from "next/cache";
import { Suspense } from "react";
import NotesSection from "@/components/NotesSection";
import DashboardClient from "@/components/DashboardClient";

export default async function ProtectedPage() {
  const supabase = await createClient();
  const { data: { user } } = await supabase.auth.getUser();

  if (!user) {
    redirect("/auth/login");
  }

  // Fetch de transacciones
  const { data: transactions } = await supabase
    .from("transactions")
    .select("*")
    .eq("user_id", user.id)
    .order("created_at", { ascending: false })
    .limit(50);

  // Acción para añadir
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
    // Pasamos NotesSection como children para que el Grid del cliente lo maneje
    <DashboardClient 
        transactions={transactions || []} 
        user={user} 
        addTransactionAction={addTransaction}
    >
        <Suspense fallback={<div className="h-full bg-gray-100 dark:bg-gray-800 rounded-[2rem] animate-pulse"/>}>
            <NotesSection />
        </Suspense>
    </DashboardClient>
  );
}