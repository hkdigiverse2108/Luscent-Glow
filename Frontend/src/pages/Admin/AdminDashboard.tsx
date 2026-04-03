import React from "react";
import { motion } from "framer-motion";
import { 
  TrendingUp, 
  ShoppingBag, 
  Users, 
  Activity,
  ArrowUpRight,
  Sparkles
} from "lucide-react";
import { useAdminTheme } from "../../context/AdminThemeContext.tsx";

const AdminDashboard = () => {
  const { isDark } = useAdminTheme();
  const stats = [
    { label: "Total Radiance", value: "₹1,42,850", icon: TrendingUp, change: "+12.5%", color: "text-gold" },
    { label: "Ritual Orders", value: "342", icon: ShoppingBag, change: "+8.2%", color: "text-rose-light" },
    { label: "Active Seekers", value: "1,205", icon: Users, change: "+15.3%", color: "text-emerald-400" },
    { label: "Sanctuary Health", value: "99.9%", icon: Activity, change: "Optimal", color: "text-sky-400" },
  ];

  return (
    <div className="space-y-12">
      {/* Header Ritual */}
      <div className="flex items-center justify-between border-b border-indigo-600/10 pb-8">
        <div className="space-y-1">
          <h2 className={`font-body text-4xl font-bold tracking-tight uppercase transition-colors duration-700 ${
            isDark ? "text-white" : "text-charcoal"
          }`}>
            Platform <span className="text-indigo-500">Governance</span>
          </h2>
          <p className={`font-body text-xs tracking-widest uppercase font-bold transition-colors duration-700 ${
            isDark ? "text-slate-500" : "text-charcoal/70"
          }`}>
            Live Administrative Intelligence and Metadata Sync
          </p>
        </div>
        <div className={`flex items-center gap-4 text-sm font-bold uppercase tracking-widest transition-colors duration-700 ${
          isDark ? "text-white/40" : "text-charcoal/60"
        }`}>
          <span>April 03, 2026</span>
          <div className={`h-4 w-[1px] transition-colors ${
            isDark ? "bg-white/10" : "bg-charcoal/10"
          }`} />
          <div className="flex items-center gap-2 text-emerald-400">
            <span className="w-1.5 h-1.5 rounded-full bg-emerald-400 animate-pulse" />
            Live Sync
          </div>
        </div>
      </div>

      {/* Stats Ritual Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-8">
        {stats.map((stat, i) => (
          <motion.div
            key={stat.label}
            initial={{ opacity: 0, y: 30 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: i * 0.1, duration: 0.8 }}
            className={`group relative overflow-hidden backdrop-blur-3xl border rounded-[2.5rem] p-8 transition-all duration-700 ${
              isDark 
              ? "bg-charcoal/40 border-white/5 hover:border-gold/20" 
              : "bg-white border-charcoal/5 hover:border-gold/30 shadow-xl shadow-charcoal/5"
            }`}
          >
            {/* Background Glow */}
            <div className="absolute top-0 right-0 w-32 h-32 bg-gold/5 rounded-full blur-3xl opacity-0 group-hover:opacity-100 transition-opacity duration-700" />
            
            <div className="flex items-center justify-between mb-8">
              <div className={`w-12 h-12 rounded-2xl flex items-center justify-center transition-all duration-500 group-hover:scale-110 ${
                isDark ? "bg-white/5" : "bg-charcoal/5 shadow-inner"
              } ${stat.color}`}>
                <stat.icon size={22} strokeWidth={1.5} />
              </div>
              <div className="text-[10px] font-bold text-gold uppercase tracking-widest flex items-center gap-1.5 opacity-60">
                {stat.change} <ArrowUpRight size={12} />
              </div>
            </div>

            <div className="space-y-1 text-center md:text-left">
              <p className={`text-[10px] font-bold uppercase tracking-[0.3em] font-body transition-colors duration-700 ${
                isDark ? "text-slate-500" : "text-charcoal/70"
              }`}>
                {stat.label}
              </p>
              <h3 className={`font-body text-4xl font-bold transition-colors duration-500 tabular-nums ${
                isDark ? "text-white group-hover:text-indigo-500" : "text-charcoal group-hover:text-indigo-600"
              }`}>
                {stat.value}
              </h3>
            </div>
          </motion.div>
        ))}
      </div>

          <div className="space-y-4">
            <h3 className={`font-body text-3xl font-bold uppercase tracking-tight transition-colors duration-700 ${
              isDark ? "text-white" : "text-charcoal"
            }`}>
              Operational <span className="text-indigo-600">Integrity</span>
            </h3>
            <p className={`font-body text-base max-w-xl leading-relaxed transition-colors duration-700 ${
              isDark ? "text-slate-500" : "text-charcoal/70"
            }`}>
              Systemic intelligence is currently at optimal performance. All database transactions, seeker interactions, and repository synchronizations are functioning within premium industrial parameters.
            </p>
          </div>
          <div className={`p-8 border rounded-[2.5rem] flex items-center gap-6 group hover:translate-y-[-4px] shadow-2xl transition-all duration-700 ${
            isDark ? "bg-charcoal/40 border-white/5 shadow-black/50" : "bg-white border-charcoal/5 shadow-charcoal/5"
          }`}>
             <div className="w-16 h-16 rounded-full bg-gold/10 flex items-center justify-center text-gold shadow-lg group-hover:scale-110 transition-transform">
                <Sparkles size={28} />
             </div>
             <div>
                <p className={`text-[10px] font-bold uppercase tracking-widest font-body transition-colors duration-700 ${
                  isDark ? "text-white/30" : "text-charcoal/30"
                }`}>Last Database Sync</p>
                <p className={`text-lg font-bold uppercase tracking-widest transition-colors duration-700 ${
                  isDark ? "text-white" : "text-charcoal"
                }`}>Just Now</p>
             </div>
          </div>
    </div>
  );
};

export default AdminDashboard;
