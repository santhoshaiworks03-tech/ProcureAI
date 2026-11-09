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
        ink: {
          950: '#07090E',
          900: '#0D111A',
          850: '#121824',
          800: '#182030',
          700: '#222C40',
          600: '#32405A',
        },
        surface: {
          ground: '#F6F8FA',
          card: '#FFFFFF',
          raised: '#F0F3F6',
          border: 'rgba(15, 23, 42, 0.08)',
          hover: '#F8FAFC',
        },
        accent: {
          DEFAULT: '#1D4ED8', // Refined enterprise cobalt
          hover: '#1E40AF',
          muted: '#EFF6FF',
          foreground: '#FFFFFF',
        },
        status: {
          success: '#15803D',
          warning: '#B45309',
          danger: '#B91C1C',
          info: '#1D4ED8',
        }
      },
      fontFamily: {
        sans: ['Inter', 'system-ui', '-apple-system', 'sans-serif'],
        mono: ['JetBrains Mono', 'ui-monospace', 'monospace'],
      },
      boxShadow: {
        subtle: '0 1px 2px 0 rgba(0, 0, 0, 0.04)',
        card: '0 1px 3px 0 rgba(0, 0, 0, 0.05), 0 1px 2px -1px rgba(0, 0, 0, 0.05)',
        elevated: '0 4px 6px -1px rgba(0, 0, 0, 0.05), 0 2px 4px -2px rgba(0, 0, 0, 0.05)',
        modal: '0 20px 25px -5px rgba(0, 0, 0, 0.1), 0 8px 10px -6px rgba(0, 0, 0, 0.06)',
      },
    },
  },
  plugins: [],
}
