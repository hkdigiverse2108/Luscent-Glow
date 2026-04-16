import React from "react";
import { Plus, Sun, Moon, LogOut } from "lucide-react";
import type { LucideIcon } from "lucide-react";
import { motion } from "framer-motion";
import { useAdminTheme } from "../../context/AdminThemeContext.tsx";
import { useAuth } from "../../context/AuthContext.tsx";

interface AdminHeaderProps {
  title: string;
  highlightedWord?: string;
  subtitle: string;
  isDark: boolean;
  action?: {
    label: string;
    onClick: () => void;
    icon?: LucideIcon;
    disabled?: boolean;
    variant?: "primary" | "danger" | "secondary";
  };
  actions?: {
    label: string;
    onClick: () => void;
    icon?: LucideIcon;
    disabled?: boolean;
    variant?: "primary" | "danger" | "secondary";
  }[];
  onBack?: () => void;
  children?: React.ReactNode;
}

const AdminHeader: React.FC<AdminHeaderProps> = ({
  title,
  highlightedWord,
  subtitle,
  isDark,
  action,
  actions,
  onBack,
  children,
}) => {
  const { toggleTheme, themeConfig } = useAdminTheme();
  const { adminLogout } = useAuth();
  const allActions = actions || (action ? [action] : []);

  return (
    <div className="flex flex-col md:flex-row md:items-start justify-between gap-6 border-b border-gold/8 pb-8">
      {/* ── Title Block ── */}
      <div className="flex flex-col gap-2">
        {onBack && (
          <button
            onClick={onBack}
            className="flex items-center gap-2 text-gold/80 hover:text-gold transition-colors duration-500 text-[9px] font-black uppercase tracking-[0.3em] group w-fit"
          >
            <Plus size={12} className="rotate-45 group-hover:-translate-x-1 transition-transform duration-300" />
            Back to Sanctuary
          </button>
        )}
        <div className="space-y-1.5">
          <h2
            className="font-body text-3xl sm:text-4xl font-bold tracking-tight uppercase transition-colors duration-700"
            style={{ color: themeConfig.vars["--adm-text"] }}
          >
            {title}{" "}
            {highlightedWord && (
              <span className="text-gold italic">{highlightedWord}</span>
            )}
          </h2>
          <p
            className="font-body text-[10px] tracking-[0.35em] uppercase font-black transition-colors duration-700"
            style={{ color: themeConfig.vars["--adm-text-dim"] }}
          >
            {subtitle}
          </p>
        </div>
        {children}
      </div>

      {/* ── Action Cluster ── */}
      <div className="flex items-center gap-4 shrink-0 flex-wrap justify-start md:justify-end">
        {/* Action Buttons */}
        {allActions.map((action, idx) => (
          <motion.button
            key={idx}
            onClick={action.onClick}
            disabled={action.disabled}
            whileHover={{ scale: 1.03 }}
            whileTap={{ scale: 0.97 }}
            className={`flex items-center gap-3 px-8 py-4 font-black uppercase tracking-[0.2em] text-[10px] rounded-2xl shadow-lg transition-all duration-500 disabled:opacity-50 disabled:cursor-not-allowed ${
              action.variant === "danger"
                ? "bg-rose-500/10 text-rose-500 border border-rose-500/20 hover:bg-rose-500 hover:text-white"
                : action.variant === "secondary"
                ? isDark
                  ? "bg-white/10 text-white/80 border border-white/20 hover:bg-white/20 hover:text-white"
                  : "bg-charcoal/5 text-charcoal/80 border border-charcoal/10 hover:bg-charcoal/10"
                : "bg-gold text-charcoal shadow-gold/20 hover:bg-white hover:shadow-xl"
            }`}
          >
            {action.icon ? <action.icon size={16} /> : <Plus size={16} />}
            <span>{action.label}</span>
          </motion.button>
        ))}

        {/* ── Utility Capsule ── */}
        <div
          className="flex items-center gap-3 px-4 py-2.5 rounded-2xl border transition-all duration-700"
          style={{
            backgroundColor: themeConfig.vars["--adm-surface"],
            borderColor: themeConfig.vars["--adm-border"],
          }}
        >
          {/* Sun icon */}
          <Sun
            size={14}
            className="transition-all duration-500 outline-none"
            style={{ color: !isDark ? themeConfig.vars["--adm-accent"] : themeConfig.vars["--adm-text-muted"] }}
          />

          {/* Toggle Track */}
          <button
            onClick={toggleTheme}
            aria-label="Toggle theme"
            className="relative w-12 h-6 rounded-full transition-all duration-700 focus:outline-none flex-shrink-0"
            style={{
              backgroundColor: isDark
                ? `${themeConfig.vars["--adm-accent"]}30`
                : `${themeConfig.vars["--adm-accent"]}25`,
              border: `1px solid ${themeConfig.vars["--adm-accent"]}40`,
            }}
          >
            {/* Gliding Thumb */}
            <motion.div
              layout
              transition={{ type: "spring", stiffness: 500, damping: 35 }}
              className="absolute top-[3px] w-[18px] h-[18px] rounded-full shadow-lg"
              style={{
                left: isDark ? "calc(100% - 21px)" : "3px",
                backgroundColor: themeConfig.vars["--adm-accent"],
                boxShadow: `0 2px 8px ${themeConfig.vars["--adm-accent"]}50`,
              }}
            />
          </button>

          {/* Moon icon */}
          <Moon
            size={14}
            className="transition-all duration-500 outline-none"
            style={{ color: isDark ? themeConfig.vars["--adm-accent"] : themeConfig.vars["--adm-text-muted"] }}
          />

          {/* Divider */}
          <div
            className="w-px h-5"
            style={{ backgroundColor: themeConfig.vars["--adm-border"] }}
          />

          {/* Logout */}
          <motion.button
            onClick={adminLogout}
            whileHover={{ scale: 1.1 }}
            whileTap={{ scale: 0.9 }}
            className="transition-colors duration-300"
            style={{ color: isDark ? "rgba(251,113,133,0.9)" : "rgba(225,29,72,0.9)" }}
            title="Logout"
          >
            <LogOut size={15} />
          </motion.button>
        </div>
      </div>
    </div>
  );
};

export default AdminHeader;
