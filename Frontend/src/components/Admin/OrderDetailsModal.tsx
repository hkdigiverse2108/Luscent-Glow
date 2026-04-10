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
  ShoppingBag,
  Save,
  Sparkles
} from "lucide-react";
import { getAssetUrl, getApiUrl } from "@/lib/api";
import { useAdminTheme } from "../../context/AdminThemeContext.tsx";
import { toast } from "sonner";

interface OrderDetailsModalProps {
  isOpen: boolean;
  onClose: () => void;
  order: any;
  onStatusUpdate: (id: string, status: string) => void;
}

const OrderDetailsModal = ({ isOpen, onClose, order, onStatusUpdate }: OrderDetailsModalProps) => {
  const { isDark } = useAdminTheme();
  const [trackingNumber, setTrackingNumber] = React.useState(order?.trackingNumber || "");
  const [courierPartner, setCourierPartner] = React.useState(order?.courierPartner || "Shiprocket");
  const [isUpdatingTracking, setIsUpdatingTracking] = React.useState(false);
  const [isAutoFulfilling, setIsAutoFulfilling] = React.useState(false);
  const [updatingStatus, setUpdatingStatus] = React.useState<string | null>(null);

  React.useEffect(() => {
    if (order) {
      setTrackingNumber(order.trackingNumber || "");
      setCourierPartner(order.courierPartner || "Shiprocket");
    }
  }, [order]);

  const handleUpdateTracking = async () => {
    setIsUpdatingTracking(true);
    try {
      const response = await fetch(getApiUrl(`/api/orders/${order._id || order.id}/tracking`), {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ trackingNumber, courierPartner }),
      });
      if (response.ok) {
        toast.success("Tracking information updated.");
      } else {
        toast.error("Failed to update tracking info.");
      }
    } catch (error) {
      toast.error("Connection error.");
    } finally {
      setIsUpdatingTracking(false);
    }
  };

  const handleAutoFulfill = async () => {
    setIsAutoFulfilling(true);
    try {
      const response = await fetch(getApiUrl(`/api/orders/${order._id || order.id}/fulfill`), {
        method: "POST",
      });
      const data = await response.json();
      
      if (response.ok) {
        toast.success("Order Fulfillment Complete!", {
          description: `AWB Generated: ${data.tracking.trackingNumber}`
        });
        setTrackingNumber(data.tracking.trackingNumber);
        setCourierPartner(data.tracking.courierPartner || "Shiprocket");
      } else {
        toast.error("Shiprocket Rejection", {
          description: data.detail || "Fulfillment failed."
        });
      }
    } catch (error) {
      toast.error("Connection failed.");
    } finally {
      setIsAutoFulfilling(false);
    }
  };

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
        <motion.div 
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          onClick={onClose}
          className="absolute inset-0 bg-black/80 backdrop-blur-sm"
        />

        <motion.div
          initial={{ opacity: 0, scale: 0.9, y: 30 }}
          animate={{ opacity: 1, scale: 1, y: 0 }}
          exit={{ opacity: 0, scale: 0.9, y: 30 }}
          className={`relative w-full max-w-4xl max-h-[90vh] border rounded-[3rem] shadow-2xl flex flex-col overflow-hidden transition-all duration-700 ${
            isDark ? "bg-charcoal/95 border-white/10 shadow-black/80" : "bg-white/95 border-charcoal/10 shadow-charcoal/30"
          }`}
        >
          {/* Header */}
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
                      Order <span className="text-indigo-500 italic">Details</span>
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
            
            {/* Delivery Timeline */}
            <div className={`p-8 rounded-[2rem] border transition-all duration-700 ${
              isDark ? "bg-white/[0.02] border-white/5" : "bg-charcoal/[0.02] border-charcoal/5"
            }`}>
               <div className="flex items-center justify-between relative max-w-2xl mx-auto">
                  <div className={`absolute top-1/2 left-0 w-full h-[2px] -translate-y-1/2 transition-all duration-1000 ${
                    isDark ? "bg-white/5" : "bg-charcoal/5"
                  }`} />
                  
                  {[
                    { id: 'Processing', icon: Clock, label: 'Order received' },
                    { id: 'Shipped', icon: Truck, label: 'Order in transit' },
                    { id: 'Delivered', icon: CheckCircle, label: 'Order delivered' }
                  ].map((step, index) => {
                    const StepIcon = step.icon;
                    const steps = ['Processing', 'Shipped', 'Delivered'];
                    const currentIndex = steps.indexOf(order.status);
                    const isActive = currentIndex >= index;
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
            
            <div className="grid grid-cols-1 lg:grid-cols-12 gap-12">
               <div className="lg:col-span-12 space-y-8">
                  <div className="flex items-center justify-between">
                    <h4 className="text-xs font-bold text-gold uppercase tracking-[0.3em]">Items ({order.items?.length || 0})</h4>
                    <span className="text-[10px] font-bold uppercase tracking-widest opacity-20 italic">Order Summary</span>
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

               <div className="lg:col-span-7 space-y-8">
                  <h4 className="text-xs font-bold text-gold uppercase tracking-[0.3em]">Customer Information</h4>
                  
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
                            {order.shippingAddress?.fullName || "Customer"}
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
                          <span className="text-[10px] font-bold uppercase tracking-widest">Shipping Address</span>
                       </div>
                       <p className={`text-xs font-medium leading-[1.6] ${isDark ? "text-white/60" : "text-charcoal/70"}`}>
                          {order.shippingAddress?.street}<br />
                          {order.shippingAddress?.city}, {order.shippingAddress?.state}<br />
                          {order.shippingAddress?.zipCode}
                       </p>
                    </div>
                  </div>
               </div>

               <div className="lg:col-span-5 space-y-8">
                  <h4 className="text-xs font-bold text-gold uppercase tracking-[0.3em]">Payment Summary</h4>
                  
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
                           <span className="text-[9px] font-bold uppercase tracking-[0.4em] text-gold">Order Total</span>
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

            {/* Status Updates */}
            <div className="space-y-8 pt-8 border-t border-white/5">
                <h4 className="text-xs font-bold text-indigo-400 uppercase tracking-[0.3em]">Update Status</h4>
                <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
                   {[
                     { id: 'Processing', icon: <Clock size={16} />, color: "hover:text-gold hover:border-gold/30 hover:bg-gold/5" },
                     { id: 'Shipped', icon: <Truck size={16} />, color: "hover:text-sky-400 hover:border-sky-400/30 hover:bg-sky-400/5" },
                     { id: 'Delivered', icon: <CheckCircle size={16} />, color: "hover:text-emerald-400 hover:border-emerald-400/30 hover:bg-emerald-400/5" },
                     { id: 'Cancelled', icon: <XCircle size={16} />, color: "hover:text-rose-400 hover:border-rose-400/30 hover:bg-rose-400/5" }
                   ].map(status => (
                     <button
                        key={status.id}
                        disabled={updatingStatus !== null}
                        onClick={async () => {
                          setUpdatingStatus(status.id);
                          await onStatusUpdate(order._id || order.id, status.id);
                          setUpdatingStatus(null);
                        }}
                        className={`flex items-center justify-center gap-3 p-5 rounded-2xl border font-bold uppercase tracking-widest text-[10px] transition-all duration-500 ${
                          order.status === status.id 
                            ? (isDark ? "bg-white/10 border-white/20 text-white shadow-lg" : "bg-charcoal/5 border-charcoal/10 text-charcoal shadow-lg")
                            : (isDark ? "bg-white/[0.02] border-white/5 text-white/20" : "bg-charcoal/[0.01] border-charcoal/5 text-charcoal/30")
                        } ${status.color} ${updatingStatus === status.id ? "animate-pulse" : ""}`}
                      >
                        {updatingStatus === status.id ? <Clock className="animate-spin" size={16} /> : status.icon}
                        {updatingStatus === status.id ? "Updating..." : status.id}
                      </button>
                   ))}
                </div>
            </div>

            {/* Tracking Integration */}
            {(order.status === 'Shipped' || order.status === 'Delivered') && (
              <motion.div 
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                className={`p-8 rounded-[2rem] border space-y-6 transition-all duration-700 ${
                  isDark ? "bg-indigo-500/5 border-indigo-500/20" : "bg-indigo-50/50 border-indigo-100"
                }`}
              >
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-4">
                    <div className="w-10 h-10 rounded-xl bg-indigo-500/10 flex items-center justify-center text-indigo-400">
                      <Truck size={20} />
                    </div>
                    <div>
                      <h4 className="text-sm font-extrabold uppercase tracking-widest text-indigo-400">Tracking Details</h4>
                      <p className="text-[10px] font-medium opacity-40 uppercase tracking-tighter">Sync with shipping partner API</p>
                    </div>
                  </div>
                  
                  <button 
                    onClick={handleAutoFulfill}
                    disabled={isAutoFulfilling}
                    className="px-4 py-2 bg-indigo-500/10 border border-indigo-500/20 text-indigo-400 font-bold rounded-lg uppercase tracking-widest text-[9px] hover:bg-indigo-500 hover:text-white transition-all flex items-center gap-2 disabled:opacity-50"
                  >
                    {isAutoFulfilling ? <Clock size={12} className="animate-spin" /> : <Sparkles size={12} />}
                    {isAutoFulfilling ? "Generating..." : "Auto-Generate AWB"}
                  </button>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  <div className="space-y-2">
                    <label className="text-[9px] font-bold uppercase tracking-widest opacity-40 ml-1 text-indigo-400">Tracking Number / AWB</label>
                    <input 
                      type="text" 
                      value={trackingNumber}
                      onChange={(e) => setTrackingNumber(e.target.value)}
                      placeholder="e.g. 1234567890"
                      className={`w-full px-5 py-3 rounded-xl border text-sm font-bold outline-none transition-all ${
                        isDark ? "bg-white/5 border-white/10 text-white focus:border-indigo-400" : "bg-white border-charcoal/10 text-charcoal focus:border-indigo-400 shadow-sm"
                      }`}
                    />
                  </div>
                  <div className="space-y-2">
                    <label className="text-[9px] font-bold uppercase tracking-widest opacity-40 ml-1 text-indigo-400">Courier Partner</label>
                    <select 
                      value={courierPartner}
                      onChange={(e) => setCourierPartner(e.target.value)}
                      className={`w-full px-5 py-3 rounded-xl border text-sm font-bold outline-none appearance-none transition-all ${
                        isDark ? "bg-white/5 border-white/10 text-white focus:border-indigo-400" : "bg-white border-charcoal/10 text-charcoal focus:border-indigo-400 shadow-sm"
                      }`}
                    >
                      <option value="Shiprocket">Shiprocket</option>
                      <option value="BlueDart">BlueDart</option>
                      <option value="Delhivery">Delhivery</option>
                      <option value="Ecom Express">Ecom Express</option>
                      <option value="Other">Other Partner</option>
                    </select>
                  </div>
                </div>

                <button 
                  onClick={handleUpdateTracking}
                  disabled={isUpdatingTracking}
                  className="w-full py-4 bg-indigo-500 text-white font-bold rounded-xl uppercase tracking-widest text-[10px] hover:bg-indigo-600 transition-all shadow-lg shadow-indigo-500/20 disabled:opacity-50 flex items-center justify-center gap-2"
                >
                  {isUpdatingTracking ? <Clock size={14} className="animate-spin" /> : <Save size={14} />}
                  {isUpdatingTracking ? "Saving..." : "Update Tracking Details"}
                </button>
              </motion.div>
            )}
          </div>

          {/* Footer */}
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
                <span>Close Order View</span>
             </button>
          </div>
        </motion.div>
      </div>
    </AnimatePresence>
  );
};

export default OrderDetailsModal;
