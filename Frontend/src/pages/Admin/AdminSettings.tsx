import React from "react";
import { motion } from "framer-motion";
import { 
  Settings, 
  User, 
  Bell, 
  Shield, 
  Smartphone,
  Moon,
  Sun,
  Layout,
  ExternalLink,
  Sparkles
} from "lucide-react";
import { useAdminTheme } from "../../context/AdminThemeContext.tsx";

const AdminSettings = () => {
  const { theme, isDark, toggleTheme } = useAdminTheme();

  const settingsGroups = [
    {
      title: "Visual Governance",
      description: "Customize the aesthetic density of your Sanctuary environment.",
      icon: Layout,
      settings: [
        { 
          label: "Sanctuary State", 
          description: isDark ? "Obsidian State (Dark Mode) active" : "Radiant State (Light Mode) active",
          action: (
            <button 
              onClick={toggleTheme}
              className={`flex items-center gap-3 px-6 py-3 rounded-xl border transition-all duration-500 font-bold uppercase tracking-widest text-xs ${
                isDark 
                ? "bg-white/5 border-white/10 text-gold hover:bg-gold/10 hover:border-gold/30 shadow-lg shadow-gold/5" 
                : "bg-charcoal/5 border-charcoal/10 text-gold hover:bg-gold/10 hover:border-gold/30 shadow-lg shadow-gold/5"
              }`}
            >
              {isDark ? <Moon size={14} /> : <Sun size={14} />}
              Toggle State
            </button>
          )
        }
      ]
    },
    {
      title: "Administrative Profile",
      description: "Manage your presence within the Lucsent Glow oversight rituals.",
      icon: User,
      settings: [
        { 
          label: "Sanctuary Identity", 
          description: "Global Administrator",
          action: (
            <button className={`px-6 py-3 rounded-xl border transition-all duration-500 font-bold uppercase tracking-widest text-xs ${
              isDark 
              ? "bg-white/5 border-white/10 text-white/40 hover:text-white hover:border-white/20" 
              : "bg-charcoal/5 border-charcoal/10 text-charcoal/70 hover:text-charcoal hover:border-charcoal/20"
            }`}>
              Edit Profile
            </button>
          )
        }
      ]
    },
    {
      title: "Operational Intelligence",
      description: "Configure systemic notifications and real-time synchronizations.",
      icon: Bell,
      settings: [
        { 
          label: "Real-time Sync", 
          description: "Currently optimized for high-performance data oversight.",
          action: (
            <div className="flex items-center gap-3 text-emerald-400">
               <div className="w-2 h-2 rounded-full bg-emerald-400 animate-pulse" />
               <span className="text-xs font-bold uppercase tracking-widest">Active</span>
            </div>
          )
        }
      ]
    }
  ];

  return (
    <div className="space-y-8 pb-20">
      {/* Header Ritual */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-6 border-b border-indigo-600/10 pb-8">
        <div className="space-y-1">
          <h2 className={`font-body text-4xl font-bold tracking-tight uppercase transition-colors duration-700 ${
            isDark ? "text-white" : "text-charcoal"
          }`}>
            Sanctuary <span className="text-indigo-500">Settings</span>
          </h2>
          <p className={`font-body text-xs tracking-widest uppercase font-bold transition-colors duration-700 ${
            isDark ? "text-slate-500" : "text-charcoal/70"
          }`}>
            Manage your administrative environment and platform governance
          </p>
        </div>
      </div>

      <div className="grid grid-cols-1 gap-12 max-w-4xl">
        {settingsGroups.map((group, i) => (
          <motion.section 
            key={group.title}
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: i * 0.1 }}
            className={`relative overflow-hidden backdrop-blur-3xl border rounded-[3rem] p-10 transition-all duration-700 ${
              isDark ? "bg-charcoal/40 border-white/5 shadow-black/50" : "bg-white border-charcoal/10 shadow-charcoal/5"
            }`}
          >
            {/* Group Header */}
            <div className="flex flex-col md:flex-row md:items-center gap-6 mb-10 border-b pb-10 transition-colors duration-700 ${
              isDark ? 'border-white/5' : 'border-charcoal/5'
            }">
              <div className="w-16 h-16 rounded-[1.5rem] bg-indigo-500/10 flex items-center justify-center text-indigo-500 shadow-lg">
                <group.icon size={30} />
              </div>
              <div className="space-y-1">
                <h3 className={`text-2xl font-bold uppercase tracking-tight transition-colors duration-700 ${
                  isDark ? "text-white" : "text-charcoal"
                }`}>{group.title}</h3>
                <p className={`text-sm font-medium transition-colors duration-700 ${
                  isDark ? "text-white/30" : "text-charcoal/70"
                }`}>{group.description}</p>
              </div>
            </div>

            {/* Group Settings */}
            <div className="space-y-10">
              {group.settings.map((setting) => (
                <div key={setting.label} className="flex flex-col md:flex-row md:items-center justify-between gap-6 group/item">
                  <div className="space-y-1">
                    <p className={`text-xs font-bold uppercase tracking-[0.2em] transition-colors duration-700 ${
                      isDark ? "text-slate-500" : "text-charcoal/70"
                    }`}>{setting.label}</p>
                    <p className={`text-lg font-bold uppercase tracking-widest transition-colors duration-700 ${
                      isDark ? "text-white" : "text-charcoal group-hover/item:text-indigo-600"
                    }`}>{setting.description}</p>
                  </div>
                  <div className="flex-shrink-0">
                    {setting.action}
                  </div>
                </div>
              ))}
            </div>
          </motion.section>
        ))}
      </div>

      {/* System Status Footer */}
      <div className={`mt-12 p-8 border rounded-[2rem] flex items-center justify-between transition-all duration-700 ${
        isDark ? "bg-white/5 border-white/10" : "bg-charcoal/5 border-charcoal/10"
      }`}>
           <div className="flex items-center gap-4">
             <div className="w-10 h-10 rounded-full bg-gold/10 flex items-center justify-center text-gold">
               <Sparkles size={20} />
             </div>
             <div>
               <p className={`text-\[11px\] font-bold uppercase tracking-widest transition-colors ${
                 isDark ? "text-white/30" : "text-charcoal/60"
               }`}>Systemic Health</p>
               <p className={`text-xs font-bold uppercase tracking-widest transition-colors ${
                 isDark ? "text-white" : "text-charcoal"
               }`}>Optimal Performance</p>
             </div>
           </div>
        <button className="flex items-center gap-2 text-xs font-bold text-gold uppercase tracking-widest hover:underline decoration-gold/30 underline-offset-4 transition-all">
          View Detailed Logs <ExternalLink size={12} />
        </button>
      </div>
    </div>
  );
};

export default AdminSettings;
