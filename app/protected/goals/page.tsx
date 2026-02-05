import { createClient } from "@/utils/supabase/server";
import { ThemeToggle } from "@/components/ThemeToggle";
import SignOutButton from "@/components/SignOutButton";
import GoalsClient from "@/components/GoalsClient"; // Importamos el cliente

export default async function GoalsPage() {
  const supabase = await createClient();
  const { data: { user } } = await supabase.auth.getUser();

  if(!user) return null;

  // Traer las metas del usuario
  const { data: goals } = await supabase
    .from('savings_goals')
    .select('*')
    .eq('user_id', user.id)
    .order('created_at', { ascending: false });

  return (
    <div className="min-h-screen px-4 py-6 md:p-8 max-w-[1200px] mx-auto relative">
      {/* Botones Flotantes */}
      <div className="absolute top-2 right-4 z-50 flex gap-2">
        <ThemeToggle />
        <SignOutButton />
      </div>

      {/* Renderizamos el Cliente con los datos reales (o array vacío si es nuevo) */}
      <GoalsClient goals={goals || []} />
    </div>
  );
}