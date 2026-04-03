import React, { useState, useEffect } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { 
  Search, 
  Filter, 
  Eye, 
  Package, 
  Truck, 
  CheckCircle, 
  Clock, 
  XCircle,
  MoreVertical,
  ChevronLeft,
  ChevronRight,
  ExternalLink,
  MapPin,
  CreditCard,
  User
} from "lucide-react";
import { getApiUrl } from "@/lib/api";
import { toast } from "sonner";
import { useAdminTheme } from "../../context/AdminThemeContext.tsx";

const AdminOrders = () => {
  const { isDark } = useAdminTheme();
  const [orders, setOrders] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchQuery, setSearchQuery] = useState("");

  const fetchOrders = async () => {
    setLoading(true);
    try {
      const response = await fetch(getApiUrl("/api/orders/"));
      if (response.ok) {
        const data = await response.json();
        setOrders(data);
      }
    } catch (error) {
      toast.error("Could not reach the order repository.");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchOrders();
  }, []);

  const handleStatusUpdate = async (id: string, newStatus: string) => {
    try {
      const response = await fetch(getApiUrl(`/api/orders/${id}/status`), {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ status: newStatus }),
      });
      if (response.ok) {
        toast.success(`Ritual status updated to ${newStatus}.`);
        fetchOrders();
      } else {
        const error = await response.json();
        toast.error(error.detail || "Status update failed.");
      }
    } catch (error) {
      toast.error("System connection error.");
    }
  };

  const getStatusColor = (status: string) => {
    switch (status.toLowerCase()) {
      case "delivered": return isDark ? "text-emerald-400 bg-emerald-400/10 border-emerald-400/20" : "text-emerald-600 bg-emerald-50 border-emerald-100";
      case "shipped": return isDark ? "text-sky-400 bg-sky-400/10 border-sky-400/20" : "text-sky-600 bg-sky-50 border-sky-100";
      case "cancelled": return isDark ? "text-rose-400 bg-rose-400/10 border-rose-400/20" : "text-rose-600 bg-rose-50 border-rose-100";
      case "processing": return isDark ? "text-gold bg-gold/10 border-gold/20" : "text-gold bg-gold/5 border-gold/20";
      default: return isDark ? "text-white/40 bg-white/5 border-white/10" : "text-charcoal/40 bg-charcoal/5 border-charcoal/10";
    }
  };

  const filteredOrders = orders.filter(o => 
    o.orderNumber.toLowerCase().includes(searchQuery.toLowerCase()) ||
    o.userMobile.toLowerCase().includes(searchQuery.toLowerCase())
  );

  return (
    <div className="space-y-8 pb-20">
      {/* Header Ritual */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-6 border-b border-indigo-600/10 pb-8">
        <div className="space-y-1">
          <h2 className={`font-body text-4xl font-bold tracking-tight uppercase transition-colors duration-700 ${
            isDark ? "text-white" : "text-charcoal"
          }`}>
            Order <span className="text-indigo-500">Repository</span>
          </h2>
          <p className={`font-body text-xs tracking-widest uppercase font-bold transition-colors duration-700 ${
            isDark ? "text-slate-500" : "text-charcoal/40"
          }`}>
            Live tracking and management of sanctuary data transitions
          </p>
        </div>
      </div>

      <div className="flex flex-col md:flex-row gap-4">
        <div className="relative flex-1 group">
          <Search className={`absolute left-6 top-1/2 -translate-y-1/2 transition-colors ${
            isDark ? "text-white/20 group-focus-within:text-gold" : "text-charcoal/60 group-focus-within:text-gold"
          }`} size={18} />
          <input 
            type="text" 
            placeholder="Search orders by number or mobile..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className={`w-full backdrop-blur-2xl border rounded-2xl py-4 pl-16 pr-6 font-body focus:outline-none focus:ring-1 focus:ring-gold/30 transition-all ${
              isDark 
              ? "bg-charcoal/40 border-white/5 text-white placeholder:text-white/10" 
              : "bg-white border-charcoal/5 text-charcoal placeholder:text-charcoal/60 shadow-sm"
            }`}
          />
        </div>
        <button className={`flex items-center gap-3 px-6 py-4 backdrop-blur-2xl border rounded-2xl transition-all duration-500 font-bold uppercase tracking-widest text-xs ${
          isDark 
          ? "bg-charcoal/40 border-white/5 text-white/40 hover:text-white hover:border-white/10" 
          : "bg-white border-charcoal/5 text-charcoal/40 hover:text-charcoal hover:border-charcoal/10 shadow-sm"
        }`}>
          <Filter size={18} />
          <span>Filter</span>
        </button>
      </div>

      {/* Order Table Ritual */}
      <div className={`backdrop-blur-3xl border rounded-[3rem] overflow-hidden shadow-2xl transition-all duration-700 ${
        isDark ? "bg-charcoal/40 border-white/5 shadow-black/50" : "bg-white border-charcoal/5 shadow-charcoal/5"
      }`}>
        <div className="overflow-x-auto">
          <table className="w-full text-left border-collapse">
             <thead className={`border-b font-body text-xs font-bold uppercase tracking-[0.3em] transition-colors duration-700 ${
               isDark ? "bg-white/[0.02] border-white/5 text-white/30" : "bg-charcoal/[0.02] border-charcoal/5 text-charcoal/70"
             }`}>
                <tr>
                   <th className="px-8 py-6">Reference</th>
                   <th className="px-6 py-6">Seeker</th>
                   <th className="px-6 py-6">Total Amount</th>
                   <th className="px-6 py-6">Status</th>
                   <th className="px-6 py-6">Payment</th>
                   <th className="px-6 py-6 text-right">Rituals</th>
                </tr>
             </thead>
             <tbody className={`divide-y transition-colors duration-700 ${
               isDark ? "divide-white/5" : "divide-charcoal/5"
             }`}>
                {loading ? (
                  Array(5).fill(0).map((_, i) => (
                    <tr key={i} className="animate-pulse">
                      <td className="px-8 py-6"><div className="h-6 w-32 bg-white/5 rounded-lg" /></td>
                      <td className="px-6 py-6"><div className="h-6 w-24 bg-white/5 rounded-lg" /></td>
                      <td className="px-6 py-6"><div className="h-6 w-16 bg-white/5 rounded-lg" /></td>
                      <td className="px-6 py-6"><div className="h-8 w-24 bg-white/5 rounded-full" /></td>
                      <td className="px-6 py-6"><div className="h-6 w-20 bg-white/5 rounded-lg" /></td>
                      <td className="px-6 py-6"><div className="h-8 w-8 ml-auto bg-white/5 rounded-full" /></td>
                    </tr>
                  ))
                ) : filteredOrders.length > 0 ? (
                  filteredOrders.map((o) => (
                    <motion.tr 
                      key={o._id || o.id}
                      initial={{ opacity: 0 }}
                      animate={{ opacity: 1 }}
                      className="group/row hover:bg-white/[0.02] transition-colors"
                    >
                       <td className="px-8 py-6">
                          <div className="flex items-center gap-3">
                             <div className={`w-10 h-10 rounded-full flex items-center justify-center text-gold/40 border transition-colors ${
                               isDark ? "bg-white/5 border-white/5" : "bg-charcoal/5 border-charcoal/5"
                             }`}>
                                <Package size={16} />
                             </div>
                             <div>
                                <h4 className={`text-base font-bold transition-colors group-hover/row:text-gold ${
                                  isDark ? "text-white" : "text-charcoal"
                                }`}>{o.orderNumber}</h4>
                                <p className={`text-\[11px\] font-bold uppercase tracking-widest transition-colors ${
                                  isDark ? "text-white/20" : "text-charcoal/60"
                                }`}>{o.createdAt}</p>
                             </div>
                          </div>
                       </td>
                       <td className="px-6 py-6">
                          <div className="flex flex-col">
                             <span className={`text-xs font-bold uppercase tracking-wider transition-colors ${
                               isDark ? "text-white" : "text-charcoal"
                             }`}>{o.userMobile}</span>
                             <span className={`text-\[11px\] font-medium uppercase tracking-widest italic transition-colors ${
                               isDark ? "text-white/20" : "text-charcoal/60"
                             }`}>{o.shippingAddress?.fullName || "Mysterious Seeker"}</span>
                          </div>
                       </td>
                       <td className={`px-6 py-6 font-display text-lg font-medium italic transition-colors ${
                         isDark ? "text-white" : "text-charcoal"
                       }`}>
                          ₹{o.totalAmount}
                       </td>
                       <td className="px-6 py-6">
                          <span className={`px-4 py-1.5 rounded-full text-\[11px\] font-bold uppercase tracking-[0.2em] border shadow-sm ${getStatusColor(o.status)}`}>
                             {o.status}
                          </span>
                       </td>
                       <td className="px-6 py-6">
                          <div className="flex items-center gap-2">
                             <CreditCard size={14} className={o.paymentStatus === 'SUCCESS' ? "text-emerald-400" : (isDark ? "text-white/20" : "text-charcoal/40")} />
                             <span className={`text-xs font-bold uppercase tracking-widest ${o.paymentStatus === 'SUCCESS' ? "text-emerald-400" : (isDark ? "text-white/20" : "text-charcoal/40")}`}>
                                {o.paymentStatus}
                             </span>
                          </div>
                       </td>
                       <td className="px-6 py-6 text-right">
                          <div className="flex items-center justify-end gap-2">
                             <button className={`w-10 h-10 rounded-full flex items-center justify-center transition-all duration-300 shadow-lg ${
                               isDark ? "bg-white/5 text-white/40 hover:text-gold hover:bg-gold/10" : "bg-charcoal/5 text-charcoal/40 hover:text-gold hover:bg-gold/10"
                             }`}>
                                <Eye size={16} />
                             </button>
                             <div className="relative group/actions ml-2">
                                <button className={`w-10 h-10 rounded-full flex items-center justify-center transition-all duration-300 ${
                                  isDark ? "bg-white/5 text-white/40 hover:text-white" : "bg-charcoal/5 text-charcoal/40 hover:text-charcoal"
                                }`}>
                                   <MoreVertical size={16} />
                                </button>
                                <div className={`absolute right-0 top-full mt-2 w-48 border rounded-2xl shadow-2xl p-2 opacity-0 scale-95 pointer-events-none group-hover/actions:opacity-100 group-hover/actions:scale-100 group-hover/actions:pointer-events-auto transition-all duration-300 z-50 ${
                                  isDark ? "bg-charcoal border-white/10" : "bg-white border-charcoal/10"
                                }`}>
                                   <button onClick={() => handleStatusUpdate(o._id || o.id, 'Processing')} className="w-full text-left px-4 py-2 text-xs font-bold text-white/40 hover:text-gold hover:bg-white/5 rounded-xl uppercase tracking-widest transition-colors flex items-center gap-3">
                                      <Clock size={14} /> Processing
                                   </button>
                                   <button onClick={() => handleStatusUpdate(o._id || o.id, 'Shipped')} className="w-full text-left px-4 py-2 text-xs font-bold text-white/40 hover:text-sky-400 hover:bg-white/5 rounded-xl uppercase tracking-widest transition-colors flex items-center gap-3">
                                      <Truck size={14} /> Shipped
                                   </button>
                                   <button onClick={() => handleStatusUpdate(o._id || o.id, 'Delivered')} className="w-full text-left px-4 py-2 text-xs font-bold text-white/40 hover:text-emerald-400 hover:bg-white/5 rounded-xl uppercase tracking-widest transition-colors flex items-center gap-3">
                                      <CheckCircle size={14} /> Delivered
                                   </button>
                                   <div className="h-[1px] bg-white/5 my-2" />
                                   <button onClick={() => handleStatusUpdate(o._id || o.id, 'Cancelled')} className="w-full text-left px-4 py-2 text-xs font-bold text-white/40 hover:text-rose-400 hover:bg-white/5 rounded-xl uppercase tracking-widest transition-colors flex items-center gap-3">
                                      <XCircle size={14} /> Cancel Ritual
                                   </button>
                                </div>
                             </div>
                          </div>
                       </td>
                    </motion.tr>
                  ))
                ) : (
                  <tr>
                    <td colSpan={6} className={`px-8 py-20 text-center font-body text-sm uppercase tracking-widest italic transition-colors ${
                      isDark ? "text-white/20" : "text-charcoal/60"
                    }`}>
                      No order rituals recorded in the repository.
                    </td>
                  </tr>
                )}
             </tbody>
          </table>
        </div>

        {/* Footer Ritual */}
        <div className={`px-8 py-6 border-t flex items-center justify-between transition-colors duration-700 ${
          isDark ? "bg-white/[0.01] border-white/5" : "bg-charcoal/[0.01] border-charcoal/5"
        }`}>
           <p className={`text-xs font-bold uppercase tracking-widest transition-colors duration-700 ${
             isDark ? "text-white/20" : "text-charcoal/60"
           }`}>
              Live Order Overlook
           </p>
           <div className={`flex items-center gap-4 text-xs font-bold uppercase tracking-widest transition-colors duration-700 ${
             isDark ? "text-white/40" : "text-charcoal/40"
           }`}>
              <span>Real-time Sync Enabled</span>
              <div className="w-1.5 h-1.5 rounded-full bg-emerald-400 animate-pulse" />
           </div>
        </div>
      </div>
    </div>
  );
};

export default AdminOrders;
