import type { Config } from "tailwindcss";

const config: Config = {
  content: [
    "./src/pages/**/*.{js,ts,jsx,tsx,mdx}",
    "./src/components/**/*.{js,ts,jsx,tsx,mdx}",
    "./src/app/**/*.{js,ts,jsx,tsx,mdx}",
    "./src/**/*.{js,ts,jsx,tsx,mdx}",
  ],
  theme: {
    extend: {
      colors: {
        background: "var(--background)",
        foreground: "var(--foreground)",
        isl: {
          green: {
            DEFAULT: "#22c55e",
            dark: "#16a34a",
            light: "#86efac",
            bg: "#f0fdf4",
          },
          blue: {
            DEFAULT: "#0ea5e9",
            dark: "#0284c7",
            light: "#7dd3fc",
            bg: "#f0f9ff",
          },
          yellow: {
            DEFAULT: "#eab308",
            dark: "#ca8a04",
            light: "#fde047",
            bg: "#fefce8",
          },
          orange: {
            DEFAULT: "#f97316",
            dark: "#ea580c",
            light: "#fdba74",
            bg: "#fff7ed",
          },
          rose: {
            DEFAULT: "#f43f5e",
            dark: "#e11d48",
            light: "#fda4af",
            bg: "#fff1f2",
          },
          purple: {
            DEFAULT: "#a855f7",
            dark: "#9333ea",
            light: "#d8b4fe",
            bg: "#faf5ff",
          },
        },
      },
      boxShadow: {
        'duo': '0 4px 0 0 rgba(0, 0, 0, 0.15)',
        'duo-sm': '0 2px 0 0 rgba(0, 0, 0, 0.15)',
        'duo-lg': '0 6px 0 0 rgba(0, 0, 0, 0.15)',
        'duo-green': '0 4px 0 0 #16a34a',
        'duo-blue': '0 4px 0 0 #0284c7',
        'duo-yellow': '0 4px 0 0 #ca8a04',
        'duo-rose': '0 4px 0 0 #e11d48',
        'duo-orange': '0 4px 0 0 #ea580c',
        'duo-purple': '0 4px 0 0 #9333ea',
      },
    },
  },
  plugins: [],
};
export default config;
