import type { Config } from "tailwindcss";

const config: Config = {
  content: [
    "./app/**/*.{ts,tsx}",
    "./components/**/*.{ts,tsx}",
    "./lib/**/*.{ts,tsx}",
  ],
  theme: {
    extend: {
      colors: {
        // Feuji-inspired vivid orange accent.
        brand: {
          50: "#fff5ed",
          100: "#ffe8d4",
          200: "#ffcda8",
          300: "#ffaa70",
          400: "#fd7e36",
          500: "#f5821f",
          600: "#e2640d",
          700: "#bb4a0c",
          800: "#943c12",
          900: "#783412",
        },
        // Feuji-inspired dark navy for headers, footers and dark panels.
        navy: {
          50: "#f3f5fa",
          100: "#e4e8f2",
          200: "#c7d0e4",
          300: "#9aabcd",
          400: "#6780b0",
          500: "#456096",
          600: "#34497b",
          700: "#2b3b64",
          800: "#1f2b49",
          900: "#131d34",
        },
      },
      fontFamily: {
        sans: ["var(--font-sans)", "ui-sans-serif", "system-ui", "sans-serif"],
      },
      boxShadow: {
        card: "0 1px 2px 0 rgb(16 24 40 / 0.05), 0 1px 3px 0 rgb(16 24 40 / 0.08)",
        cardhover: "0 4px 12px -2px rgb(16 24 40 / 0.12)",
      },
    },
  },
  plugins: [],
};

export default config;
