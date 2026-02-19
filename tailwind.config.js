/** @type {import('tailwindcss').Config} */
module.exports = {
  content: [
    './src/pages/**/*.{js,ts,jsx,tsx,mdx}',
    './src/components/**/*.{js,ts,jsx,tsx,mdx}',
    './src/app/**/*.{js,ts,jsx,tsx,mdx}',
  ],
  theme: {
    extend: {
      colors: {
        primary: {
          50: '#fef7ed',
          100: '#fdedd3',
          200: '#fad5a5',
          300: '#f7b96d',
          400: '#f39232',
          500: '#f0750a',
          600: '#e15a00',
          700: '#ba4302',
          800: '#953608',
          900: '#792d09',
        },
        navy: {
          900: '#0c1016',
          800: '#1a202c',
          700: '#2d3748',
        }
      },
      fontFamily: {
        sans: ['Poppins', 'Inter', 'system-ui', 'sans-serif'],
        display: ['Montserrat', 'Poppins', 'system-ui', 'sans-serif'],
      },
    },
  },
  plugins: [],
}
