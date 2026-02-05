import { signOutAction } from "@/app/protected/actions"; // Importamos la acción
import { ArrowRightStartOnRectangleIcon } from "@heroicons/react/24/outline";

export default function SignOutButton() {
  return (
    <form action={signOutAction}>
      <button 
        type="submit" 
        className="p-2 rounded-full bg-gray-100 dark:bg-gray-800 text-gray-500 hover:text-red-600 dark:hover:text-red-400 transition-colors"
        title="Cerrar sesión"
      >
        <ArrowRightStartOnRectangleIcon className="w-5 h-5" />
      </button>
    </form>
  );
}