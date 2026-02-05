import type { Metadata } from "next";
import { Inter } from "next/font/google";
import "./globals.css";
import { ThemeProvider } from "@/components/ThemeProvider";

const inter = Inter({ subsets: ["latin"] });

export const metadata: Metadata = {
  title: "MyBill App",
  description: "Finanzas personales",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="es" suppressHydrationWarning>
      <body className={`${inter.className} min-h-screen antialiased neon-gradient`}>
        <ThemeProvider
          attribute="class"
          defaultTheme="system"
          enableSystem
          disableTransitionOnChange
        >
          {/* CAMBIO AQUÍ: Quitamos 'items-center' para que los hijos ocupen todo el ancho */}
          <main className="min-h-screen flex flex-col">
            <div className="flex-1 w-full flex flex-col">
              {children}
            </div>
          </main>
        </ThemeProvider>
      </body>
    </html>
  );
}