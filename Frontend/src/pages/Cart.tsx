import React from "react";
import { Link, useNavigate } from "react-router-dom";
import { motion, AnimatePresence } from "framer-motion";
import { 
  Trash2, 
  Minus, 
  Plus, 
  ShoppingBag, 
  ArrowRight, 
  Truck, 
  ShieldCheck, 
  CreditCard,
  ChevronLeft,
  CheckCircle2,
  Heart,
  ChevronRight,
  Tag,
  Copy,
  Check,
  Sparkles,
  MapPin,
  Settings
} from "lucide-react";
import { 
  Dialog, 
  DialogContent, 
  DialogHeader, 
  DialogTitle, 
  DialogTrigger,
  DialogClose 
} from "@/components/ui/dialog";
import { toast } from "sonner";
import { getApiUrl, getAssetUrl } from "@/lib/api";
import Header from "@/components/Header";
import Footer from "@/components/Footer";
import WhatsAppButton from "@/components/WhatsAppButton";
import { useCart } from "@/context/CartContext";
import { useAuth } from "@/context/AuthContext";
import { load } from '@cashfreepayments/cashfree-js';

const Cart = () => {
  const { 
    items, 
    removeItem, 
    updateQuantity, 
    subtotal, 
    totalItems, 
    clearCart,
    appliedCoupon,
    applyCoupon,
    removeCoupon,
    discountAmount,
    appliedGiftCard,
    applyGiftCard,
    removeGiftCard,
    giftCardDiscount,
    receivedGiftCards,
    availableCoupons,
    fetchReceivedGiftCards
  } = useCart();
  const { user } = useAuth();
  
  const navigate = useNavigate();
  const [couponInput, setCouponInput] = React.useState("");
  const [giftCardInput, setGiftCardInput] = React.useState("");
  const [isCouponsModalOpen, setIsCouponsModalOpen] = React.useState(false);
  const [isPlacingOrder, setIsPlacingOrder] = React.useState(false);
  const [orderComplete, setOrderComplete] = React.useState(false);

  const shipping = subtotal >= 999 ? 0 : 50; 
  const tax = 0; 
  const total = Math.max(0, subtotal + shipping + tax - discountAmount - giftCardDiscount);

  const handleApplyGiftCard = () => {
    if (!giftCardInput.trim()) return;
    applyGiftCard(giftCardInput);
    setGiftCardInput("");
  };

  const handleCompletePurchase = () => {
    navigate("/checkout");
  };

  const freeShippingThreshold = 999;
  const progressToFreeShipping = Math.min((subtotal / freeShippingThreshold) * 100, 100);

  if (orderComplete) {
    return (
      <div className="min-h-screen bg-[#faf9f6]">
        <Header />
        <main className="container mx-auto px-4 py-32 text-center">
          <motion.div 
            initial={{ opacity: 0, y: 50 }}
            animate={{ opacity: 1, y: 0 }}
            className="max-w-2xl mx-auto space-y-10 py-20 px-10 glass-gold rounded-[4rem] shadow-ethereal border border-white/40"
          >
            <div className="relative mx-auto w-32 h-32">
              <motion.div 
                initial={{ scale: 0 }}
                animate={{ scale: 1 }}
                transition={{ type: "spring", stiffness: 200, delay: 0.2 }}
                className="w-full h-full bg-gold rounded-full flex items-center justify-center text-primary shadow-2xl relative z-10"
              >
                <CheckCircle2 size={60} strokeWidth={1} />
              </motion.div>
              <div className="absolute inset-0 bg-gold/20 rounded-full blur-3xl animate-pulse" />
            </div>
            
            <div className="space-y-4">
              <h1 className="font-display text-5xl md:text-6xl font-light text-foreground tracking-tight">Order <span className="italic font-normal">Placed</span></h1>
              <p className="text-muted-foreground font-body text-lg max-w-md mx-auto leading-relaxed">
                Your curated selection has been successfully recorded in our orders database.
              </p>
            </div>

            <div className="pt-6">
              <Link 
                to="/products"
                className="group inline-flex items-center gap-4 px-12 py-5 bg-primary text-primary-foreground rounded-full font-body font-bold uppercase tracking-[0.2em] text-xs hover:bg-gold transition-all duration-700 shadow-2xl"
              >
                Continue Your Journey <ArrowRight size={18} className="transition-transform group-hover:translate-x-2" />
              </Link>
            </div>
          </motion.div>
        </main>
        <Footer />
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-[#faf9f6] relative overflow-hidden">
      <Header />
      
      {/* Luxury Aura Background Elements */}
      <div className="fixed inset-0 pointer-events-none overflow-hidden select-none z-0">
        <motion.div 
          animate={{ 
            x: [0, 40, 0],
            y: [0, 60, 0],
            scale: [1, 1.2, 1]
          }}
          transition={{ duration: 22, repeat: Infinity, ease: "linear" }}
          className="absolute top-[-5%] right-[-5%] w-[45%] h-[45%] bg-gold/10 rounded-full blur-[130px] opacity-40" 
        />
        <motion.div 
          animate={{ 
            x: [0, -30, 0],
            y: [0, 40, 0],
            scale: [1, 1.1, 1]
          }}
          transition={{ duration: 28, repeat: Infinity, ease: "linear" }}
          className="absolute bottom-[5%] left-[-10%] w-[50%] h-[50%] bg-rose-light/10 rounded-full blur-[110px] opacity-35" 
        />
      </div>

      <main className="container mx-auto px-4 py-12 lg:py-24 relative z-10">
        <div className="max-w-7xl mx-auto">
          {/* Header Section */}
          <div className="flex flex-col md:flex-row md:items-end justify-between mb-16 md:mb-24 gap-10">
            <div className="space-y-4">
              <Link to="/products" className="inline-flex items-center gap-3 text-gold hover:gap-5 transition-all text-[11px] md:text-xs font-body font-bold uppercase tracking-[0.3em] mb-4 group">
                <ChevronLeft size={16} className="group-hover:-translate-x-1 transition-transform" /> Back to Collection
              </Link>
              <div className="space-y-1">
                <div className="flex items-center gap-3 text-gold">
                  <Sparkles size={14} className="opacity-50" />
                  <span className="text-[9px] font-body font-bold uppercase tracking-[0.4em]">Special Selections</span>
                </div>
                <h1 className="font-display text-5xl md:text-7xl lg:text-8xl font-bold text-charcoal tracking-tight lowercase leading-[0.9]">
                  Shopping <span className="text-gold italic font-light">Bag</span>
                </h1>
              </div>
            </div>
            <div className="hidden md:flex flex-col items-end gap-3 pb-2">
              <div className="flex items-center gap-4 bg-white/40 backdrop-blur-md px-6 py-3 rounded-full border border-white/50 shadow-sm">
                <ShoppingBag size={18} className="text-gold" />
                <p className="text-[10px] font-body font-bold text-charcoal uppercase tracking-[0.3em]">{totalItems} Total Items</p>
              </div>
            </div>
          </div>

          {items.length === 0 ? (
            <motion.div 
              initial={{ opacity: 0, scale: 0.95 }}
              animate={{ opacity: 1, scale: 1 }}
              className="text-center py-24 lg:py-40 bg-white/40 backdrop-blur-3xl border border-white/50 rounded-[3rem] shadow-ethereal relative overflow-hidden"
            >
              <div className="absolute top-0 right-0 w-64 h-64 bg-gold/5 rounded-full blur-3xl -translate-y-1/2 translate-x-1/2 pointer-events-none" />
              <div className="w-24 h-24 bg-gold/5 rounded-full flex items-center justify-center mx-auto mb-10 text-gold/40">
                <ShoppingBag size={48} strokeWidth={1} />
              </div>
              <h2 className="font-display text-4xl font-light mb-6 text-charcoal tracking-tight">Your collection is empty<span className="text-gold">.</span></h2>
              <p className="text-muted-foreground/60 font-body mb-10 max-w-sm mx-auto leading-relaxed italic text-sm text-center">
                Discover our latest arrivals in skincare and makeup, curated for your perfect glow.
              </p>
              <Link 
                to="/products"
                className="inline-flex items-center gap-4 px-12 py-5 bg-charcoal text-white rounded-full font-body font-bold uppercase tracking-[0.2em] text-[10px] hover:bg-gold hover:text-charcoal transition-all duration-700 shadow-2xl"
              >
                Explore Collection <ArrowRight size={18} />
              </Link>
            </motion.div>
          ) : (
            <div className="grid lg:grid-cols-12 gap-12 lg:gap-20 items-start">
              {/* Items List */}
              <div className="lg:col-span-7 space-y-12">
                <AnimatePresence mode="popLayout">
                  {items.map((item, index) => (
                    <motion.div
                      key={`${item.id}-${item.selectedShade}-${item.selectedSize}`}
                      layout
                      initial={{ opacity: 0, y: 30 }}
                      animate={{ opacity: 1, y: 0 }}
                      exit={{ opacity: 0, x: -100, transition: { duration: 0.5 } }}
                      transition={{ delay: index * 0.1, duration: 0.8, ease: [0.16, 1, 0.3, 1] }}
                      className="group relative"
                    >
                      <div className="flex gap-6 lg:gap-10 items-center p-6 md:p-8 bg-white/70 backdrop-blur-3xl rounded-[2rem] md:rounded-[2.5rem] border border-white/50 shadow-ethereal hover:shadow-2xl transition-all duration-700 relative overflow-hidden">
                        <div className="absolute top-0 right-0 w-32 h-32 bg-gold/5 rounded-full blur-3xl -translate-y-1/2 translate-x-1/2 pointer-events-none" />
                        
                        <div className={`relative ${item.category === "Gift Cards" ? "aspect-[16/10] w-28 md:w-48" : "w-24 h-32 md:w-36 md:h-48"} bg-[#f8f8f8] rounded-xl md:rounded-2xl overflow-hidden flex-shrink-0 shadow-lg group-hover:shadow-2xl transition-all duration-1000 group-hover:translate-x-2`}>
                          <img src={getAssetUrl(item.image)} alt={item.name} className="w-full h-full object-cover transition-transform duration-1000 group-hover:scale-110" />
                        </div>
                        
                        <div className="flex-1 min-w-0 flex flex-col lg:flex-row lg:items-center justify-between gap-8 lg:gap-12 pl-2">
                          <div className="space-y-4 flex-1 min-w-0">
                            <div>
                              <div className="flex items-center gap-2 mb-2">
                                <span className="w-6 h-[1px] bg-gold/30" />
                                <p className="text-[9px] font-body font-bold text-gold uppercase tracking-[0.4em] leading-none">{item.category}</p>
                              </div>
                              <h3 className="font-display text-2xl md:text-3xl lg:text-4xl font-bold text-charcoal leading-tight truncate tracking-tight lowercase">
                                {item.name}<span className="text-gold italic font-light">.</span>
                              </h3>
                              
                              <div className="flex flex-wrap gap-2 mt-4">
                                {item.selectedShade && (
                                  <span className="text-[9px] font-body font-bold uppercase tracking-widest text-muted-foreground/60 bg-gold/5 px-3 py-1 rounded-full border border-gold/5">{item.selectedShade}</span>
                                )}
                                {item.selectedSize && (
                                  <span className="text-[9px] font-body font-bold uppercase tracking-widest text-muted-foreground/60 bg-gold/5 px-3 py-1 rounded-full border border-gold/5">{item.selectedSize}</span>
                                )}
                              </div>
                            </div>

                            <div className="flex items-center gap-6 mt-6">
                              <div className="flex items-center bg-white/40 backdrop-blur-md border border-gold/5 rounded-xl p-1 shadow-sm">
                                <button onClick={() => updateQuantity(item.id, item.quantity - 1, item.selectedShade, item.selectedSize, item.metadata)} className="w-8 h-8 flex items-center justify-center text-muted-foreground/60 hover:text-gold transition-all hover:bg-gold/5 rounded-lg"><Minus size={12} /></button>
                                <span className="w-8 text-xs font-bold font-body text-charcoal text-center">{item.quantity}</span>
                                <button onClick={() => updateQuantity(item.id, item.quantity + 1, item.selectedShade, item.selectedSize, item.metadata)} className="w-8 h-8 flex items-center justify-center text-muted-foreground/60 hover:text-gold transition-all hover:bg-gold/5 rounded-lg"><Plus size={12} /></button>
                              </div>
                              <button onClick={() => removeItem(item.id, item.selectedShade, item.selectedSize, item.metadata)} className="group/del flex items-center gap-2 text-[10px] font-body font-bold uppercase tracking-[0.3em] text-muted-foreground/40 hover:text-rose-brand transition-all">
                                <div className="w-8 h-8 flex items-center justify-center rounded-xl bg-rose-brand/5 group-hover/del:bg-rose-brand group-hover/del:text-white transition-all duration-500"><Trash2 size={14} strokeWidth={1.5} /></div>
                                <span className="hidden md:inline">Remove</span>
                              </button>
                            </div>
                          </div>
                          <div className="text-right">
                            <p className="text-[10px] font-body font-bold text-gold/60 uppercase tracking-[0.4em] mb-1">Ritual Value</p>
                            <p className="font-display text-3xl lg:text-4xl font-normal text-charcoal tracking-tight">₹{(item.price * item.quantity).toLocaleString()}</p>
                          </div>
                        </div>
                      </div>
                    </motion.div>
                  ))}
                </AnimatePresence>
              </div>

              {/* Order Summary Sidebar */}
              <div className="lg:col-span-5 relative mt-12 lg:mt-0">
                <div className="sticky top-32 space-y-10">
                  <motion.div 
                    initial={{ opacity: 0, scale: 0.95 }}
                    animate={{ opacity: 1, scale: 1 }}
                    className="bg-white/60 backdrop-blur-3xl p-8 md:p-10 rounded-[2.5rem] md:rounded-[3rem] shadow-ethereal border border-gold/10 relative overflow-hidden text-charcoal"
                  >
                    <div className="absolute top-0 right-0 w-80 h-80 bg-gold/5 blur-[100px] rounded-full -mr-40 -mt-40 pointer-events-none" />
                    
                    <div className="flex justify-between items-center mb-8 border-b border-gold/10 pb-6">
                       <div className="space-y-1">
                         <p className="text-[10px] font-body font-bold text-gold/60 uppercase tracking-[0.4em] leading-none mb-1">Order Summary</p>
                         <h2 className="font-display text-3xl font-light text-charcoal italic tracking-tight">Summary<span className="text-gold font-serif">.</span></h2>
                       </div>
                    </div>
                    
                    <div className="space-y-8 mb-12">

                      <div className="flex justify-between text-[11px] font-body font-bold text-muted-foreground/60 uppercase tracking-[0.3em] items-center">
                        <span>Subtotal</span>
                        <span className="text-charcoal">₹{subtotal.toLocaleString()}</span>
                      </div>

                      <div className="flex justify-between text-[11px] font-body font-bold text-muted-foreground/60 uppercase tracking-[0.3em] items-center">
                        <span>Logistics (Shipping)</span>
                        <span className={shipping === 0 ? "text-gold" : "text-charcoal"}>
                          {shipping === 0 ? "FREE" : `₹${shipping}`}
                        </span>
                      </div>
                      
                      <div className="pt-2">
                        <Dialog open={isCouponsModalOpen} onOpenChange={setIsCouponsModalOpen}>
                          <DialogTrigger asChild>
                            <button className="w-full text-left bg-white/70 hover:bg-white border border-gold/10 rounded-2xl p-5 flex items-center justify-between group transition-all duration-500 shadow-sm hover:shadow-xl">
                              <div className="flex items-center gap-4">
                                <div className="w-12 h-12 bg-gold/10 rounded-xl flex items-center justify-center text-gold group-hover:scale-110 transition-transform duration-700 shadow-inner"><Tag size={24} strokeWidth={1} /></div>
                                <div className="space-y-1">
                                  <h4 className="text-xs font-display font-bold text-charcoal tracking-widest uppercase">Available Coupons</h4>
                                  <p className="text-[9px] font-body font-medium text-gold/60 uppercase tracking-widest leading-none">Choose a discount code</p>
                                </div>
                              </div>
                              <ChevronRight size={18} className="text-gold transition-transform group-hover:translate-x-1" />
                            </button>
                          </DialogTrigger>
                          
                          <DialogContent className="max-w-md w-[95vw] rounded-[3rem] p-0 overflow-hidden border-white/10 shadow-2xl flex flex-col max-h-[85vh] bg-[#fdfcfb]">
                             <div className="bg-white px-8 py-6 border-b border-gray-100 flex items-center gap-6">
                               <DialogClose className="p-1 hover:bg-gray-100 rounded-full transition-colors text-gold"><ChevronLeft size={24} /></DialogClose>
                               <DialogTitle className="font-display text-2xl font-bold text-charcoal tracking-tight lowercase">Available <span className="text-gold italic font-light">Coupons</span></DialogTitle>
                             </div>
                             <div className="flex-1 overflow-y-auto custom-scrollbar bg-[#f8f9fb]">
                               <div className="p-6 bg-white shadow-sm mb-6">
                                  <div className="relative flex items-center bg-secondary rounded-2xl border border-gold/5 overflow-hidden group focus-within:ring-2 focus-within:ring-gold/20 transition-all">
                                    <input type="text" value={couponInput} onChange={(e) => setCouponInput(e.target.value.toUpperCase())} placeholder="Enter Ritual Code" className="flex-1 bg-transparent border-none px-6 py-5 text-sm font-body font-bold text-charcoal outline-none placeholder:text-muted-foreground/30 uppercase tracking-widest" />
                                    <button onClick={() => { if(applyCoupon(couponInput)) setIsCouponsModalOpen(false); }} className="px-8 py-5 text-[10px] font-body font-bold text-gold hover:text-charcoal transition-colors uppercase tracking-[0.2em]">Apply</button>
                                  </div>
                               </div>
                               <div className="px-6 space-y-6 pb-20">
                                 <div className="space-y-4">
                                   <div className="flex items-center gap-3 px-2"><Sparkles size={12} className="text-gold opacity-50" /><h5 className="text-[10px] font-body font-bold text-muted-foreground/60 uppercase tracking-[0.3em]">Unlocked Potential</h5></div>
                                   <div className="grid gap-5">
                                     {availableCoupons.map((coupon) => (
                                       <div key={coupon.code} className={`relative bg-white rounded-[2rem] p-6 shadow-sm border transition-all duration-500 ${appliedCoupon?.code === coupon.code ? 'border-gold shadow-gold/10' : 'border-gold/5'}`}>
                                         <div className="flex justify-between items-start gap-4 mb-6">
                                           <div className="space-y-3 flex-1">
                                              <h6 className="font-display text-lg font-bold text-gold/80 tracking-tight lowercase italic">Glow Boutique</h6>
                                              <h4 className="text-xl font-display font-medium text-charcoal leading-tight tracking-tight">{coupon.code === "GLOW20" ? "20% Radiance" : coupon.code === "FESTIVE15" ? "15% Celebration" : coupon.code === "FREESHIP" ? "Free Logistics" : "₹500 Ritual Offset"}</h4>
                                           </div>
                                           <button disabled={appliedCoupon?.code === coupon.code} onClick={() => { applyCoupon(coupon.code); setIsCouponsModalOpen(false); }} className={`px-8 py-3 rounded-full border text-[10px] font-body font-bold uppercase tracking-widest transition-all ${appliedCoupon?.code === coupon.code ? 'bg-gold/10 border-gold/20 text-gold cursor-default' : 'bg-charcoal text-white hover:bg-gold hover:text-charcoal border-transparent active:scale-95'}`}>{appliedCoupon?.code === coupon.code ? "Active" : "Apply"}</button>
                                         </div>
                                         <div className="flex items-center justify-between bg-secondary rounded-xl px-4 py-3 border border-gold/5">
                                            <span className="text-[11px] font-mono font-bold text-charcoal tracking-widest">{coupon.code}</span>
                                            <span className="text-[8px] font-body font-bold text-muted-foreground/40 uppercase tracking-[0.2em]">Sacred until May 2026</span>
                                         </div>
                                       </div>
                                     ))}
                                   </div>
                                 </div>
                               </div>
                             </div>
                          </DialogContent>
                        </Dialog>
                      </div>

                      {/* Apply Gift Card Section */}
                      <div className="space-y-5 pt-2 border-t border-gold/10">
                        <div className="flex items-center justify-between">
                          <div className="flex items-center gap-3 text-gold">
                            <CreditCard size={14} className="opacity-60" />
                            <span className="text-[10px] font-body font-bold uppercase tracking-[0.4em]">Apply Gift Card</span>
                          </div>
                          {receivedGiftCards.length > 0 && (
                            <Dialog>
                              <DialogTrigger asChild>
                                <button className="text-[9px] font-body font-bold text-gold hover:text-charcoal transition-colors px-3 py-1 bg-gold/10 rounded-full">QUICK SELECT</button>
                              </DialogTrigger>
                              <DialogContent className="max-w-md w-[95vw] rounded-[3rem] p-8 border-white/10 shadow-2xl bg-[#fdfcfb]">
                                <DialogHeader className="mb-8">
                                  <DialogTitle className="font-display text-2xl font-bold text-charcoal lowercase">Your <span className="text-gold italic font-light">Received Cards</span></DialogTitle>
                                </DialogHeader>
                                <div className="space-y-4 max-h-[50vh] overflow-y-auto pr-2 custom-scrollbar">
                                  {receivedGiftCards.map((card, idx) => (
                                    <button 
                                      key={idx}
                                      onClick={() => { applyGiftCard(card.code); }}
                                      className="w-full text-left p-5 rounded-2xl bg-white border border-gold/10 hover:border-gold/30 hover:shadow-lg transition-all group flex justify-between items-center"
                                    >
                                      <div className="space-y-1">
                                        <p className="text-[10px] font-body font-bold text-gold uppercase tracking-widest">{card.code}</p>
                                        <p className="text-xs font-display font-medium text-charcoal">Available Balance: ₹{card.balance.toLocaleString()}</p>
                                      </div>
                                      <div className="w-8 h-8 rounded-full bg-gold/5 flex items-center justify-center text-gold group-hover:bg-gold group-hover:text-white transition-all">
                                        <ChevronRight size={14} />
                                      </div>
                                    </button>
                                  ))}
                                </div>
                              </DialogContent>
                            </Dialog>
                          )}
                        </div>

                        <div className="relative flex items-center bg-white/40 border border-gold/10 rounded-2xl overflow-hidden group focus-within:border-gold/30 transition-all shadow-sm">
                           <input 
                             type="text" 
                             value={giftCardInput}
                             onChange={(e) => setGiftCardInput(e.target.value.toUpperCase())}
                             placeholder="ENTER GIFT CODE"
                             className="flex-1 bg-transparent border-none px-6 py-4 text-[10px] font-body font-bold text-charcoal outline-none placeholder:text-muted-foreground/30 uppercase tracking-widest"
                           />
                           <button 
                             onClick={handleApplyGiftCard}
                             className="px-6 py-4 text-[10px] font-body font-bold text-gold hover:text-charcoal transition-colors uppercase tracking-[0.2em]"
                           >
                             Apply
                           </button>
                        </div>
                      </div>

                         <div className="space-y-6 pt-6 animate-in fade-in slide-in-from-top-4 border-t border-gold/10">
                            {giftCardDiscount > 0 && (
                             <div className="flex justify-between items-center text-[10px] font-body font-bold text-gold uppercase tracking-[0.35em]">
                                 <div className="flex items-center gap-3">
                                   <div className="p-2 bg-gold/10 rounded-full"><CreditCard size={12} /></div>
                                   <span>Gift Balance Applied</span>
                                 </div>
                                 <div className="flex items-center gap-4">
                                   <span className="text-charcoal font-display text-lg">- ₹{giftCardDiscount.toLocaleString()}</span>
                                   <button onClick={removeGiftCard} className="p-1 hover:text-rose-brand transition-colors text-muted-foreground/40"><Trash2 size={12} /></button>
                                 </div>
                               </div>
                            )}

                            {discountAmount > 0 && (
                             <div className="flex justify-between items-center text-[10px] font-body font-bold text-gold uppercase tracking-[0.35em]">
                                 <div className="flex items-center gap-3">
                                   <div className="p-2 bg-gold/10 rounded-full"><Tag size={12} /></div>
                                   <span>Aura Discount</span>
                                 </div>
                                 <div className="flex items-center gap-4">
                                   <span className="text-charcoal font-display text-lg">- ₹{discountAmount.toLocaleString()}</span>
                                   <button onClick={removeCoupon} className="p-1 hover:text-rose-brand transition-colors text-muted-foreground/40"><Trash2 size={12} /></button>
                                 </div>
                               </div>
                            )}
                                             <div className="pt-8 border-t border-gold/10">
                        <div className="flex justify-between items-end mb-8">
                          <div className="space-y-1">
                             <p className="text-[10px] font-body font-bold text-muted-foreground/40 uppercase tracking-[0.5em] leading-none mb-1">Total Ritual Value</p>
                             <span className="font-display text-xl md:text-2xl font-light text-charcoal italic tracking-tight lowercase">Grand <span className="text-gold">Total</span> Price</span>
                          </div>
                          <span className="font-display text-3xl md:text-5xl font-normal text-gold tracking-tight leading-none drop-shadow-[0_2px_10px_rgba(182,143,76,0.15)]">₹{total.toLocaleString()}</span>
                        </div>
                      </div>
                    </div>

                    <button 
                      onClick={handleCompletePurchase}
                      disabled={isPlacingOrder || items.length === 0}
                      className="w-full group/btn relative py-5 md:py-6 bg-charcoal text-white rounded-2xl font-body font-bold uppercase tracking-[0.4em] text-[10px] md:text-xs overflow-hidden transition-all hover:translate-y-[-2px] hover:shadow-[0_10px_30px_rgba(182,143,76,0.2)] disabled:opacity-50 disabled:translate-y-0 shadow-2xl"
                    >
                      <span className="relative z-10 flex items-center justify-center gap-4">
                        {isPlacingOrder ? "Placing Order..." : "Complete purchase"} 
                        {!isPlacingOrder && <ChevronRight size={16} className="transition-transform group-hover/btn:translate-x-2" />}
                      </span>
                      <div className="absolute inset-0 bg-gold transform -translate-x-full group-hover/btn:translate-x-0 transition-transform duration-700 origin-left" />
                    </button>
                    
                    <div className="mt-8 flex items-center justify-center gap-4 opacity-40 group pb-4">
                      <ShieldCheck size={16} className="text-charcoal group-hover:text-gold transition-colors" />
                      <p className="text-[8px] font-body font-bold uppercase tracking-[0.4em] text-charcoal">Secure Checkout Guaranteed</p>
                    </div>      </div>
                  </motion.div>

                  {/* Free shipping toast-like indicator */}
                  {subtotal < freeShippingThreshold && (
                    <motion.div 
                      initial={{ opacity: 0, y: 10 }}
                      animate={{ opacity: 1, y: 0 }}
                      className="p-8 rounded-[3rem] border border-white/50 bg-white/40 backdrop-blur-3xl shadow-ethereal flex items-center gap-6 group hover:border-gold/30 transition-all duration-700"
                    >
                      <div className="w-14 h-14 bg-gold/10 rounded-[1.5rem] flex items-center justify-center text-gold group-hover:scale-110 transition-transform duration-700">
                        <Truck size={22} strokeWidth={1.5} />
                      </div>
                      <div className="flex-1 space-y-3">
                        <div className="flex justify-between items-center text-[9px] font-body font-bold uppercase tracking-[0.3em] text-muted-foreground/60">
                          <span>Progress to complimentary logistics</span>
                          <span className="text-gold">{Math.round(progressToFreeShipping)}%</span>
                        </div>
                        <div className="h-1 bg-gold/5 rounded-full overflow-hidden border border-gold/5">
                           <motion.div 
                             initial={{ width: 0 }}
                             animate={{ width: `${progressToFreeShipping}%` }}
                             className="h-full bg-gold shadow-[0_0_15px_rgba(182,143,76,0.6)]"
                           />
                        </div>
                      </div>
                    </motion.div>
                  )}
                </div>
              </div>
            </div>
          )}
        </div>
      </main>
      <Footer />
      <WhatsAppButton />
    </div>
  );
};

export default Cart;
