import React from "react";
import { Plus, LucideIcon } from "lucide-react";

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
        {children}
      </div>
      
      <div className="flex items-center gap-4 shrink-0">
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
      </div>
    </div>
  );
};

export default AdminHeader;
