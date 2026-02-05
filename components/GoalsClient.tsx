"use client";

import { useState, useRef } from "react";
import { 
  TrophyIcon, PlusIcon, TrashIcon, BanknotesIcon, CalendarIcon 
} from "@heroicons/react/24/outline";
import { addGoal, addFunds, deleteGoal } from "@/app/protected/goals/actions";

export default function GoalsClient({ goals }: { goals: any[] }) {
  const formRef = useRef<HTMLFormElement>(null);
  const [isAddingFunds, setIsAddingFunds] = useState<number | null>(null); // ID de la meta a la que abonamos

  const totalAhorrado = goals.reduce((acc, g) => acc + g.saved_amount, 0);
  const totalObjetivo = goals.reduce((acc, g) => acc + g.target_amount, 0);
  const porcentajeTotal = totalObjetivo > 0 ? Math.round((totalAhorrado / totalObjetivo) * 100) : 0;

  return (
    <div className="animate-in fade-in zoom-in duration-500 pb-32">
        
        {/* HEADER CON RESUMEN GLOBAL */}
        <div className="flex flex-col md:flex-row justify-between items-end mb-8 gap-4">
            <div>
                <h1 className="text-3xl font-bold text-gray-900 dark:text-white">Mis Metas 🎯</h1>
                <p className="text-sm text-gray-500 mt-1">Visualiza y alcanza tus objetivos.</p>
            </div>
            {goals.length > 0 && (
                <div className="bg-white dark:bg-gray-800 px-4 py-2 rounded-2xl border border-gray-200 dark:border-gray-700 shadow-sm flex items-center gap-3">
                    <div className="text-right">
                        <p className="text-[10px] uppercase font-bold text-gray-400">Fondo Total Ahorrado</p>
                        <p className="text-xl font-bold text-violet-600">${totalAhorrado.toLocaleString()}</p>
                    </div>
                    <div className="h-10 w-10 rounded-full border-4 border-gray-100 dark:border-gray-700 flex items-center justify-center text-xs font-bold relative">
                        {porcentajeTotal}%
                        <svg className="absolute inset-0 h-full w-full -rotate-90" viewBox="0 0 36 36">
                            <path className="text-violet-600" d="M18 2.0845 a 15.9155 15.9155 0 0 1 0 31.831 a 15.9155 15.9155 0 0 1 0 -31.831" fill="none" stroke="currentColor" strokeWidth="4" strokeDasharray={`${porcentajeTotal}, 100`} />
                        </svg>
                    </div>
                </div>
            )}
        </div>

        {/* --- GRID DE METAS --- */}
        {goals.length === 0 ? (
            // ESTADO VACÍO (EMPTY STATE)
            <div className="flex flex-col items-center justify-center py-20 text-center opacity-60">
                <div className="w-24 h-24 bg-gray-100 dark:bg-gray-800 rounded-full flex items-center justify-center mb-4">
                    <TrophyIcon className="w-10 h-10 text-gray-400"/>
                </div>
                <h3 className="text-xl font-bold text-gray-900 dark:text-white">Sin metas aún</h3>
                <p className="text-sm text-gray-500 max-w-xs mx-auto mb-6">Define un objetivo (un viaje, un auto, una compu) y empieza a llenar la barra.</p>
            </div>
        ) : (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 mb-8">
                {goals.map((goal) => {
                    const progress = Math.min(100, Math.round((goal.saved_amount / goal.target_amount) * 100));
                    return (
                        <div key={goal.id} className="bg-white dark:bg-gray-900 rounded-[2rem] p-5 border border-gray-200 dark:border-gray-800 shadow-sm relative overflow-hidden group hover:border-violet-300 transition-colors">
                            {/* Barra de progreso visual (Fondo) */}
                            <div className="absolute bottom-0 left-0 h-1 bg-violet-600 transition-all duration-1000" style={{ width: `${progress}%` }}></div>
                            
                            <div className="flex justify-between items-start mb-4">
                                <div>
                                    <h3 className="font-bold text-lg text-gray-900 dark:text-white truncate pr-4">{goal.name}</h3>
                                    <p className="text-xs text-gray-500 font-medium">Meta: ${goal.target_amount.toLocaleString()}</p>
                                </div>
                                <div className="text-right">
                                    <span className="text-2xl font-bold text-violet-600">{progress}%</span>
                                </div>
                            </div>

                            {/* Barra Grande */}
                            <div className="w-full bg-gray-100 dark:bg-gray-800 rounded-full h-4 overflow-hidden mb-4 shadow-inner">
                                <div 
                                    className="bg-gradient-to-r from-violet-600 to-indigo-500 h-full rounded-full transition-all duration-1000 ease-out relative" 
                                    style={{ width: `${progress}%` }}
                                >
                                    <div className="absolute top-0 left-0 w-full h-full bg-white opacity-20 animate-pulse"></div>
                                </div>
                            </div>

                            <div className="flex justify-between items-end">
                                <div>
                                    <p className="text-[10px] uppercase font-bold text-gray-400">Ahorrado</p>
                                    <p className="text-lg font-bold text-gray-900 dark:text-white">${goal.saved_amount.toLocaleString()}</p>
                                </div>
                                
                                <div className="flex gap-2">
                                    {/* Botón Abonar */}
                                    <button 
                                        onClick={() => setIsAddingFunds(isAddingFunds === goal.id ? null : goal.id)}
                                        className="bg-black dark:bg-white text-white dark:text-black p-2 rounded-xl hover:scale-105 transition-transform shadow-lg"
                                        title="Agregar fondos"
                                    >
                                        <PlusIcon className="w-4 h-4"/>
                                    </button>
                                    
                                    {/* Botón Borrar */}
                                    <form action={deleteGoal}>
                                        <input type="hidden" name="id" value={goal.id} />
                                        <button className="bg-gray-100 dark:bg-gray-800 text-gray-400 hover:text-red-500 p-2 rounded-xl transition-colors">
                                            <TrashIcon className="w-4 h-4"/>
                                        </button>
                                    </form>
                                </div>
                            </div>

                            {/* Input para agregar fondos (Desplegable) */}
                            {isAddingFunds === goal.id && (
                                <form action={addFunds} className="mt-4 pt-4 border-t border-gray-100 dark:border-gray-800 animate-in slide-in-from-top-2">
                                    <input type="hidden" name="id" value={goal.id} />
                                    <input type="hidden" name="current_saved" value={goal.saved_amount} />
                                    <div className="flex gap-2">
                                        <input 
                                            name="amount" 
                                            type="number" 
                                            placeholder="Monto a sumar..." 
                                            className="flex-1 bg-gray-50 dark:bg-gray-800 rounded-lg px-3 py-2 text-sm outline-none border focus:border-violet-500 transition-colors"
                                            autoFocus
                                            required
                                        />
                                        <button type="submit" className="bg-violet-600 text-white text-xs font-bold px-3 rounded-lg hover:bg-violet-700">
                                            Confirmar
                                        </button>
                                    </div>
                                </form>
                            )}
                        </div>
                    );
                })}
            </div>
        )}

        {/* --- FORMULARIO CREAR NUEVA META --- */}
        <div className="bg-white/60 dark:bg-gray-900/40 backdrop-blur-xl rounded-[2rem] p-6 border border-gray-200 dark:border-gray-800 shadow-sm max-w-2xl mx-auto">
            <h3 className="text-sm font-bold text-gray-900 dark:text-white mb-4 flex items-center gap-2">
                <PlusIcon className="w-4 h-4"/> Crear Nueva Meta
            </h3>
            <form 
                ref={formRef}
                action={async (formData) => {
                    await addGoal(formData);
                    formRef.current?.reset();
                }}
                className="grid grid-cols-1 md:grid-cols-2 gap-4"
            >
                <div className="col-span-2 md:col-span-1">
                    <label className="text-[10px] font-bold text-gray-400 uppercase mb-1 block">Nombre</label>
                    <input name="name" type="text" placeholder="Ej. MacBook Pro" className="w-full bg-white dark:bg-gray-800 rounded-xl px-4 py-3 text-sm outline-none border border-transparent focus:border-violet-500 transition-all" required />
                </div>
                <div className="col-span-2 md:col-span-1">
                    <label className="text-[10px] font-bold text-gray-400 uppercase mb-1 block">Costo Total ($)</label>
                    <input name="target_amount" type="number" placeholder="0.00" className="w-full bg-white dark:bg-gray-800 rounded-xl px-4 py-3 text-sm outline-none border border-transparent focus:border-violet-500 transition-all" required />
                </div>
                <div className="col-span-2">
                     <button type="submit" className="w-full bg-black dark:bg-white text-white dark:text-black font-bold py-3 rounded-xl hover:scale-[1.01] active:scale-95 transition-all shadow-lg">
                        🚀 Comenzar Ahorro
                    </button>
                </div>
            </form>
        </div>
    </div>
  );
}