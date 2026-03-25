/** @type {import('tailwindcss').Config} */
export default {
  content: [
    "./index.html",
    "./src/**/*.{js,ts,jsx,tsx}",
  ],
  theme: {
    extend: {
      colors: {
        primary: {
          50: '#f0fdf4',
          100: '#dcfce7',
          200: '#bbf7d0',
          300: '#86efac',
          400: '#4ade80',
          500: '#22c55e',
          600: '#16a34a',
          700: '#15803d',
          800: '#166534',
          900: '#14532d',
        },
        earth: {
          50: '#faf8f5',
          100: '#f5f1ea',
          200: '#e8dfd0',
          300: '#d4c4a8',
          400: '#b8a179',
          500: '#9d8355',
          600: '#8b7049',
          700: '#735b3d',
          800: '#604c36',
          900: '#52412f',
        },
        status: {
          ok: '#22c55e',
          warning: '#f59e0b',
          critical: '#ef4444',
        },
      },
    },
  },
  plugins: [],
}
