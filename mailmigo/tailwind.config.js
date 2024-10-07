/** @type {import('tailwindcss').Config} */
module.exports = {
  corePlugins: {
    preflight: false,
  },
  content: ["projects/web/src/**/*.{html,ts}"],
  theme: {
    extend: {
      screens: {
        xl: { max: "1279px" },
        lg: { max: "1023px" },
        md: { max: "767px" },
        sm: { max: "639px" },
      },
      colors: {
        primary: "#000000",
        secondary: "#FFFFFF",
        grey: {
          100: "#E0E0E0",
          600: "#828282",
        },
      },
    },
  },
  plugins: ["prettier-plugin-tailwindcss"],
};
