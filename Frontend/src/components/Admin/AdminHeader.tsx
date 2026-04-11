import React from "react";
import { Plus, LucideIcon, Sun, Moon, LogOut } from "lucide-react";
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
  children?: React.ReactNode;
}

const AdminHeader: React.FC<AdminHeaderProps> = ({ 
  title, 
  highlightedWord, 
  subtitle, 
  isDark, 
  action,
  actions,
  children 
}) => {
  const { toggleTheme } = useAdminTheme();
  const { adminLogout } = useAuth();
  const allActions = actions || (action ? [action] : []);

  return (
    <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 border-b border-gold/10 pb-4">
      <div className="space-y-1">
        <h2 className={`font-body text-4xl font-bold tracking-tight uppercase transition-colors duration-700 ${
          isDark ? "text-white" : "text-charcoal"
        }`}>
          {title} {highlightedWord && <span className="text-gold">{highlightedWord}</span>}
        </h2>
        <p className={`font-body text-sm tracking-widest uppercase font-bold transition-colors duration-700 ${
          isDark ? "text-slate-500" : "text-charcoal/70"
        }`}>
          {subtitle}
        </p>
      </div>
      
      <div className="flex items-center gap-4 shrink-0">
        {children}
        {allActions.map((action, idx) => (
          <button 
            key={idx}
            onClick={action.onClick}
            disabled={action.disabled}
            className={`flex items-center gap-3 px-8 py-4 font-black uppercase tracking-widest text-xs rounded-2xl shadow-lg transition-all duration-500 disabled:opacity-50 disabled:cursor-not-allowed ${
              action.variant === "danger" 
                ? "bg-rose-500/10 text-rose-500 border border-rose-500/20 hover:bg-rose-500 hover:text-white" 
                : action.variant === "secondary"
                ? "bg-white/5 text-muted-foreground border border-white/10 hover:bg-white/10 hover:text-white"
                : "bg-gold text-charcoal shadow-gold/20 hover:bg-white"
            }`}
          >
            {action.icon ? <action.icon size={18} /> : <Plus size={18} />}
            <span>{action.label}</span>
          </button>
        ))}

        {/* ── Global Utility Capsule ── */}
        <div className={`flex items-center gap-1 p-1 rounded-2xl border transition-all duration-500 ${
          isDark 
            ? "bg-white/5 border-white/10" 
            : "bg-charcoal/5 border-charcoal/10"
        }`}>
          <button
            onClick={toggleTheme}
            className={`w-10 h-10 rounded-xl flex items-center justify-center transition-all duration-300 hover:scale-110 active:scale-90 ${
              isDark ? "text-gold hover:bg-white/5" : "text-gold hover:bg-gold/10"
            }`}
            title="Toggle Theme"
          >
            {isDark ? <Moon size={16} /> : <Sun size={16} />}
          </button>

          <div className={`w-px h-5 mx-0.5 ${isDark ? "bg-white/10" : "bg-charcoal/10"}`} />

          <button
            onClick={adminLogout}
            className={`w-10 h-10 rounded-xl flex items-center justify-center transition-all duration-300 hover:scale-110 active:scale-90 ${
              isDark ? "text-rose-400 hover:bg-rose-500/10" : "text-rose-500 hover:bg-rose-50"
            }`}
            title="Logout"
          >
            <LogOut size={16} />
          </button>
        </div>
      </div>
    </div>
  );
};

export default AdminHeader;
