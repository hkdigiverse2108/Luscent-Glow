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
            className={`relative overflow-hidden backdrop-blur-3xl border rounded-[3rem] p-12 transition-all duration-700 ${
              isDark ? "bg-charcoal/40 border-white/12 shadow-black/50" : "bg-white border-charcoal/12 shadow-charcoal/15"
            }`}
          >
            {/* Group Header */}
            <div className={`flex flex-col md:flex-row md:items-center gap-8 mb-12 border-b pb-12 transition-colors duration-700 ${
              isDark ? 'border-white/12' : 'border-charcoal/12'
            }`}>
              <div className="w-20 h-20 rounded-[2.2rem] bg-indigo-500/10 flex items-center justify-center text-indigo-500 shadow-2xl">
                <group.icon size={40} />
              </div>
              <div className="space-y-2">
                <h3 className={`text-4xl font-extrabold uppercase tracking-tight transition-colors duration-700 ${
                  isDark ? "text-white" : "text-charcoal"
                }`}>{group.title}</h3>
                <p className={`text-lg font-extrabold transition-colors duration-700 ${
                  isDark ? "text-white/60" : "text-charcoal/80"
                }`}>{group.description}</p>
              </div>
            </div>

            {/* Group Settings */}
            <div className="space-y-12">
              {group.settings.map((setting) => (
                <div key={setting.label} className="flex flex-col md:flex-row md:items-center justify-between gap-8 group/item">
                  <div className="space-y-2">
                    <p className={`text-[14px] font-extrabold uppercase tracking-[0.25em] transition-colors duration-700 ${
                      isDark ? "text-slate-300" : "text-indigo-600"
                    }`}>{setting.label}</p>
                    <p className={`text-2xl font-extrabold uppercase tracking-widest transition-colors duration-700 ${
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
      <div className={`mt-20 p-12 border rounded-[4rem] flex items-center justify-between transition-all duration-700 ${
        isDark ? "bg-white/5 border-white/12 shadow-black/50" : "bg-charcoal/5 border-charcoal/12 shadow-charcoal/10"
      }`}>
           <div className="flex items-center gap-8">
             <div className="w-16 h-16 rounded-full bg-gold/10 flex items-center justify-center text-gold shadow-2xl">
               <Sparkles size={32} />
             </div>
             <div>
               <p className={`text-[14px] font-extrabold uppercase tracking-[0.3em] transition-colors ${
                 isDark ? "text-white/50" : "text-charcoal/60"
               }`}>Systemic Health Assessment</p>
               <p className={`text-2xl font-extrabold uppercase tracking-[0.1em] transition-colors ${
                 isDark ? "text-white" : "text-charcoal"
               }`}>Optimal Industrial Performance</p>
             </div>
           </div>
        <button className="flex items-center gap-4 text-base font-extrabold text-gold uppercase tracking-[0.2em] hover:underline decoration-gold/40 underline-offset-8 transition-all">
          View Detailed Logs Archive <ExternalLink size={20} />
        </button>
      </div>
    </div>
  );
};

export default AdminSettings;
