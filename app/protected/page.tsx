import { createClient } from "@/utils/supabase/server";
import { redirect } from "next/navigation";
import { revalidatePath } from "next/cache";

export const dynamic = "force-dynamic";

export default async function ProtectedPage() {
  const supabase = await createClient();

  // 1. Verificar Auth
  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) {
    return redirect("/login");
  }

  // 2. Acción de Servidor para guardar datos (Backend logic en el mismo archivo por ahora)
  const addTransaction = async (formData: FormData) => {
    "use server";
    const supabase = await createClient();
    const amount = formData.get("amount");
    const description = formData.get("description");
    const type = formData.get("type"); // 'gasto' o 'ingreso'
    
    // Hardcodeamos categoría por hoy para ir rápido
    const { error } = await supabase.from("transactions").insert({
      amount: Number(amount),
      description: String(description),
      type: String(type),
      category: "General",
      user_id: user.id,
    });

    if (error) console.error(error);
    revalidatePath("/protected"); // Refresca la lista sin recargar
  };

  // 3. Fetch de datos
  const { data: transactions } = await supabase
    .from("transactions")
    .select("*")
    .order("created_at", { ascending: false });

  return (
    <div className="max-w-md mx-auto p-4 space-y-6">
      <h1 className="text-2xl font-bold text-center mb-6">Mi Billetera 💸</h1>

      {/* Formulario de Entrada */}
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

      {/* Lista de Movimientos */}
      <div className="space-y-2">
        <h2 className="text-lg font-semibold">Movimientos Recientes</h2>
        {transactions?.map((t) => (
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
        {transactions?.length === 0 && (
          <p className="text-gray-500 text-center">No hay datos aún.</p>
        )}
      </div>
    </div>
  );
}