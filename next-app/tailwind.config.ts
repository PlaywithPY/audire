import type { Config } from "tailwindcss";

const config: Config = {
  content: [
    "./src/pages/**/*.{js,ts,jsx,tsx,mdx}",
    "./src/components/**/*.{js,ts,jsx,tsx,mdx}",
    "./src/app/**/*.{js,ts,jsx,tsx,mdx}",
  ],
  theme: {
    extend: {
      colors: {
        primary: {
          DEFAULT: '#42a4ff',
          light: '#5ab3ff',
          dark: '#2d87e6',
        },
        secondary: '#EBF5FF',
      },
    },
  },
  plugins: [],
};
export default config;
