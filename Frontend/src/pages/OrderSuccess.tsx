import React from "react";
import { Link, useSearchParams } from "react-router-dom";
import { motion } from "framer-motion";
import { 
  CheckCircle2, 
  ArrowRight, 
  ShoppingBag,
  Sparkles,
  Heart,
  ExternalLink
} from "lucide-react";
import Header from "@/components/Header";
import Footer from "@/components/Footer";
import { useCart } from "@/context/CartContext";
import { toast } from "sonner";
import { Copy, Check } from "lucide-react";

const OrderSuccess = () => {
  const [searchParams] = useSearchParams();
  const orderNumber = searchParams.get("orderNumber") || "LG-" + Math.floor(Math.random() * 1000000);
  const { clearCart } = useCart();
  const [copied, setCopied] = React.useState(false);
  const hasCopied = React.useRef(false);

  const handleCopy = () => {
    navigator.clipboard.writeText(orderNumber);
    setCopied(true);
    toast.success("Order number copied to clipboard!");
    setTimeout(() => setCopied(false), 2000);
  };

  React.useEffect(() => {
    clearCart();
    // Automatic copy - only once
    if (orderNumber && !hasCopied.current) {
      navigator.clipboard.writeText(orderNumber);
      toast.info("Order number automatically copied!");
      hasCopied.current = true;
    }
  }, [clearCart, orderNumber]);

  return (
    <div className="min-h-screen bg-[#faf9f6] flex flex-col relative overflow-hidden">
      <Header />
      
      {/* Luxury Aura Background */}
      <div className="absolute inset-0 pointer-events-none overflow-hidden select-none z-0">
        <motion.div 
          animate={{ scale: [1, 1.2, 1], opacity: [0.3, 0.5, 0.3] }}
          transition={{ duration: 15, repeat: Infinity }}
          className="absolute top-[-10%] right-[-10%] w-[50%] h-[50%] bg-gold/10 rounded-full blur-[120px]" 
        />
        <motion.div 
          animate={{ scale: [1, 1.1, 1], opacity: [0.2, 0.4, 0.2] }}
          transition={{ duration: 20, repeat: Infinity }}
          className="absolute bottom-0 left-0 w-[40%] h-[40%] bg-rose-light/10 rounded-full blur-[100px]" 
        />
      </div>

      <main className="flex-1 container mx-auto px-4 py-8 md:py-12 flex items-center justify-center relative z-10">
        <motion.div 
          initial={{ opacity: 0, y: 50, scale: 0.9 }}
          animate={{ opacity: 1, y: 0, scale: 1 }}
          transition={{ duration: 1, ease: [0.16, 1, 0.3, 1] }}
          className="max-w-xl w-full bg-white/40 backdrop-blur-3xl p-6 md:p-10 rounded-[2.5rem] shadow-ethereal border border-white/50 text-center space-y-6 relative overflow-hidden"
        >
          {/* Decorative Sparkles */}
          <div className="absolute top-10 left-10 text-gold/20 animate-pulse"><Sparkles size={24} /></div>
          <div className="absolute bottom-10 right-10 text-gold/20 animate-pulse delay-700"><Heart size={20} /></div>

          <div className="relative mx-auto w-20 h-20">
            <motion.div 
              initial={{ scale: 0, rotate: -20 }}
              animate={{ scale: 1, rotate: 0 }}
              transition={{ type: "spring", stiffness: 200, delay: 0.4 }}
              className="w-full h-full bg-gold rounded-full flex items-center justify-center text-white shadow-2xl relative z-10"
            >
              <CheckCircle2 size={40} strokeWidth={1} />
            </motion.div>
            <div className="absolute inset-0 bg-gold/30 rounded-full blur-3xl animate-ping opacity-20" />
          </div>
          
          <div className="space-y-1.5">
            <h1 className="font-display text-4xl md:text-5xl font-light text-charcoal tracking-tight">Order <span className="text-gold italic font-normal">Placed</span></h1>
            <p className="text-muted-foreground/60 font-body text-base italic max-w-sm mx-auto leading-relaxed">
              Your curated selection has been successfully recorded in our boutique database.
            </p>
          </div>

          <div className="py-5 px-8 bg-white/60 rounded-[1.5rem] border border-gold/10 inline-flex flex-col items-center shadow-sm relative group">
            <p className="text-[10px] font-body font-bold text-gold/60 uppercase tracking-[0.5em] mb-2 leading-none">Your Order Number</p>
            <div className="flex items-center gap-4">
              <p className="font-display text-4xl text-charcoal tracking-tighter">{orderNumber}</p>
              <button 
                onClick={handleCopy}
                className="p-2 bg-gold/5 hover:bg-gold/10 text-gold rounded-lg transition-all group-hover:scale-110 active:scale-95 border border-gold/10"
                title="Copy Order Number"
              >
                {copied ? <Check size={18} /> : <Copy size={18} />}
              </button>
            </div>
          </div>

          <div className="pt-4 space-y-4">
            <Link 
              to="/products"
              className="group w-full flex items-center justify-center gap-4 px-12 py-5 bg-charcoal text-white rounded-xl font-body font-bold uppercase tracking-[0.3em] text-[10px] hover:bg-gold hover:text-charcoal transition-all duration-700 shadow-2xl"
            >
              Continue Your Journey <ArrowRight size={18} className="transition-transform group-hover:translate-x-2" />
            </Link>

            <Link 
              to={`/track-order?orderId=${orderNumber.replace('#', '')}&auto=true`}
              className="group w-full flex items-center justify-center gap-4 px-12 py-5 border border-gold/30 text-gold rounded-xl font-body font-bold uppercase tracking-[0.3em] text-[10px] hover:bg-gold hover:text-charcoal transition-all duration-500 shadow-lg shadow-gold/5"
            >
              Track Order <ExternalLink size={18} className="transition-transform group-hover:translate-x-1" />
            </Link>
            
            <Link 
              to="/orders"
              className="block text-[11px] font-body font-bold text-gold hover:text-charcoal uppercase tracking-[0.4em] transition-all"
            >
              View All Orders
            </Link>
          </div>
        </motion.div>
      </main>

      <Footer />
    </div>
  );
};

export default OrderSuccess;
