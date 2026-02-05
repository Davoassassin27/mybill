import { createClient } from "@/utils/supabase/server";
import { redirect } from "next/navigation";
import Link from "next/link";
import { ChartBarIcon, ShieldCheckIcon, WalletIcon } from "@heroicons/react/24/outline";

export default async function Index() {
  // 1. LOGIC: Si ya hay usuario, saltamos la landing y vamos al dashboard
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (user) {
    return redirect("/protected");
  }

  // 2. UI: Landing Page Minimalista
  return (
    <div className="flex flex-col min-h-screen bg-white">
      {/* Navbar Simple */}
      <nav className="flex items-center justify-between p-6 max-w-5xl mx-auto w-full">
        <div className="text-2xl font-extrabold tracking-tighter">
          my<span className="text-gray-400">bill.</span>
        </div>
        <Link 
          href="/auth/login" 
          className="text-sm font-semibold text-gray-900 hover:text-gray-600 transition-colors"
        >
          Entrar
        </Link>
      </nav>

      {/* Hero Section */}
      <main className="flex-1 flex flex-col items-center justify-center text-center px-6 pb-20 max-w-3xl mx-auto mt-10 sm:mt-0">
        <div className="inline-flex items-center rounded-full border border-gray-200 bg-gray-50 px-3 py-1 text-sm font-medium text-gray-600 mb-8">
          🚀 Finanzas personales v1.0
        </div>
        
        <h1 className="text-5xl sm:text-7xl font-bold tracking-tight text-gray-900 mb-6">
          Toma el control de <br className="hidden sm:block"/>
          <span className="text-transparent bg-clip-text bg-gradient-to-r from-gray-900 to-gray-500">
            tu dinero.
          </span>
        </h1>
        
        <p className="text-lg text-gray-500 mb-10 max-w-md mx-auto leading-relaxed">
          Sin hojas de cálculo complejas. Sin publicidad. Solo tus ingresos, tus gastos y tu tranquilidad.
        </p>

        <div className="flex flex-col sm:flex-row gap-4 w-full sm:w-auto">
          <Link
            href="/auth/login"
            className="rounded-2xl bg-black px-8 py-4 text-center text-white font-bold text-lg hover:bg-gray-800 hover:scale-105 transition-all shadow-xl shadow-gray-200"
          >
            Empezar ahora
          </Link>
          <a
            href="https://github.com/tu-usuario/mybill" // Opcional
            target="_blank" 
            rel="noreferrer"
            className="rounded-2xl border border-gray-200 bg-white px-8 py-4 text-center text-gray-900 font-bold text-lg hover:bg-gray-50 hover:border-gray-300 transition-all"
          >
            Ver código
          </a>
        </div>

        {/* Features Grid (Iconos) */}
        <div className="grid grid-cols-1 sm:grid-cols-3 gap-8 mt-24 w-full text-left">
          <Feature 
            icon={<WalletIcon className="w-6 h-6"/>}
            title="Registro Rápido"
            desc="Anota gastos en segundos con una interfaz pensada para móviles."
          />
          <Feature 
            icon={<ChartBarIcon className="w-6 h-6"/>}
            title="Métricas Claras"
            desc="Visualiza tu balance y deudas pendientes al instante."
          />
          <Feature 
            icon={<ShieldCheckIcon className="w-6 h-6"/>}
            title="Datos Privados"
            desc="Tus datos son tuyos. Almacenados con seguridad RLS."
          />
        </div>
      </main>

      {/* Footer */}
      <footer className="py-8 text-center text-gray-400 text-sm border-t border-gray-100">
        © {new Date().getFullYear()} MyBill App. Creado con Next.js 16.
      </footer>
    </div>
  );
}

// Componente auxiliar para los items de características
function Feature({ icon, title, desc }: { icon: any, title: string, desc: string }) {
  return (
    <div className="flex flex-col gap-2 p-4 rounded-2xl bg-gray-50/50 border border-transparent hover:border-gray-200 transition-colors">
      <div className="p-2 w-fit rounded-lg bg-white border border-gray-200 text-black mb-2 shadow-sm">
        {icon}
      </div>
      <h3 className="font-bold text-gray-900">{title}</h3>
      <p className="text-sm text-gray-500 leading-relaxed">{desc}</p>
    </div>
  );
}