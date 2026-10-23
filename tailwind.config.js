/** @type {import('tailwindcss').Config} */
export default {
  content: [
    "./index.html",
    "./src/**/*.{js,ts,jsx,tsx}",
  ],
  theme: {
    extend: {
      colors: {
        plum: {
          900: '#380026',
          800: '#4a0e35',
        },
        cream: {
          50: '#fffdfa',
          100: '#fffbf0',
          200: '#fff7ed',
        },
        pastel: {
          pink: '#ffd1dc',
          rose: '#f472b6',
        }
      },
      fontFamily: {
        sans: ['"Plus Jakarta Sans"', 'ui-sans-serif', 'system-ui', '-apple-system', 'sans-serif'],
        pixel: ['"VT323"', 'monospace'],
      }
    },
  },
  plugins: [],
}
