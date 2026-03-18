/** @type {import('tailwindcss').Config} */
module.exports = {
  content: ["./src/**/*.{js,ts,jsx,tsx}"],
  theme: {
    extend: {
      fontFamily: {
        mono: ["'DM Mono'", "monospace"],
        sans: ["'Pretendard'", "sans-serif"],
      },
      colors: {
        bg:      "#0a0a0a",
        surface: "#111111",
        border:  "#1e1e1e",
        muted:   "#3a3a3a",
        dim:     "#6b6b6b",
        soft:    "#a0a0a0",
        primary: "#e8e8e8",
        inflow:  "#3b82f6",
        indep:   "#10b981",
        export:  "#f97316",
      },
    },
  },
  plugins: [],
};
