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
import OrderRitualModal from "@/components/Admin/OrderRitualModal.tsx";

const AdminOrders = () => {
  const { isDark } = useAdminTheme();
  const [orders, setOrders] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchQuery, setSearchQuery] = useState("");
  const [selectedOrder, setSelectedOrder] = useState<any>(null);
  const [isModalOpen, setIsModalOpen] = useState(false);

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

  const openOrderModal = (order: any) => {
    setSelectedOrder(order);
    setIsModalOpen(true);
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

  const StatusStepper = ({ currentStatus }: { currentStatus: string }) => {
    const steps = [
      { id: 'Processing', icon: Clock },
      { id: 'Shipped', icon: Truck },
      { id: 'Delivered', icon: CheckCircle }
    ];
    
    const currentIndex = steps.findIndex(s => s.id.toLowerCase() === currentStatus.toLowerCase());
    const isCancelled = currentStatus.toLowerCase() === 'cancelled';

    if (isCancelled) {
      return (
        <span className={`px-4 py-1.5 rounded-full text-[11px] font-bold uppercase tracking-[0.2em] border shadow-sm ${getStatusColor('cancelled')}`}>
          Cancelled
        </span>
      );
    }

    return (
      <div className="flex items-center gap-1.5">
        {steps.map((step, index) => {
          const StepIcon = step.icon;
          const isActive = index <= currentIndex;
          const isCurrent = index === currentIndex;
          
          let colorClass = "";
          if (isActive) {
            if (step.id === 'Delivered') colorClass = isDark ? "bg-emerald-400 border-emerald-400 text-charcoal" : "bg-emerald-500 border-emerald-500 text-white";
            else if (step.id === 'Shipped') colorClass = isDark ? "bg-sky-400 border-sky-400 text-charcoal" : "bg-sky-500 border-sky-500 text-white";
            else colorClass = "bg-gold border-gold text-charcoal";
          } else {
            colorClass = isDark ? "bg-white/10 border-white/10 text-white/30" : "bg-charcoal/10 border-charcoal/10 text-charcoal/30";
          }

          return (
            <React.Fragment key={step.id}>
              <div 
                className={`w-8 h-8 rounded-full flex items-center justify-center border transition-all duration-500 ${colorClass} ${isCurrent ? "scale-110 shadow-lg" : "scale-100"}`}
                title={step.id}
              >
                <StepIcon size={14} strokeWidth={isActive ? 3 : 2} />
              </div>
              {index < steps.length - 1 && (
                <div className={`w-4 h-[2px] rounded-full transition-all duration-700 ${
                  index < currentIndex 
                    ? (steps[index + 1].id === 'Shipped' ? 'bg-sky-400/70' : 'bg-emerald-400/70') 
                    : (isDark ? 'bg-white/10' : 'bg-charcoal/10')
                }`} />
              )}
            </React.Fragment>
          );
        })}
      </div>
    );
  };

  const filteredOrders = orders.filter(o => 
    o.orderNumber.toLowerCase().includes(searchQuery.toLowerCase()) ||
    o.userMobile.toLowerCase().includes(searchQuery.toLowerCase())
  );

  return (
    <div className="space-y-2 pb-4">
      {/* Header Ritual */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-2 border-b border-indigo-600/10 pb-1.5">
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
            className={`w-full backdrop-blur-2xl border rounded-2xl py-3 pl-16 pr-6 font-body focus:outline-none focus:ring-1 focus:ring-gold/30 transition-all ${
              isDark 
              ? "bg-charcoal/40 border-white/5 text-white placeholder:text-white/10" 
              : "bg-white border-charcoal/5 text-charcoal placeholder:text-charcoal/60 shadow-sm"
            }`}
          />
        </div>
        <button className={`flex items-center gap-3 px-6 py-3 backdrop-blur-2xl border rounded-2xl transition-all duration-500 font-bold uppercase tracking-widest text-xs ${
          isDark 
          ? "bg-charcoal/40 border-white/5 text-white/40 hover:text-white hover:border-white/10" 
          : "bg-white border-charcoal/5 text-charcoal/40 hover:text-charcoal hover:border-charcoal/10 shadow-sm"
        }`}>
          <Filter size={18} />
          <span>Filter</span>
        </button>
      </div>

      {/* Order Table Ritual */}
      <div className={`backdrop-blur-3xl border rounded-3xl shadow-2xl transition-all duration-700 ${
        isDark ? "bg-charcoal/40 border-white/5 shadow-black/50" : "bg-white border-charcoal/5 shadow-charcoal/5"
      }`}>
        <div className="overflow-x-auto">
          <table className="w-full text-left border-collapse">
             <thead className={`border-b font-body text-[13px] font-extrabold uppercase tracking-[0.3em] transition-colors duration-700 ${
               isDark ? "bg-white/[0.04] border-white/12 text-white/70" : "bg-charcoal/[0.04] border-charcoal/12 text-charcoal/90"
             }`}>
                <tr>
                   <th className="px-4 py-2">Reference</th>
                    <th className="px-4 py-2">Seeker</th>
                    <th className="px-4 py-2">Total Amount</th>
                    <th className="px-4 py-2">Status</th>
                    <th className="px-4 py-2">Payment</th>
                   <th className="px-4 py-2 text-right pr-12">Actions</th>
                </tr>
             </thead>
             <tbody className={`divide-y transition-colors duration-700 ${
               isDark ? "divide-white/10" : "divide-charcoal/10"
             }`}>
                {loading ? (
                   Array(5).fill(0).map((_, i) => (
                    <tr key={i} className="animate-pulse">
                      <td className="px-4 py-1.5"><div className="h-6 w-32 bg-white/5 rounded-lg" /></td>
                      <td className="px-4 py-1.5"><div className="h-6 w-24 bg-white/5 rounded-lg" /></td>
                      <td className="px-4 py-1.5"><div className="h-6 w-16 bg-white/5 rounded-lg" /></td>
                      <td className="px-4 py-1.5"><div className="h-10 w-32 bg-white/5 rounded-full" /></td>
                      <td className="px-4 py-1.5"><div className="h-6 w-20 bg-white/5 rounded-lg" /></td>
                      <td className="px-4 py-1.5"><div className="h-10 w-10 ml-auto bg-white/5 rounded-full" /></td>
                    </tr>
                  ))
                ) : filteredOrders.length > 0 ? (
                  filteredOrders.map((o) => (
                    <motion.tr 
                      key={o._id || o.id}
                      initial={{ opacity: 0 }}
                      animate={{ opacity: 1 }}
                      className="group/row hover:bg-white/[0.03] transition-colors"
                    >
                       <td className="px-4 py-1.5">
                          <div className="flex items-center gap-4">
                             <div className={`w-12 h-12 rounded-full flex items-center justify-center text-gold border transition-colors ${
                               isDark ? "bg-white/5 border-white/10" : "bg-charcoal/5 border-charcoal/10"
                             }`}>
                                <Package size={18} />
                             </div>
                             <div>
                                <h4 className={`text-[15px] font-extrabold transition-colors group-hover/row:text-gold ${
                                  isDark ? "text-white" : "text-charcoal"
                                }`}>{o.orderNumber}</h4>
                                <p className={`text-[12px] font-extrabold uppercase tracking-widest transition-colors ${
                                  isDark ? "text-white/60" : "text-charcoal/80"
                                }`}>{o.createdAt}</p>
                             </div>
                          </div>
                       </td>
                       <td className="px-4 py-1.5">
                          <div className="flex flex-col gap-1">
                             <span className={`text-[15px] font-extrabold uppercase tracking-wider transition-colors ${
                               isDark ? "text-white" : "text-charcoal"
                             }`}>{o.userMobile}</span>
                             <span className={`text-[13px] font-bold uppercase tracking-widest italic transition-colors ${
                               isDark ? "text-white/60" : "text-charcoal/80"
                             }`}>{o.shippingAddress?.fullName || "Mysterious Seeker"}</span>
                          </div>
                       </td>
                       <td className={`px-6 py-5 font-display text-xl font-bold italic transition-colors ${
                         isDark ? "text-white" : "text-charcoal"
                       }`}>
                          ₹{o.totalAmount}
                       </td>
                       <td className="px-4 py-1.5">
                           <StatusStepper currentStatus={o.status} />
                       </td>
                       <td className="px-4 py-1.5">
                          <div className="flex items-center gap-2">
                             <CreditCard size={18} className={o.paymentStatus === 'SUCCESS' ? "text-emerald-400" : (isDark ? "text-white/40" : "text-charcoal/60")} />
                             <span className={`text-[13px] font-extrabold uppercase tracking-widest ${o.paymentStatus === 'SUCCESS' ? "text-emerald-400" : (isDark ? "text-white/80" : "text-charcoal/80")}`}>
                                {o.paymentStatus}
                             </span>
                          </div>
                       </td>
                       <td className="px-6 py-5 text-right pr-8">
                          <div className="flex items-center justify-end gap-3">
                             <button 
                                onClick={() => openOrderModal(o)}
                                className={`w-11 h-11 rounded-full flex items-center justify-center transition-all duration-300 shadow-xl ${
                               isDark ? "bg-white/5 text-white/40 hover:text-gold hover:bg-gold/10" : "bg-charcoal/5 text-charcoal/40 hover:text-gold hover:bg-gold/10"
                             }`}>
                                <Eye size={18} />
                             </button>
                             <div className="relative group/actions">
                                <button className={`w-11 h-11 rounded-full flex items-center justify-center transition-all duration-300 ${
                                  isDark ? "bg-white/5 text-white/40 hover:text-white" : "bg-charcoal/5 text-charcoal/40 hover:text-charcoal"
                                }`}>
                                   <MoreVertical size={18} />
                                </button>
                                <div className={`absolute right-0 top-full mt-3 w-56 border rounded-2xl shadow-2xl p-2.5 opacity-0 scale-95 pointer-events-none group-hover/actions:opacity-100 group-hover/actions:scale-100 group-hover/actions:pointer-events-auto transition-all duration-300 z-50 ${
                                  isDark ? "bg-charcoal border-white/10" : "bg-white border-charcoal/10"
                                }`}>
                                   <button onClick={() => handleStatusUpdate(o._id || o.id, 'Processing')} className={`w-full text-left px-5 py-3 text-[13px] font-extrabold hover:text-gold hover:bg-gold/5 rounded-xl uppercase tracking-widest transition-colors flex items-center gap-3 ${
                                     isDark ? "text-white/60" : "text-charcoal/80"
                                    }`}>
                                      <Clock size={15} /> Processing
                                   </button>
                                   <button onClick={() => handleStatusUpdate(o._id || o.id, 'Shipped')} className={`w-full text-left px-5 py-3 text-[13px] font-extrabold hover:text-sky-400 hover:bg-sky-400/5 rounded-xl uppercase tracking-widest transition-colors flex items-center gap-3 ${
                                     isDark ? "text-white/60" : "text-charcoal/80"
                                    }`}>
                                      <Truck size={15} /> Shipped
                                   </button>
                                   <button onClick={() => handleStatusUpdate(o._id || o.id, 'Delivered')} className={`w-full text-left px-5 py-3 text-[13px] font-extrabold hover:text-emerald-400 hover:bg-emerald-400/5 rounded-xl uppercase tracking-widest transition-colors flex items-center gap-3 ${
                                     isDark ? "text-white/60" : "text-charcoal/80"
                                    }`}>
                                      <CheckCircle size={15} /> Delivered
                                   </button>
                                   <div className={`h-[1px] my-2.5 ${isDark ? "bg-white/5" : "bg-charcoal/5"}`} />
                                   <button onClick={() => handleStatusUpdate(o._id || o.id, 'Cancelled')} className={`w-full text-left px-5 py-3 text-[13px] font-extrabold hover:text-rose-400 hover:bg-rose-400/5 rounded-xl uppercase tracking-widest transition-colors flex items-center gap-3 ${
                                     isDark ? "text-white/60" : "text-charcoal/80"
                                    }`}>
                                      <XCircle size={15} /> Cancel Ritual
                                   </button>
                                </div>
                             </div>
                          </div>
                       </td>
                    </motion.tr>
                  ))
                ) : (
                  <tr>
                    <td colSpan={6} className={`px-8 py-24 text-center font-body text-base font-extrabold uppercase tracking-widest italic transition-colors ${
                      isDark ? "text-white/40" : "text-charcoal/70"
                    }`}>
                      No order rituals recorded in the repository.
                    </td>
                  </tr>
                )}
             </tbody>
          </table>

        </div>

        {/* Footer Ritual */}
        <div className={`px-8 py-4 border-t flex items-center justify-between transition-colors duration-700 ${
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
      <OrderRitualModal 
        isOpen={isModalOpen}
        onClose={() => setIsModalOpen(false)}
        order={selectedOrder}
        onStatusUpdate={handleStatusUpdate}
      />
    </div>
  );
};

export default AdminOrders;
