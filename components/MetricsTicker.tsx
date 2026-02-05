"use client";

import { useMemo } from "react";
import { AreaChart, Area, ResponsiveContainer, Tooltip, BarChart, Bar } from "recharts";
import { ArrowTrendingUpIcon, ArrowTrendingDownIcon, BanknotesIcon } from "@heroicons/react/24/outline";

export default function MetricsTicker({ transactions, safeRate }: { transactions: any[], safeRate: number }) {
  
  // Procesamos datos para los mini gráficos
  const data = useMemo(() => {
    // Agrupamos por día (últimos 7 días con movimiento)
    const grouped = transactions.slice(0, 10).reverse().map(t => ({
        name: new Date(t.created_at).getDate(),
        ingreso: t.type === 'ingreso' ? t.amount * safeRate : 0,
        gasto: t.type === 'gasto' ? t.amount * safeRate : 0,
        neto: (t.type === 'ingreso' ? t.amount : -t.amount) * safeRate
    }));
    return grouped;
  }, [transactions, safeRate]);

  return (
    <div className="w-full bg-white dark:bg-gray-900 border-t border-gray-200 dark:border-gray-800 py-3 px-6 flex flex-nowrap items-center gap-6 overflow-x-auto no-scrollbar shadow-[0_-10px_40px_rgba(0,0,0,0.05)]">
        
        {/* GRÁFICO 1: FLUJO DE INGRESOS */}
        <div className="flex-shrink-0 min-w-[200px] bg-gray-50 dark:bg-gray-800/50 rounded-xl p-2 flex items-center gap-3 border border-gray-100 dark:border-gray-700 hover:scale-105 transition-transform cursor-pointer group">
            <div className="h-10 w-10 bg-green-100 dark:bg-green-900/30 rounded-lg flex items-center justify-center">
                <ArrowTrendingUpIcon className="w-5 h-5 text-green-600"/>
            </div>
            <div className="flex-1">
                <p className="text-[10px] font-bold uppercase text-gray-400">Tendencia Ingresos</p>
                <div className="h-8 w-24">
                    <ResponsiveContainer width="100%" height="100%">
                        <AreaChart data={data}>
                            <defs>
                                <linearGradient id="colorIngreso" x1="0" y1="0" x2="0" y2="1">
                                    <stop offset="5%" stopColor="#22c55e" stopOpacity={0.3}/>
                                    <stop offset="95%" stopColor="#22c55e" stopOpacity={0}/>
                                </linearGradient>
                            </defs>
                            <Area type="monotone" dataKey="ingreso" stroke="#22c55e" strokeWidth={2} fill="url(#colorIngreso)" />
                        </AreaChart>
                    </ResponsiveContainer>
                </div>
            </div>
        </div>

        {/* GRÁFICO 2: VOLUMEN DE GASTOS */}
        <div className="flex-shrink-0 min-w-[200px] bg-gray-50 dark:bg-gray-800/50 rounded-xl p-2 flex items-center gap-3 border border-gray-100 dark:border-gray-700 hover:scale-105 transition-transform cursor-pointer group">
            <div className="h-10 w-10 bg-red-100 dark:bg-red-900/30 rounded-lg flex items-center justify-center">
                <ArrowTrendingDownIcon className="w-5 h-5 text-red-600"/>
            </div>
            <div className="flex-1">
                <p className="text-[10px] font-bold uppercase text-gray-400">Picos de Gasto</p>
                <div className="h-8 w-24">
                    <ResponsiveContainer width="100%" height="100%">
                        <BarChart data={data}>
                            <Bar dataKey="gasto" fill="#ef4444" radius={[2, 2, 0, 0]} />
                        </BarChart>
                    </ResponsiveContainer>
                </div>
            </div>
        </div>

        {/* GRÁFICO 3: NETO ACUMULADO */}
        <div className="flex-shrink-0 min-w-[200px] bg-gray-50 dark:bg-gray-800/50 rounded-xl p-2 flex items-center gap-3 border border-gray-100 dark:border-gray-700 hover:scale-105 transition-transform cursor-pointer group">
            <div className="h-10 w-10 bg-violet-100 dark:bg-violet-900/30 rounded-lg flex items-center justify-center">
                <BanknotesIcon className="w-5 h-5 text-violet-600"/>
            </div>
            <div className="flex-1">
                <p className="text-[10px] font-bold uppercase text-gray-400">Volatilidad</p>
                <div className="h-8 w-24">
                    <ResponsiveContainer width="100%" height="100%">
                         <AreaChart data={data}>
                            <Area type="step" dataKey="neto" stroke="#8b5cf6" strokeWidth={2} fill="transparent" />
                        </AreaChart>
                    </ResponsiveContainer>
                </div>
            </div>
        </div>

        {/* INFO EXTRA TEXTUAL */}
        <div className="flex-1 text-right hidden md:block opacity-50">
            <p className="text-xs text-gray-400">Datos basados en últimos 10 movimientos</p>
        </div>
    </div>
  );
}