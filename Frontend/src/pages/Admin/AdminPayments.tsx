import React, { useState, useEffect } from "react";
import { Link } from "react-router-dom";
import { motion, AnimatePresence } from "framer-motion";
import { 
  Search, 
  Filter, 
  CreditCard,
  ExternalLink,
  RefreshCcw,
  CheckCircle2,
  AlertCircle,
  Clock,
  ArrowRight,
  Calendar,
  Layers,
  HandCoins
} from "lucide-react";
import { getApiUrl } from "@/lib/api";
import { toast } from "sonner";
import { useAdminTheme } from "../../context/AdminThemeContext.tsx";
import AdminHeader from "../../components/Admin/AdminHeader.tsx";
import { format } from "date-fns";

const AdminPayments = () => {
  const { isDark } = useAdminTheme();
  const [payments, setPayments] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchQuery, setSearchQuery] = useState("");
  const [statusFilter, setStatusFilter] = useState("all");

  const fetchPayments = async () => {
    setLoading(true);
    try {
      const response = await fetch(getApiUrl("/api/payments/"));
      if (response.ok) {
        const data = await response.json();
        setPayments(data);
      } else {
        toast.error("Failed to load the financial records.");
      }
    } catch (error) {
      toast.error("Database connection failure.");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchPayments();
  }, []);

  const getStatusConfig = (status: string) => {
    const s = status.toUpperCase();
    switch (s) {
      case "SUCCESS":
        return {
          label: "Success",
          icon: CheckCircle2,
          color: isDark ? "text-emerald-400 bg-emerald-400/10 border-emerald-400/20" : "text-emerald-600 bg-emerald-50 border-emerald-100"
        };
      case "FAILED":
        return {
          label: "Failed",
          icon: AlertCircle,
          color: isDark ? "text-rose-400 bg-rose-400/10 border-rose-400/20" : "text-rose-600 bg-rose-50 border-rose-100"
        };
      case "INITIATED":
        return {
          label: "Initiated",
          icon: Clock,
          color: isDark ? "text-amber-400 bg-amber-400/10 border-amber-400/20" : "text-amber-600 bg-amber-50 border-amber-100"
        };
      default:
        return {
          label: status,
          icon: Layers,
          color: isDark ? "text-white/40 bg-white/5 border-white/10" : "text-charcoal/40 bg-charcoal/5 border-charcoal/10"
        };
    }
  };

  const filteredPayments = payments.filter(p => {
    const matchesSearch = 
      (p.orderNumber || "").toLowerCase().includes(searchQuery.toLowerCase()) ||
      (p.merchantTransactionId || "").toLowerCase().includes(searchQuery.toLowerCase()) ||
      (p.userMobile || "").toLowerCase().includes(searchQuery.toLowerCase()) ||
      (p.providerReferenceId || "").toLowerCase().includes(searchQuery.toLowerCase());
    
    if (statusFilter === "all") return matchesSearch;
    return matchesSearch && p.status === statusFilter.toUpperCase();
  });

  const cardClass = isDark 
    ? "bg-charcoal/30 backdrop-blur-3xl border border-white/5 shadow-[0_20px_50px_rgba(0,0,0,0.3)]" 
    : "bg-white border border-gold/10 shadow-[0_15px_40px_rgba(0,0,0,0.04)]";

  return (
    <div className="space-y-8 pb-12 animate-in fade-in duration-700">
      <AdminHeader 
        title="Payment History" 
        subtitle="Live transactional audit of all platform commerce."
        icon={CreditCard}
      />

      <div className="grid grid-cols-1 lg:grid-cols-4 gap-6">
        {/* Filters Panel */}
        <div className={`lg:col-span-1 p-6 rounded-3xl ${cardClass} h-fit space-y-8`}>
          <div className="space-y-4">
            <h4 className={`text-[10px] font-black uppercase tracking-[0.3em] ${isDark ? "text-white/30" : "text-charcoal/40"}`}>
              Search Transactions
            </h4>
            <div className="relative">
              <Search className="absolute left-4 top-1/2 -translate-y-1/2 text-gold" size={16} />
              <input
                type="text"
                placeholder="Order # or TXN ID..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className={`w-full bg-transparent border rounded-2xl py-3 pl-11 pr-4 text-xs font-semibold focus:outline-none focus:border-gold/50 transition-all ${
                  isDark ? "border-white/5 text-white placeholder:text-white/20" : "border-charcoal/10 text-charcoal placeholder:text-charcoal/30"
                }`}
              />
            </div>
          </div>

          <div className="space-y-4">
            <h4 className={`text-[10px] font-black uppercase tracking-[0.3em] ${isDark ? "text-white/30" : "text-charcoal/40"}`}>
              Payment Status
            </h4>
            <div className="flex flex-col gap-2">
              {["all", "success", "initiated", "failed"].map((s) => (
                <button
                  key={s}
                  onClick={() => setStatusFilter(s)}
                  className={`flex items-center justify-between px-4 py-3 rounded-xl text-[10px] font-black uppercase tracking-widest transition-all ${
                    statusFilter === s
                      ? "bg-gold/10 text-gold border border-gold/20"
                      : isDark ? "text-white/30 hover:bg-white/5 border border-transparent" : "text-charcoal/40 hover:bg-charcoal/5 border border-transparent"
                  }`}
                >
                  {s}
                  {statusFilter === s && <ArrowRight size={12} />}
                </button>
              ))}
            </div>
          </div>

          <button
            onClick={fetchPayments}
            className={`w-full flex items-center justify-center gap-2 py-4 rounded-xl text-[10px] font-black uppercase tracking-widest border transition-all ${
              isDark ? "border-white/5 text-white/40 hover:bg-white/5" : "border-charcoal/10 text-charcoal/40 hover:bg-charcoal/5"
            }`}
          >
            <RefreshCcw size={14} className={loading ? "animate-spin" : ""} />
            Re-Sync Records
          </button>
        </div>

        {/* Transaction Table */}
        <div className={`lg:col-span-3 rounded-3xl overflow-hidden ${cardClass}`}>
          <div className="overflow-x-auto">
            <table className="w-full text-left border-collapse">
              <thead>
                <tr className={isDark ? "bg-white/2" : "bg-charcoal/2"}>
                  <th className={`px-4 py-5 text-[9px] font-black uppercase tracking-widest ${isDark ? "text-white/30" : "text-charcoal/40"}`}>Order #</th>
                  <th className={`px-4 py-5 text-[9px] font-black uppercase tracking-widest ${isDark ? "text-white/30" : "text-charcoal/40"}`}>Customer</th>
                  <th className={`px-4 py-5 text-[9px] font-black uppercase tracking-widest ${isDark ? "text-white/30" : "text-charcoal/40"}`}>TXN ID</th>
                  <th className={`px-4 py-5 text-[9px] font-black uppercase tracking-widest ${isDark ? "text-white/30" : "text-charcoal/40"}`}>Platform</th>
                  <th className={`px-4 py-5 text-[9px] font-black uppercase tracking-widest ${isDark ? "text-white/30" : "text-charcoal/40"}`}>Ref ID</th>
                  <th className={`px-4 py-5 text-[9px] font-black uppercase tracking-widest ${isDark ? "text-white/30" : "text-charcoal/40"}`}>Method</th>
                  <th className={`px-4 py-5 text-[9px] font-black uppercase tracking-widest ${isDark ? "text-white/30" : "text-charcoal/40"}`}>Amount</th>
                  <th className={`px-4 py-5 text-[9px] font-black uppercase tracking-widest ${isDark ? "text-white/30" : "text-charcoal/40"}`}>Status</th>
                  <th className={`px-4 py-5 text-[9px] font-black uppercase tracking-widest ${isDark ? "text-white/30" : "text-charcoal/40"}`}>Date</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-gold/5">
                {loading ? (
                  <tr>
                    <td colSpan={5} className="py-20 text-center">
                      <RefreshCcw size={24} className="animate-spin text-gold mx-auto mb-3" />
                      <p className={`text-xs font-bold uppercase tracking-widest ${isDark ? "text-white/20" : "text-charcoal/20"}`}>Loading Records...</p>
                    </td>
                  </tr>
                ) : filteredPayments.length === 0 ? (
                  <tr>
                    <td colSpan={9} className="py-20 text-center">
                      <AlertCircle size={24} className="text-gold mx-auto mb-3 opacity-20" />
                      <p className={`text-xs font-bold uppercase tracking-widest ${isDark ? "text-white/20" : "text-charcoal/20"}`}>No matching records found.</p>
                    </td>
                  </tr>
                ) : (
                  filteredPayments.map((p, idx) => {
                    const statusCfg = getStatusConfig(p.status || "UNKNOWN");
                    return (
                      <motion.tr
                        initial={{ opacity: 0, y: 10 }}
                        animate={{ opacity: 1, y: 0 }}
                        transition={{ delay: idx * 0.05 }}
                        key={p.id || p._id}
                        className={`group hover:bg-gold/5 transition-all cursor-default`}
                      >
                        <td className="px-4 py-6 border-transparent relative">
                          <Link to="/admin/orders" className="text-[12px] font-bold transition-colors hover:text-gold block">
                            {p.orderNumber || "LG-UNKNOWN"}
                          </Link>
                          <div className="absolute left-0 top-1/2 -translate-y-1/2 w-1 h-8 bg-gold rounded-r-full scale-y-0 group-hover:scale-y-100 transition-transform" />
                        </td>
                        <td className="px-4 py-6 border-transparent">
                          <span className={`text-[11px] font-black tracking-widest ${isDark ? "text-white/80" : "text-charcoal/80"}`}>
                            {p.userMobile || "GUEST"}
                          </span>
                        </td>
                        <td className="px-4 py-6 border-transparent">
                          <span className={`text-[9px] font-mono opacity-60`}>
                            {p.merchantTransactionId}
                          </span>
                        </td>
                        <td className="px-4 py-6 border-transparent">
                          <span className={`px-2 py-1 rounded-lg border text-[8px] font-black uppercase tracking-widest ${
                            isDark ? "bg-white/5 border-white/10 text-white/50" : "bg-charcoal/5 border-charcoal/10 text-charcoal/50"
                          }`}>
                            {p.merchantId || "Manual"}
                          </span>
                        </td>
                        <td className="px-4 py-6 border-transparent">
                          <span className={`text-[9px] font-mono opacity-60 truncate max-w-[100px] block`}>
                            {p.providerReferenceId || "—"}
                          </span>
                        </td>
                        <td className="px-4 py-6 border-transparent">
                          <span className={`text-[9px] font-black uppercase tracking-widest opacity-60`}>
                            {p.paymentMode || "—"}
                          </span>
                        </td>
                        <td className="px-4 py-6 border-transparent">
                          <span className={`text-sm font-black ${isDark ? "text-white" : "text-charcoal"}`}>
                            ₹{Number(p.amount).toLocaleString('en-IN')}
                          </span>
                        </td>
                        <td className="px-4 py-6 border-transparent">
                          <span className={`px-2 py-1 rounded-xl border inline-flex items-center gap-1.5 text-[8px] font-black uppercase tracking-widest ${statusCfg.color}`}>
                            <statusCfg.icon size={10} strokeWidth={3} />
                            {statusCfg.label}
                          </span>
                        </td>
                        <td className="px-4 py-6 border-transparent">
                          <div className="flex flex-col gap-0.5 opacity-40">
                            <span className="text-[10px] font-bold whitespace-nowrap">
                              {p.createdAt ? format(new Date(p.createdAt), "MMM dd, yyyy") : "N/A"}
                            </span>
                            <span className="text-[8px] font-bold tracking-widest">
                              {p.createdAt ? format(new Date(p.createdAt), "hh:mm a") : "N/A"}
                            </span>
                          </div>
                        </td>
                      </motion.tr>
                    );
                  })
                )}
              </tbody>
            </table>
          </div>
        </div>
      </div>
    </div>
  );
};

export default AdminPayments;
