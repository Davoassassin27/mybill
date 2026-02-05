import type { CapacitorConfig } from '@capacitor/cli';

const config: CapacitorConfig = {
  appId: 'com.mybill.app', // Asegúrate que coincida con lo que pusiste antes
  appName: 'MyBill',
  webDir: 'public', // Next.js usa public para estáticos
  server: {
    // 🔴 IMPORTANTE: Pon aquí tu URL real de Vercel
    url: 'mybill-ten.vercel.app', 
    cleartext: true
  }
};

export default config;