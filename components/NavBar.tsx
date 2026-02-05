"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { HomeIcon, BanknotesIcon, TrophyIcon } from "@heroicons/react/24/outline";
import { HomeIcon as HomeSolid, BanknotesIcon as BankSolid, TrophyIcon as TrophySolid } from "@heroicons/react/24/solid";

export default function NavBar() {
  const pathname = usePathname();

  const navItems = [
    { name: "Pizarrón", href: "/protected", icon: HomeIcon, activeIcon: HomeSolid },
    { name: "Sueldo", href: "/protected/salary", icon: BanknotesIcon, activeIcon: BankSolid },
    { name: "Metas", href: "/protected/goals", icon: TrophyIcon, activeIcon: TrophySolid },
  ];

  return (
    <div className="fixed bottom-6 left-1/2 -translate-x-1/2 z-50">
      <nav className="bg-white/80 dark:bg-gray-900/80 backdrop-blur-xl border border-gray-200 dark:border-gray-800 rounded-full shadow-2xl px-6 py-3 flex items-center gap-8 transition-all hover:scale-105">
        {navItems.map((item) => {
          const isActive = pathname === item.href;
          const Icon = isActive ? item.activeIcon : item.icon;
          
          return (
            <Link 
              key={item.name} 
              href={item.href}
              className={`flex flex-col items-center gap-1 transition-colors ${
                isActive ? "text-black dark:text-white" : "text-gray-400 hover:text-gray-600 dark:hover:text-gray-300"
              }`}
            >
              <Icon className="w-6 h-6" />
              {isActive && (
                <span className="text-[10px] font-bold absolute -bottom-5 opacity-0 animate-slide-up-fade">
                  {item.name}
                </span>
              )}
              {/* Indicador de activo (puntito) */}
              {isActive && <div className="w-1 h-1 bg-black dark:bg-white rounded-full mt-1"></div>}
            </Link>
          );
        })}
      </nav>
    </div>
  );
}