import React from "react";
import { motion, AnimatePresence } from "framer-motion";
import { 
  X, 
  Package, 
  MapPin, 
  Phone, 
  User, 
  CreditCard, 
  Clock, 
  Truck, 
  CheckCircle, 
  XCircle,
  Hash,
  Calendar,
  IndianRupee,
  ShieldCheck,
  ShoppingBag
} from "lucide-react";
import { getAssetUrl } from "@/lib/api";
import { useAdminTheme } from "../../context/AdminThemeContext.tsx";

interface OrderRitualModalProps {
  isOpen: boolean;
  onClose: () => void;
  order: any;
  onStatusUpdate: (id: string, status: string) => void;
}

const OrderRitualModal = ({ isOpen, onClose, order, onStatusUpdate }: OrderRitualModalProps) => {
  const { isDark } = useAdminTheme();

  if (!isOpen || !order) return null;

  const getStatusIcon = (status: string) => {
    switch (status.toLowerCase()) {
      case "delivered": return <CheckCircle className="text-emerald-400" size={20} />;
      case "shipped": return <Truck className="text-sky-400" size={20} />;
      case "cancelled": return <XCircle className="text-rose-400" size={20} />;
      case "processing": return <Clock className="text-gold" size={20} />;
      default: return <Package size={20} />;
    }
  };

  const getStatusColor = (status: string) => {
    switch (status.toLowerCase()) {
      case "delivered": return isDark ? "text-emerald-400 bg-emerald-400/10" : "text-emerald-600 bg-emerald-50";
      case "shipped": return isDark ? "text-sky-400 bg-sky-400/10" : "text-sky-600 bg-sky-50";
      case "cancelled": return isDark ? "text-rose-400 bg-rose-400/10" : "text-rose-600 bg-rose-50";
      case "processing": return isDark ? "text-gold bg-gold/10" : "text-gold bg-gold/5";
      default: return "bg-gray-100 text-gray-600";
    }
  };

  return (
    <AnimatePresence>
      <div className="fixed inset-0 z-[100] flex items-center justify-center p-4 md:p-8">
        {/* Backdrop */}
        <motion.div 
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          onClick={onClose}
          className="absolute inset-0 bg-black/80 backdrop-blur-sm"
        />

        {/* Modal Stage */}
        <motion.div
          initial={{ opacity: 0, scale: 0.9, y: 30 }}
          animate={{ opacity: 1, scale: 1, y: 0 }}
          exit={{ opacity: 0, scale: 0.9, y: 30 }}
          className={`relative w-full max-w-4xl max-h-[90vh] border rounded-[3rem] shadow-2xl flex flex-col overflow-hidden transition-all duration-700 ${
            isDark ? "bg-charcoal/95 border-white/10 shadow-black/80" : "bg-white/95 border-charcoal/10 shadow-charcoal/30"
          }`}
        >
          {/* Header Ritual */}
          <div className={`p-8 border-b flex items-center justify-between transition-colors duration-700 ${
            isDark ? "bg-white/[0.02] border-white/5" : "bg-charcoal/[0.02] border-charcoal/5"
          }`}>
            <div className="flex items-center gap-6">
               <div className={`w-14 h-14 rounded-2xl flex items-center justify-center shadow-lg ${
                 isDark ? "bg-white/5 text-gold" : "bg-charcoal/5 text-gold"
               }`}>
                  <ShoppingBag size={28} />
               </div>
               <div>
                  <div className="flex items-center gap-3 mb-1">
                    <h3 className={`font-body text-2xl font-bold uppercase tracking-tight transition-colors duration-700 ${
                      isDark ? "text-white" : "text-charcoal"
                    }`}>
                      Order <span className="text-indigo-500 italic">Ritual</span>
                    </h3>
                    <span className={`px-4 py-1 rounded-full text-[10px] font-bold uppercase tracking-widest border ${getStatusColor(order.status)}`}>
                       {order.status}
                    </span>
                  </div>
                  <div className="flex items-center gap-4 text-[10px] font-bold uppercase tracking-widest opacity-40">
                    <span className="flex items-center gap-1.5"><Hash size={10} /> {order.orderNumber}</span>
                    <span className="flex items-center gap-1.5"><Calendar size={10} /> {new Date(order.createdAt).toLocaleDateString()}</span>
                  </div>
               </div>
            </div>
            <button 
              onClick={onClose}
              className={`w-12 h-12 rounded-full flex items-center justify-center transition-all ${
                isDark ? "hover:bg-white/5 text-white/40 hover:text-white" : "hover:bg-charcoal/5 text-charcoal/40 hover:text-charcoal"
              }`}
            >
              <X size={24} />
            </button>
          </div>

          <div className="flex-1 overflow-y-auto p-8 md:p-12 space-y-12 custom-scrollbar">
            
            {/* Visual Delivery Timeline */}
            <div className={`p-8 rounded-[2rem] border transition-all duration-700 ${
              isDark ? "bg-white/[0.02] border-white/5" : "bg-charcoal/[0.02] border-charcoal/5"
            }`}>
               <div className="flex items-center justify-between relative max-w-2xl mx-auto">
                  {/* Step Connector Line */}
                  <div className={`absolute top-1/2 left-0 w-full h-[2px] -translate-y-1/2 transition-all duration-1000 ${
                    isDark ? "bg-white/5" : "bg-charcoal/5"
                  }`} />
                  
                  {[
                    { id: 'Processing', icon: Clock, label: 'Order Ritual initiated' },
                    { id: 'Shipped', icon: Truck, label: 'Aura in Transit' },
                    { id: 'Delivered', icon: CheckCircle, label: 'Ritual Completed' }
                  ].map((step, index, array) => {
                    const StepIcon = step.icon;
                    const steps = ['Processing', 'Shipped', 'Delivered'];
                    const currentIndex = steps.indexOf(order.status);
                    const isActive = currentIndex >= index;
                    const isCompleted = currentIndex > index;
                    const isCurrent = currentIndex === index;

                    return (
                      <div key={step.id} className="relative z-10 flex flex-col items-center">
                        <motion.div 
                          initial={false}
                          animate={{
                            scale: isCurrent ? 1.2 : 1,
                            backgroundColor: isActive ? (step.id === 'Delivered' ? '#10b981' : (step.id === 'Shipped' ? '#0ea5e9' : '#d4af37')) : (isDark ? '#1a1a1a' : '#f8f8f8'),
                          }}
                          className={`w-14 h-14 rounded-2xl flex items-center justify-center border-4 shadow-2xl transition-all duration-700 ${
                            isActive 
                              ? "border-white/20 text-charcoal" 
                              : (isDark ? "border-white/5 text-white/20" : "border-charcoal/5 text-charcoal/20")
                          }`}
                        >
                           <StepIcon size={24} strokeWidth={isActive ? 2.5 : 1.5} />
                        </motion.div>
                        <div className="absolute top-full mt-4 text-center w-32">
                           <p className={`text-[10px] font-bold uppercase tracking-widest mb-1 transition-colors duration-500 ${
                             isActive ? (isDark ? "text-white" : "text-charcoal") : "opacity-20"
                           }`}>
                              {step.id}
                           </p>
                           {isCurrent && (
                             <motion.p 
                               initial={{ opacity: 0, y: 5 }}
                               animate={{ opacity: 1, y: 0 }}
                               className="text-[8px] font-medium italic text-gold uppercase tracking-tighter"
                             >
                               {step.label}
                             </motion.p>
                           )}
                        </div>
                      </div>
                    );
                  })}
               </div>
            </div>
            
            {/* Grid for Logistics & Items */}
            <div className="grid grid-cols-1 lg:grid-cols-12 gap-12">
               
               {/* Left: Items (8 cols) */}
               <div className="lg:col-span-12 space-y-8">
                  <div className="flex items-center justify-between">
                    <h4 className="text-xs font-bold text-gold uppercase tracking-[0.3em]">Included Rituals ({order.items?.length || 0})</h4>
                    <span className="text-[10px] font-bold uppercase tracking-widest opacity-20 italic">Aura Collection</span>
                  </div>
                  
                  <div className={`rounded-3xl overflow-hidden border ${
                    isDark ? "bg-white/[0.02] border-white/5" : "bg-charcoal/[0.02] border-charcoal/5"
                  }`}>
                    {order.items?.map((item: any, idx: number) => (
                      <div key={idx} className={`p-6 flex items-center justify-between relative group ${
                        idx !== order.items.length - 1 ? (isDark ? "border-b border-white/5" : "border-b border-charcoal/5") : ""
                      }`}>
                         <div className="flex items-center gap-6">
                            <div className="w-16 h-16 rounded-2xl overflow-hidden bg-charcoal border border-white/5 relative flex-shrink-0">
                               <img 
                                 src={getAssetUrl(item.image)} 
                                 alt={item.name} 
                                 className="w-full h-full object-cover transition-transform group-hover:scale-110 duration-700" 
                               />
                            </div>
                            <div>
                               <h5 className={`text-base font-bold mb-1 transition-colors group-hover:text-gold ${
                                 isDark ? "text-white" : "text-charcoal"
                               }`}>{item.name}</h5>
                               <p className={`text-[10px] font-bold uppercase tracking-widest opacity-40`}>
                                 Quantity: {item.quantity} × ₹{item.price}
                               </p>
                            </div>
                         </div>
                         <div className={`font-display text-xl italic font-medium ${isDark ? "text-white" : "text-charcoal"}`}>
                            ₹{item.price * item.quantity}
                         </div>
                      </div>
                    ))}
                  </div>
               </div>

               {/* Logistics Section */}
               <div className="lg:col-span-7 space-y-8">
                  <h4 className="text-xs font-bold text-gold uppercase tracking-[0.3em]">Seeker Metadata</h4>
                  
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                    <div className={`p-6 rounded-3xl border space-y-4 ${
                      isDark ? "bg-white/[0.02] border-white/10" : "bg-charcoal/[0.02] border-charcoal/10"
                    }`}>
                       <div className="flex items-center gap-3 text-gold/60">
                          <User size={16} />
                          <span className="text-[10px] font-bold uppercase tracking-widest">Personal Info</span>
                       </div>
                       <div>
                          <p className={`text-lg font-bold leading-tight mb-1 ${isDark ? "text-white" : "text-charcoal"}`}>
                            {order.shippingAddress?.fullName || "Mysterious Seeker"}
                          </p>
                          <div className="flex items-center gap-2 text-xs font-medium opacity-40">
                             <Phone size={12} />
                             <span>{order.userMobile}</span>
                          </div>
                       </div>
                    </div>

                    <div className={`p-6 rounded-3xl border space-y-4 ${
                      isDark ? "bg-white/[0.02] border-white/10" : "bg-charcoal/[0.02] border-charcoal/10"
                    }`}>
                       <div className="flex items-center gap-3 text-gold/60">
                          <MapPin size={16} />
                          <span className="text-[10px] font-bold uppercase tracking-widest">Shipping Sanctuary</span>
                       </div>
                       <p className={`text-xs font-medium leading-[1.6] ${isDark ? "text-white/60" : "text-charcoal/70"}`}>
                          {order.shippingAddress?.street}<br />
                          {order.shippingAddress?.city}, {order.shippingAddress?.state}<br />
                          {order.shippingAddress?.zipCode}
                       </p>
                    </div>
                  </div>
               </div>

               {/* Payment Breakdown */}
               <div className="lg:col-span-5 space-y-8">
                  <h4 className="text-xs font-bold text-gold uppercase tracking-[0.3em]">Payment Blueprint</h4>
                  
                  <div className={`p-8 rounded-4xl border space-y-6 ${
                    isDark ? "bg-white/[0.02] border-white/10 shadow-black/20 shadow-xl" : "bg-charcoal/[0.02] border-charcoal/10 shadow-lg"
                  }`}>
                     <div className="space-y-4">
                        <div className="flex justify-between text-[11px] font-bold uppercase tracking-widest opacity-40">
                           <span>Subtotal</span>
                           <span>₹{order.totalAmount}</span>
                        </div>
                        <div className="flex justify-between text-[11px] font-bold uppercase tracking-widest text-emerald-400">
                           <span>Aura Discount</span>
                           <span>-₹0</span>
                        </div>
                        <div className="flex justify-between text-[11px] font-bold uppercase tracking-widest opacity-40">
                           <span>Shipping</span>
                           <span className="italic">FREE</span>
                        </div>
                     </div>
                     
                     <div className={`h-[1px] ${isDark ? "bg-white/5" : "bg-charcoal/5"}`} />
                     
                     <div className="flex justify-between items-end">
                        <div className="space-y-1">
                           <span className="text-[9px] font-bold uppercase tracking-[0.4em] text-gold">Final Consignment</span>
                           <div className="flex items-center gap-2">
                              <span className={`text-3xl font-display italic font-medium ${isDark ? "text-white" : "text-charcoal"}`}>₹{order.totalAmount}</span>
                           </div>
                        </div>
                        <div className="flex flex-col items-end gap-2">
                           <div className={`flex items-center gap-2 px-3 py-1.5 rounded-xl border text-[10px] font-bold uppercase tracking-widest ${
                             order.paymentStatus === 'SUCCESS' ? "bg-emerald-400/10 text-emerald-400 border-emerald-400/20" : "bg-rose-400/10 text-rose-400 border-rose-400/20"
                           }`}>
                              <ShieldCheck size={12} />
                              {order.paymentStatus === 'SUCCESS' ? 'Fully Paid' : 'Pending'}
                           </div>
                        </div>
                     </div>
                  </div>
               </div>
            </div>

            {/* Lifecycle Transitions (Admin Only) */}
            <div className="space-y-8 pt-8 border-t border-white/5">
                <h4 className="text-xs font-bold text-indigo-400 uppercase tracking-[0.3em]">Lifecycle Transitions</h4>
                <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
                   {[
                     { id: 'Processing', icon: <Clock size={16} />, color: "hover:text-gold hover:border-gold/30 hover:bg-gold/5" },
                     { id: 'Shipped', icon: <Truck size={16} />, color: "hover:text-sky-400 hover:border-sky-400/30 hover:bg-sky-400/5" },
                     { id: 'Delivered', icon: <CheckCircle size={16} />, color: "hover:text-emerald-400 hover:border-emerald-400/30 hover:bg-emerald-400/5" },
                     { id: 'Cancelled', icon: <XCircle size={16} />, color: "hover:text-rose-400 hover:border-rose-400/30 hover:bg-rose-400/5" }
                   ].map(status => (
                     <button
                       key={status.id}
                       onClick={() => onStatusUpdate(order._id || order.id, status.id)}
                       className={`flex items-center justify-center gap-3 p-5 rounded-2xl border font-bold uppercase tracking-widest text-[10px] transition-all duration-500 ${
                         order.status === status.id 
                           ? (isDark ? "bg-white/10 border-white/20 text-white shadow-lg" : "bg-charcoal/5 border-charcoal/10 text-charcoal shadow-lg")
                           : (isDark ? "bg-white/[0.02] border-white/5 text-white/20" : "bg-charcoal/[0.01] border-charcoal/5 text-charcoal/30")
                       } ${status.color}`}
                     >
                        {status.icon}
                        <span>{status.id}</span>
                     </button>
                   ))}
                </div>
            </div>
          </div>

          {/* Footer Ritual */}
          <div className={`p-8 border-t flex justify-end transition-colors duration-700 ${
            isDark ? "bg-white/[0.02] border-white/5" : "bg-charcoal/[0.02] border-charcoal/5"
          }`}>
             <button 
               onClick={onClose}
               className={`flex items-center gap-3 px-10 py-5 bg-charcoal text-white font-bold rounded-2xl shadow-xl hover:bg-gold hover:text-charcoal transition-all duration-500 uppercase tracking-widest text-xs border ${
                 isDark ? "border-white/5" : "border-charcoal/5"
               }`}
             >
                <CheckCircle size={18} />
                <span>Finalize Inspection</span>
             </button>
          </div>
        </motion.div>
      </div>
    </AnimatePresence>
  );
};

export default OrderRitualModal;
