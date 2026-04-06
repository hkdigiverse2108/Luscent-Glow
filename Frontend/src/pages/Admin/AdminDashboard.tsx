import React from "react";
import { motion } from "framer-motion";
import { 
  TrendingUp, 
  ShoppingBag, 
  Users, 
  Activity,
  ArrowUpRight,
  Sparkles,
  MessageSquare
} from "lucide-react";
import { useAdminTheme } from "../../context/AdminThemeContext.tsx";

const AdminDashboard = () => {
  const { isDark } = useAdminTheme();
  const stats = [
    { label: "Total Radiance", value: "₹1,42,850", icon: TrendingUp, change: "+12.5%", color: "text-gold" },
    { label: "Ritual Orders", value: "342", icon: ShoppingBag, change: "+8.2%", color: "text-rose-light" },
    { label: "Active Seekers", value: "1,205", icon: Users, change: "+15.3%", color: "text-emerald-400" },
    { label: "Pending Rituals", value: "24", icon: MessageSquare, change: "Inquiries", color: "text-indigo-400" },
    { label: "Sanctuary Health", value: "99.9%", icon: Activity, change: "Optimal", color: "text-sky-400" },
  ];

  return (
    <div className="space-y-4">
      {/* Header Ritual */}
      <div className="flex items-center justify-between border-b border-indigo-600/10 pb-2">
        <div className="space-y-1">
          <h2 className={`font-body text-4xl font-bold tracking-tight uppercase transition-colors duration-700 ${
            isDark ? "text-white" : "text-charcoal"
          }`}>
            Platform <span className="text-indigo-500">Governance</span>
          </h2>
          <p className={`font-body text-[13px] tracking-widest uppercase font-bold transition-colors duration-700 ${
            isDark ? "text-slate-400" : "text-charcoal/70"
          }`}>
            Live Administrative Intelligence and Metadata Sync
          </p>
        </div>
        <div className={`flex items-center gap-6 text-[14px] font-extrabold uppercase tracking-widest transition-colors duration-700 ${
          isDark ? "text-white/80" : "text-charcoal"
        }`}>
          <span>April 03, 2026</span>
          <div className={`h-5 w-[1.5px] transition-colors ${
            isDark ? "bg-white/30" : "bg-charcoal/30"
          }`} />
          <div className="flex items-center gap-2.5 text-emerald-500">
            <span className="w-2 h-2 rounded-full bg-emerald-500 animate-pulse" />
            Live Database Sync
          </div>
        </div>
      </div>

      {/* Stats Ritual Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-3">
        {stats.map((stat, i) => (
          <motion.div
            key={stat.label}
            initial={{ opacity: 0, y: 30 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: i * 0.1, duration: 0.8 }}
            className={`group relative overflow-hidden backdrop-blur-3xl border rounded-3xl p-4 transition-all duration-700 ${
              isDark 
              ? "bg-charcoal/40 border-white/5 hover:border-gold/20" 
              : "bg-white border-charcoal/5 hover:border-gold/30 shadow-xl shadow-charcoal/5"
            }`}
          >
            {/* Background Glow */}
            <div className="absolute top-0 right-0 w-32 h-32 bg-gold/5 rounded-full blur-3xl opacity-0 group-hover:opacity-100 transition-opacity duration-700" />
            
            <div className="flex items-center justify-between mb-2">
              <div className={`w-12 h-12 rounded-2xl flex items-center justify-center transition-all duration-500 group-hover:scale-110 ${
                isDark ? "bg-white/5" : "bg-charcoal/5 shadow-inner"
              } ${stat.color}`}>
                <stat.icon size={22} strokeWidth={1.5} />
              </div>
              <div className="text-[12px] font-extrabold text-gold uppercase tracking-widest flex items-center gap-2">
                {stat.change} <ArrowUpRight size={14} />
              </div>
            </div>

            <div className="space-y-1 text-center md:text-left">
              <p className={`text-[13px] font-extrabold uppercase tracking-[0.3em] font-body transition-colors duration-700 ${
                isDark ? "text-slate-300" : "text-charcoal"
              }`}>
                {stat.label}
              </p>
              <h3 className={`font-body text-2xl font-bold transition-colors duration-500 tabular-nums ${
                isDark ? "text-white group-hover:text-indigo-500" : "text-charcoal group-hover:text-indigo-600"
              }`}>
                {stat.value}
              </h3>
            </div>
          </motion.div>
        ))}
      </div>

          <div className="space-y-4">
            <h3 className={`font-body text-xl font-bold uppercase tracking-tight transition-colors duration-700 ${
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
          <div className={`p-4 border rounded-3xl flex items-center gap-4 group hover:translate-y-[-4px] shadow-2xl transition-all duration-700 ${
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
