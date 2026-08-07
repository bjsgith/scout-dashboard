/** @type {import('tailwindcss').Config} */
module.exports = {
  content: [
    "./app/**/*.{js,ts,jsx,tsx,mdx}",
    "./components/**/*.{js,ts,jsx,tsx,mdx}",
  ],
  theme: {
    extend: {
      // Room to grow on large monitors — the app is often read zoomed out,
      // which widens the CSS viewport well past Tailwind's default ceiling.
      screens: {
        "2xl": "1600px",
        "3xl": "2000px",
        "4xl": "2560px",
      },
      // Dark sea. The token names are inherited from the original daylight
      // palette and kept deliberately — every class in the app references them,
      // so the theme swaps by remapping values, not by renaming anything.
      // Read them by role: paper = surfaces, pine = ink & primary action,
      // moss = secondary text, sage = hairlines, rust = the accent.
      colors: {
        // Deep water — the page and its surfaces, darkest to lit.
        paper: {
          DEFAULT: "#0B1E27",
          raised: "#12303B",
          sunk: "#071720",
        },
        // Foam — primary text, and the fill of primary actions.
        pine: {
          DEFAULT: "#E8F3F4",
          deep: "#C8E2E6",
          soft: "#A5C7D0",
        },
        // Mist — secondary and tertiary text.
        moss: {
          DEFAULT: "#93AEB9",
          light: "#7E9CAA",
        },
        // Shoal — hairlines, borders, dividers, and faded numerals.
        sage: {
          DEFAULT: "#1D3E4C",
          dark: "#27505F",
          deep: "#5E93A6",
        },
        // The blaze — a coral beacon against the teal, used sparingly.
        rust: {
          DEFAULT: "#E4694A",
          deep: "#F08265",
          soft: "#3B211A",
        },
      },
      fontFamily: {
        display: ["var(--font-display)", "ui-sans-serif", "sans-serif"],
        sans: ["var(--font-body)", "ui-sans-serif", "system-ui", "sans-serif"],
      },
      // Deeper and more opaque than the daylight original — on dark surfaces a
      // 4% shadow reads as nothing.
      boxShadow: {
        card: "0 1px 2px rgba(2, 12, 18, 0.35), 0 1px 12px rgba(2, 12, 18, 0.25)",
        lift: "0 2px 4px rgba(2, 12, 18, 0.4), 0 8px 24px rgba(2, 12, 18, 0.45)",
      },
    },
  },
  plugins: [],
};
