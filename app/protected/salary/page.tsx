import { createClient } from "@/utils/supabase/server";
import { ThemeToggle } from "@/components/ThemeToggle";
import SignOutButton from "@/components/SignOutButton";
import SalaryClient from "@/components/SalaryClient";

export default async function SalaryPage() {
  const supabase = await createClient();
  const { data: { user } } = await supabase.auth.getUser();

  if(!user) return null;

  const { data: salaryConfig } = await supabase
    .from('salary_config')
    .select('*')
    .eq('user_id', user.id)
    .single();

  const { data: fixedExpenses } = await supabase
    .from('fixed_expenses')
    .select('*')
    .eq('user_id', user.id)
    .order('created_at', { ascending: false });

  const { data: passiveIncomes } = await supabase
    .from('passive_incomes')
    .select('*')
    .eq('user_id', user.id)
    .order('created_at', { ascending: false });

  return (
    <div className="min-h-screen px-4 py-6 md:p-8 max-w-[1400px] mx-auto relative pb-32">
       
       {/* AJUSTE AQUÍ: 'top-2' para subirlos más y 'right-4' */}
       <div className="absolute top-2 right-4 z-50 flex gap-2">
        <ThemeToggle />
        <SignOutButton />
      </div>

      <SalaryClient 
        salaryConfig={salaryConfig} 
        fixedExpenses={fixedExpenses} 
        passiveIncomes={passiveIncomes} 
      />
    </div>
  );
}