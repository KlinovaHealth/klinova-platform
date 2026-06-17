/** @type {import('tailwindcss').Config} */
module.exports = {
  content: [
    './app/**/*.{js,jsx,ts,tsx}',
    './hooks/**/*.{js,jsx,ts,tsx}',
    './lib/**/*.{js,jsx,ts,tsx}',
    './components/**/*.{js,jsx,ts,tsx}',
  ],
  corePlugins: {
    // Disable Tailwind's reset so the existing marketing page styles aren't wiped
    preflight: false,
  },
  theme: {
    extend: {
      fontFamily: {
        fraunces: ['Fraunces', 'Georgia', 'serif'],
        jakarta: ['"Plus Jakarta Sans"', 'system-ui', 'sans-serif'],
      },
      colors: {
        kgreen:  { DEFAULT: '#0E6B4F', light: '#E8F3EF', dark: '#0a5540' },
        kblue:   { DEFAULT: '#2C6E8F', light: '#E8F0F5', dark: '#235a75' },
        kgold:   { DEFAULT: '#D99A2B', light: '#FBF4E5', dark: '#b8821f' },
        kpurple: { DEFAULT: '#6A4C93', light: '#F0EBF7', dark: '#573e78' },
        kteal:   { DEFAULT: '#2C8C99', light: '#E6F4F5', dark: '#237380' },
        ivory:   '#F5EFE3',
        ink:     '#15302A',
        border:  '#E7DECC',
      },
      boxShadow: {
        card: '0 1px 4px rgba(21,48,42,0.06)',
      },
    },
  },
  plugins: [],
}
