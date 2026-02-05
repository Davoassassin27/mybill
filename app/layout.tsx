import type { Metadata, Viewport } from "next";
import { Inter } from "next/font/google";
import "./globals.css";
import { ThemeProvider } from "@/components/ThemeProvider";

const inter = Inter({ subsets: ["latin"] });

// 1. CONFIGURACIÓN DEL VIEWPORT (Solo una vez)
// Esto evita que el usuario haga zoom y hace que se sienta nativa en móviles
export const viewport: Viewport = {
  width: "device-width",
  initialScale: 1,
  maximumScale: 1,
  userScalable: false,
  themeColor: "#000000",
};

// 2. METADATOS Y PWA (Para iPhone y Android)
export const metadata: Metadata = {
  title: "MyBill",
  description: "Control de finanzas personales",
  manifest: "/manifest.json", // Tu archivo de configuración Android/Web
  appleWebApp: {
    capable: true, // Activa el modo App en iOS
    statusBarStyle: "black-translucent", // Barra de estado integrada
    title: "MyBill",
  },
  icons: {
    icon: "/icon.png", // Icono general
    apple: "/icon.png", // Icono para iPhone
  },
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="es" suppressHydrationWarning>
      <body className={inter.className}>
        <ThemeProvider
          attribute="class"
          defaultTheme="dark"
          enableSystem
          disableTransitionOnChange
        >
          {children}
        </ThemeProvider>
      </body>
    </html>
  );
}