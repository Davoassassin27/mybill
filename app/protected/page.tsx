import { createClient } from "@/utils/supabase/server";
import { redirect } from "next/navigation";
import { revalidatePath } from "next/cache";
import { Suspense } from "react";
import { ArrowDownIcon, ArrowUpIcon, ClockIcon, CheckCircleIcon } from "@heroicons/react/24/outline";

// --- COMPONENTE LISTA (Client Component UI, Server Data) ---
async function TransactionList() {
  const supabase = await createClient();
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) return null;

  const { data: transactions } = await supabase
    .from("transactions")
    .select("*")
    .eq("user_id", user.id)
    .order("created_at", { ascending: false });

  if (!transactions?.length) {
    return <div className="text-center py-12 text-gray-400 font-light">Nada por aquí aún.</div>;
  }

  return (
    <div className="space-y-4 pb-24">
      <h3 className="text-xs font-semibold text-gray-400 uppercase tracking-widest pl-1">Historial</h3>
      {transactions.map((t) => (
        <div key={t.id} className="group flex justify-between items-center p-4 bg-white border border-gray-100 rounded-2xl shadow-sm hover:border-gray-300 transition-all">
          <div className="flex items-center gap-4">
            <div className={`p-3 rounded-full ${t.type === 'ingreso' ? 'bg-green-50 text-green-600' : 'bg-gray-50 text-gray-900'}`}>
              {t.type === 'ingreso' ? <ArrowUpIcon className="w-5 h-5"/> : <ArrowDownIcon className="w-5 h-5"/>}
            </div>
            <div>
              <p className="font-semibold text-gray-900 text-sm">{t.description}</p>
              <div className="flex items-center gap-2 text-xs text-gray-500 mt-0.5">
                <span>{new Date(t.created_at).toLocaleDateString()}</span>
                {t.status === 'pendiente' ? (
                  <span className="inline-flex items-center gap-1 rounded-md bg-yellow-50 px-2 py-0.5 text-xs font-medium text-yellow-700 ring-1 ring-inset ring-yellow-600/20">
                    <ClockIcon className="w-3 h-3"/> Pendiente
                  </span>
                ) : (
                   <span className="text-green-600 flex items-center gap-1"><CheckCircleIcon className="w-3 h-3"/> Pagado</span>
                )}
              </div>
            </div>
          </div>
          <div className="text-right">
             <span className={`block text-lg font-bold ${t.type === "ingreso" ? "text-green-600" : "text-gray-900"}`}>
              {t.type === "ingreso" ? "+" : "-"}${Number(t.amount).toLocaleString()}
            </span>
          </div>
        </div>
      ))}
    </div>
  );
}

// --- COMPONENTE DE BALANCE ---
async function BalanceHeader() {
  const supabase = await createClient();
  const { data: { user } } = await supabase.auth.getUser();
  if(!user) return null;

  const { data: transactions } = await supabase.from("transactions").select("amount, type, status").eq("user_id", user.id);

  // Lógica Financiera:
  // Balance Actual = (Ingresos Pagados) - (Gastos Pagados)
  // Deuda Pendiente = Suma de Gastos Pendientes
  
  const ingresos = transactions?.filter(t => t.type === 'ingreso' && t.status === 'pagado').reduce((acc, t) => acc + t.amount, 0) || 0;
  const gastos = transactions?.filter(t => t.type === 'gasto' && t.status === 'pagado').reduce((acc, t) => acc + t.amount, 0) || 0;
  const deuda = transactions?.filter(t => t.type === 'gasto' && t.status === 'pendiente').reduce((acc, t) => acc + t.amount, 0) || 0;

  const balance = ingresos - gastos;

  return (
    <div className="mb-8">
      <div className="bg-black text-white p-6 rounded-[2rem] shadow-2xl relative overflow-hidden">
        <div className="relative z-10">
          <p className="text-gray-400 text-sm font-medium mb-1">Balance Disponible</p>
          <h2 className="text-5xl font-bold tracking-tight">${balance.toLocaleString()}</h2>
          
          {deuda > 0 && (
             <div className="mt-4 inline-flex items-center gap-2 bg-white/10 px-3 py-1.5 rounded-full backdrop-blur-sm">
               <ClockIcon className="w-4 h-4 text-yellow-400"/>
               <p className="text-xs text-gray-200">Pendiente de pago: <span className="font-bold text-white">${deuda.toLocaleString()}</span></p>
             </div>
          )}
        </div>
        {/* Decoración de fondo */}
        <div className="absolute -top-10 -right-10 w-40 h-40 bg-gray-800 rounded-full blur-3xl opacity-50"></div>
      </div>
    </div>
  );
}

// --- PÁGINA PRINCIPAL ---
export default async function ProtectedPage() {
  const supabase = await createClient();
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) redirect("/auth/login"); // <-- OJO: Ajusté la ruta a tu estructura

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
      type: String(type), // 'gasto' o 'ingreso'
      status: isPending ? 'pendiente' : 'pagado',
      user_id: user.id,
      category: "General" 
    });
    revalidatePath("/protected");
  };

  // Fecha actual (Formato: Martes, 4 de febrero)
  const today = new Date().toLocaleDateString('es-ES', { weekday: 'long', day: 'numeric', month: 'long' });

  return (
    <div className="min-h-screen bg-[#FBFBFB] px-6 pt-10">
      
      {/* Header Fecha */}
      <header className="mb-6 flex justify-between items-center">
        <div>
          <p className="text-gray-400 text-xs font-bold uppercase tracking-wider">Hoy</p>
          <h1 className="text-2xl font-bold text-gray-900 capitalize">{today}</h1>
        </div>
        <div className="h-10 w-10 rounded-full bg-gradient-to-br from-gray-800 to-black border-2 border-white shadow-sm"></div>
      </header>

      {/* Tarjeta de Balance */}
      <Suspense fallback={<div className="h-48 bg-gray-200 rounded-[2rem] animate-pulse mb-8"/>}>
        <BalanceHeader />
      </Suspense>

      {/* Formulario de Entrada Rápida */}
      <div className="mb-10">
        <form action={addTransaction} className="bg-white p-1 rounded-[1.5rem] shadow-sm border border-gray-100 flex flex-col gap-2">
            {/* Input Monto */}
            <div className="px-5 pt-4">
               <label className="text-xs font-bold text-gray-400 uppercase">Monto</label>
               <div className="flex items-center gap-1">
                  <span className="text-2xl text-gray-300">$</span>
                  <input name="amount" type="number" step="0.01" placeholder="0.00" className="w-full text-3xl font-bold text-gray-900 outline-none placeholder:text-gray-200" required />
               </div>
            </div>

            {/* Separador */}
            <div className="h-px w-full bg-gray-50"></div>

            {/* Detalles */}
            <div className="px-5 pb-4 flex flex-col gap-4">
               <input name="description" type="text" placeholder="¿Qué compraste?" className="w-full text-sm font-medium text-gray-900 outline-none placeholder:text-gray-400" required />
               
               <div className="flex gap-2 overflow-x-auto pb-1">
                  {/* Selector Tipo Custom */}
                  <div className="relative flex-shrink-0">
                    <select name="type" className="appearance-none bg-gray-50 hover:bg-gray-100 text-gray-700 text-xs font-bold py-2 pl-3 pr-8 rounded-lg outline-none transition-colors cursor-pointer">
                      <option value="gasto">💸 Gasto</option>
                      <option value="ingreso">💰 Ingreso</option>
                    </select>
                    <div className="pointer-events-none absolute inset-y-0 right-0 flex items-center px-2 text-gray-500">
                      <svg className="fill-current h-3 w-3" xmlns="http://www.w3.org/2000/svg" viewBox="0 0 20 20"><path d="M9.293 12.95l.707.707L15.657 8l-1.414-1.414L10 10.828 5.757 6.586 4.343 8z"/></svg>
                    </div>
                  </div>

                  {/* Toggle Pendiente */}
                  <label className="flex items-center gap-2 bg-yellow-50 px-3 py-2 rounded-lg cursor-pointer hover:bg-yellow-100 transition-colors border border-transparent hover:border-yellow-200 flex-shrink-0">
                    <input type="checkbox" name="isPending" className="w-3.5 h-3.5 accent-yellow-600 rounded" />
                    <span className="text-xs font-bold text-yellow-700">⏳ Pendiente</span>
                  </label>

                  <button type="submit" className="ml-auto bg-black text-white px-4 py-2 rounded-lg text-xs font-bold hover:bg-gray-800 transition-colors flex-shrink-0">
                    Guardar
                  </button>
               </div>
            </div>
        </form>
      </div>

      {/* Lista */}
      <Suspense fallback={<p className="text-center text-sm text-gray-400">Cargando...</p>}>
        <TransactionList />
      </Suspense>
    </div>
  );
}