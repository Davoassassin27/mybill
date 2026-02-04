import { createClient } from "@/utils/supabase/server";
import { redirect } from "next/navigation";
import { revalidatePath } from "next/cache";
import { Suspense } from "react";

// Forzamos dinamismo y desactivamos caché para asegurar datos frescos
export const dynamic = "force-dynamic";
export const fetchCache = "force-no-store";

// 1. Componente que hace el trabajo pesado (Async)
async function TransactionList() {
  const supabase = await createClient();
  
  // Verificamos usuario dentro del componente de datos
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) return null; // El redirect lo maneja el padre o middleware

  const { data: transactions } = await supabase
    .from("transactions")
    .select("*")
    .eq("user_id", user.id) // Filtrar por usuario explícitamente es buena práctica
    .order("created_at", { ascending: false });

  if (!transactions || transactions.length === 0) {
    return <p className="text-gray-500 text-center">No hay datos aún.</p>;
  }

  return (
    <div className="space-y-2">
      <h2 className="text-lg font-semibold">Movimientos Recientes</h2>
      {transactions.map((t) => (
        <div
          key={t.id}
          className="flex justify-between items-center p-3 border rounded bg-white shadow-sm"
        >
          <div>
            <p className="font-medium">{t.description}</p>
            <p className="text-xs text-gray-500">
              {new Date(t.created_at).toLocaleDateString()}
            </p>
          </div>
          <span
            className={`font-bold ${
              t.type === "ingreso" ? "text-green-600" : "text-red-600"
            }`}
          >
            {t.type === "ingreso" ? "+" : "-"}${t.amount}
          </span>
        </div>
      ))}
    </div>
  );
}

// 2. Página Principal (El esqueleto)
export default async function ProtectedPage() {
  const supabase = await createClient();
  const { data: { user } } = await supabase.auth.getUser();

  if (!user) {
    redirect("/login");
  }

  // Action del Formulario
  const addTransaction = async (formData: FormData) => {
    "use server";
    const supabase = await createClient();
    
    // Necesitamos el usuario de nuevo para el insert
    const { data: { user } } = await supabase.auth.getUser();
    if(!user) return;

    const amount = formData.get("amount");
    const description = formData.get("description");
    const type = formData.get("type");

    await supabase.from("transactions").insert({
      amount: Number(amount),
      description: String(description),
      type: String(type),
      category: "General",
      user_id: user.id,
    });
    
    revalidatePath("/protected");
  };

  return (
    <div className="max-w-md mx-auto p-4 space-y-6">
      <h1 className="text-2xl font-bold text-center mb-6">Mi Billetera 💸</h1>

      {/* Formulario (Es estático, carga rápido) */}
      <div className="bg-gray-100 p-4 rounded-lg shadow-sm">
        <form action={addTransaction} className="flex flex-col gap-3">
          <div className="flex gap-2">
            <select name="type" className="p-2 rounded border w-1/3">
              <option value="gasto">Gasto</option>
              <option value="ingreso">Ingreso</option>
            </select>
            <input
              name="amount"
              type="number"
              step="0.01"
              placeholder="0.00"
              className="p-2 rounded border w-2/3"
              required
            />
          </div>
          <input
            name="description"
            type="text"
            placeholder="¿En qué gastaste?"
            className="p-2 rounded border"
            required
          />
          <button
            type="submit"
            className="bg-black text-white p-2 rounded hover:bg-gray-800 transition"
          >
            Guardar
          </button>
        </form>
      </div>

      {/* Lista de Datos (Envuelto en Suspense para calmar al compilador) */}
      <Suspense fallback={<div className="text-center py-4">Cargando movimientos...</div>}>
        <TransactionList />
      </Suspense>
    </div>
  );
}