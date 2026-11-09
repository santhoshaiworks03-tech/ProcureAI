/** @type {import('tailwindcss').Config} */
export default {
  content: [
    "./index.html",
    "./src/**/*.{js,ts,jsx,tsx}",
  ],
  darkMode: 'class',
  theme: {
    extend: {
      colors: {
        navy: {
          900: '#071426', // Deep Navy
          800: '#10243D', // Secondary Navy
          700: '#173559',
          600: '#204675',
          500: '#2b5a94',
        },
        brand: {
          blue: '#2878E5',
          cyan: '#28C5D7',
          light: '#F5F8FC',
          success: '#16A36A',
          warning: '#E9A23B',
          error: '#DC5252',
        },
      },
      fontFamily: {
        sans: ['Inter', 'system-ui', '-apple-system', 'sans-serif'],
        mono: ['JetBrains Mono', 'Fira Code', 'monospace'],
      },
      boxShadow: {
        card: '0 1px 3px 0 rgba(7, 20, 38, 0.05), 0 1px 2px -1px rgba(7, 20, 38, 0.05)',
        elevated: '0 4px 6px -1px rgba(7, 20, 38, 0.08), 0 2px 4px -2px rgba(7, 20, 38, 0.05)',
        modal: '0 20px 25px -5px rgba(7, 20, 38, 0.15), 0 8px 10px -6px rgba(7, 20, 38, 0.1)',
        glow: '0 0 15px -3px rgba(40, 120, 229, 0.3)',
      },
    },
  },
  plugins: [],
}
