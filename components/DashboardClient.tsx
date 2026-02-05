"use client";

import { useState, useRef } from "react";
// CORRECCIÓN AQUÍ: Agregamos CurrencyDollarIcon a los imports
import { ArrowDownIcon, ArrowUpIcon, TrashIcon, BanknotesIcon, ArrowTrendingDownIcon, CurrencyDollarIcon } from "@heroicons/react/24/outline";
import { ThemeToggle } from "@/components/ThemeToggle";
import SignOutButton from "@/components/SignOutButton";
import { deleteTransaction } from "@/app/protected/actions";
import MetricsTicker from "@/components/MetricsTicker";

export default function DashboardClient({ 
  transactions, 
  user, 
  addTransactionAction,
  children 
}: { 
  transactions: any[], 
  user: any, 
  addTransactionAction: any,
  children: React.ReactNode 
}) {
  
  const formRef = useRef<HTMLFormElement>(null);
  const [exchangeRate, setExchangeRate] = useState<string | number>(1400); 
  const [isConversionMode, setIsConversionMode] = useState(false);

  const safeRate = isConversionMode ? (Number(exchangeRate) || 1) : 1;

  const calculateTotal = (type: 'ingreso' | 'gasto' | 'pendiente') => {
    return transactions?.filter(t => 
        (type === 'pendiente' ? t.status === 'pendiente' : t.type === type && t.status === 'pagado')
      ).reduce((acc, t) => acc + t.amount, 0) || 0;
  };

  const ingresos = calculateTotal('ingreso');
  const gastos = calculateTotal('gasto');
  const deuda = calculateTotal('pendiente');
  const rawBalance = ingresos - gastos;
  const displayBalance = rawBalance * safeRate;

  return (
    <div className="flex flex-col h-screen max-h-screen bg-gray-50/50 dark:bg-black/90 overflow-hidden">
      
      {/* 1. HEADER INTEGRADO */}
      <header className="flex-shrink-0 px-6 py-4 flex justify-between items-center">
        <div>
           <h1 className="text-xl font-bold text-gray-900 dark:text-white flex items-center gap-2">
              <span className="w-2 h-6 bg-violet-600 rounded-full inline-block"></span>
              Mi Pizarrón
           </h1>
           <p className="text-xs text-gray-500 hidden md:block ml-4">Resumen financiero en tiempo real</p>
        </div>
        
        <div className="flex items-center gap-3 bg-white dark:bg-gray-800 p-1.5 rounded-full border border-gray-200 dark:border-gray-700 shadow-sm">
           <ThemeToggle />
           <div className="w-px h-4 bg-gray-300 dark:bg-gray-600"></div>
           <SignOutButton />
        </div>
      </header>

      {/* 2. AREA DE TRABAJO (GRID) */}
      <div className="flex-1 min-h-0 px-4 pb-4 md:px-6 md:pb-6 w-full max-w-[1900px] mx-auto">
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-4 h-full">
            
            {/* IZQUIERDA: NOTAS (3 cols) */}
            <div className="lg:col-span-3 h-full overflow-hidden flex flex-col">
                <div className="h-full [&>div]:h-full">
                    {children}
                </div>
            </div>

            {/* CENTRO: OPERATIVA (6 cols) */}
            <div className="lg:col-span-6 flex flex-col gap-4 h-full min-h-0">
                
                {/* Input Rápido */}
                <div className="flex-shrink-0 bg-white dark:bg-gray-900/60 backdrop-blur-xl p-4 rounded-[1.5rem] border border-gray-200 dark:border-gray-800 shadow-sm">
                    <form 
                        ref={formRef} 
                        action={async (formData) => { await addTransactionAction(formData); formRef.current?.reset(); }} 
                        className="flex flex-col gap-2"
                    >
                        <div className="flex gap-4 items-end px-2">
                            <span className="text-gray-300 dark:text-gray-600 text-3xl font-light pb-1">$</span>
                            <input 
                                name="amount" type="number" step="0.01" placeholder="0.00" required 
                                className="flex-1 bg-transparent text-4xl font-bold text-gray-900 dark:text-white outline-none placeholder:text-gray-200 dark:placeholder:text-gray-800 border-b border-transparent focus:border-gray-200 transition-colors pb-1"
                            />
                        </div>
                        <input 
                             name="description" type="text" placeholder="Concepto (ej. Cena...)" required 
                             className="w-full bg-transparent px-2 text-sm font-medium text-gray-600 dark:text-gray-300 outline-none placeholder:text-gray-400"
                        />
                        <div className="grid grid-cols-2 gap-2 mt-2">
                            <button name="type" value="gasto" type="submit" className="bg-gray-100 dark:bg-white text-black py-2.5 rounded-xl font-bold hover:bg-gray-200 transition-all text-xs flex items-center justify-center gap-2">
                                <BanknotesIcon className="w-4 h-4"/> Gasto
                            </button>
                            <button name="type" value="ingreso" type="submit" className="bg-black dark:bg-gray-800 text-white py-2.5 rounded-xl font-bold hover:bg-gray-800 dark:hover:bg-gray-700 transition-all text-xs flex items-center justify-center gap-2">
                                <ArrowUpIcon className="w-4 h-4 text-green-400"/> Ingreso
                            </button>
                        </div>
                        <label className="flex items-center gap-2 justify-center cursor-pointer opacity-60 hover:opacity-100 transition-opacity pt-1">
                            <input type="checkbox" name="isPending" className="w-3.5 h-3.5 rounded accent-violet-600"/>
                            <span className="text-[10px] font-bold uppercase text-gray-500">Pendiente / Deuda</span>
                        </label>
                    </form>
                </div>

                {/* Lista (Scrollable) */}
                <div className="flex-1 bg-white/50 dark:bg-gray-900/40 backdrop-blur-md rounded-[1.5rem] border border-gray-200 dark:border-gray-800 p-4 flex flex-col min-h-0">
                    <div className="flex-1 overflow-y-auto pr-2 custom-scrollbar space-y-2">
                         {transactions.map((t) => (
                            <div key={t.id} className="group flex justify-between items-center p-2 bg-white dark:bg-gray-800 rounded-xl border border-gray-100 dark:border-gray-700/50 hover:border-gray-300 dark:hover:border-gray-600 transition-all">
                              <div className="flex items-center gap-3">
                                <div className={`p-2 rounded-full ${t.type === 'ingreso' ? 'bg-green-50 dark:bg-green-900/20 text-green-600' : 'bg-gray-50 dark:bg-red-900/20 text-gray-600 dark:text-red-400'}`}>
                                  {t.type === 'ingreso' ? <ArrowUpIcon className="w-3 h-3"/> : <ArrowTrendingDownIcon className="w-3 h-3"/>}
                                </div>
                                <div>
                                  <p className="font-bold text-gray-900 dark:text-gray-200 text-xs truncate max-w-[120px]">{t.description}</p>
                                  <p className="text-[10px] text-gray-400 uppercase font-semibold">{t.status === 'pendiente' ? '⏳ Pendiente' : new Date(t.created_at).toLocaleDateString()}</p>
                                </div>
                              </div>
                              <div className="flex items-center gap-3">
                                <span className={`font-bold text-sm ${t.type === 'ingreso' ? 'text-green-600' : 'text-gray-900 dark:text-white'}`}>
                                    {t.type === 'ingreso' ? '+' : '-'}${Number(t.amount * safeRate).toLocaleString(undefined, {maximumFractionDigits: 0})}
                                </span>
                                <form action={deleteTransaction}>
                                    <input type="hidden" name="id" value={t.id} />
                                    <button type="submit" className="text-gray-300 hover:text-red-500 opacity-0 group-hover:opacity-100 transition-opacity"><TrashIcon className="w-3 h-3" /></button>
                                </form>
                              </div>
                            </div>
                          ))}
                    </div>
                </div>
            </div>

            {/* DERECHA: BALANCE (3 cols) */}
            <div className="lg:col-span-3 flex flex-col gap-4 h-full min-h-0">
                
                {/* Conversor */}
                <div className="flex-shrink-0 bg-white dark:bg-gray-900 p-4 rounded-[1.5rem] border border-gray-200 dark:border-gray-800 shadow-sm">
                    <div className="flex justify-between items-center mb-2">
                        <span className="text-[10px] font-bold uppercase text-gray-400 flex items-center gap-1">
                            <CurrencyDollarIcon className="w-3 h-3"/> Conversor
                        </span>
                        <label className="relative inline-flex items-center cursor-pointer scale-75 origin-right">
                            <input type="checkbox" checked={isConversionMode} onChange={(e) => setIsConversionMode(e.target.checked)} className="sr-only peer" />
                            <div className="w-9 h-5 bg-gray-200 rounded-full peer dark:bg-gray-700 peer-checked:bg-violet-600 peer-checked:after:translate-x-full after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:rounded-full after:h-4 after:w-4 after:transition-all"></div>
                        </label>
                    </div>
                    {isConversionMode && (
                        <div className="flex items-center gap-2 bg-gray-50 dark:bg-gray-800 p-2 rounded-xl animate-in fade-in slide-in-from-top-1">
                            <span className="text-xs font-bold text-gray-500">1 USD =</span>
                            <input 
                                type="number" 
                                value={exchangeRate}
                                onChange={(e) => setExchangeRate(e.target.value === "" ? "" : Number(e.target.value))}
                                className="w-full bg-transparent font-bold text-gray-900 dark:text-white outline-none text-right text-sm"
                            />
                            <span className="text-xs font-bold text-gray-500">ARS</span>
                        </div>
                    )}
                </div>

                {/* Balance Principal */}
                <div className="flex-1 bg-black dark:bg-gray-900 text-white p-6 rounded-[1.5rem] relative overflow-hidden flex flex-col justify-center shadow-xl group">
                    <div className="absolute top-0 right-0 w-32 h-32 bg-gray-800 dark:bg-violet-600 rounded-full blur-[50px] opacity-40 group-hover:opacity-60 transition-opacity duration-700"></div>
                    <p className="text-gray-400 text-[10px] font-bold uppercase mb-1 relative z-10">Disponible Real</p>
                    <div className="relative z-10">
                        <h2 className="text-4xl lg:text-5xl font-bold tracking-tight">
                            <span className="text-lg text-gray-500 mr-1">{isConversionMode ? "ARS" : "USD"}</span>
                            ${displayBalance.toLocaleString(undefined, {maximumFractionDigits: 0})}
                        </h2>
                    </div>
                </div>

                {/* Deuda */}
                <div className="flex-shrink-0 bg-white dark:bg-gray-800 p-4 rounded-[1.5rem] border border-gray-200 dark:border-gray-700 flex justify-between items-center h-20">
                    <div>
                        <p className="text-gray-400 text-[10px] font-bold uppercase">Deuda Pend.</p>
                        <p className="text-xl font-bold text-gray-900 dark:text-white">${(deuda * safeRate).toLocaleString(undefined, {maximumFractionDigits: 0})}</p>
                    </div>
                    <div className="h-8 w-8 bg-red-50 dark:bg-red-900/30 rounded-full flex items-center justify-center text-xs">💸</div>
                </div>
            </div>

        </div>
      </div>

      {/* 3. TICKER INFERIOR */}
      <div className="flex-shrink-0 relative z-20">
         <MetricsTicker transactions={transactions} safeRate={safeRate} />
      </div>
    </div>
  );
}