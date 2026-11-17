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
          '950': 'rgb(var(--c-forest-950) / <alpha-value>)',
          '900': 'rgb(var(--c-forest-900) / <alpha-value>)',
          '800': 'rgb(var(--c-forest-800) / <alpha-value>)',
          '700': 'rgb(var(--c-forest-700) / <alpha-value>)',
          '600': 'rgb(var(--c-forest-600) / <alpha-value>)',
          '500': 'rgb(var(--c-forest-500) / <alpha-value>)',
        },
        sage: {
          '50': 'rgb(var(--c-sage-50) / <alpha-value>)',
          '100': 'rgb(var(--c-sage-100) / <alpha-value>)',
          '200': 'rgb(var(--c-sage-200) / <alpha-value>)',
          '300': 'rgb(var(--c-sage-300) / <alpha-value>)',
        },
        gold: {
          'DEFAULT': 'rgb(var(--c-gold-default) / <alpha-value>)',
          'light': 'rgb(var(--c-gold-light) / <alpha-value>)',
          'dark': 'rgb(var(--c-gold-dark) / <alpha-value>)',
        },
        cream: 'rgb(var(--c-cream) / <alpha-value>)',
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
