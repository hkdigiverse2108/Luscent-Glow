import React, { createContext, useContext, useState, useEffect } from "react";

// ── Sanctuary Themes ──────────────────────────────────────────────────────────
export type AdminTheme = "obsidian" | "radiant";

export interface SanctuaryTheme {
  id: AdminTheme;
  label: string;
  description: string;
  isDark: boolean;
  // These are applied as CSS variables on :root when the theme is active
  vars: {
    "--adm-bg": string;
    "--adm-surface": string;
    "--adm-surface-2": string;
    "--adm-border": string;
    "--adm-border-strong": string;
    "--adm-text": string;
    "--adm-text-muted": string;
    "--adm-text-dim": string;
    "--adm-glow-1": string;
    "--adm-glow-2": string;
    "--adm-accent": string;
    "--adm-accent-text": string;
  };
  /** Tailwind class preview swatches */
  swatches: string[];
}

export const SANCTUARY_THEMES: SanctuaryTheme[] = [
  {
    id: "obsidian",
    label: "Obsidian",
    description: "Midnight luxury — deep blacks with warm gold shimmer",
    isDark: true,
    vars: {
      "--adm-bg":           "#0f0f0f",
      "--adm-surface":      "rgba(255,255,255,0.025)",
      "--adm-surface-2":    "rgba(255,255,255,0.04)",
      "--adm-border":       "rgba(255,255,255,0.06)",
      "--adm-border-strong":"rgba(255,255,255,0.12)",
      "--adm-text":         "rgba(255,255,255,0.90)",
      "--adm-text-muted":   "rgba(255,255,255,0.45)",
      "--adm-text-dim":     "rgba(255,255,255,0.20)",
      "--adm-glow-1":       "rgba(212,175,55,0.05)",
      "--adm-glow-2":       "rgba(212,100,80,0.04)",
      "--adm-accent":       "#D4AF37",
      "--adm-accent-text":  "#1a1a1a",
    },
    swatches: ["bg-[#0f0f0f]", "bg-[#1d1d1d]", "bg-[#D4AF37]"],
  },
  {
    id: "radiant",
    label: "Radiant",
    description: "Ivory dawn — warm cream with burnished gold accents",
    isDark: false,
    vars: {
      "--adm-bg":           "#faf9f6",
      "--adm-surface":      "rgba(255,255,255,0.96)",
      "--adm-surface-2":    "rgba(0,0,0,0.025)",
      "--adm-border":       "rgba(0,0,0,0.055)",
      "--adm-border-strong":"rgba(0,0,0,0.12)",
      "--adm-text":         "rgba(28,22,16,0.92)",
      "--adm-text-muted":   "rgba(28,22,16,0.55)",
      "--adm-text-dim":     "rgba(28,22,16,0.30)",
      "--adm-glow-1":       "rgba(212,175,55,0.04)",
      "--adm-glow-2":       "rgba(200,120,90,0.03)",
      "--adm-accent":       "#B68F4C",
      "--adm-accent-text":  "#ffffff",
    },
    swatches: ["bg-[#faf9f6]", "bg-[#f0ebe2]", "bg-[#B68F4C]"],
  },
];

// ── Context ───────────────────────────────────────────────────────────────────
interface AdminThemeContextType {
  theme: AdminTheme;
  themeConfig: SanctuaryTheme;
  isDark: boolean;
  setTheme: (theme: AdminTheme) => void;
  toggleTheme: () => void;
}

const AdminThemeContext = createContext<AdminThemeContextType | undefined>(undefined);

// ── Provider ──────────────────────────────────────────────────────────────────
export const AdminThemeProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [theme, setThemeState] = useState<AdminTheme>(() => {
    const saved = localStorage.getItem("sanctuary-theme") as AdminTheme;
    return SANCTUARY_THEMES.find(t => t.id === saved) ? saved : "obsidian";
  });

  const themeConfig = SANCTUARY_THEMES.find(t => t.id === theme)!;
  const isDark = themeConfig.isDark;

  // Apply CSS variables to :root whenever theme changes
  useEffect(() => {
    const root = document.documentElement;
    Object.entries(themeConfig.vars).forEach(([key, val]) => {
      root.style.setProperty(key, val);
    });
    localStorage.setItem("sanctuary-theme", theme);
  }, [theme, themeConfig]);

  const setTheme = (t: AdminTheme) => setThemeState(t);

  const toggleTheme = () => {
    setThemeState((prev) => prev === "obsidian" ? "radiant" : "obsidian");
  };

  return (
    <AdminThemeContext.Provider value={{ theme, themeConfig, isDark, setTheme, toggleTheme }}>
      {children}
    </AdminThemeContext.Provider>
  );
};

// ── Hook ──────────────────────────────────────────────────────────────────────
export const useAdminTheme = () => {
  const context = useContext(AdminThemeContext);
  if (context === undefined) {
    throw new Error("useAdminTheme must be used within an AdminThemeProvider");
  }
  return context;
};
