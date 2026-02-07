/** @type {import('tailwindcss').Config} */
module.exports = {
  content: [
    "./src/**/*.{html,ts}",
  ],
  theme: {
    extend: {
      colors: {
        'bg': {
          'primary': '#303446',
          'secondary': '#292C3C',
          'tertiary': '#232634',
          'card': '#292C3C',
        },
        'accent': {
          DEFAULT: '#F288B7',
          'light': '#F5A3C7',
          'dark': '#E06A9E',
          'muted': 'rgba(242, 136, 183, 0.15)',
        },
        'border': {
          DEFAULT: 'rgba(255, 255, 255, 0.1)',
          'light': 'rgba(255, 255, 255, 0.15)',
        },
        'text': {
          'primary': '#ffffff',
          'secondary': 'rgba(255, 255, 255, 0.6)',
          'muted': 'rgba(255, 255, 255, 0.4)',
        }
      },
      fontFamily: {
        'display': ['Outfit', 'sans-serif'],
        'body': ['Inter', 'sans-serif'],
      },
      animation: {
        'fade-in': 'fade-in 0.6s ease-out',
        'slide-in': 'slide-in 0.3s ease-out',
      },
      keyframes: {
        'fade-in': {
          '0%': { opacity: '0', transform: 'translateY(20px)' },
          '100%': { opacity: '1', transform: 'translateY(0)' },
        },
        'slide-in': {
          '0%': { opacity: '0', transform: 'translateX(-10px)' },
          '100%': { opacity: '1', transform: 'translateX(0)' },
        },
      },
    },
  },
  plugins: [],
};
