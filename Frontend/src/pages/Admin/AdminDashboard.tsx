import React, { useState, useEffect } from "react";
import { Link } from "react-router-dom";
import { motion, AnimatePresence } from "framer-motion";
import {
  ShoppingBag,
  Users,
  Package,
  IndianRupee,
  TrendingUp,
  TrendingDown,
  ArrowRight,
  Loader2,
  AlertCircle,
  Calendar,
  CheckCircle2,
  Clock,
  ExternalLink,
  ShieldCheck,
  Zap,
  LayoutDashboard,
  Filter,
  Check
} from "lucide-react";
import {
  AreaChart,
  Area,
  BarChart,
  Bar,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer
} from "recharts";
import { useAdminTheme } from "../../context/AdminThemeContext.tsx";
import AdminHeader from "../../components/Admin/AdminHeader.tsx";
import { getApiUrl } from "../../lib/api";

type AnalyticsData = {
  summary: {
    totalRevenue: { value: number; change: number; trend: string };
    activeUsers: { value: number; change: number; trend: string };
    totalOrders: { value: number; change: number; trend: string };
    conversionRate: { value: number; change: number; trend: string };
  };
  revenueTrend: Array<{ name: string; revenue: number }>;
  profitExpenses: Array<{ name: string; profit: number; expenses: number }>;
  topProducts: Array<{ name: string; sales: number; growth: number }>;
  recentOrders: Array<{ customer: string; product: string; amount: number; status: string }>;
};

const AdminDashboard = () => {
  const { isDark } = useAdminTheme();
  const [data, setData] = useState<AnalyticsData | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [period, setPeriod] = useState("allTime");
  const [selectedCategory, setSelectedCategory] = useState("all");
  const [categories, setCategories] = useState<{name: string, slug: string}[]>([]);

  useEffect(() => {
    const fetchCategories = async () => {
      try {
        const res = await fetch(getApiUrl("/api/categories/"));
        if (res.ok) {
          const data = await res.json();
          setCategories(data);
        }
      } catch (err) {
        console.error("Failed to load categories", err);
      }
    };
    fetchCategories();
  }, []);

  useEffect(() => {
    const fetchAnalytics = async () => {
      try {
        setLoading(true);
        const res = await fetch(getApiUrl(`/api/analytics/dashboard?period=${period}&category=${selectedCategory}`));
        if (!res.ok) throw new Error("Data retrieval failed.");
        const json = await res.json();
        setData(json);
      } catch (err: any) {
        console.error(err);
        setError("Unable to load analytics data.");
      } finally {
        setLoading(false);
      }
    };
    fetchAnalytics();
  }, [period, selectedCategory]);

  // Professional Dynamic Colors
  const chartColors = {
    gold: isDark ? "#D4AF37" : "#B68F4C",
    text: isDark ? "rgba(255,255,255,0.4)" : "rgba(18, 18, 18, 0.4)",
    grid: isDark ? "rgba(255,255,255,0.04)" : "rgba(0,0,0,0.04)",
    emerald: isDark ? "#34D399" : "#059669",
    rose: isDark ? "#FB7185" : "#E11D48",
    bg: isDark ? "bg-charcoal/40" : "bg-white",
    border: isDark ? "border-white/5" : "border-charcoal/5",
    subtext: isDark ? "text-slate-400" : "text-charcoal/60"
  };

  const cardBase = `relative overflow-hidden group rounded-[2rem] border backdrop-blur-3xl transition-all duration-500 hover:shadow-2xl ${
    isDark 
      ? "bg-charcoal/40 border-white/5 shadow-[0_20px_50px_rgba(0,0,0,0.3)] hover:border-gold/30" 
      : "bg-white border-gold/5 shadow-[0_10px_40px_rgba(182,143,76,0.04)] hover:border-gold/20"
  }`;

  if (loading) {
    return (
      <div className="min-h-[70vh] flex flex-col items-center justify-center gap-6">
        <Loader2 size={40} className="animate-spin text-gold opacity-30" />
        <p className="text-[10px] font-black uppercase tracking-[0.4em] text-gold/60">Loading statistics...</p>
      </div>
    );
  }

  if (error || !data) {
    return (
      <div className="min-h-[60vh] flex flex-col items-center justify-center p-8 text-center animate-in fade-in zoom-in duration-700">
        <AlertCircle size={48} className="text-rose-500/50 mb-6" />
        <h3 className="text-2xl font-display font-bold mb-2">Connection Error</h3>
        <p className={`text-sm mb-8 ${chartColors.subtext}`}>{error}</p>
        <button onClick={() => window.location.reload()} className="px-8 py-3 bg-gold text-white rounded-xl text-[10px] font-black uppercase tracking-widest shadow-lg shadow-gold/20 hover:scale-105 transition-all">Reload Data</button>
      </div>
    );
  }

  const kpis = [
    { label: "Total Revenue", value: `₹${data.summary.totalRevenue.value.toLocaleString('en-IN')}`, trendValue: data.summary.totalRevenue.change, trend: data.summary.totalRevenue.trend, icon: IndianRupee, color: "text-gold", bg: "bg-gold/10" },
    { label: "Accounts", value: data.summary.activeUsers.value.toLocaleString(), trendValue: data.summary.activeUsers.change, trend: data.summary.activeUsers.trend, icon: Users, color: "text-blue-500", bg: "bg-blue-500/10" },
    { label: "Orders", value: data.summary.totalOrders.value.toLocaleString(), trendValue: data.summary.totalOrders.change, trend: data.summary.totalOrders.trend, icon: ShoppingBag, color: "text-violet-500", bg: "bg-violet-500/10" }
  ];

  return (
    <div className="space-y-12 pb-20 animate-in fade-in duration-1000">
      <div className="py-2">
        <AdminHeader
          title="Admin"
          highlightedWord="Dashboard"
          subtitle="Real-time store performance and analytics overview."
          isDark={isDark}
        >
           {/* Desktop Selectors */}
           <div className="hidden lg:flex items-center gap-4">
              <div className={`p-1 flex items-center gap-1 rounded-2xl border ${isDark ? "bg-white/5 border-white/5" : "bg-charcoal/5 border-charcoal/5"}`}>
                 {[
                   { id: "today", label: "Today" },
                   { id: "yesterday", label: "Yesterday" },
                   { id: "last7d", label: "7 Days" },
                   { id: "last30d", label: "30 Days" },
                   { id: "allTime", label: "All Time" }
                 ].map((p) => (
                   <button
                     key={p.id}
                     onClick={() => setPeriod(p.id)}
                     className={`px-6 py-2.5 rounded-xl text-[9px] font-black uppercase tracking-widest transition-all duration-500 ${
                       period === p.id 
                         ? "bg-gold text-charcoal shadow-lg" 
                         : isDark ? "text-white/30 hover:text-white" : "text-charcoal/40 hover:text-gold"
                     }`}
                   >
                     {p.label}
                   </button>
                 ))}
              </div>

              <div className="relative group">
                 <Filter size={14} className={`absolute left-4 top-1/2 -translate-y-1/2 ${isDark ? "text-white/20" : "text-charcoal/30"}`} />
                 <select 
                    value={selectedCategory}
                    onChange={(e) => setSelectedCategory(e.target.value)}
                    className={`pl-10 pr-10 py-3.5 rounded-2xl text-[10px] font-bold uppercase tracking-widest border transition-all appearance-none cursor-pointer focus:outline-none focus:ring-1 focus:ring-gold/30 ${
                      isDark ? "bg-white/5 border-white/10 text-white hover:bg-white/10" : "bg-white border-charcoal/10 text-charcoal hover:bg-charcoal/5 shadow-sm"
                    }`}
                 >
                    <option value="all">All Categories</option>
                    {categories.map(cat => (
                      <option key={cat.slug} value={cat.slug}>{cat.name}</option>
                    ))}
                 </select>
              </div>
           </div>

           {/* Mobile Filter Trigger */}
           <div className="lg:hidden flex items-center gap-2">
              <select 
                value={period}
                onChange={(e) => setPeriod(e.target.value)}
                className={`px-4 py-3 rounded-2xl text-[9px] font-bold uppercase tracking-widest border focus:outline-none ${isDark ? "bg-charcoal border-white/10 text-white" : "bg-white border-charcoal/10 text-charcoal"}`}
              >
                <option value="today">Today</option>
                <option value="yesterday">Yesterday</option>
                <option value="last7d">7 Days</option>
                <option value="last30d">30 Days</option>
                <option value="allTime">All Time</option>
              </select>

              <select 
                value={selectedCategory}
                onChange={(e) => setSelectedCategory(e.target.value)}
                className={`px-4 py-3 rounded-2xl text-[9px] font-bold uppercase tracking-widest border focus:outline-none ${isDark ? "bg-charcoal border-white/10 text-white" : "bg-white border-charcoal/10 text-charcoal"}`}
              >
                <option value="all">All Cats</option>
                {categories.map(cat => (
                  <option key={cat.slug} value={cat.slug}>{cat.name}</option>
                ))}
              </select>
           </div>
        </AdminHeader>
      </div>


      {/* ── KPI Summary Cards ──────────────────────────────────────────────── */}
      <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-8">
        {kpis.map((kpi, idx) => (
          <motion.div
            key={kpi.label}
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: idx * 0.1, duration: 0.8, ease: "easeOut" }}
            className={cardBase}
          >
            <div className="p-8">
              <div className="flex items-center justify-between mb-8">
                <div className={`w-14 h-14 rounded-2xl ${kpi.bg} ${kpi.color} flex items-center justify-center shadow-lg transition-transform group-hover:scale-110 duration-500`}>
                  <kpi.icon size={26} strokeWidth={1.5} />
                </div>
                <div className={`flex items-center gap-1 px-3 py-1.5 rounded-full text-[10px] font-black uppercase tracking-widest ${kpi.trend === 'up' ? 'text-emerald-500 bg-emerald-500/5 border border-emerald-500/10' : 'text-rose-500 bg-rose-500/5 border border-rose-500/10'}`}>
                  {kpi.trend === 'up' ? <TrendingUp size={12} strokeWidth={3} /> : <TrendingDown size={12} strokeWidth={3} />}
                  {Math.abs(kpi.trendValue)}%
                </div>
              </div>
              
              <h4 className={`text-[10px] font-black uppercase tracking-[0.4em] mb-1.5 opacity-50`}>
                {kpi.label}
              </h4>
              <p className={`text-4xl font-display font-bold tabular-nums tracking-tight ${isDark ? "text-white" : "text-charcoal"}`}>
                {kpi.value}
              </p>
              
              <div className="mt-8 pt-6 border-t border-white/5 flex items-center justify-between">
                <p className="text-[9px] font-black uppercase tracking-[0.2em] opacity-30">Data Updated</p>
                <div className="w-1.5 h-1.5 rounded-full bg-emerald-500 shadow-[0_0_8px_rgba(16,185,129,0.5)]"></div>
              </div>
            </div>
          </motion.div>
        ))}
      </div>

      {/* ── Main Performance Analytics ────────────────────────────────────────── */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        {/* Revenue Area Chart */}
        <motion.div
          initial={{ opacity: 0, x: -20 }}
          animate={{ opacity: 1, x: 0 }}
          transition={{ delay: 0.4, duration: 0.8 }}
          className={`lg:col-span-2 ${cardBase}`}
        >
          <div className="p-10">
            <div className="flex items-center justify-between mb-12">
              <div>
                <h3 className="text-3xl font-display font-bold mb-1">Revenue Overview</h3>
                <p className={`text-[10px] font-black uppercase tracking-[0.4em] opacity-40`}>Revenue trends over time</p>
              </div>
              <LayoutDashboard size={20} className="text-gold opacity-20" />
            </div>
            
            <div className="h-[400px] w-full">
              <ResponsiveContainer width="100%" height="100%">
                <AreaChart data={data.revenueTrend} margin={{ top: 10, right: 10, left: 0, bottom: 0 }}>
                  <defs>
                    <linearGradient id="revenueGradient" x1="0" y1="0" x2="0" y2="1">
                      <stop offset="5%" stopColor={chartColors.gold} stopOpacity={0.25}/>
                      <stop offset="95%" stopColor={chartColors.gold} stopOpacity={0}/>
                    </linearGradient>
                  </defs>
                  <CartesianGrid strokeDasharray="6 6" vertical={false} stroke={chartColors.grid} />
                  <XAxis 
                    dataKey="name" 
                    axisLine={false} 
                    tickLine={false} 
                    tick={{ fill: chartColors.text, fontSize: 11, fontWeight: '800', letterSpacing: '0.1em' }} 
                    dy={20}
                  />
                  <YAxis 
                    axisLine={false} 
                    tickLine={false} 
                    tick={{ fill: chartColors.text, fontSize: 11, fontWeight: '800' }}
                    tickFormatter={(v) => v >= 1000 ? `₹${v/1000}k` : `₹${v}`}
                  />
                  <Tooltip 
                    contentStyle={{ 
                      backgroundColor: isDark ? '#141414' : '#fff', 
                      borderRadius: '1.5rem', 
                      border: `1px solid ${isDark ? 'rgba(255,255,255,0.1)' : 'rgba(0,0,0,0.05)'}`,
                      boxShadow: '0 20px 40px rgba(0,0,0,0.1)',
                      fontFamily: 'Outfit',
                      fontSize: '11px',
                      fontWeight: '700',
                      textTransform: 'uppercase'
                    }}
                    cursor={{ stroke: chartColors.gold, strokeWidth: 1, strokeDasharray: '4 4' }}
                  />
                  <Area 
                    type="monotone" 
                    dataKey="revenue" 
                    stroke={chartColors.gold} 
                    strokeWidth={4}
                    fillOpacity={1} 
                    fill="url(#revenueGradient)" 
                    animationDuration={2000}
                    activeDot={{ r: 6, strokeWidth: 0, fill: chartColors.gold }}
                  />
                </AreaChart>
              </ResponsiveContainer>
            </div>
          </div>
        </motion.div>

        {/* Profit vs Expenses BarChart */}
        <motion.div
           initial={{ opacity: 0, x: 20 }}
           animate={{ opacity: 1, x: 0 }}
           transition={{ delay: 0.5, duration: 0.8 }}
           className={cardBase}
        >
          <div className="p-10 flex flex-col h-full">
            <div className="mb-12">
               <h3 className="text-3xl font-display font-bold mb-1">Profit & Expenses</h3>
               <p className={`text-[10px] font-black uppercase tracking-[0.4em] opacity-40`}>Financial balance overview</p>
            </div>
            
            <div className="flex-1 min-h-[380px]">
              <ResponsiveContainer width="100%" height="100%">
                <BarChart data={data.profitExpenses} margin={{ top: 0, right: 0, left: 0, bottom: 0 }} barGap={10}>
                  <CartesianGrid strokeDasharray="3 3" vertical={false} stroke={chartColors.grid} />
                  <XAxis 
                    dataKey="name" 
                    axisLine={false} 
                    tickLine={false} 
                    tick={{ fill: chartColors.text, fontSize: 11, fontWeight: '800' }}
                    dy={20}
                  />
                  <Tooltip 
                    cursor={{ fill: 'rgba(182, 143, 76, 0.05)' }} 
                    contentStyle={{ borderRadius: '1.2rem', border: 'none', fontSize: '11px' }} 
                  />
                  <Bar dataKey="profit" fill={chartColors.gold} radius={[8, 8, 0, 0]} barSize={22} animationDuration={1500} />
                  <Bar dataKey="expenses" fill={isDark ? "rgba(255,255,255,0.08)" : "rgba(0,0,0,0.08)"} radius={[8, 8, 0, 0]} barSize={22} animationDuration={2000} />
                </BarChart>
              </ResponsiveContainer>
            </div>

            <div className="mt-10 p-6 rounded-2xl bg-secondary/20 border border-white/5 flex items-center justify-between">
               <div className="flex items-center gap-6">
                  <div className="flex items-center gap-2">
                     <div className="w-2.5 h-2.5 rounded-full bg-gold"></div>
                     <span className="text-[9px] font-black uppercase tracking-widest opacity-60">Profit</span>
                  </div>
                  <div className="flex items-center gap-2">
                     <div className={`w-2.5 h-2.5 rounded-full ${isDark ? "bg-white/10" : "bg-charcoal/10"}`}></div>
                     <span className="text-[9px] font-black uppercase tracking-widest opacity-60">Expenses</span>
                  </div>
               </div>
               <ShieldCheck size={16} className="text-gold opacity-30" />
            </div>
          </div>
        </motion.div>
      </div>

      {/* ── Transactional Lists ──────────────────────────────────────────────── */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-8 mt-4">
        {/* Recent Orders Table List */}
        <motion.div
           initial={{ opacity: 0, y: 30 }}
           animate={{ opacity: 1, y: 0 }}
           transition={{ delay: 0.6, duration: 1 }}
           className={cardBase}
        >
          <div className="p-10">
            <div className="flex items-center justify-between mb-10">
               <div>
                  <h3 className="text-2xl font-display font-bold mb-1">Recent Transactions</h3>
                  <p className="text-[10px] font-black text-gold uppercase tracking-[0.4em]">Latest store activity</p>
               </div>
               <Link to="/admin/orders" className="p-3 rounded-2xl bg-gold/5 text-gold hover:bg-gold hover:text-white transition-all duration-500 shadow-sm">
                  <ExternalLink size={18} />
               </Link>
            </div>
            
            <div className="space-y-4">
               {data.recentOrders.map((order, i) => (
                  <div key={i} className={`flex items-center justify-between p-5 rounded-[1.5rem] border transition-all hover:bg-gold/5 ${isDark ? "bg-white/5 border-white/5" : "bg-charcoal/5 border-charcoal/5"}`}>
                     <div className="flex items-center gap-5">
                        <div className={`w-12 h-12 rounded-2xl flex items-center justify-center font-display font-bold text-xl shadow-md ${isDark ? "bg-gold/20 text-gold border border-gold/10" : "bg-gold text-white"}`}>
                           {order.customer.charAt(0).toUpperCase()}
                        </div>
                        <div>
                           <p className={`text-sm font-bold tracking-tight ${isDark ? "text-white" : "text-charcoal"}`}>{order.customer}</p>
                           <p className={`text-[10px] font-black uppercase tracking-widest opacity-40`}>{order.product}</p>
                        </div>
                     </div>
                     <div className="text-right">
                        <p className={`text-base font-display font-bold mb-1 ${isDark ? "text-white" : "text-charcoal"}`}>₹{order.amount.toLocaleString()}</p>
                        <span className={`px-3 py-1 rounded-lg text-[9px] font-black uppercase tracking-widest border transition-colors ${
                           order.status === 'Delivered' 
                            ? 'bg-emerald-500/10 text-emerald-500 border-emerald-500/20' 
                            : 'bg-amber-500/10 text-amber-500 border-amber-500/20'
                        }`}>
                           {order.status}
                        </span>
                     </div>
                  </div>
               ))}
            </div>
          </div>
        </motion.div>

        {/* Top Products Rankings */}
        <motion.div
           initial={{ opacity: 0, y: 30 }}
           animate={{ opacity: 1, y: 0 }}
           transition={{ delay: 0.7, duration: 1 }}
           className={cardBase}
        >
          <div className="p-10">
            <div className="flex items-center justify-between mb-10">
               <div>
                  <h3 className="text-2xl font-display font-bold mb-1">Top Products</h3>
                  <p className="text-[10px] font-black text-gold uppercase tracking-[0.4em]">Best performing products</p>
               </div>
               <Zap size={20} className="text-gold opacity-30" />
            </div>

            <div className="space-y-8">
               {data.topProducts.map((product, i) => (
                  <div key={i} className="group/product">
                     <div className="flex items-center justify-between mb-3">
                        <div className="flex items-center gap-3">
                           <span className="text-[10px] font-black text-gold/30">0{i+1}</span>
                           <p className={`text-[11px] font-black uppercase tracking-[0.15em] ${isDark ? "text-white/80" : "text-charcoal/80"}`}>{product.name}</p>
                        </div>
                        <div className="flex items-center gap-3">
                           <span className="text-sm font-display font-bold tabular-nums text-gold">{product.sales} Sales</span>
                           <span className="text-[9px] font-black text-emerald-500 tracking-widest">+{product.growth}%</span>
                        </div>
                     </div>
                     <div className={`w-full h-2 rounded-full overflow-hidden ${isDark ? "bg-white/5" : "bg-charcoal/5 shadow-inner"}`}>
                        <motion.div 
                          initial={{ width: 0 }}
                          animate={{ width: `${(product.sales / data.topProducts[0].sales) * 100}%` }}
                          transition={{ delay: 1.2 + i * 0.1, duration: 1.5, ease: "easeOut" }}
                          className="h-full bg-gradient-to-r from-gold/40 to-gold rounded-full shadow-[0_0_10px_rgba(182,143,76,0.3)]"
                        />
                     </div>
                  </div>
               ))}
            </div>

            <div className="mt-14 p-8 rounded-[2rem] bg-gold/5 border border-gold/10 relative overflow-hidden group/cta">
               <div className="relative z-10 flex items-center justify-between">
                  <div>
                    <h5 className="text-[10px] font-black uppercase tracking-[0.4em] text-gold mb-1">Product Insights</h5>
                    <p className={`text-xs font-semibold max-w-[220px] leading-relaxed opacity-60`}>Your trending products are showing high conversion across premium customer segments.</p>
                  </div>
                  <Link to="/admin/products" className="w-12 h-12 rounded-full bg-gold text-white flex items-center justify-center transform group-hover/cta:scale-110 transition-all duration-500 shadow-lg shadow-gold/20">
                     <ArrowRight size={20} />
                  </Link>
               </div>
               <IndianRupee size={150} className="absolute -right-16 -bottom-16 text-gold/5 transform rotate-[-15deg] group-hover/cta:rotate-0 transition-transform duration-1000" />
            </div>
          </div>
        </motion.div>
      </div>

      {/* ── Quick Global Navigation ─────────────────────────────────────────── */}
      <motion.div
        initial={{ opacity: 0, y: 10 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 1 }}
        className="grid grid-cols-2 md:grid-cols-4 gap-6"
      >
        {[
          { label: "Orders", icon: ShoppingBag, href: "/admin/orders" },
          { label: "Users", icon: Users, href: "/admin/users" },
          { label: "Products", icon: Package, href: "/admin/products" },
          { label: "Settings", icon: ShieldCheck, href: "/admin/settings" }
        ].map((item, i) => (
          <Link 
             key={i} 
             to={item.href} 
             className={`flex flex-col items-center gap-4 p-6 rounded-[2rem] border transition-all hover:-translate-y-1.5 ${
               isDark ? "bg-white/4 border-white/5 hover:border-gold/20 hover:bg-gold/5" : "bg-white border-gold/10 hover:shadow-2xl hover:border-gold/30"
             }`}
          >
             <div className="w-12 h-12 rounded-xl bg-gold/10 text-gold flex items-center justify-center">
               <item.icon size={20} />
             </div>
             <span className={`text-[10px] font-black uppercase tracking-[0.3em] opacity-40 group-hover:opacity-100`}>{item.label}</span>
          </Link>
        ))}
      </motion.div>
    </div>
  );
};

export default AdminDashboard;
