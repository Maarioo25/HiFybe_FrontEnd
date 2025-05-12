/** @type {import('tailwindcss').Config} */
export default {
  content: [
    "./index.html",
    "./src/**/*.{js,ts,jsx,tsx}",
  ],
  theme: {
    extend: {
      colors: {
        'harmony-primary': '#1a1a2e',
        'harmony-secondary': '#16213e',
        'harmony-accent': '#0f3460',
        'harmony-accent-dark': '#0c2a4a',
        harmony: {
          primary: '#1E4E4E',    // Color de fondo principal (verde azulado oscuro)
          secondary: '#2A6B6B',  // Color de fondo secundario
          accent: '#4ECCA3',     // Color de acento (verde claro para botones y elementos interactivos)
          dark: '#0D2B2B',       // Color más oscuro para fondos
          light: '#7BFFD9',      // Color más claro para hover y efectos
          text: {
            primary: '#FFFFFF',   // Texto blanco
            secondary: '#B2F5EA', // Texto verde claro
            muted: '#88C5B5'     // Texto desactivado
          }
        }
      },
      backgroundImage: {
        'gradient-harmony': 'linear-gradient(135deg, #1E4E4E 0%, #0D2B2B 100%)',
      }
    },
  },
  plugins: [],
} 