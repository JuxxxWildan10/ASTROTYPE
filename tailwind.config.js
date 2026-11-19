/** @type {import('tailwindcss').Config} */
module.exports = {
  content: ['./index.html', './js/**/*.js'],
  darkMode: 'class',
  theme: {
    extend: {
      screens: {
        xs: '420px'
      }
    }
  },
  plugins: []
};

