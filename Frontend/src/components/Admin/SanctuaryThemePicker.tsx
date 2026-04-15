import React, { useRef, useEffect } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { Sun, Moon, X } from "lucide-react";
import { useAdminTheme, SANCTUARY_THEMES } from "../../context/AdminThemeContext.tsx";

interface SanctuaryThemePickerProps {
  isOpen: boolean;
  onClose: () => void;
}

const SanctuaryThemePicker: React.FC<SanctuaryThemePickerProps> = ({ isOpen, onClose }) => {
  const { theme, setTheme, isDark } = useAdminTheme();
  const ref = useRef<HTMLDivElement>(null);

  // Close on outside click
  useEffect(() => {
    const handler = (e: MouseEvent) => {
      if (ref.current && !ref.current.contains(e.target as Node)) onClose();
    };
    if (isOpen) document.addEventListener("mousedown", handler);
    return () => document.removeEventListener("mousedown", handler);
  }, [isOpen, onClose]);

  const themes = SANCTUARY_THEMES; // now exactly 2: obsidian & radiant

  return (
    <AnimatePresence>
      {isOpen && (
        <>
          {/* Backdrop */}
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 z-[200] bg-black/20 backdrop-blur-sm"
            onClick={onClose}
          />

          {/* Picker Panel */}
          <motion.div
            ref={ref}
            initial={{ opacity: 0, y: -10, scale: 0.97 }}
            animate={{ opacity: 1, y: 0, scale: 1 }}
            exit={{ opacity: 0, y: -10, scale: 0.97 }}
            transition={{ type: "spring", stiffness: 420, damping: 38 }}
            className={`fixed top-[4.5rem] right-6 z-[201] w-[300px] rounded-[2rem] border shadow-2xl overflow-hidden ${
              isDark
                ? "bg-[#141414] border-white/10 shadow-black/60"
                : "bg-white border-charcoal/8 shadow-charcoal/10"
            }`}
          >
            {/* Header */}
            <div className={`flex items-center justify-between px-6 pt-6 pb-4 border-b ${
              isDark ? "border-white/6" : "border-charcoal/6"
            }`}>
              <p className={`text-[9px] font-black uppercase tracking-[0.4em] ${
                isDark ? "text-white/30" : "text-charcoal/40"
              }`}>Sanctuary Theme</p>
              <button
                onClick={onClose}
                className={`w-7 h-7 rounded-lg flex items-center justify-center transition-colors ${
                  isDark ? "text-white/20 hover:text-white/50 hover:bg-white/5" : "text-charcoal/30 hover:text-charcoal hover:bg-charcoal/5"
                }`}
              >
                <X size={14} />
              </button>
            </div>

            {/* Theme Options */}
            <div className="p-4 space-y-2.5">
              {themes.map((t) => {
                const isActive = theme === t.id;
                const Icon = t.isDark ? Moon : Sun;

                return (
                  <motion.button
                    key={t.id}
                    onClick={() => { setTheme(t.id); onClose(); }}
                    whileHover={{ x: 3 }}
                    whileTap={{ scale: 0.97 }}
                    className={`w-full flex items-center gap-5 p-4 rounded-[1.25rem] border text-left transition-all duration-500 group ${
                      isActive
                        ? "border-gold/25 shadow-inner"
                        : isDark
                          ? "bg-white/[0.02] border-white/5 hover:border-white/10"
                          : "bg-charcoal/[0.02] border-charcoal/5 hover:border-charcoal/10"
                    }`}
                    style={isActive ? { backgroundColor: `${t.vars["--adm-accent"]}10` } : {}}
                  >
                    {/* Icon */}
                    <div
                      className="w-10 h-10 rounded-xl flex items-center justify-center flex-shrink-0 transition-transform group-hover:scale-110 duration-500"
                      style={{
                        backgroundColor: isActive ? `${t.vars["--adm-accent"]}20` : undefined,
                        color: isActive ? t.vars["--adm-accent"] : isDark ? "rgba(255,255,255,0.25)" : "rgba(0,0,0,0.25)"
                      }}
                    >
                      <Icon size={18} />
                    </div>

                    {/* Label */}
                    <div className="flex-1">
                      <p
                        className="text-[11px] font-black uppercase tracking-[0.25em] mb-0.5 transition-colors"
                        style={{ color: isActive ? t.vars["--adm-accent"] : isDark ? "rgba(255,255,255,0.65)" : "rgba(28,22,16,0.75)" }}
                      >
                        {t.label}
                      </p>
                      <p
                        className="text-[9px] font-medium leading-snug"
                        style={{ color: isDark ? "rgba(255,255,255,0.22)" : "rgba(28,22,16,0.35)" }}
                      >
                        {t.description}
                      </p>
                    </div>

                    {/* Active indicator — accent dot */}
                    {isActive && (
                      <motion.div
                        initial={{ scale: 0 }}
                        animate={{ scale: 1 }}
                        className="w-2 h-2 rounded-full flex-shrink-0"
                        style={{ backgroundColor: t.vars["--adm-accent"] }}
                      />
                    )}
                  </motion.button>
                );
              })}
            </div>

            {/* Footer */}
            <div className={`px-6 pb-5 pt-1`}>
              <p
                className="text-center text-[8px] font-black uppercase tracking-[0.35em]"
                style={{ color: isDark ? "rgba(255,255,255,0.10)" : "rgba(0,0,0,0.15)" }}
              >
                ✦ Luscent Glow · Admin ✦
              </p>
            </div>
          </motion.div>
        </>
      )}
    </AnimatePresence>
  );
};

export default SanctuaryThemePicker;
