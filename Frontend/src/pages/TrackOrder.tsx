import { useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { 
  Package, Truck, CheckCircle2, Search, MapPin, 
  Calendar, ShoppingBag, ArrowRight, ShieldCheck, 
  HelpCircle, ChevronRight, Clock, Box, Mail, Sparkles
} from "lucide-react";
import Header from "@/components/Header";
import Footer from "@/components/Footer";
import WhatsAppButton from "@/components/WhatsAppButton";
import { Link } from "react-router-dom";

const trackingSteps = [
  { id: 1, title: "Order Confirmed", description: "Payment received & confirmed", icon: <CheckCircle2 size={24} />, time: "9:30 AM, March 29" },
  { id: 2, title: "Preparing Treasures", description: "Curating your skincare rituals", icon: <Box size={24} />, time: "2:15 PM, March 29" },
  { id: 3, title: "Shipped", description: "In transit to your sanctuary", icon: <Truck size={24} />, time: "11:00 AM, March 30" },
  { id: 4, title: "Out for Delivery", description: "Approaching your doorstep", icon: <MapPin size={24} />, time: "In Progress" },
  { id: 5, title: "Delivered", description: "Radiance reaches you", icon: <Package size={24} />, time: "Pending" }
];

const TrackOrder = () => {
  const [orderId, setOrderId] = useState("");
  const [email, setEmail] = useState("");
  const [isTracking, setIsTracking] = useState(false);
  const [loading, setLoading] = useState(false);

  const handleTrack = (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    // Simulate API delay
    setTimeout(() => {
      setIsTracking(true);
      setLoading(false);
    }, 1500);
  };

  return (
    <div className="min-h-screen bg-[#faf9f6]">
      <Header />
      
      <main>
        {/* Luxury Hero Background */}
        <section className="relative pt-24 pb-16 md:pt-32 md:pb-20 overflow-hidden bg-charcoal">
          <div className="absolute top-0 right-0 w-[600px] h-[600px] bg-gold/10 rounded-full blur-[120px] -translate-y-1/2 translate-x-1/4 opacity-40" />
          <div className="absolute bottom-0 left-0 w-[400px] h-[400px] bg-rose-light/10 rounded-full blur-[100px] translate-y-1/2 -translate-x-1/4 opacity-30" />
          
          <div className="container mx-auto px-4 md:px-6 relative z-10 text-center">
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 1 }}
              className="space-y-6 max-w-3xl mx-auto"
            >
              <div className="flex items-center justify-center gap-3 text-gold">
                <div className="h-[1px] w-6 md:w-8 bg-gold" />
                <span className="text-[9px] md:text-[10px] font-body font-bold uppercase tracking-[0.3em]">Concierge Services</span>
                <div className="h-[1px] w-6 md:w-8 bg-gold" />
              </div>
              <h1 className="font-display text-3xl sm:text-4xl md:text-6xl lg:text-7xl font-bold text-white tracking-tight leading-tight md:leading-[1.1]">
                Track Your <span className="text-gradient-gold italic font-light">Glow Journey</span>
              </h1>
              <p className="text-white/60 font-body text-sm md:text-lg max-w-xl mx-auto italic">
                "Anticipation is the first step of the ritual. Follow your curated treasures as they travel from our vault to your vanity."
              </p>
            </motion.div>
          </div>
        </section>

        {/* Tracking Input Card */}
        <section className="container mx-auto px-4 md:px-6 -mt-8 md:-mt-12 relative z-20 pb-20 md:pb-24">
          <AnimatePresence mode="wait">
            {!isTracking ? (
              <motion.div
                key="track-form"
                initial={{ opacity: 0, y: 40 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, scale: 0.95 }}
                className="max-w-4xl mx-auto bg-white rounded-[2.5rem] md:rounded-[3rem] p-6 sm:p-8 lg:p-16 shadow-ethereal border border-gold/10"
              >
                <form onSubmit={handleTrack} className="grid grid-cols-1 md:grid-cols-2 gap-6 md:gap-8 items-end">
                  <div className="space-y-4">
                    <label className="text-[10px] font-body font-bold text-charcoal uppercase tracking-widest pl-2">Order ID</label>
                    <div className="relative">
                      <ShoppingBag className="absolute left-6 top-1/2 -translate-y-1/2 text-gold" size={18} />
                      <input
                        required
                        type="text"
                        placeholder="e.g. #LUC-7890"
                        className="w-full bg-[#f8f8f8] border border-transparent rounded-xl md:rounded-2xl py-4 md:py-6 pl-14 md:pl-16 pr-6 font-body focus:bg-white focus:border-gold/30 outline-none transition-all text-sm"
                        value={orderId}
                        onChange={(e) => setOrderId(e.target.value)}
                      />
                    </div>
                  </div>
                  <div className="space-y-4">
                    <label className="text-[10px] font-body font-bold text-charcoal uppercase tracking-widest pl-2">Email Address</label>
                    <div className="relative">
                      <Mail className="absolute left-6 top-1/2 -translate-y-1/2 text-gold" size={18} />
                      <input
                        required
                        type="email"
                        placeholder="your@email.com"
                        className="w-full bg-[#f8f8f8] border border-transparent rounded-xl md:rounded-2xl py-4 md:py-6 pl-14 md:pl-16 pr-6 font-body focus:bg-white focus:border-gold/30 outline-none transition-all text-sm"
                        value={email}
                        onChange={(e) => setEmail(e.target.value)}
                      />
                    </div>
                  </div>
                  <div className="md:col-span-2 pt-4">
                    <button
                      disabled={loading}
                      type="submit"
                      className="w-full py-4 md:py-6 bg-charcoal text-white font-body font-bold uppercase tracking-[0.25em] rounded-xl md:rounded-2xl hover:bg-gold hover:text-charcoal transition-all duration-500 shadow-2xl flex items-center justify-center gap-3 relative overflow-hidden text-xs md:text-sm"
                    >
                      {loading ? (
                        <div className="w-6 h-6 border-2 border-white/30 border-t-white rounded-full animate-spin" />
                      ) : (
                        <>
                          <Search size={18} />
                          <span>Track Now</span>
                        </>
                      )}
                    </button>
                  </div>
                </form>

                <div className="mt-12 pt-12 border-t border-border/50 grid grid-cols-1 md:grid-cols-2 gap-8 text-center md:text-left">
                  <div className="flex items-start gap-4">
                    <div className="w-10 h-10 rounded-full bg-gold/10 flex items-center justify-center flex-shrink-0 text-gold">
                      <ShieldCheck size={20} />
                    </div>
                    <div>
                      <p className="font-body font-bold text-[10px] uppercase tracking-widest mb-1">Encrypted Access</p>
                      <p className="text-xs text-muted-foreground">Only authorized access to order details via validated email pairing.</p>
                    </div>
                  </div>
                  <div className="flex items-start gap-4">
                    <div className="w-10 h-10 rounded-full bg-gold/10 flex items-center justify-center flex-shrink-0 text-gold">
                      <HelpCircle size={20} />
                    </div>
                    <div>
                      <p className="font-body font-bold text-[10px] uppercase tracking-widest mb-1">Concierge Help</p>
                      <p className="text-xs text-muted-foreground">Having trouble? Our consultants are available via WhatsApp 24/7.</p>
                    </div>
                  </div>
                </div>
              </motion.div>
            ) : (
              <motion.div
                key="track-results"
                initial={{ opacity: 0, scale: 0.95 }}
                animate={{ opacity: 1, scale: 1 }}
                className="max-w-5xl mx-auto space-y-8"
              >
                {/* Status Bar */}
                <div className="bg-white rounded-[2rem] md:rounded-[3rem] p-6 md:p-8 lg:p-12 shadow-ethereal border border-gold/10 flex flex-col md:flex-row flex-wrap items-center justify-between gap-6 md:gap-8">
                  <div className="text-center md:text-left">
                    <p className="text-[9px] md:text-[10px] font-body font-bold text-gold uppercase tracking-[0.2em] mb-1">Current Status</p>
                    <h2 className="font-display text-2xl md:text-3xl font-bold flex items-center justify-center md:justify-start gap-3">
                      <Truck size={28} className="text-gold" />
                      In Transit
                    </h2>
                  </div>
                  <div className="w-px h-12 bg-border/50 hidden lg:block" />
                  <div className="text-center md:text-left">
                    <p className="text-[9px] md:text-[10px] font-body font-bold text-muted-foreground uppercase tracking-[0.2em] mb-1">Order Identifier</p>
                    <p className="font-body font-bold text-base md:text-lg">{orderId || "#LUC-7890-GLOW"}</p>
                  </div>
                  <div className="w-px h-12 bg-border/50 hidden lg:block" />
                  <div className="text-center md:text-left">
                    <p className="text-[9px] md:text-[10px] font-body font-bold text-muted-foreground uppercase tracking-[0.2em] mb-1">Estimated Arrival</p>
                    <p className="font-body font-bold text-base md:text-lg flex items-center justify-center md:justify-start gap-2">
                       <Calendar size={18} className="text-gold" /> April 1, 2026
                    </p>
                  </div>
                  <button 
                    onClick={() => setIsTracking(false)}
                    className="p-3 md:p-4 rounded-full border border-gold/10 hover:bg-gold/5 transition-colors group"
                  >
                    <RefreshCw size={20} className="text-gold group-hover:rotate-180 transition-transform duration-700" />
                  </button>
                </div>

                {/* Animated Timeline Stage */}
                <div className="bg-white rounded-[2.5rem] md:rounded-[4rem] p-6 sm:p-8 md:p-12 lg:p-20 shadow-ethereal border border-gold/10 relative overflow-hidden">
                  <div className="absolute top-0 left-0 w-full h-1 md:h-1.5 bg-secondary overflow-hidden">
                      <motion.div 
                        initial={{ width: 0 }}
                        animate={{ width: "55%" }}
                        transition={{ duration: 1.5, delay: 0.5 }}
                        className="h-full bg-gold shadow-[0_0_15px_rgba(182,143,76,0.5)]"
                      />
                  </div>

                  <div className="flex flex-col md:grid md:grid-cols-5 gap-10 md:gap-12 relative">
                    {trackingSteps.map((step, i) => {
                      const isActive = step.id <= 3;
                      const isCurrent = step.id === 3;
                      
                      return (
                        <div key={step.id} className="relative group flex md:block items-center gap-6 md:gap-0">
                          <div className={`w-12 h-12 md:w-16 md:h-16 rounded-2xl md:rounded-3xl flex-shrink-0 md:mx-auto mb-0 md:mb-6 flex items-center justify-center transition-all duration-700 relative z-10 ${
                            isActive 
                              ? "bg-gold text-white shadow-lg md:shadow-xl shadow-gold/20" 
                              : "bg-secondary text-muted-foreground/40 border border-border"
                          }`}>
                            <div className="scale-75 md:scale-100">
                              {step.icon}
                            </div>
                            {isCurrent && (
                              <div className="absolute inset-0 rounded-2xl md:rounded-3xl border-2 md:border-4 border-gold animate-ping opacity-20" />
                            )}
                          </div>
                          <div className="text-left md:text-center space-y-1 md:space-y-2">
                            <p className={`font-body font-bold text-[9px] md:text-[10px] uppercase tracking-[0.15em] ${isActive ? "text-charcoal" : "text-muted-foreground/40"}`}>
                              {step.title}
                            </p>
                            <p className="text-[8px] md:text-[9px] font-body text-muted-foreground leading-tight italic">
                              {step.description}
                            </p>
                            <div className={`flex items-center justify-start md:justify-center gap-1.5 text-[7px] md:text-[8px] font-body font-bold uppercase tracking-widest pt-1 md:pt-2 ${isActive ? "text-gold" : "text-muted-foreground/20"}`}>
                              <Clock size={10} /> {step.time}
                            </div>
                          </div>
                          {i < trackingSteps.length - 1 && (
                            <>
                              <div className="hidden md:block absolute top-[31px] left-[calc(50%+32px)] w-[calc(100%-64px)] h-[2px] bg-secondary" />
                              <div className="md:hidden absolute top-[48px] left-[23px] w-[2px] h-[calc(100%-48px+40px)] bg-secondary" />
                            </>
                          )}
                        </div>
                      );
                    })}
                  </div>
                </div>

                <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
                  <div className="lg:col-span-2 bg-[#f4f2ee] rounded-[2.5rem] md:rounded-[3rem] p-8 md:p-12 border border-gold/5 flex flex-col md:flex-row items-center justify-between gap-8 md:gap-12 overflow-hidden relative">
                    <div className="space-y-4 md:space-y-6 relative z-10 text-center md:text-left">
                      <div className="flex items-center justify-center md:justify-start gap-3 text-gold">
                         <Sparkles size={18} />
                         <span className="text-[10px] font-body font-bold uppercase tracking-[0.2em]">Live Location</span>
                      </div>
                      <h3 className="font-display text-3xl md:text-4xl font-bold">Mumbai Vault <br /><span className="text-gold italic font-light">Processing</span></h3>
                      <button className="flex items-center justify-center md:justify-start gap-3 text-[10px] font-body font-bold uppercase tracking-widest text-charcoal hover:text-gold transition-colors mx-auto md:mx-0">
                        View Detailed Log <ArrowRight size={14} />
                      </button>
                    </div>
                    <div className="w-full md:w-1/2 absolute -right-10 md:-right-20 top-0 bottom-0 opacity-5 md:opacity-10 pointer-events-none">
                       <MapPin size={400} className="text-charcoal" />
                    </div>
                  </div>

                  <div className="bg-charcoal rounded-[2.5rem] md:rounded-[3rem] p-8 md:p-12 text-white space-y-6 md:space-y-8">
                    <p className="text-[10px] font-body font-bold text-gold/60 uppercase tracking-[0.2em]">Package Insight</p>
                    <div className="space-y-4">
                      <div className="flex justify-between items-center pb-4 border-b border-white/5">
                        <span className="text-[10px] text-white/40 uppercase">Weight</span>
                        <span className="font-body font-bold">1.2 kg</span>
                      </div>
                      <div className="flex justify-between items-center pb-4 border-b border-white/5">
                        <span className="text-[10px] text-white/40 uppercase">Carrier</span>
                        <span className="font-body font-bold text-sm">Lucsent Express</span>
                      </div>
                      <div className="flex justify-between items-center">
                        <span className="text-[10px] text-white/40 uppercase">Method</span>
                        <span className="font-body font-bold text-sm text-gold">Priority Air</span>
                      </div>
                    </div>
                    <div className="pt-4">
                      <Link to="/products" className="w-full py-4 bg-white/5 border border-white/10 rounded-xl md:rounded-2xl flex items-center justify-center gap-3 text-[10px] font-bold uppercase tracking-widest hover:bg-gold hover:text-charcoal transition-all duration-500">
                        Continue Shopping
                      </Link>
                    </div>
                  </div>
                </div>
              </motion.div>
            )}
          </AnimatePresence>
        </section>

        {/* Global Support Call */}
        <section className="py-16 md:py-24 lg:py-40 relative">
          <div className="container mx-auto px-4 md:px-6 text-center">
            <motion.div
               initial={{ opacity: 0 }}
               whileInView={{ opacity: 1 }}
               viewport={{ once: true }}
               className="max-w-4xl mx-auto space-y-8 md:space-y-12"
            >
              <div className="space-y-4 md:space-y-6">
                <h2 className="font-display text-3xl sm:text-4xl md:text-6xl lg:text-7xl font-bold text-charcoal tracking-tight leading-tight">Need <span className="text-gradient-gold italic font-light">Assistance?</span></h2>
                <p className="text-sm md:text-lg text-muted-foreground font-body max-w-xl mx-auto italic">
                  "Questions about your gems? Our radiance consultants are on standby to ensure your delivery is as smooth as our textures."
                </p>
              </div>
              
              <div className="flex flex-col sm:flex-row justify-center items-center gap-4 md:gap-8">
                <a href="#whatsapp" className="w-full sm:w-auto flex items-center justify-center gap-4 px-8 md:px-10 py-4 md:py-5 bg-[#25D366] text-white rounded-full font-body font-bold uppercase tracking-widest text-[10px] md:text-xs hover:shadow-2xl hover:translate-y-[-4px] transition-all">
                  WhatsApp Support
                </a>
                <Link to="/contact" className="w-full sm:w-auto flex items-center justify-center gap-4 px-8 md:px-10 py-4 md:py-5 border border-charcoal text-charcoal rounded-full font-body font-bold uppercase tracking-widest text-[10px] md:text-xs hover:bg-charcoal hover:text-white transition-all">
                  Contact Concierge
                </Link>
              </div>
            </motion.div>
          </div>
        </section>
      </main>

      <Footer />
      <WhatsAppButton />
    </div>
  );
};

const RefreshCw = ({ size, className }: { size: number; className?: string }) => (
  <svg 
    xmlns="http://www.w3.org/2000/svg" 
    width={size} 
    height={size} 
    viewBox="0 0 24 24" 
    fill="none" 
    stroke="currentColor" 
    strokeWidth="2" 
    strokeLinecap="round" 
    strokeLinejoin="round" 
    className={className}
  >
    <path d="M3 12a9 9 0 0 1 9-9 9.75 9.75 0 0 1 6.74 2.74L21 8" />
    <path d="M21 3v5h-5" />
    <path d="M21 12a9 9 0 0 1-9 9 9.75 9.75 0 0 1-6.74-2.74L3 16" />
    <path d="M3 21v-5h5" />
  </svg>
);

export default TrackOrder;
