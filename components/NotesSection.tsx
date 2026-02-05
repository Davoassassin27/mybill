import { createClient } from "@/utils/supabase/server";
import { revalidatePath } from "next/cache";
import { XMarkIcon, PlusIcon } from "@heroicons/react/24/outline";

export default async function NotesSection() {
  const supabase = await createClient();
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) return null;

  const { data: notes } = await supabase
    .from("notes")
    .select("*")
    .order("created_at", { ascending: false });

  const addNote = async (formData: FormData) => {
    "use server";
    const supabase = await createClient();
    const { data: { user } } = await supabase.auth.getUser();
    const content = String(formData.get("content"));
    if (!content || !user) return;
    await supabase.from("notes").insert({ content, user_id: user.id });
    revalidatePath("/protected");
  };

  const deleteNote = async (formData: FormData) => {
    "use server";
    const supabase = await createClient();
    const id = formData.get("id");
    await supabase.from("notes").delete().eq("id", id);
    revalidatePath("/protected");
  };

  return (
    // ESTILO ESPEJO APLICADO AQUÍ
    <div className="bg-white/60 dark:bg-gray-900/30 backdrop-blur-xl p-5 rounded-[2rem] border border-white/60 dark:border-gray-800 h-full flex flex-col shadow-lg shadow-gray-200/50 dark:shadow-none">
      <h3 className="text-xs font-bold text-gray-400 uppercase tracking-widest mb-4 flex items-center gap-2">
        📌 Notas Rápidas
      </h3>

      <form action={addNote} className="mb-4 flex gap-2">
        <input
          name="content"
          type="text"
          placeholder="Nota rápida..."
          className="w-full bg-white/80 dark:bg-gray-800/50 rounded-xl px-3 py-2 text-sm outline-none border border-transparent focus:border-black/10 dark:focus:border-violet-500/50 transition-all text-gray-700 dark:text-gray-200 placeholder:text-gray-400"
          required
          autoComplete="off"
        />
        <button type="submit" className="bg-black dark:bg-violet-600 text-white p-2 rounded-xl hover:scale-105 transition-transform">
          <PlusIcon className="w-5 h-5" />
        </button>
      </form>

      <div className="space-y-3 overflow-y-auto pr-1 custom-scrollbar flex-1">
        {notes?.map((note) => (
          <div key={note.id} className="group relative bg-white/80 dark:bg-yellow-500/10 border border-white dark:border-yellow-500/20 p-3 rounded-xl transition-all hover:shadow-md">
            <p className="text-sm text-gray-800 dark:text-yellow-50 font-medium leading-relaxed">{note.content}</p>
            <form action={deleteNote} className="absolute top-2 right-2 opacity-0 group-hover:opacity-100 transition-opacity">
              <input type="hidden" name="id" value={note.id} />
              <button className="text-gray-400 hover:text-red-500 transition-colors">
                <XMarkIcon className="w-4 h-4" />
              </button>
            </form>
          </div>
        ))}
        {notes?.length === 0 && (
            <div className="text-center py-10 opacity-30">
                <p className="text-sm text-gray-400">Sin notas</p>
            </div>
        )}
      </div>
    </div>
  );
}