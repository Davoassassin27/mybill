"use client";

import { useState, useRef, useMemo } from "react";
import { 
  BanknotesIcon, CalendarIcon, TrashIcon, PlusIcon, 
  CalculatorIcon, CurrencyDollarIcon, ChartBarIcon, ChartPieIcon, PresentationChartLineIcon 
} from "@heroicons/react/24/outline";
import { 
  BarChart, Bar, XAxis, YAxis, Tooltip, ResponsiveContainer, Cell, 
  PieChart, Pie, AreaChart, Area, CartesianGrid 
} from "recharts";
import { updateSalaryConfig, addFixedExpense, deleteFixedExpense, addPassiveIncome, deletePassiveIncome } from "@/app/protected/salary/actions";

export default function SalaryClient({ salaryConfig, fixedExpenses, passiveIncomes }: any) {
  const [exchangeRate, setExchangeRate] = useState<string | number>(1400); 
  const [isConversionMode, setIsConversionMode] = useState(false);
  const [projectionMonths, setProjectionMonths] = useState(6);
  const [chartType, setChartType] = useState<'bar' | 'pie' | 'area'>('bar');

  const expenseFormRef = useRef<HTMLFormElement>(null);
  const incomeFormRef = useRef<HTMLFormElement>(null);

  const safeRate = isConversionMode ? (Number(exchangeRate) || 1) : 1;
  const currencySymbol = isConversionMode ? "ARS$" : "USD$";

  const sueldoBase = salaryConfig?.amount || 0;
  const totalPasivos = passiveIncomes?.reduce((acc: number, item: any) => acc + item.amount, 0) || 0;
  const totalFijos = fixedExpenses?.reduce((acc: number, item: any) => acc + item.amount, 0) || 0;
  
  const ingresosTotales = sueldoBase + totalPasivos;
  const ahorroEstimado = ingresosTotales - totalFijos;
  const porcentajeAhorro = ingresosTotales > 0 ? ((ahorroEstimado / ingresosTotales) * 100).toFixed(0) : 0;

  const today = new Date();
  const payDay = salaryConfig?.pay_day || 1;
  let nextPayDate = new Date(today.getFullYear(), today.getMonth(), payDay);
  if (today.getDate() > payDay) {
    nextPayDate = new Date(today.getFullYear(), today.getMonth() + 1, payDay);
  }
  const daysUntilPay = Math.ceil((nextPayDate.getTime() - today.getTime()) / (1000 * 60 * 60 * 24));

  const barData = useMemo(() => {
    return fixedExpenses.map((e: any) => ({
      name: e.title.substring(0, 10),
      monto: e.amount * safeRate
    })).sort((a: any, b: any) => b.monto - a.monto).slice(0, 5);
  }, [fixedExpenses, safeRate]);

  const pieData = [
    { name: 'Fijos', value: totalFijos * safeRate, color: '#ef4444' },
    { name: 'Ahorro', value: ahorroEstimado * safeRate, color: '#8b5cf6' },
  ];

  const areaData = useMemo(() => {
    const data = [];
    let accum = 0;
    for (let i = 1; i <= 6; i++) {
        accum += (ahorroEstimado * safeRate);
        data.push({ mes: `M${i}`, ahorro: accum });
    }
    return data;
  }, [ahorroEstimado, safeRate]);

  return (
    <div className="animate-in fade-in zoom-in duration-500 w-full">
        
        {/* === HEADER & CONVERSOR === */}
        <div className="flex flex-col lg:flex-row lg:items-end justify-between gap-4 mb-6 md:mb-8 pr-12 lg:pr-0 mt-4"> {/* mt-4 extra para separar de los toggles */}
            <div>
                <h1 className="text-2xl md:text-3xl font-bold text-gray-900 dark:text-white tracking-tight">Gestión de Sueldo</h1>
                <p className="text-xs md:text-sm text-gray-500 mt-1">Planificación mensual y gastos fijos.</p>
            </div>

            <div className="bg-white dark:bg-gray-800 p-3 rounded-2xl border border-gray-200 dark:border-gray-700 shadow-sm flex flex-wrap items-center gap-3 w-full lg:w-auto">
                <div className="flex items-center gap-2">
                    <div className={`p-2 rounded-lg transition-colors ${isConversionMode ? 'bg-violet-100 text-violet-600' : 'bg-gray-100 text-gray-400'}`}>
                        <CurrencyDollarIcon className="w-5 h-5"/>
                    </div>
                    <div className="flex flex-col">
                        <span className="text-[10px] font-bold uppercase text-gray-400">Conversor</span>
                        <label className="relative inline-flex items-center cursor-pointer mt-0.5">
                            <input type="checkbox" checked={isConversionMode} onChange={(e) => setIsConversionMode(e.target.checked)} className="sr-only peer" />
                            <div className="w-8 h-4 bg-gray-200 peer-focus:outline-none rounded-full peer dark:bg-gray-700 peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-3 after:w-3 after:transition-all peer-checked:bg-violet-600"></div>
                            <span className="ml-2 text-xs font-bold text-gray-700 dark:text-gray-300">{isConversionMode ? 'ARS' : 'USD'}</span>
                        </label>
                    </div>
                </div>

                {isConversionMode && (
                    <div className="flex flex-col ml-auto sm:ml-0 animate-in slide-in-from-right-2 border-l pl-3 border-gray-200 dark:border-gray-700">
                         <span className="text-[10px] font-bold uppercase text-gray-400">Cotización</span>
                         <div className="flex items-center gap-1">
                            <span className="text-xs text-gray-500">$</span>
                            <input 
                                type="number" 
                                value={exchangeRate}
                                onChange={(e) => setExchangeRate(e.target.value)}
                                className="w-16 bg-transparent text-sm font-bold text-gray-900 dark:text-white outline-none border-b border-gray-300 focus:border-violet-500 p-0"
                            />
                         </div>
                    </div>
                )}
            </div>
        </div>

        {/* === GRID PRINCIPAL UNIFICADO === */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4 mb-6">
            
            {/* CARD 1: INGRESO NETO */}
            <div className="bg-white dark:bg-gray-900 rounded-[2rem] p-5 border border-gray-200 dark:border-gray-800 shadow-sm relative overflow-hidden group">
                <div className="absolute top-0 right-0 w-24 h-24 bg-green-500/10 rounded-full blur-2xl group-hover:bg-green-500/20 transition-colors"></div>
                <h3 className="text-[10px] md:text-xs font-bold text-gray-500 uppercase tracking-widest mb-2">Ingreso Neto</h3>
                
                <form action={updateSalaryConfig} className="relative z-10">
                    <div className="flex items-center gap-1">
                        <span className="text-lg md:text-xl text-gray-400 font-light">{currencySymbol}</span>
                        <input 
                            name="amount" 
                            type="number" 
                            defaultValue={sueldoBase} 
                            placeholder="0"
                            className="text-3xl md:text-4xl font-bold text-gray-900 dark:text-white bg-transparent outline-none w-full placeholder:text-gray-200 min-w-0"
                        />
                    </div>
                    {isConversionMode && (
                        <p className="text-xs text-gray-500 mt-1">
                            Vista: <span className="font-bold text-gray-700 dark:text-gray-300">${(sueldoBase * safeRate).toLocaleString()}</span>
                        </p>
                    )}
                    
                    <div className="mt-4 md:mt-6 flex flex-wrap items-center justify-between gap-2">
                         <div className="flex items-center gap-2 bg-gray-50 dark:bg-gray-800 px-3 py-1.5 rounded-xl border border-gray-100 dark:border-gray-700">
                            <CalendarIcon className="w-4 h-4 text-gray-500"/>
                            <span className="text-xs text-gray-500 whitespace-nowrap">Día cobro:</span>
                            <input 
                                name="pay_day" 
                                type="number" 
                                min="1" max="31" 
                                defaultValue={salaryConfig?.pay_day || 1}
                                className="w-8 bg-transparent text-sm font-bold text-center outline-none border-b border-gray-300 focus:border-green-500 p-0"
                            />
                        </div>
                        <button type="submit" className="text-xs font-bold bg-black dark:bg-white text-white dark:text-black px-4 py-2 rounded-lg hover:scale-105 active:scale-95 transition-all">
                            Guardar
                        </button>
                    </div>
                </form>
                <div className="mt-3 text-[10px] md:text-xs text-green-600 font-medium text-center bg-green-50 dark:bg-green-900/20 py-1 rounded-lg">
                    Faltan {daysUntilPay} días para cobrar
                </div>
            </div>

            {/* CARD 2: GASTOS FIJOS (Ocupa 2 Columnas) */}
            <div className="md:col-span-2 bg-white/60 dark:bg-gray-900/40 backdrop-blur-xl rounded-[2rem] p-5 border border-gray-200 dark:border-gray-800 flex flex-col h-[320px]">
                <div className="flex justify-between items-center mb-4">
                    <h3 className="font-bold text-sm md:text-base flex items-center gap-2 text-gray-900 dark:text-white">
                        🧾 Fijos & Cuotas
                        <span className="text-[10px] md:text-xs bg-red-100 dark:bg-red-900/30 text-red-600 dark:text-red-400 px-2 py-0.5 rounded-full font-bold">
                            Total: -${(totalFijos * safeRate).toLocaleString(undefined, {maximumFractionDigits:0})}
                        </span>
                    </h3>
                </div>
                
                <div className="flex-1 space-y-2 overflow-y-auto pr-1 custom-scrollbar">
                    {fixedExpenses?.map((expense: any) => (
                        <div key={expense.id} className="group flex justify-between items-center p-2.5 bg-white dark:bg-gray-800 rounded-xl border border-gray-100 dark:border-gray-700 hover:border-red-200 transition-colors text-sm">
                            <div className="flex items-center gap-3 overflow-hidden">
                                <div className="w-8 h-8 flex-shrink-0 bg-gray-50 dark:bg-gray-700/50 rounded-full flex items-center justify-center text-sm">
                                    {expense.installments_total > 0 ? '💳' : '📄'}
                                </div>
                                <div className="min-w-0">
                                    <p className="font-semibold text-gray-900 dark:text-gray-200 truncate">{expense.title}</p>
                                    {expense.installments_total > 0 && (
                                        <p className="text-[10px] text-gray-500 font-bold uppercase">
                                            {expense.installments_current}/{expense.installments_total}
                                        </p>
                                    )}
                                </div>
                            </div>
                            <div className="flex items-center gap-2 md:gap-3 flex-shrink-0">
                                <p className="font-bold text-gray-900 dark:text-white">
                                    ${(expense.amount * safeRate).toLocaleString(undefined, {maximumFractionDigits:0})}
                                </p>
                                <form action={deleteFixedExpense}>
                                    <input type="hidden" name="id" value={expense.id} />
                                    <button className="text-gray-300 hover:text-red-500 p-1"><TrashIcon className="w-4 h-4"/></button>
                                </form>
                            </div>
                        </div>
                    ))}
                </div>

                <form 
                    ref={expenseFormRef}
                    action={async (formData) => { await addFixedExpense(formData); expenseFormRef.current?.reset(); }}
                    className="mt-3 pt-3 border-t border-gray-200 dark:border-gray-700 grid grid-cols-12 gap-2"
                >
                    <input name="title" type="text" placeholder="Nombre" className="col-span-4 bg-transparent text-xs md:text-sm p-2 border-b border-gray-300 outline-none placeholder:text-gray-400 min-w-0" required />
                    <input name="amount" type="number" placeholder="$" className="col-span-3 bg-transparent text-xs md:text-sm p-2 border-b border-gray-300 outline-none placeholder:text-gray-400 min-w-0" required />
                    <input name="installments_current" type="number" placeholder="#" className="col-span-2 bg-transparent text-xs md:text-sm p-2 border-b border-gray-300 outline-none placeholder:text-gray-400 min-w-0" />
                    <input name="installments_total" type="number" placeholder="Tot" className="col-span-2 bg-transparent text-xs md:text-sm p-2 border-b border-gray-300 outline-none placeholder:text-gray-400 min-w-0" />
                    <button type="submit" className="col-span-1 flex justify-center items-center bg-black text-white dark:bg-white dark:text-black rounded-lg hover:opacity-80"><PlusIcon className="w-4 h-4"/></button>
                </form>
            </div>

            {/* CARD 3: CAPACIDAD AHORRO */}
            <div className="bg-violet-600 dark:bg-violet-900 text-white rounded-[2rem] p-6 shadow-xl shadow-violet-500/30 flex flex-col justify-between relative overflow-hidden h-[300px]">
                 <div className="absolute top-0 right-0 w-32 h-32 bg-white opacity-10 rounded-full blur-3xl -translate-y-1/2 translate-x-1/2"></div>
                 <div>
                    <h3 className="text-violet-200 text-[10px] md:text-xs font-bold uppercase tracking-widest mb-1 flex items-center gap-1">
                        <CalculatorIcon className="w-3 h-3"/> Ahorro Estimado
                    </h3>
                    <p className="text-3xl md:text-4xl font-bold tracking-tight truncate">
                        ${(ahorroEstimado * safeRate).toLocaleString(undefined, {maximumFractionDigits:0})}
                    </p>
                    <p className="text-xs md:text-sm text-violet-200 mt-2 opacity-80">
                        {porcentajeAhorro}% de tus ingresos.
                    </p>
                 </div>
                 
                 <div className="mt-4 pt-4 border-t border-white/20 flex-1 flex flex-col justify-end">
                    <div className="flex justify-between items-center mb-2">
                        <span className="text-[10px] md:text-xs font-bold uppercase text-violet-200">Ingresos Pasivos</span>
                    </div>
                    
                    <div className="space-y-1 mb-3 overflow-y-auto custom-scrollbar flex-1">
                         {passiveIncomes?.map((inc: any) => (
                             <div key={inc.id} className="flex justify-between text-xs px-2 py-1 bg-white/10 rounded">
                                 <span className="truncate max-w-[50%]">{inc.title}</span>
                                 <div className="flex gap-2 items-center">
                                    <span className="font-bold">+${(inc.amount * safeRate).toLocaleString(undefined, {maximumFractionDigits:0})}</span>
                                    <form action={deletePassiveIncome}>
                                        <input type="hidden" name="id" value={inc.id} />
                                        <button className="hover:text-red-300 flex items-center"><TrashIcon className="w-3 h-3"/></button>
                                    </form>
                                 </div>
                             </div>
                         ))}
                    </div>

                    <form 
                        ref={incomeFormRef}
                        action={async (formData) => { await addPassiveIncome(formData); incomeFormRef.current?.reset(); }}
                        className="flex gap-2"
                    >
                        <input name="title" type="text" placeholder="Extra..." className="flex-1 bg-white/10 text-xs px-2 py-1.5 rounded outline-none placeholder:text-violet-300 min-w-0" required/>
                        <input name="amount" type="number" placeholder="$" className="w-16 bg-white/10 text-xs px-2 py-1.5 rounded outline-none placeholder:text-violet-300 min-w-0" required/>
                        <button className="bg-white text-violet-600 px-2 rounded hover:bg-violet-100 flex items-center justify-center"><PlusIcon className="w-3 h-3"/></button>
                    </form>
                 </div>
            </div>

            {/* CARD 4: GRÁFICOS (Ahora está DENTRO del Grid y ocupa 2 columnas) */}
            <div className="md:col-span-2 bg-white dark:bg-gray-900 rounded-[2rem] border border-gray-200 dark:border-gray-800 p-5 shadow-sm h-[300px]">
                <div className="flex flex-col md:flex-row justify-between items-start md:items-center mb-6 gap-4">
                    <div>
                        <h3 className="font-bold text-base md:text-lg text-gray-900 dark:text-white">Análisis Financiero</h3>
                        <p className="text-xs text-gray-500">Proyecciones y distribución.</p>
                    </div>
                    
                    {/* Selector */}
                    <div className="flex bg-gray-100 dark:bg-gray-800 p-1 rounded-xl overflow-x-auto w-full md:w-auto no-scrollbar">
                        <button onClick={() => setChartType('bar')} className={`flex-shrink-0 flex items-center gap-2 px-3 py-2 rounded-lg text-xs font-bold transition-all whitespace-nowrap ${chartType === 'bar' ? 'bg-white dark:bg-gray-700 text-black dark:text-white shadow-sm' : 'text-gray-500 hover:text-gray-700'}`}>
                            <ChartBarIcon className="w-4 h-4"/> Top
                        </button>
                        <button onClick={() => setChartType('pie')} className={`flex-shrink-0 flex items-center gap-2 px-3 py-2 rounded-lg text-xs font-bold transition-all whitespace-nowrap ${chartType === 'pie' ? 'bg-white dark:bg-gray-700 text-black dark:text-white shadow-sm' : 'text-gray-500 hover:text-gray-700'}`}>
                            <ChartPieIcon className="w-4 h-4"/> Dist.
                        </button>
                        <button onClick={() => setChartType('area')} className={`flex-shrink-0 flex items-center gap-2 px-3 py-2 rounded-lg text-xs font-bold transition-all whitespace-nowrap ${chartType === 'area' ? 'bg-white dark:bg-gray-700 text-black dark:text-white shadow-sm' : 'text-gray-500 hover:text-gray-700'}`}>
                            <PresentationChartLineIcon className="w-4 h-4"/> Proy.
                        </button>
                    </div>
                </div>

                <div className="h-[200px] w-full">
                    <ResponsiveContainer width="100%" height="100%">
                        {chartType === 'bar' ? (
                            <BarChart data={barData} margin={{ top: 10, right: 10, left: -20, bottom: 0 }}>
                                <CartesianGrid strokeDasharray="3 3" opacity={0.1} />
                                <XAxis dataKey="name" fontSize={10} stroke="#888888" tickLine={false} axisLine={false} />
                                <YAxis fontSize={10} stroke="#888888" tickLine={false} axisLine={false} />
                                <Tooltip contentStyle={{ borderRadius: '12px', border: 'none', boxShadow: '0 4px 12px rgba(0,0,0,0.1)' }} cursor={{fill: 'transparent'}} />
                                <Bar dataKey="monto" fill="#8b5cf6" radius={[6, 6, 0, 0]} barSize={30} />
                            </BarChart>
                        ) : chartType === 'pie' ? (
                            <PieChart>
                                <Tooltip contentStyle={{ borderRadius: '12px' }} />
                                <Pie data={pieData} cx="50%" cy="50%" innerRadius={60} outerRadius={80} paddingAngle={5} dataKey="value">
                                    {pieData.map((entry, index) => (<Cell key={`cell-${index}`} fill={entry.color} />))}
                                </Pie>
                                <text x="50%" y="50%" textAnchor="middle" dominantBaseline="middle" className="fill-gray-900 dark:fill-white font-bold text-lg">{porcentajeAhorro}%</text>
                            </PieChart>
                        ) : (
                            <AreaChart data={areaData} margin={{ top: 10, right: 10, left: -20, bottom: 0 }}>
                                <defs>
                                    <linearGradient id="colorAhorro" x1="0" y1="0" x2="0" y2="1">
                                        <stop offset="5%" stopColor="#8b5cf6" stopOpacity={0.8}/>
                                        <stop offset="95%" stopColor="#8b5cf6" stopOpacity={0}/>
                                    </linearGradient>
                                </defs>
                                <XAxis dataKey="mes" fontSize={10} stroke="#888888" tickLine={false} axisLine={false} />
                                <YAxis fontSize={10} stroke="#888888" tickLine={false} axisLine={false} />
                                <CartesianGrid strokeDasharray="3 3" opacity={0.1} />
                                <Tooltip contentStyle={{ borderRadius: '12px' }} />
                                <Area type="monotone" dataKey="ahorro" stroke="#8b5cf6" fillOpacity={1} fill="url(#colorAhorro)" strokeWidth={3} />
                            </AreaChart>
                        )}
                    </ResponsiveContainer>
                </div>
            </div>

        </div>
    </div>
  );
}