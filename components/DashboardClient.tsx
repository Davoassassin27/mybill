"use client";

import { useState, useRef } from "react";
import { ArrowDownIcon, ArrowUpIcon, TrashIcon, BanknotesIcon, CurrencyDollarIcon } from "@heroicons/react/24/outline";
import { ThemeToggle } from "@/components/ThemeToggle";
import SignOutButton from "@/components/SignOutButton";
import { deleteTransaction } from "@/app/protected/actions";

export default function DashboardClient({ 
  transactions, 
  user, 
  addTransactionAction 
}: { 
  transactions: any[], 
  user: any, 
  addTransactionAction: any 
}) {
  
  const formRef = useRef<HTMLFormElement>(null);

  const [exchangeRate, setExchangeRate] = useState<string | number>(1400); 
  const [isConversionMode, setIsConversionMode] = useState(false);

  const safeRate = isConversionMode ? (Number(exchangeRate) || 1) : 1;

  const calculateTotal = (type: 'ingreso' | 'gasto' | 'pendiente') => {
    return transactions
      ?.filter(t => 
        (type === 'pendiente' ? t.status === 'pendiente' : t.type === type && t.status === 'pagado')
      )
      .reduce((acc, t) => acc + t.amount, 0) || 0;
  };

  const ingresos = calculateTotal('ingreso');
  const gastos = calculateTotal('gasto');
  const deuda = calculateTotal('pendiente');
  const rawBalance = ingresos - gastos;
  const displayBalance = rawBalance * safeRate;

  return (
    <div className="min-h-screen px-4 py-6 md:p-8 max-w-[1600px] mx-auto relative">
      
      {/* Botones Flotantes */}
      <div className="absolute top-6 right-6 z-50 flex gap-2">
        <ThemeToggle />
        <SignOutButton />
      </div>

      <h1 className="text-2xl font-bold text-gray-900 dark:text-white mb-6 md:hidden">Mi Pizarrón</h1>

      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 h-full">
        
        {/* === COLUMNA CENTRAL === */}
        <div className="lg:col-span-8 space-y-6 order-2 lg:order-1">
            
            {/* ESTILO ESPEJO APLICADO AQUÍ: 
                bg-white/60 (semi-transparente) 
                backdrop-blur-xl (difuminado fuerte)
                border-white/50 (borde sutil blanco)
            */}
            <div className="bg-white/60 dark:bg-gray-900/40 backdrop-blur-xl p-1 rounded-[2rem] border border-white/60 dark:border-gray-800 shadow-xl shadow-gray-200/50 dark:shadow-none transition-all">
                <form 
                    ref={formRef} 
                    action={async (formData) => {
                        await addTransactionAction(formData); 
                        formRef.current?.reset();             
                    }} 
                    className="flex flex-col gap-2 p-4"
                >
                    <div className="relative group">
                        <span className="absolute left-0 top-1/2 -translate-y-1/2 text-gray-400 dark:text-gray-600 text-3xl font-light">$</span>
                        <input 
                            name="amount" type="number" step="0.01" placeholder="0.00" required 
                            className="w-full bg-transparent text-5xl font-bold text-gray-800 dark:text-white outline-none placeholder:text-gray-300 dark:placeholder:text-gray-800 pl-8"
                        />
                    </div>
                    <input 
                        name="description" type="text" placeholder="Concepto (ej. Sueldo, Spotify...)" required 
                        className="w-full bg-transparent border-b border-gray-200 dark:border-gray-800 pb-2 text-lg font-medium text-gray-600 dark:text-gray-300 outline-none focus:border-black dark:focus:border-violet-500 transition-colors"
                    />
                    <div className="grid grid-cols-2 gap-2 mt-4">
                        <button name="type" value="gasto" type="submit" className="bg-white dark:bg-white text-black py-4 rounded-xl font-bold hover:bg-gray-50 transition-all shadow-sm border border-gray-100 dark:border-none flex items-center justify-center gap-2">
                            <BanknotesIcon className="w-5 h-5"/> Gasto
                        </button>
                        <button name="type" value="ingreso" type="submit" className="bg-black dark:bg-gray-800 text-white py-4 rounded-xl font-bold hover:bg-gray-800 dark:hover:bg-gray-700 transition-all flex items-center justify-center gap-2 shadow-lg shadow-black/20 dark:shadow-none">
                            <ArrowUpIcon className="w-5 h-5 text-green-400"/> Ingreso
                        </button>
                    </div>
                    <label className="flex items-center gap-2 justify-center mt-2 cursor-pointer opacity-60 hover:opacity-100 transition-opacity">
                        <input type="checkbox" name="isPending" className="w-4 h-4 rounded accent-black dark:accent-violet-500"/>
                        <span className="text-xs font-medium text-gray-500 dark:text-gray-400">Marcar como Pendiente</span>
                    </label>
                </form>
            </div>

            {/* Lista de Movimientos */}
            <div className="pl-2 pb-20">
                <h3 className="text-xs font-bold text-gray-400 uppercase tracking-widest mb-4">Flujo de Caja</h3>
                <div className="space-y-3">
                  {transactions.map((t) => (
                    <div key={t.id} className="group flex justify-between items-center p-3 bg-white/70 dark:bg-gray-800/50 rounded-2xl border border-white/50 dark:border-gray-800/50 shadow-sm hover:shadow-md hover:bg-white dark:hover:bg-gray-800 transition-all backdrop-blur-md">
                      <div className="flex items-center gap-3">
                        <div className={`p-2 rounded-full ${t.type === 'ingreso' ? 'bg-green-100 dark:bg-green-900/30 text-green-600' : 'bg-gray-100 dark:bg-red-900/30 text-gray-600 dark:text-red-400'}`}>
                          {t.type === 'ingreso' ? <ArrowUpIcon className="w-4 h-4"/> : <ArrowDownIcon className="w-4 h-4"/>}
                        </div>
                        <div>
                          <p className="font-bold text-gray-900 dark:text-gray-200 text-sm">{t.description}</p>
                          <p className="text-[10px] text-gray-500 uppercase font-semibold">{t.status === 'pendiente' ? '⏳ Pendiente' : new Date(t.created_at).toLocaleDateString()}</p>
                        </div>
                      </div>
                      
                      <div className="flex items-center gap-4">
                        <span className={`font-bold ${t.type === 'ingreso' ? 'text-green-600' : 'text-gray-900 dark:text-white'}`}>
                            {t.type === 'ingreso' ? '+' : '-'}${Number(t.amount * safeRate).toLocaleString(undefined, {maximumFractionDigits: 0})}
                        </span>
                        
                        <form action={deleteTransaction}>
                            <input type="hidden" name="id" value={t.id} />
                            <button type="submit" className="p-2 text-gray-300 hover:text-red-500 dark:text-gray-600 dark:hover:text-red-400 transition-colors opacity-100 lg:opacity-0 lg:group-hover:opacity-100">
                                <TrashIcon className="w-4 h-4" />
                            </button>
                        </form>
                      </div>
                    </div>
                  ))}
                </div>
            </div>
        </div>

        {/* === COLUMNA DERECHA === */}
        <div className="lg:col-span-4 lg:h-[85vh] lg:sticky lg:top-8 space-y-6 order-1 lg:order-2 lg:mt-14">
             
            {/* Widget Convertidor Espejo */}
            <div className="bg-white/60 dark:bg-violet-900/10 p-4 rounded-[2rem] border border-white/60 dark:border-violet-900/20 backdrop-blur-xl shadow-sm">
                <div className="flex justify-between items-center mb-2">
                    <p className="text-gray-500 dark:text-violet-300 text-[10px] font-bold uppercase tracking-wider flex items-center gap-1">
                        <CurrencyDollarIcon className="w-3 h-3"/> Conversor ARS
                    </p>
                    <label className="relative inline-flex items-center cursor-pointer">
                        <input type="checkbox" checked={isConversionMode} onChange={(e) => setIsConversionMode(e.target.checked)} className="sr-only peer" />
                        <div className="w-9 h-5 bg-gray-200 peer-focus:outline-none rounded-full peer dark:bg-gray-700 peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-4 after:w-4 after:transition-all peer-checked:bg-black dark:peer-checked:bg-violet-600"></div>
                    </label>
                </div>
                
                {isConversionMode && (
                    <div className="flex items-center gap-2 bg-gray-50/50 dark:bg-gray-900/50 p-2 rounded-xl animate-in fade-in slide-in-from-top-2">
                        <span className="text-xs font-bold text-gray-400 pl-2">1 USD =</span>
                        <input 
                            type="number" 
                            value={exchangeRate}
                            onChange={(e) => {
                              const val = e.target.value;
                              setExchangeRate(val === "" ? "" : Number(val));
                            }}
                            className="w-full bg-transparent font-bold text-gray-900 dark:text-white outline-none text-right pr-2"
                        />
                        <span className="text-xs font-bold text-gray-400 pr-2">ARS</span>
                    </div>
                )}
            </div>

            {/* Tarjeta Balance - Mantiene negro sólido para contraste en ambos modos */}
            <div className="bg-black dark:bg-gray-900 text-white p-6 rounded-[2rem] relative overflow-hidden flex flex-col justify-center min-h-[180px] shadow-2xl shadow-gray-300 dark:shadow-none">
                <div className="absolute top-0 right-0 w-40 h-40 bg-gray-800 dark:bg-violet-600 rounded-full blur-[80px] opacity-40 animate-pulse"></div>
                <p className="text-gray-400 text-xs font-bold uppercase mb-1 relative z-10">Disponible Total</p>
                <div className="relative z-10">
                    <h2 className="text-4xl lg:text-5xl font-bold tracking-tight">
                        <span className="text-xl text-gray-500 mr-1">{isConversionMode ? "ARS" : "USD"}</span>
                        ${displayBalance.toLocaleString(undefined, {maximumFractionDigits: 0})}
                    </h2>
                    {isConversionMode && (
                        <p className="text-xs text-gray-500 mt-2">
                            Base: ${rawBalance.toLocaleString()} USD
                        </p>
                    )}
                </div>
            </div>

            <div className="grid grid-cols-2 gap-2">
                <div className="bg-white/60 dark:bg-gray-800 p-4 rounded-[1.5rem] border border-white/60 dark:border-gray-700 backdrop-blur-md shadow-sm">
                    <p className="text-gray-400 text-[10px] font-bold uppercase">Deuda</p>
                    <p className="text-lg font-bold text-gray-900 dark:text-white mt-1">
                        ${(deuda * safeRate).toLocaleString(undefined, {maximumFractionDigits: 0})}
                    </p>
                </div>
                <div className="bg-white/40 dark:bg-gray-800 p-4 rounded-[1.5rem] border border-white/40 dark:border-gray-700 opacity-60 backdrop-blur-sm">
                    <p className="text-gray-400 text-[10px] font-bold uppercase">Ahorro</p>
                    <p className="text-lg font-bold text-green-600 dark:text-green-500 mt-1">Soon...</p>
                </div>
            </div>
        </div>

      </div>
    </div>
  );
}