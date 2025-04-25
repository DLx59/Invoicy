/** @type {import('tailwindcss').Config} */
module.exports = {
  content: [
    "./src/**/*.{html,ts}",
    "./node_modules/primeng/**/*.{js,ts}",
    "./node_modules/tailwindcss-primeui/**/*.{js,ts}"
  ],
  theme: {
    extend: {
      colors: {
        background: '#1f1f1f',
        surface: '#111827',
        primary: '#3b82f6',
        info: '#2196F3',
        success: '#22c55e',
        danger: '#ef4444',
        warning: '#f59e0b',
        text: '#f5f5f5',
        textSecondary: '#9ca3af',
        border: '#374151',
        hover: '#2a2a2a',
      },
    },
  },
  plugins: []
}
