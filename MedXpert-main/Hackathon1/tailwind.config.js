// tailwind.config.js
import forms from '@tailwindcss/forms';

/** @type {import('tailwindcss').Config} */
export default {
  content: ["./index.html", "./src/**/*.{js,ts,jsx,tsx}"],
  theme: {
    extend: {
      colors: {
        emerald: {
          950: "#022c22",
          900: "#033d2d",
        },
      },
      fontFamily: {
        sans: ['Space Grotesk', 'sans-serif'],
        heading: ['Marcellus', 'serif'],
        modern: ['ModernAesthetic', 'sans-serif'],
      },
    },
  },
  plugins: [forms],
};
