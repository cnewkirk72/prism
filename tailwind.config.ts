import type { Config } from "tailwindcss";

const config: Config = {
  darkMode: "class",
  content: ["./src/**/*.{ts,tsx,js,jsx,mdx}"],
  theme: {
    extend: {
      colors: {
        prism: {
          bg: "hsl(var(--prism-bg))",
          surface: "hsl(var(--prism-surface))",
          "surface-2": "hsl(var(--prism-surface-2))",
          "surface-3": "hsl(var(--prism-surface-3))",
          border: "hsl(var(--prism-border))",
          "border-strong": "hsl(var(--prism-border-strong))",
          purple: "hsl(var(--prism-purple))",
          "purple-bright": "hsl(var(--prism-purple-bright))",
          pink: "hsl(var(--prism-pink))",
          "pink-bright": "hsl(var(--prism-pink-bright))",
          text: "hsl(var(--prism-text))",
          "text-secondary": "hsl(var(--prism-text-secondary))",
          "text-muted": "hsl(var(--prism-text-muted))",
          success: "hsl(var(--prism-success))",
          warning: "hsl(var(--prism-warning))",
          danger: "hsl(var(--prism-danger))",
          info: "hsl(var(--prism-info))",
          tiktok: "hsl(var(--prism-tiktok))",
        },
      },
      backgroundImage: {
        "prism-gradient":
          "linear-gradient(135deg, hsl(var(--prism-purple)) 0%, hsl(var(--prism-pink)) 100%)",
        "prism-gradient-soft":
          "linear-gradient(135deg, hsl(var(--prism-purple) / 0.18) 0%, hsl(var(--prism-pink) / 0.18) 100%)",
        "instagram-gradient":
          "linear-gradient(135deg, #F58529 0%, #DD2A7B 50%, #8134AF 80%, #515BD4 100%)",
      },
      boxShadow: {
        "glow-purple": "0 0 24px hsl(var(--prism-purple) / 0.35)",
        "glow-pink": "0 0 24px hsl(var(--prism-pink) / 0.30)",
        "cta": "0 8px 24px -8px hsl(var(--prism-purple) / 0.6)",
        "card-inner": "inset 0 1px 0 rgba(255, 255, 255, 0.04)",
      },
      borderRadius: {
        xl: "12px",
        "2xl": "16px",
      },
      fontFamily: {
        sans: ["var(--font-inter)", "system-ui", "sans-serif"],
        display: ["var(--font-geist)", "var(--font-inter)", "system-ui", "sans-serif"],
        mono: ["var(--font-mono)", "ui-monospace", "monospace"],
      },
      keyframes: {
        "fade-in": {
          "0%": { opacity: "0", transform: "translateY(4px)" },
          "100%": { opacity: "1", transform: "translateY(0)" },
        },
        shimmer: {
          "100%": { transform: "translateX(100%)" },
        },
      },
      animation: {
        "fade-in": "fade-in 200ms ease-out",
        shimmer: "shimmer 1.6s infinite",
      },
    },
  },
  plugins: [],
};

export default config;
