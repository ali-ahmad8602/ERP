import type { Config } from "tailwindcss";

const config: Config = {
  content: ["./src/**/*.{js,ts,jsx,tsx,mdx}"],
  theme: {
    extend: {
      colors: {
        primary:    { DEFAULT: "#0454FC", light: "#3B7BFF", ghost: "rgba(4,84,252,0.12)" },
        accent:     "#00E5A0",
        danger:     "#FF4444",
        warning:    "#F5A623",
        bg: {
          base:     "#050505",
          surface:  "#0F0F0F",
          elevated: "#1A1A1A",
          overlay:  "#242424",
        },
        border:     { DEFAULT: "#2A2A2A", subtle: "#1E1E1E" },
        text: {
          primary:   "#F3F3F3",
          secondary: "#888888",
          muted:     "#444444",
        },
      },
      fontFamily: {
        sans: ["Inter", "-apple-system", "BlinkMacSystemFont", "sans-serif"],
        mono: ["JetBrains Mono", "Fira Code", "monospace"],
      },
      fontSize: {
        display:    ["32px", { lineHeight: "1.2", fontWeight: "700" }],
        heading:    ["24px", { lineHeight: "1.3", fontWeight: "600" }],
        subheading: ["18px", { lineHeight: "1.4", fontWeight: "500" }],
        body:       ["14px", { lineHeight: "1.5", fontWeight: "400" }],
        small:      ["12px", { lineHeight: "1.4", fontWeight: "400" }],
      },
      borderRadius: {
        card: "12px",
        btn:  "8px",
        badge:"6px",
      },
      boxShadow: {
        card:        "0 1px 3px rgba(0,0,0,0.4)",
        "card-hover":"0 0 0 1px rgba(4,84,252,0.3), 0 4px 16px rgba(0,0,0,0.5)",
        modal:       "0 24px 48px rgba(0,0,0,0.8)",
      },
      animation: {
        "slide-in-right": "slideInRight 0.2s ease-out",
        "fade-in":        "fadeIn 0.15s ease-out",
      },
      keyframes: {
        slideInRight: {
          from: { transform: "translateX(100%)", opacity: "0" },
          to:   { transform: "translateX(0)",    opacity: "1" },
        },
        fadeIn: {
          from: { opacity: "0" },
          to:   { opacity: "1" },
        },
      },
    },
  },
  plugins: [],
};

export default config;
