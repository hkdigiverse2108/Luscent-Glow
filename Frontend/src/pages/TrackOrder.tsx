import { useState, useEffect } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { 
  Package, Truck, CheckCircle2, Search, MapPin, 
  Calendar, ShoppingBag, ArrowRight, ShieldCheck, 
  HelpCircle, ChevronRight, Clock, Box, Mail, Sparkles, ChevronLeft,
  RotateCcw, Copy, ExternalLink, MessageCircle, Share2, Clipboard, Printer, Phone
} from "lucide-react";
import { toast } from "sonner";
import Header from "@/components/Header";
import Footer from "@/components/Footer";
import { Link, useSearchParams, useNavigate } from "react-router-dom";
import { useAuth } from "@/context/AuthContext";
import { getApiUrl, getAssetUrl } from "@/lib/api";

interface TrackStep {
  id: number;
  title: string;
  description: string;
  icon: JSX.Element;
  time: string;
  isCompleted: boolean;
  isCurrent?: boolean;
}

const TrackOrder = () => {

  const [searchParams] = useSearchParams();
  const navigate = useNavigate();
  const { user } = useAuth();
  const [orderId, setOrderId] = useState("");
  const [email, setEmail] = useState("");
  const [isTracking, setIsTracking] = useState(false);
  const [loading, setLoading] = useState(false);
  const [copied, setCopied] = useState(false);
  
  // Tracking state management
  const [orderData, setOrderData] = useState<any>(null);
  const [isAutoTracking, setIsAutoTracking] = useState(false);
  useEffect(() => {
    const urlOrderId = searchParams.get("orderId");
    const autoTrack = searchParams.get("auto") === "true";
    
    if (urlOrderId) {
      setOrderId(urlOrderId);
      if (autoTrack) {
        setIsAutoTracking(true);
        handleTrack(null, urlOrderId);
      } else {
        handleTrack(null, urlOrderId);
      }
    }
    if (user?.email) {
      setEmail(user.email);
    }
  }, [searchParams, user]);

  const handleTrack = async (e: React.FormEvent | null, idFromUrl?: string) => {
    if (e) e.preventDefault();
    setLoading(true);
    
    try {
      const targetId = idFromUrl || orderId;
      if (!targetId) {
        toast.error("Please enter an order number.");
        setLoading(false);
        return;
      }

      const response = await fetch(getApiUrl(`/api/orders/${targetId}/track`));
      if (!response.ok) {
        throw new Error("Order not found or registry unreachable.");
      }

      const data = await response.json();
      const { order, tracking } = data;

      if (!order) {
        toast.error("Order not found.");
        setLoading(false);
        return;
      }

      // Map Order & Tracking Data
      const shiprocketData = tracking?.tracking_data?.shipment_track?.[0];
      const activities = shiprocketData?.shipment_track_activities || [];
      
      // Determine steps based on activities
      const steps = [
        { id: 1, title: "Order Confirmed", description: "Your order has been received and confirmed.", icon: <CheckCircle2 size={18} />, time: new Date(order.createdAt).toLocaleString(), isCompleted: true },
        { id: 2, title: "Quality Check", description: "Our experts verified your items for perfection.", icon: <ShieldCheck size={18} />, time: "Completed", isCompleted: true },
        { id: 3, title: "Order Shipped", description: "Your order is on the way.", icon: <Truck size={18} />, time: "Pending", isCompleted: false },
        { id: 4, title: "Out for Delivery", description: "A courier is navigating to your address.", icon: <MapPin size={18} />, time: "Pending", isCompleted: false },
        { id: 5, title: "Delivered", description: "Your order has been successfully delivered.", icon: <Package size={18} />, time: "Pending", isCompleted: false }
      ];

      // Update steps based on Shiprocket activities
      if (activities.length > 0) {
        const latestStatus = shiprocketData.current_status.toLowerCase();
        
        steps[2].isCompleted = true; // Shipped
        steps[2].time = activities.find((a: any) => a.status.toLowerCase().includes('shipped'))?.date || "In Transit";
        
        if (latestStatus.includes('delivered')) {
          steps[3].isCompleted = true;
          steps[4].isCompleted = true;
          steps[4].isCurrent = true;
          steps[4].time = activities.find((a: any) => a.status.toLowerCase().includes('delivered'))?.date || "Delivered";
        } else if (latestStatus.includes('out')) {
          steps[3].isCompleted = true;
          steps[3].isCurrent = true;
          steps[3].time = activities.find((a: any) => a.status.toLowerCase().includes('out'))?.date || "Out for Delivery";
        } else {
          steps[2].isCurrent = true;
        }
      } else if (order.status === "Shipped") {
        steps[2].isCompleted = true;
        steps[2].isCurrent = true;
      } else if (order.status === "Delivered") {
        steps[2].isCompleted = true;
        steps[3].isCompleted = true;
        steps[4].isCompleted = true;
        steps[4].isCurrent = true;
      }

      // Arrived via direct link (auto=true) - Bypass internal view and go to Shiprocket

      setOrderData({
        orderNumber: order.orderNumber,
        status: order.status,
        expectedDelivery: shiprocketData?.expected_date || "To be updated",
        courier: order.courierPartner || shiprocketData?.courier_name || "Logistics Partner",
        trackingId: order.trackingNumber || shiprocketData?.awb_code || "Processing",
        items: order.items || [],
        steps: steps,
        activities: activities
      });

      setIsTracking(true);
    } catch (error: any) {
      toast.error(error.message || "Failed to fetch tracking data.");
    } finally {
      setLoading(false);
      setIsAutoTracking(false);
    }
  };

  const copyToClipboard = (text: string) => {
    navigator.clipboard.writeText(text);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  return (
    <div className="min-h-screen bg-[#fafaf9]">
      <Header />
      
      <main className="pt-28 pb-32 md:pt-40">
        <div className="max-w-2xl mx-auto px-6">
          {/* Professional Header Section */}
          <div className="flex flex-col md:flex-row md:items-end justify-between gap-6 mb-12">
            <div className="space-y-1">
              <h1 className="text-3xl md:text-5xl font-display font-bold text-charcoal">Track Order</h1>
              <p className="text-[10px] text-muted-foreground uppercase tracking-[0.2em] font-medium">Real-time status of your items</p>
            </div>
            {isTracking && (
               <button 
                onClick={() => setIsTracking(false)}
                className="text-[10px] text-gold font-bold uppercase tracking-widest hover:text-charcoal transition-colors flex items-center gap-2 group"
               >
                 <RotateCcw size={14} className="group-hover:rotate-180 transition-transform duration-500" />
                 New Tracking
               </button>
            )}
          </div>

          <AnimatePresence mode="wait">
            {isAutoTracking ? (
              <motion.div
                key="auto-loader"
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                exit={{ opacity: 0 }}
                className="flex flex-col items-center justify-center py-24 space-y-8"
              >
                <div className="relative">
                  <div className="w-24 h-24 border-2 border-gold/10 rounded-full" />
                  <motion.div 
                    animate={{ rotate: 360 }}
                    transition={{ duration: 2, repeat: Infinity, ease: "linear" }}
                    className="absolute inset-0 border-2 border-transparent border-t-gold rounded-full"
                  />
                  <div className="absolute inset-0 flex items-center justify-center text-gold">
                    <Sparkles size={32} className="animate-pulse" />
                  </div>
                </div>
                <div className="text-center space-y-2">
                  <h3 className="text-xl font-display font-bold text-charcoal">Summoning Logistics...</h3>
                  <p className="text-xs text-muted-foreground uppercase tracking-widest animate-pulse">Syncing with Shiprocket Registry</p>
                </div>
              </motion.div>
            ) : !isTracking ? (
              <motion.div
                key="track-form"
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, scale: 0.98 }}
                className="bg-white border border-border p-8 md:p-12 rounded-[2.5rem] shadow-[0_2px_15px_-3px_rgba(0,0,0,0.07)]"
              >
                 <form onSubmit={handleTrack} className="space-y-10">
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
                       <div className="space-y-2 group">
                         <label className="text-[9px] font-bold text-muted-foreground uppercase tracking-[0.2em] ml-1 group-focus-within:text-gold transition-colors">Order Number</label>
                         <div className="relative">
                           <ShoppingBag className="absolute left-4 top-1/2 -translate-y-1/2 text-muted-foreground/40 group-focus-within:text-gold transition-colors" size={16} />
                           <input
                             required
                             type="text"
                             placeholder="e.g. #LG-12345"
                             className="w-full bg-white border border-border rounded-xl py-4 pl-12 pr-4 text-sm outline-none focus:border-gold/50 focus:ring-1 ring-gold/10 transition-all font-medium"
                             value={orderId}
                             onChange={(e) => setOrderId(e.target.value)}
                           />
                         </div>
                       </div>
                       
                       <div className="space-y-2 group">
                         <label className="text-[9px] font-bold text-muted-foreground uppercase tracking-[0.2em] ml-1 group-focus-within:text-gold transition-colors">Email Address</label>
                         <div className="relative">
                           <Mail className="absolute left-4 top-1/2 -translate-y-1/2 text-muted-foreground/40 group-focus-within:text-gold transition-colors" size={16} />
                           <input
                             required
                             type="email"
                             placeholder="your@email.com"
                             className="w-full bg-white border border-border rounded-xl py-4 pl-12 pr-4 text-sm outline-none focus:border-gold/50 focus:ring-1 ring-gold/10 transition-all font-medium"
                             value={email}
                             onChange={(e) => setEmail(e.target.value)}
                           />
                         </div>
                       </div>
                    </div>

                    <button
                      disabled={loading}
                      type="submit"
                      className="w-full py-4 bg-charcoal text-white font-bold rounded-xl hover:bg-gold hover:text-charcoal transition-all active:scale-[0.98] flex items-center justify-center gap-3 uppercase text-[10px] tracking-[0.3em] shadow-lg shadow-charcoal/5"
                    >
                      {loading ? (
                        <div className="w-5 h-5 border-2 border-white/30 border-t-white rounded-full animate-spin" />
                      ) : (
                        <>
                          <Search size={16} />
                          <span>Track Now</span>
                        </>
                      )}
                    </button>
                 </form>

                 <div className="mt-12 pt-10 border-t border-border grid grid-cols-1 md:grid-cols-2 gap-6">
                    <div className="flex gap-4 p-4 rounded-2xl bg-muted/30">
                       <ShieldCheck size={20} className="text-gold flex-shrink-0" />
                       <div className="space-y-1">
                          <p className="text-[10px] font-bold text-charcoal uppercase tracking-wider">Secure Access</p>
                          <p className="text-[11px] text-muted-foreground leading-relaxed">Verification through encrypted credentials.</p>
                       </div>
                    </div>
                    <div className="flex gap-4 p-4 rounded-2xl bg-muted/30">
                       <HelpCircle size={20} className="text-gold flex-shrink-0" />
                       <div className="space-y-1">
                          <p className="text-[10px] font-bold text-charcoal uppercase tracking-wider">Need Support?</p>
                          <p className="text-[11px] text-muted-foreground leading-relaxed">Our help center is available 24/7 for you.</p>
                       </div>
                    </div>
                 </div>
              </motion.div>
            ) : (
              <motion.div
                key="track-results"
                initial={{ opacity: 0, scale: 0.98 }}
                animate={{ opacity: 1, scale: 1 }}
                className="space-y-6"
              >
                {/* Nykaa-Style Status Banner */}
                <div className="bg-white border border-border p-8 rounded-[2rem] shadow-sm flex items-center justify-between group overflow-hidden relative">
                   <div className="absolute top-0 right-0 p-4 opacity-[0.03] group-hover:opacity-10 transition-opacity">
                      <Truck size={120} />
                   </div>
                   <div className="space-y-2 relative z-10">
                      <div className="flex items-center gap-2 px-3 py-1 bg-gold/10 border border-gold/20 rounded-full w-fit">
                        <div className="w-1.5 h-1.5 rounded-full bg-gold animate-pulse" />
                        <span className="text-[10px] font-bold text-gold uppercase tracking-wider">{orderData.status}</span>
                      </div>
                      <h2 className="text-3xl font-display font-bold text-charcoal tracking-tight">On its way.</h2>
                   </div>
                   <div className="text-right space-y-1 relative z-10">
                      <p className="text-[10px] font-bold text-muted-foreground uppercase tracking-wider">Estimated Delivery</p>
                      <p className="text-xl font-bold text-charcoal">{orderData.expectedDelivery}</p>
                   </div>
                </div>

                {/* Logistics & Items Grid */}
                <div className="grid grid-cols-1 md:grid-cols-12 gap-6">
                   
                   {/* Left: Timeline */}
                   <div className="md:col-span-12 lg:col-span-8 bg-white border border-border rounded-[2.5rem] p-8 md:p-12 relative shadow-sm">
                      <div className="space-y-10 relative">
                        {/* Solid Connection Line */}
                        <div className="absolute left-[20px] top-4 bottom-4 w-[1px] bg-border">
                          <motion.div 
                            initial={{ height: 0 }}
                            animate={{ height: "55%" }}
                            transition={{ duration: 1, ease: "easeInOut" }}
                            className="w-full bg-gold"
                          />
                        </div>

                        {orderData.steps.map((step: any, i: number) => (
                          <div key={step.id} className="relative flex gap-8 group">
                            {/* Crisp Node */}
                            <div className={`w-10 h-10 rounded-full flex items-center justify-center z-10 transition-all ${
                              step.isCompleted ? "bg-gold text-white shadow-xl shadow-gold/20" : "bg-white border border-border text-muted-foreground/30"
                            }`}>
                              {step.isCompleted ? step.icon : <div className="w-1.5 h-1.5 rounded-full bg-muted-foreground/20" />}
                              {step.isCurrent && (
                                <div className="absolute inset-0 rounded-full border-2 border-gold animate-ping opacity-30" />
                              )}
                            </div>

                            <div className="flex-1 space-y-1 pt-1.5">
                              <h4 className={`text-base font-bold transition-colors ${step.isCompleted ? "text-charcoal" : "text-muted-foreground/30"}`}>
                                {step.title}
                              </h4>
                              <p className={`text-xs leading-relaxed transition-colors ${step.isCompleted ? "text-muted-foreground" : "text-muted-foreground/20"}`}>
                                {step.description}
                              </p>
                              {step.isCompleted && step.time !== "Pending" && (
                                <p className="text-[9px] text-gold font-bold uppercase tracking-widest mt-1 bg-gold/5 w-fit px-2 py-0.5 rounded-md">
                                  {step.time}
                                </p>
                              )}
                            </div>
                          </div>
                        ))}
                      </div>
                   </div>

                   {/* Right: Shipping Partner & Items */}
                   <div className="md:col-span-12 lg:col-span-4 space-y-6">
                      {/* Courier Partner */}
                      <div className="bg-white p-6 rounded-[2rem] border border-border shadow-sm space-y-5">
                         <div className="flex items-center gap-3">
                            <Box size={18} className="text-gold" />
                            <h3 className="text-[10px] font-bold text-charcoal uppercase tracking-widest">Shipping Partner</h3>
                         </div>
                         <div className="space-y-4">
                            <p className="text-base font-bold text-charcoal">{orderData.courier}</p>
                            <div className="flex items-center justify-between p-3 bg-muted/20 border border-border rounded-xl">
                               <div className="space-y-0.5">
                                  <p className="text-[8px] text-muted-foreground uppercase font-bold tracking-wider">Tracking ID</p>
                                  <p className="text-xs font-bold text-charcoal truncate max-w-[120px]">{orderData.trackingId}</p>
                               </div>
                               <button 
                                 onClick={() => copyToClipboard(orderData.trackingId)}
                                 className="p-2 hover:bg-white rounded-lg transition-all text-gold group"
                               >
                                 {copied ? <CheckCircle2 size={16} /> : <Copy size={16} className="group-hover:scale-110" />}
                               </button>
                            </div>
                         </div>
                      </div>

                       {/* Detailed History Log (Shiprocket Live) */}
                       {orderData.activities && orderData.activities.length > 0 && (
                         <div className="bg-white p-6 rounded-[2rem] border border-border shadow-sm space-y-5">
                            <div className="flex items-center gap-3">
                               <Clock size={14} className="text-gold" />
                               <h3 className="text-[10px] font-bold text-charcoal uppercase tracking-widest">Tracking History</h3>
                            </div>
                            <div className="space-y-6 max-h-[300px] overflow-y-auto pr-2 custom-scrollbar">
                               {orderData.activities.map((activity: any, i: number) => (
                                 <div key={i} className="flex gap-4 relative group">
                                    {i !== orderData.activities.length - 1 && (
                                      <div className="absolute left-[7px] top-4 bottom-[-24px] w-[1px] bg-border group-hover:bg-gold/20 transition-colors" />
                                    )}
                                    <div className="w-3.5 h-3.5 rounded-full border-2 border-gold/30 bg-white ring-4 ring-gold/5 flex-shrink-0 z-10 mt-1" />
                                    <div className="space-y-1 pb-4">
                                       <p className="text-[11px] font-bold text-charcoal">{activity.status}</p>
                                       <div className="flex flex-wrap items-center gap-x-3 gap-y-1">
                                          <p className="text-[9px] text-muted-foreground flex items-center gap-1">
                                             <Calendar size={10} /> {activity.date}
                                          </p>
                                          {activity.location && (
                                            <p className="text-[9px] text-gold font-bold flex items-center gap-1 uppercase tracking-tighter">
                                               <MapPin size={10} /> {activity.location}
                                            </p>
                                          )}
                                       </div>
                                       {activity.activity && (
                                         <p className="text-[10px] text-muted-foreground/60 leading-tight italic">{activity.activity}</p>
                                       )}
                                    </div>
                                 </div>
                               ))}
                            </div>
                         </div>
                       )}

                      {/* Item Preview */}
                      <div className="bg-white p-6 rounded-[2rem] border border-border shadow-sm space-y-5">
                         <div className="flex items-center gap-3">
                            <ShoppingBag size={18} className="text-gold" />
                            <h3 className="text-[10px] font-bold text-charcoal uppercase tracking-widest">Package Contents</h3>
                         </div>
                         <div className="space-y-4">
                            {orderData.items.map((item: any, i: number) => (
                              <div key={i} className="flex items-center gap-4 group">
                                 <div className="w-12 h-12 bg-muted rounded-lg border border-border p-1 flex-shrink-0 group-hover:border-gold transition-all">
                                    <img src={item.image} alt={item.name} className="w-full h-full object-contain" />
                                 </div>
                                 <div className="min-w-0">
                                    <p className="text-xs font-bold text-charcoal truncate">{item.name}</p>
                                    <p className="text-[10px] text-muted-foreground">Qty: {item.quantity}</p>
                                 </div>
                              </div>
                            ))}
                         </div>
                      </div>

                      {/* Support Hub */}
                      <div className="bg-charcoal p-6 rounded-[2.2rem] shadow-xl text-white space-y-6">
                         <div className="space-y-2">
                            <h3 className="text-lg font-display font-bold">Need assistance?</h3>
                            <p className="text-xs text-white/60 leading-relaxed italic">Our curators are always ready to help with your shipment.</p>
                         </div>
                         <div className="space-y-3">
                            <a 
                              href="https://wa.me/#"
                              target="_blank"
                              className="w-full py-3 bg-gold text-charcoal font-bold rounded-xl flex items-center justify-center gap-2 uppercase text-[9px] tracking-widest hover:brightness-110 transition-all active:scale-[0.98]"
                            >
                               <MessageCircle size={14} />
                               Talk to Expert
                            </a>
                            <button className="w-full py-3 bg-white/10 text-white font-bold rounded-xl flex items-center justify-center gap-2 uppercase text-[9px] tracking-widest hover:bg-white/20 transition-all">
                               Help Center
                            </button>
                         </div>
                      </div>
                   </div>
                </div>
              </motion.div>
            )}
          </AnimatePresence>
        </div>
      </main>

      <Footer />
    </div>
  );
};

export default TrackOrder;
