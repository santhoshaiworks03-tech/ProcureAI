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
        // Verity Exact Design Tokens
        verity: {
          bg: '#F4EEE6',          // Warm off-white / soft neutral canvas
          'bg-subtle': '#EDE6DC', // Subtle section well / tint
          'bg-muted': '#E4DDD3',  // Deeper neutral well
          card: '#FFFFFF',        // Clean white card surface
          'card-hover': '#FAF7F2',
          charcoal: '#13110F',    // Deep charcoal / near-black primary text & buttons
          'charcoal-light': '#1C1916',
          'charcoal-hover': '#26221F',
          muted: '#6B6560',       // Muted warm grey for secondary text
          'muted-light': '#8C847D',
          border: 'rgba(19, 17, 15, 0.08)', // Very subtle warm light-grey border
          'border-strong': 'rgba(19, 17, 15, 0.16)',
          accent: '#F2C8A8',      // Restrained warm terracotta / peach
          'accent-dark': '#E2B28D',
          'accent-bg': 'rgba(242, 200, 168, 0.18)',
          sage: '#B4C7A6',        // Restrained sage green (success / verified)
          'sage-dark': '#3E5C31',
          'sage-bg': 'rgba(180, 199, 166, 0.25)',
          amber: '#D97706',
          'amber-bg': 'rgba(217, 119, 6, 0.12)',
          rose: '#BE123C',
          'rose-bg': 'rgba(190, 18, 60, 0.10)',
        },
        surface: {
          ground: '#F4EEE6',
          card: '#FFFFFF',
          raised: '#EDE6DC',
          border: 'rgba(19, 17, 15, 0.08)',
          hover: '#FAF7F2',
        },
        accent: {
          DEFAULT: '#13110F',     // Deep charcoal replaces previous blue
          hover: '#26221F',
          muted: '#EDE6DC',
          foreground: '#FFFFFF',
        },
        primary: {
          DEFAULT: '#13110F',
          hover: '#26221F',
          light: '#F4EEE6',
        }
      },
      fontFamily: {
        sans: ['Geist', 'Inter', 'system-ui', '-apple-system', 'sans-serif'],
        mono: ['JetBrains Mono', 'ui-monospace', 'monospace'],
      },
      boxShadow: {
        subtle: '0 1px 2px 0 rgba(19, 17, 15, 0.04)',
        card: '0 1px 3px 0 rgba(19, 17, 15, 0.04), 0 1px 2px -1px rgba(19, 17, 15, 0.04)',
        elevated: '0 4px 14px -2px rgba(19, 17, 15, 0.06), 0 2px 4px -2px rgba(19, 17, 15, 0.03)',
        modal: '0 20px 25px -5px rgba(19, 17, 15, 0.1), 0 8px 10px -6px rgba(19, 17, 15, 0.05)',
      },
    },
  },
  plugins: [],
}
