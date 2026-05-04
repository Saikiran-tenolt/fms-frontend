/** @type {import('tailwindcss').Config} */
export default {
  content: [
    "./index.html",
    "./src/**/*.{js,ts,jsx,tsx}",
  ],
  theme: {
    extend: {
      fontFamily: {
        sans: ['Inter', 'system-ui', 'Avenir', 'Helvetica', 'Arial', 'sans-serif'],
        manrope: ['Inter', 'sans-serif'],
        mono: ['Inter', 'sans-serif'],
        serif: ['Inter', 'sans-serif'],
      },
      colors: {
        primary: {
          50: '#ecfdf5',
          100: '#d1fae5',
          200: '#a7f3d0',
          300: '#6ee7b7',
          400: '#34d399',
          500: '#10b981',
          600: '#059669',
          700: '#047857',
          800: '#065f46',
          900: '#012d1d',
          container: '#1b4332',
          fixed: '#c1ecd4',
        },
        'on-primary-container': '#ffffff',
        'on-primary-fixed': '#002114',
        'secondary-container': '#f1f5f9',
        'on-secondary-container': '#475569',
        'surface-container': '#f8fafc',
        'surface-container-low': '#f1f5f9',
        'surface-container-lowest': '#ffffff',
        'on-surface-variant': '#64748b',
        'outline-variant': '#e2e8f0',
        'error-container': '#fee2e2',
        'on-error-container': '#9ef4e65', // Using hex for error color if needed
        slate: {
          50: '#f8fafc',
          100: '#f1f5f9',
          200: '#e2e8f0',
          300: '#cbd5e1',
          400: '#94a3b8',
          500: '#64748b',
          600: '#475569',
          700: '#334155',
          800: '#1e293b',
          900: '#0f172a',
        },
        status: {
          ok: '#10b981',
          warning: '#f59e0b',
          critical: '#ef4444',
        },
      },
    },
  },
  plugins: [],
}
