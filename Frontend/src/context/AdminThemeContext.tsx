import React, { createContext, useContext, useState, useEffect } from "react";

type AdminTheme = "radiant" | "obsidian";

interface AdminThemeContextType {
  theme: AdminTheme;
  isDark: boolean;
  toggleTheme: () => void;
}

const AdminThemeContext = createContext<AdminThemeContextType | undefined>(undefined);

export const AdminThemeProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [theme, setTheme] = useState<AdminTheme>(() => {
    const saved = localStorage.getItem("sanctuary-theme");
    return (saved as AdminTheme) || "obsidian";
  });

  const isDark = theme === "obsidian";

  useEffect(() => {
    localStorage.setItem("sanctuary-theme", theme);
  }, [theme]);

  const toggleTheme = () => {
    setTheme((prev) => (prev === "obsidian" ? "radiant" : "obsidian"));
  };

  return (
    <AdminThemeContext.Provider value={{ theme, isDark, toggleTheme }}>
      {children}
    </AdminThemeContext.Provider>
  );
};

export const useAdminTheme = () => {
  const context = useContext(AdminThemeContext);
  if (context === undefined) {
    throw new Error("useAdminTheme must be used within an AdminThemeProvider");
  }
  return context;
};
