/** @type {import('tailwindcss').Config} */
export default {
  content: ['./index.html', './src/**/*.{js,jsx}'],
  theme: {
    extend: {
      fontFamily: {
        display: ['"Playfair Display"', 'Georgia', 'serif'],
        sans: ['"DM Sans"', 'system-ui', 'sans-serif'],
      },
      colors: {
        forest: {
          950: '#0d1a0f',
          900: '#1b3520',
          800: '#254a2c',
          700: '#2d5a22',
          600: '#3d7a30',
          500: '#4e9a3e',
        },
        sage: {
          50:  '#f5f7ee',
          100: '#eef2e4',
          200: '#dde7c8',
          300: '#c5d6a0',
        },
        gold: {
          DEFAULT: '#c8a96e',
          light: '#dfc494',
          dark: '#a88748',
        },
        cream: '#fafaf7',
      },
      keyframes: {
        fadeIn: { from: { opacity: '0', transform: 'translateY(8px)' }, to: { opacity: '1', transform: 'none' } },
        slideIn: { from: { opacity: '0', transform: 'translateX(-12px)' }, to: { opacity: '1', transform: 'none' } },
        pulse: { '0%,100%': { opacity: '1' }, '50%': { opacity: '.5' } },
      },
      animation: {
        fadeIn: 'fadeIn 0.4s ease-out forwards',
        'fade-in-1': 'fadeIn 0.4s ease-out 0.1s forwards',
        'fade-in-2': 'fadeIn 0.4s ease-out 0.2s forwards',
        'fade-in-3': 'fadeIn 0.4s ease-out 0.3s forwards',
        'fade-in-4': 'fadeIn 0.4s ease-out 0.4s forwards',
        slideIn: 'slideIn 0.3s ease-out forwards',
      },
    },
  },
  plugins: [],
}
