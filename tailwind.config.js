/** @type {import('tailwindcss').Config} */
module.exports = {
  content: [
    "./app/**/*.{js,ts,jsx,tsx,mdx}",
    "./components/**/*.{js,ts,jsx,tsx,mdx}",
  ],
  theme: {
    extend: {
      colors: {
        // Warm daylight paper — the page and its surfaces.
        paper: {
          DEFAULT: "#F3EFE4",
          raised: "#FBF9F1",
          sunk: "#ECE7D8",
        },
        // Deep forest ink + primary actions.
        pine: {
          DEFAULT: "#22372B",
          deep: "#1A2C21",
          soft: "#3A5240",
        },
        // Muted green-grays for secondary text.
        moss: {
          DEFAULT: "#54624E",
          light: "#7C8B73",
        },
        // Sage hairlines, borders, dividers.
        sage: {
          DEFAULT: "#D7DBC6",
          dark: "#C3C9AE",
          deep: "#9DA889",
        },
        // The blaze — clay/rust accent, used sparingly.
        rust: {
          DEFAULT: "#A8482A",
          deep: "#8C3A20",
          soft: "#EDDBCF",
        },
      },
      fontFamily: {
        display: ["var(--font-display)", "ui-sans-serif", "sans-serif"],
        sans: ["var(--font-body)", "ui-sans-serif", "system-ui", "sans-serif"],
      },
      boxShadow: {
        card: "0 1px 2px rgba(34, 55, 43, 0.04), 0 1px 12px rgba(34, 55, 43, 0.04)",
        lift: "0 2px 4px rgba(34, 55, 43, 0.06), 0 8px 24px rgba(34, 55, 43, 0.08)",
      },
    },
  },
  plugins: [],
};
