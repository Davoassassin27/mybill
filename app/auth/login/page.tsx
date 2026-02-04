import { login, signup } from "./actions";

export default function LoginPage() {
  return (
    <div className="flex min-h-screen flex-col items-center justify-center bg-white px-6">
      <div className="w-full max-w-sm space-y-8">
        <div className="text-center">
          <h1 className="text-4xl font-extrabold tracking-tight text-gray-900">
            my<span className="text-gray-400">bill</span>.
          </h1>
          <p className="mt-2 text-sm text-gray-500">Finanzas personales, simplificadas.</p>
        </div>

        <form className="space-y-4">
          <div>
            <input
              id="email"
              name="email"
              type="email"
              required
              placeholder="correo@ejemplo.com"
              className="block w-full rounded-xl border-0 bg-gray-50 py-4 px-4 text-gray-900 shadow-sm ring-1 ring-inset ring-gray-200 placeholder:text-gray-400 focus:ring-2 focus:ring-inset focus:ring-black sm:text-sm sm:leading-6 transition-all"
            />
          </div>

          <div>
            <input
              id="password"
              name="password"
              type="password"
              required
              placeholder="Contraseña"
              className="block w-full rounded-xl border-0 bg-gray-50 py-4 px-4 text-gray-900 shadow-sm ring-1 ring-inset ring-gray-200 placeholder:text-gray-400 focus:ring-2 focus:ring-inset focus:ring-black sm:text-sm sm:leading-6 transition-all"
            />
          </div>

          <div className="flex flex-col gap-3 pt-4">
            <button
              formAction={login}
              className="flex w-full justify-center rounded-xl bg-black px-3 py-4 text-sm font-semibold text-white shadow-lg hover:bg-gray-800 focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-black transition-transform active:scale-95"
            >
              Ingresar
            </button>
            <button
              formAction={signup}
              className="flex w-full justify-center rounded-xl bg-white px-3 py-4 text-sm font-semibold text-gray-900 shadow-sm ring-1 ring-inset ring-gray-200 hover:bg-gray-50 transition-transform active:scale-95"
            >
              Crear cuenta
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}