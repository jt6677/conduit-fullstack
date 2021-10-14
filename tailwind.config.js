const colors = require('tailwindcss/colors')
module.exports = {
  purge: ['./index.html', './src/**/*.{vue,js,ts,jsx,tsx}'],
  darkMode: false, // or 'media' or 'class'
  theme: {
    // maxWidth: {
    //   '1/4': '25%',

    //   '1/2': '50%',

    //   '3/4': '75%',
    // },
    extend: {
      colors: {
        teal: colors.teal,
        rose: colors.rose,
        pink: colors.pink,
      },
    },
  },
  variants: {
    extend: {},
  },
  plugins: [],
}
