import type { Config } from "tailwindcss";

const config: Config = {
  content: ["./src/**/*.{js,ts,jsx,tsx,mdx}"],
  theme: {
    extend: {
      colors: {
        void: "rgb(var(--void) / <alpha-value>)",
        panel: "rgb(var(--panel) / <alpha-value>)",
        "panel-hi": "rgb(var(--panel-hi) / <alpha-value>)",
        fg: "rgb(var(--fg) / <alpha-value>)",
        dim: "rgb(var(--dim) / <alpha-value>)",
      },
      fontFamily: {
        dot: ["var(--font-dot)", "ui-monospace", "monospace"],
        sans: ["var(--font-sans)", "system-ui", "sans-serif"],
        mono: ["var(--font-mono)", "ui-monospace", "monospace"],
      },
      letterSpacing: {
        label: "0.18em",
      },
      transitionTimingFunction: {
        decel: "cubic-bezier(0.2, 0, 0, 1)",
      },
    },
  },
  plugins: [],
};
export default config;
