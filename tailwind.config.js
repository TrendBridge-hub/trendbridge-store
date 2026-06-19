/** @type {import('tailwindcss').Config} */
export default {
  content: [
    "./index.html",
    "./product.html",
    "./src/**/*.{js,ts,jsx,tsx}",
  ],
  theme: {
    extend: {
      colors: {
        primary: '#0f172a', // slate-900
        secondary: '#64748b', // slate-500
        accent: '#0d9488', // teal-600
        highlight: '#f0fdfa', // teal-50
      },
      fontFamily: {
        heading: ['Inter', 'system-ui', 'sans-serif'],
        body: ['Inter', 'system-ui', 'sans-serif'],
      },
    },
  },
  plugins: [],
}
