import type { Metadata } from "next";
import "./globals.css";

export const metadata: Metadata = {
  title: "Flow Rental - Bocas del Toro",
  description: "Alquiler de Motos y Ebikes en Bocas del Toro. Reserva tu aventura.",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="es">
      <body className="antialiased font-sans min-h-screen flex flex-col">
        <header className="bg-brand-dark text-brand-paper py-4 shadow-lg sticky top-0 z-50">
          <div className="container mx-auto px-4 flex justify-between items-center">
             {/* Placeholder para Logo */}
            <div className="font-bold text-2xl tracking-wider uppercase border-2 border-brand-paper px-2 py-1">
              Flow Rental
            </div>
            <nav>
              <a href="#flota" className="mx-3 hover:text-brand-accent transition">Flota</a>
              <a href="#tarifas" className="mx-3 hover:text-brand-accent transition">Tarifas</a>
              <a href="#reservar" className="mx-3 text-brand-accent font-bold uppercase">Reservar</a>
            </nav>
          </div>
        </header>
        
        <main className="flex-grow">
          {children}
        </main>

        <footer className="bg-brand-dark text-brand-paper/60 py-8 text-center mt-auto">
          <p>© {new Date().getFullYear()} Flow Rental - Bocas del Toro, Panamá.</p>
        </footer>
      </body>
    </html>
  );
}
