import { motion, AnimatePresence } from "framer-motion";
import { X, MapPin, CreditCard, Package, Calendar, Clock, ShoppingBag } from "lucide-react";
import { getAssetUrl } from "@/lib/api";

interface OrderItem {
  productId: string;
  name: string;
  price: number;
  quantity: number;
  image: string;
  selectedShade?: string;
  selectedSize?: string;
}

interface OrderDetailsProps {
  isOpen: boolean;
  onClose: () => void;
  order: {
    id: string;
    orderNumber: string;
    items: OrderItem[];
    totalAmount: number;
    status: string;
    createdAt: string;
    paymentMethod?: string;
    address?: string;
    shippingCharges?: number;
    discount?: number;
  };
}

const OrderDetailsModal = ({ isOpen, onClose, order }: OrderDetailsProps) => {
  if (!isOpen) return null;

  return (
    <AnimatePresence>
      <div className="fixed inset-0 z-[110] flex items-center justify-center sm:p-4">
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          onClick={onClose}
          className="absolute inset-0 bg-black/40 backdrop-blur-sm"
        />
        
        <motion.div
          initial={{ opacity: 0, y: "100%" }}
          animate={{ opacity: 1, y: 0 }}
          exit={{ opacity: 0, y: "100%" }}
          className="relative w-full max-w-2xl bg-[#faf9f6]/95 backdrop-blur-xl sm:rounded-[3rem] h-full sm:h-[90vh] overflow-y-auto shadow-2xl border border-white/20"
        >
          {/* Header */}
          <div className="sticky top-0 z-10 bg-white/70 backdrop-blur-md px-6 py-5 border-b border-gold/5 flex items-center gap-6">
            <button onClick={onClose} className="p-1 hover:bg-muted rounded-full transition-colors group">
              <X size={24} className="text-charcoal group-hover:text-gold transition-colors" />
            </button>
            <h2 className="text-2xl font-display font-bold text-charcoal flex-1 uppercase tracking-tight">Order <span className="text-gold italic font-light">Details</span></h2>
          </div>

          <div className="p-6 md:p-8 space-y-6 pb-24">
            {/* Status Summary */}
            <div className="bg-[#fdfcfb]/80 backdrop-blur-sm p-7 rounded-[2.5rem] border border-gold/10 shadow-[0_15px_40px_rgba(182,143,76,0.04)] space-y-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-[10px] font-bold text-muted-foreground uppercase tracking-[0.2em] mb-1">Order Number</p>
                  <p className="text-base font-bold text-charcoal">#{order.orderNumber}</p>
                </div>
                <div className="text-right">
                  <p className="text-[10px] font-bold text-muted-foreground uppercase tracking-[0.2em] mb-1">Status</p>
                  <span className="text-[10px] font-bold text-gold px-4 py-1.5 bg-gold/5 border border-gold/10 rounded-full uppercase tracking-wider">{order.status}</span>
                </div>
              </div>
              
              <div className="flex items-center gap-3 pt-4 text-[11px] text-muted-foreground border-t border-muted/30 font-medium">
                <Calendar size={14} className="text-gold" />
                <span>Ordered on {new Date(order.createdAt).toLocaleDateString("en-US", { month: "long", day: "numeric", year: "numeric" })}</span>
              </div>
            </div>

            {/* Items Section */}
            <div className="bg-[#fdfcfb]/80 backdrop-blur-sm rounded-[2.5rem] border border-gold/10 shadow-[0_15px_40px_rgba(182,143,76,0.04)] overflow-hidden">
               <div className="px-8 py-5 border-b bg-muted/5 flex items-center gap-3">
                  <ShoppingBag size={18} className="text-gold" />
                  <h3 className="text-sm font-bold text-charcoal uppercase tracking-widest">Items Ordered</h3>
               </div>
               <div className="divide-y divide-muted/30">
                  {order.items.map((item, idx) => (
                    <div key={idx} className="p-8 flex items-center gap-6 group">
                        <div className="w-20 h-20 rounded-2xl overflow-hidden flex-shrink-0 bg-muted/20 border border-border p-2 group-hover:border-gold/30 transition-all">
                           <img src={getAssetUrl(item.image)} alt={item.name} className="w-full h-full object-contain" />
                        </div>
                        <div className="flex-1 min-w-0">
                           <h4 className="text-lg font-display font-bold text-charcoal truncate">{item.name}</h4>
                           <p className="text-xs text-muted-foreground mt-1 font-body">Qty: {item.quantity} • {item.selectedShade || "Default"}</p>
                           <p className="text-base font-bold text-charcoal mt-3">₹{Number(item.price).toLocaleString()}</p>
                        </div>
                    </div>
                  ))}
               </div>
            </div>

            {/* Shipping & Payment Grid */}
            <div className="grid md:grid-cols-2 gap-6">
                {/* Shipping Address */}
                <div className="bg-[#fdfcfb]/80 p-7 rounded-[2.5rem] border border-gold/10 shadow-[0_15px_40px_rgba(182,143,76,0.04)] space-y-5">
                  <div className="flex items-center gap-3">
                     <MapPin size={18} className="text-gold" />
                     <h3 className="text-xs font-bold text-charcoal uppercase tracking-[0.2em]">Delivery Address</h3>
                  </div>
                  <div className="text-xs text-muted-foreground leading-relaxed font-body italic">
                     {order.address || "Shipping to: 123 Radiance Lane, Glow City, Sanctuary Park, 560001"}
                  </div>
               </div>

                {/* Payment Info */}
                <div className="bg-[#fdfcfb]/80 p-7 rounded-[2.5rem] border border-gold/10 shadow-[0_15px_40px_rgba(182,143,76,0.04)] space-y-6">
                   <div className="flex items-center gap-3">
                     <CreditCard size={18} className="text-gold" />
                     <h3 className="text-xs font-bold text-charcoal uppercase tracking-[0.2em]">Payment Summary</h3>
                   </div>
                   
                   <div className="space-y-3 font-body">
                      <div className="flex items-center justify-between text-[11px]">
                        <span className="text-muted-foreground uppercase tracking-widest">Method</span>
                        <span className="font-bold text-charcoal uppercase tracking-widest">{order.paymentMethod || "Online Payment"}</span>
                      </div>
                      
                      <div className="space-y-2 pt-4 border-t border-muted/30">
                        <div className="flex justify-between text-[11px]">
                            <span className="text-muted-foreground">Subtotal</span>
                            <span className="font-bold text-charcoal">₹{order.items.reduce((acc, item) => acc + (item.price * item.quantity), 0).toLocaleString()}</span>
                        </div>
                        <div className="flex justify-between text-[11px]">
                            <span className="text-muted-foreground">Shipping</span>
                            <span className="font-bold text-gold uppercase tracking-[0.1em]">Free Delivery</span>
                        </div>
                        {order.discount && (
                          <div className="flex justify-between text-[11px]">
                              <span className="text-muted-foreground font-bold">Discount</span>
                              <span className="font-bold text-gold">-₹{order.discount.toLocaleString()}</span>
                          </div>
                        )}
                        <div className="flex justify-between items-baseline pt-4 border-t border-gold/10 mt-2">
                            <span className="font-display font-bold text-charcoal uppercase tracking-tight">Total Amount</span>
                            <span className="font-body font-bold text-gold text-3xl tracking-tight">₹{Number(order.totalAmount).toLocaleString()}</span>
                        </div>
                      </div>
                   </div>
               </div>
            </div>
          </div>
        </motion.div>
      </div>
    </AnimatePresence>
  );
};

export default OrderDetailsModal;
