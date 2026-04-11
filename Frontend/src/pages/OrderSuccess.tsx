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

const OrderSuccess = () => {
  const [searchParams] = useSearchParams();
  const orderNumber = searchParams.get("orderNumber") || "LG-" + Math.floor(Math.random() * 1000000);
  const { clearCart } = useCart();

  React.useEffect(() => {
    clearCart();
  }, [clearCart]);

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

      <main className="flex-1 container mx-auto px-4 py-32 flex items-center justify-center relative z-10">
        <motion.div 
          initial={{ opacity: 0, y: 50, scale: 0.9 }}
          animate={{ opacity: 1, y: 0, scale: 1 }}
          transition={{ duration: 1, ease: [0.16, 1, 0.3, 1] }}
          className="max-w-xl w-full bg-white/40 backdrop-blur-3xl p-12 md:p-20 rounded-[4rem] shadow-ethereal border border-white/50 text-center space-y-12 relative overflow-hidden"
        >
          {/* Decorative Sparkles */}
          <div className="absolute top-10 left-10 text-gold/20 animate-pulse"><Sparkles size={24} /></div>
          <div className="absolute bottom-10 right-10 text-gold/20 animate-pulse delay-700"><Heart size={20} /></div>

          <div className="relative mx-auto w-32 h-32">
            <motion.div 
              initial={{ scale: 0, rotate: -20 }}
              animate={{ scale: 1, rotate: 0 }}
              transition={{ type: "spring", stiffness: 200, delay: 0.4 }}
              className="w-full h-full bg-gold rounded-full flex items-center justify-center text-white shadow-2xl relative z-10"
            >
              <CheckCircle2 size={60} strokeWidth={1} />
            </motion.div>
            <div className="absolute inset-0 bg-gold/30 rounded-full blur-3xl animate-ping opacity-20" />
          </div>
          
          <div className="space-y-4">
            <h1 className="font-display text-5xl md:text-6xl font-light text-charcoal tracking-tight">Order <span className="text-gold italic font-normal">Placed</span></h1>
            <p className="text-muted-foreground/60 font-body text-lg italic max-w-sm mx-auto leading-relaxed">
              Your curated selection has been successfully recorded in our boutique database.
            </p>
          </div>

          <div className="py-8 px-10 bg-white/60 rounded-[2.5rem] border border-gold/10 inline-block shadow-sm">
            <p className="text-[10px] font-body font-bold text-gold/60 uppercase tracking-[0.5em] mb-2 leading-none">Your Order Number</p>
            <p className="font-display text-4xl text-charcoal tracking-tighter">{orderNumber}</p>
          </div>

          <div className="pt-6 space-y-6">
            <Link 
              to="/products"
              className="group w-full flex items-center justify-center gap-4 px-12 py-5 bg-charcoal text-white rounded-xl font-body font-bold uppercase tracking-[0.3em] text-[10px] hover:bg-gold hover:text-charcoal transition-all duration-700 shadow-2xl"
            >
              Continue Your Journey <ArrowRight size={18} className="transition-transform group-hover:translate-x-2" />
            </Link>

            <a 
              href={`https://shiprocket.co/tracking/${orderNumber.replace('#', '')}`}
              target="_blank"
              rel="noopener noreferrer"
              className="group w-full flex items-center justify-center gap-4 px-12 py-5 border border-gold/30 text-gold rounded-xl font-body font-bold uppercase tracking-[0.3em] text-[10px] hover:bg-gold hover:text-charcoal transition-all duration-500 shadow-lg shadow-gold/5"
            >
              Track Order <ExternalLink size={18} className="transition-transform group-hover:translate-x-1" />
            </a>
            
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
