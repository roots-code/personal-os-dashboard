import type { Config } from "tailwindcss";

const config: Config = {
  darkMode: "class",
  content: [
    "./app/**/*.{js,ts,jsx,tsx,mdx}",
    "./components/**/*.{js,ts,jsx,tsx,mdx}"
  ],
  theme: {
    extend: {
      colors: {
        background: "#050816",
        surface: "#0b1020",
        surfaceMuted: "#141826",
        accent: "#4f46e5",
        accentSoft: "#312e81",
        border: "#1f2937"
      },
      borderRadius: {
        xl: "1rem"
      },
      boxShadow: {
        card: "0 16px 40px rgba(0,0,0,0.45)"
      }
    }
  },
  plugins: []
};

export default config;
