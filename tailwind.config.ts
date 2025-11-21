import type { Config } from "tailwindcss";

const config: Config = {
  content: [
    "./pages/**/*.{js,ts,jsx,tsx,mdx}",
    "./components/**/*.{js,ts,jsx,tsx,mdx}",
    "./app/**/*.{js,ts,jsx,tsx,mdx}",
  ],
  theme: {
    extend: {
      colors: {
        // Paleta Hotel Boutique / Kraft
        brand: {
          paper: "#F4E4BC", // Beige/Kraft de fondo
          dark: "#2D2420",  // Marrón muy oscuro (casi negro) para texto
          brown: "#5D4037", // Marrón medio para bordes/detalles
          accent: "#C04E01", // Naranja quemado / Óvalo logo
          light: "#FFF8E7", // Blanco hueso para tarjetas
        }
      },
      fontFamily: {
        sans: ['var(--font-sans)', 'sans-serif'],
      }
    },
  },
  plugins: [],
};
export default config;
