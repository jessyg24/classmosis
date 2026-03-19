import type { Config } from "tailwindcss";

const config: Config = {
  content: [
    "./pages/**/*.{js,ts,jsx,tsx,mdx}",
    "./components/**/*.{js,ts,jsx,tsx,mdx}",
    "./app/**/*.{js,ts,jsx,tsx,mdx}",
  ],
  theme: {
    extend: {
      colors: {
        // shadcn/ui CSS variable colors
        background: "var(--background)",
        foreground: "var(--foreground)",
        card: { DEFAULT: "var(--card)", foreground: "var(--card-foreground)" },
        popover: { DEFAULT: "var(--popover)", foreground: "var(--popover-foreground)" },
        primary: { DEFAULT: "var(--primary)", foreground: "var(--primary-foreground)" },
        secondary: { DEFAULT: "var(--secondary)", foreground: "var(--secondary-foreground)" },
        muted: { DEFAULT: "var(--muted)", foreground: "var(--muted-foreground)" },
        accent: { DEFAULT: "var(--accent)", foreground: "var(--accent-foreground)" },
        destructive: { DEFAULT: "var(--destructive)", foreground: "var(--destructive-foreground, #fff)" },
        border: "var(--border)",
        input: "var(--input)",
        ring: "var(--ring)",
        sidebar: {
          DEFAULT: "var(--sidebar)",
          foreground: "var(--sidebar-foreground)",
          primary: "var(--sidebar-primary)",
          "primary-foreground": "var(--sidebar-primary-foreground)",
          accent: "var(--sidebar-accent)",
          "accent-foreground": "var(--sidebar-accent-foreground)",
          border: "var(--sidebar-border)",
          ring: "var(--sidebar-ring)",
        },

        // Classmosis design tokens
        "cm-white": "#FAFBFC",
        "cm-surface": "#FFFFFF",
        "cm-border": "rgba(0,0,0,0.07)",
        "cm-border-med": "rgba(0,0,0,0.12)",
        "cm-text-primary": "#1A1D23",
        "cm-text-secondary": "#5A6072",
        "cm-text-hint": "#9299A8",

        // Teal — schedule, active, success
        "cm-teal": "#1D9E75",
        "cm-teal-light": "#E1F5EE",
        "cm-teal-dark": "#085041",

        // Purple — planning, standards, goals
        "cm-purple": "#534AB7",
        "cm-purple-light": "#EEEDFE",
        "cm-purple-dark": "#3C3489",

        // Amber — economy, warnings, watch
        "cm-amber": "#BA7517",
        "cm-amber-light": "#FAEEDA",
        "cm-amber-dark": "#633806",

        // Coral — student portal, alerts, urgent
        "cm-coral": "#D85A30",
        "cm-coral-light": "#FAECE7",
        "cm-coral-dark": "#712B13",

        // Blue — grading, info, academic
        "cm-blue": "#185FA5",
        "cm-blue-light": "#E6F1FB",
        "cm-blue-dark": "#0C447C",

        // Green — mastery, complete, growth
        "cm-green": "#3B6D11",
        "cm-green-light": "#EAF3DE",
        "cm-green-dark": "#27500A",

        // Pink — AI layer, wellbeing, care
        "cm-pink": "#993556",
        "cm-pink-light": "#FBEAF0",
        "cm-pink-dark": "#72243E",
      },
      fontSize: {
        "cm-title": ["28px", { fontWeight: "500", letterSpacing: "-0.3px", lineHeight: "1.3" }],
        "cm-section": ["20px", { fontWeight: "500", lineHeight: "1.4" }],
        "cm-label": ["15px", { fontWeight: "500", lineHeight: "1.5" }],
        "cm-body": ["14px", { fontWeight: "400", lineHeight: "1.6" }],
        "cm-caption": ["12px", { fontWeight: "400", lineHeight: "1.5" }],
        "cm-overline": ["11px", { fontWeight: "500", letterSpacing: "0.07em", lineHeight: "1.4" }],
      },
      borderRadius: {
        "cm-badge": "6px",
        "cm-button": "10px",
        "cm-card": "14px",
        "cm-modal": "20px",
      },
      spacing: {
        "cm-1": "4px",
        "cm-2": "8px",
        "cm-3": "12px",
        "cm-4": "16px",
        "cm-5": "20px",
        "cm-6": "24px",
        "cm-8": "32px",
        "cm-12": "48px",
        "cm-16": "64px",
      },
    },
  },
  plugins: [],
};
export default config;
