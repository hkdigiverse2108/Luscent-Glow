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
  Check
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
import { getApiUrl } from "@/lib/api";
import Header from "@/components/Header";
import Footer from "@/components/Footer";
import WhatsAppButton from "@/components/WhatsAppButton";
import { useCart } from "@/context/CartContext";

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
  
  const navigate = useNavigate();
  const [couponInput, setCouponInput] = React.useState("");
  const [giftCardInput, setGiftCardInput] = React.useState("");
  const [isCouponsModalOpen, setIsCouponsModalOpen] = React.useState(false);
  const [isPlacingOrder, setIsPlacingOrder] = React.useState(false);
  const [orderComplete, setOrderComplete] = React.useState(false);

  const shipping = 50; // Flat charge, offset by coupons if applicable
  const tax = 0; // Removed as requested by user
  const total = Math.max(0, subtotal + shipping + tax - discountAmount - giftCardDiscount);

  const handleApplyGiftCard = () => {
    if (!giftCardInput.trim()) return;
    applyGiftCard(giftCardInput);
    setGiftCardInput("");
  };

  const handleCompletePurchase = async () => {
    const userStr = localStorage.getItem("user");
    const guestId = localStorage.getItem("luscent-glow-guest-id");
    const user = userStr ? JSON.parse(userStr) : null;
    const identifier = user?.mobileNumber || guestId || "Guest";
    
    setIsPlacingOrder(true);
    try {
      const orderData = {
        userMobile: identifier,
        items: items.map(item => ({
          productId: item.id,
          name: item.name,
          price: item.price,
          quantity: item.quantity,
          image: item.image,
          selectedShade: item.selectedShade,
          selectedSize: item.selectedSize,
          metadata: item.metadata
        })),
        totalAmount: subtotal + shipping - discountAmount - giftCardDiscount,
        appliedGiftCardCode: appliedGiftCard?.code || null,
        giftCardDiscount: giftCardDiscount || 0,
        paymentStatus: "Paid",
        shippingAddress: {}
      };

      const response = await fetch(getApiUrl("/orders/"), {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(orderData),
      });

      if (response.ok) {
        await clearCart();
        toast.success("Ritual Secured: Your order has been placed!");
        window.scrollTo(0, 0);
        navigate("/orders");
      } else {
        // Even if server returns error, if it's a demo, we might want to show success
        // but for now we follow the response. Let's make it robust.
        const errorData = await response.json();
        console.error("Order error:", errorData);
        toast.error("Process interrupted. Please try again.");
      }
    } catch (error) {
      console.error("Purchase error:", error);
      toast.error("Could not reach our fulfillment center.");
      
      // FALLBACK for User's 'Always Success' request if needed: 
      // In a real demo, we might setOrderComplete(true) anyway, 
      // but let's keep it honest to the API for now unless it's a persistent blocker.
    } finally {
      setIsPlacingOrder(false);
    }
  };

  const handleApplyCoupon = () => {
    if (!couponInput.trim()) return;
    applyCoupon(couponInput);
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
              <h1 className="font-display text-5xl md:text-6xl font-light text-foreground tracking-tight">Ritual <span className="italic font-normal">Secured</span></h1>
              <p className="text-muted-foreground font-body text-lg max-w-md mx-auto leading-relaxed">
                Your curated selection has been successfully recorded in our orders database. 
                {items.some(i => i.category === "Gift Cards") && " Your digital gift cards have been dispatched to the recipients."}
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
    <div className="min-h-screen bg-[#faf9f6]">
      <Header />
      <main className="container mx-auto px-4 py-12 lg:py-20">
        <div className="max-w-7xl mx-auto">
          {/* Header Section */}
          <div className="flex flex-col md:flex-row md:items-end justify-between mb-8 md:mb-12 gap-6">
            <div className="space-y-2">
              <Link to="/products" className="inline-flex items-center gap-2 text-gold hover:gap-3 transition-all text-[10px] md:text-sm font-body font-bold uppercase tracking-widest mb-2 md:mb-4">
                <ChevronLeft size={16} /> Back to Collection
              </Link>
              <h1 className="font-display text-4xl md:text-5xl lg:text-6xl font-light text-foreground tracking-tight leading-[1.1]">
                Shopping <span className="italic font-normal">Bag</span>
              </h1>
            </div>
            <div className="hidden md:flex flex-col items-end gap-2">
              <p className="text-sm font-body text-muted-foreground uppercase tracking-[0.2em]">{totalItems} Curated Items</p>
              <button 
                onClick={clearCart}
                className="text-[10px] font-body font-bold uppercase tracking-[0.2em] text-muted-foreground hover:text-destructive transition-colors"
              >
                Clear All Items
              </button>
            </div>
          </div>

          {items.length === 0 ? (
            <motion.div 
              initial={{ opacity: 0, y: 30 }}
              animate={{ opacity: 1, y: 0 }}
              className="text-center py-24 lg:py-40 bg-white/50 border border-white rounded-[3rem] shadow-ethereal backdrop-blur-sm"
            >
              <div className="w-24 h-24 bg-gold/5 rounded-full flex items-center justify-center mx-auto mb-8 text-gold/60">
                <ShoppingBag size={40} strokeWidth={1} />
              </div>
              <h2 className="font-display text-3xl font-light mb-6 text-foreground">Your collection is empty</h2>
              <p className="text-muted-foreground font-body mb-10 max-w-md mx-auto leading-relaxed">
                Discover our latest arrivals in skincare and makeup, curated to reveal your inner radiance.
              </p>
              <Link 
                to="/products"
                className="inline-flex items-center gap-3 px-10 py-4 bg-primary text-primary-foreground rounded-full font-body font-bold uppercase tracking-[0.15em] text-xs hover:bg-gold transition-all duration-500 shadow-xl hover:shadow-gold/20"
              >
                Explore Collection <ArrowRight size={18} />
              </Link>
            </motion.div>
          ) : (
            <div className="grid lg:grid-cols-12 gap-12 lg:gap-20 items-start">
              {/* Items List */}
              <div className="lg:col-span-7 space-y-12">
                {/* Free Shipping Progress */}
                <div className="bg-white p-5 md:p-6 rounded-2xl md:rounded-3xl border border-gold/10 shadow-sm relative overflow-hidden">
                  <div className="flex justify-between items-center mb-3 md:mb-4">
                    <p className="text-[9px] md:text-xs font-body font-bold uppercase tracking-wider text-muted-foreground">
                      {subtotal >= freeShippingThreshold ? 
                        "✨ You've unlocked Complimentary Shipping" : 
                        `Add ₹${(freeShippingThreshold - subtotal).toLocaleString()} more for Complimentary Shipping`}
                    </p>
                    <span className="text-[10px] font-bold text-gold">{Math.round(progressToFreeShipping)}%</span>
                  </div>
                  <div className="h-1.5 w-full bg-secondary rounded-full overflow-hidden">
                    <motion.div 
                      initial={{ width: 0 }}
                      animate={{ width: `${progressToFreeShipping}%` }}
                      className="h-full bg-gold shadow-[0_0_10px_rgba(182,143,76,0.3)]"
                    />
                  </div>
                </div>

                <AnimatePresence mode="popLayout">
                  {items.map((item) => (
                    <motion.div
                      key={`${item.id}-${item.selectedShade}-${item.selectedSize}`}
                      layout
                      initial={{ opacity: 0, scale: 0.98 }}
                      animate={{ opacity: 1, scale: 1 }}
                      exit={{ opacity: 0, x: -50 }}
                      className="group flex gap-6 lg:gap-10 items-center"
                    >
                      <div className={`relative ${item.category === "Gift Cards" ? "aspect-[16/10] w-32 md:w-48 lg:w-56" : "w-24 h-32 md:w-32 md:h-40 lg:w-44 lg:h-56"} bg-secondary rounded-xl md:rounded-[2rem] overflow-hidden flex-shrink-0 shadow-md group-hover:shadow-2xl transition-all duration-700`}>
                        <img 
                          src={item.image} 
                          alt={item.name} 
                          className="w-full h-full object-cover transition-transform duration-1000 group-hover:scale-110"
                        />
                      </div>
                      
                      <div className="flex-1 min-w-0 flex flex-col md:flex-row md:items-center justify-between gap-4">
                        <div className="space-y-3 flex-1 min-w-0">
                          <div>
                            <p className="text-[9px] md:text-[10px] font-body font-bold text-gold uppercase tracking-[0.2em] mb-1 md:mb-2">{item.category}</p>
                            <h3 className="font-display text-lg md:text-xl lg:text-2xl font-light text-foreground leading-tight truncate">
                              {item.name}
                            </h3>
                          </div>

                          <div className="flex flex-wrap gap-2 md:gap-3 text-[8px] md:text-[10px] font-body font-bold uppercase tracking-widest text-muted-foreground">
                            {item.selectedShade && (
                              <div className="flex items-center gap-1 bg-white border border-border px-2 py-0.5 rounded-full">
                                <span className="w-1 h-1 rounded-full bg-gold" />
                                {item.selectedShade}
                              </div>
                            )}
                            {item.selectedSize && (
                              <div className="flex items-center gap-1 bg-white border border-border px-2 py-0.5 rounded-full">
                                <span className="w-1 h-1 rounded-full bg-gold" />
                                {item.selectedSize}
                              </div>
                            )}
                          </div>

                          {item.metadata?.recipient && (
                             <div className="space-y-1.5 pt-2 border-t border-gold/10">
                               <p className="text-[9px] font-body text-muted-foreground uppercase tracking-wider">Recipient: <span className="text-foreground font-bold">{item.metadata.recipient}</span></p>
                               {item.metadata.message && (
                                 <p className="text-[10px] font-body italic text-muted-foreground line-clamp-1 opacity-80">"{item.metadata.message}"</p>
                               )}
                             </div>
                          )}

                          <div className="flex items-center border border-gold/10 rounded-xl bg-white p-1 w-fit mt-4">
                            <button 
                              onClick={() => updateQuantity(item.id, item.quantity - 1, item.selectedShade, item.selectedSize, item.metadata)}
                              className="p-1.5 text-muted-foreground hover:text-gold transition-colors"
                            >
                              <Minus size={12} />
                            </button>
                            <span className="px-3 text-xs font-bold font-body min-w-[2rem] text-center">{item.quantity}</span>
                            <button 
                              onClick={() => updateQuantity(item.id, item.quantity + 1, item.selectedShade, item.selectedSize, item.metadata)}
                              className="p-1.5 text-muted-foreground hover:text-gold transition-colors"
                            >
                              <Plus size={12} />
                            </button>
                          </div>
                        </div>

                        <div className="flex flex-row md:flex-col items-center md:items-end justify-between md:justify-center gap-4 border-t md:border-t-0 border-gold/10 pt-4 md:pt-0">
                          <p className="font-display text-xl lg:text-2xl font-normal text-foreground">₹{(item.price * item.quantity).toLocaleString()}</p>
                          <button 
                            onClick={() => removeItem(item.id, item.selectedShade, item.selectedSize, item.metadata)}
                            className="text-[9px] font-body font-bold uppercase tracking-[0.2em] text-muted-foreground hover:text-destructive transition-colors group/del flex items-center gap-2"
                          >
                            <Trash2 size={12} className="opacity-50 group-hover/del:opacity-100" />
                            Dispose
                          </button>
                        </div>
                      </div>
                    </motion.div>
                  ))}
                </AnimatePresence>
              </div>

              {/* Order Summary */}
              <div className="lg:col-span-5 lg:pl-10">
                <div className="sticky top-32 space-y-8">
                  <div className="glass-gold p-6 md:p-10 lg:p-12 rounded-[2.5rem] md:rounded-[4rem] shadow-ethereal relative overflow-hidden">
                    <div className="absolute top-0 right-0 w-64 h-64 bg-gold/5 blur-[80px] rounded-full -mr-32 -mt-32" />
                    
                    <div className="flex justify-between items-center mb-8 md:mb-10 border-b border-gold/10 pb-6">
                      <h2 className="font-display text-2xl md:text-3xl font-light text-foreground italic">Bag Summary</h2>
                      <button 
                        onClick={clearCart}
                        className="text-[10px] font-body font-bold uppercase tracking-[0.2em] text-muted-foreground hover:text-destructive transition-colors"
                      >
                        Clear Bag
                      </button>
                    </div>
                    
                    <div className="space-y-6 mb-10">
                      <div className="flex justify-between text-xs font-body font-bold text-muted-foreground uppercase tracking-wider">
                        <span>Subtotal</span>
                        <span className="text-foreground">₹{subtotal.toLocaleString()}</span>
                      </div>

                      <div className="flex justify-between text-xs font-body font-bold text-muted-foreground uppercase tracking-wider">
                        <span>Logistics</span>
                        <span className="text-foreground">₹{shipping.toLocaleString()}</span>
                      </div>
                      
                      {/* Unified Coupons Selection Card */}
                      <div className="pt-2">
                        <Dialog open={isCouponsModalOpen} onOpenChange={setIsCouponsModalOpen}>
                          <DialogTrigger asChild>
                            <button className="w-full text-left bg-white/60 hover:bg-white border border-gold/20 rounded-2xl p-5 md:p-6 flex items-center justify-between group transition-all duration-500 shadow-sm hover:shadow-md">
                              <div className="flex items-center gap-4">
                                <div className="w-12 h-12 bg-rose-brand/10 rounded-xl flex items-center justify-center text-rose-brand group-hover:scale-110 transition-transform duration-500">
                                  <Tag size={24} strokeWidth={1.5} />
                                </div>
                                <div>
                                  <h4 className="text-sm font-display font-bold text-foreground tracking-wide">Coupons</h4>
                                  <p className="text-[10px] md:text-xs font-body font-medium text-rose-brand uppercase tracking-widest mt-0.5">Apply now and save extra!</p>
                                </div>
                              </div>
                              <ChevronRight size={20} className="text-rose-brand transition-transform group-hover:translate-x-1" />
                            </button>
                          </DialogTrigger>
                          
                          <DialogContent className="max-w-md w-[95vw] rounded-[2rem] p-0 overflow-hidden border-none shadow-2xl flex flex-col max-h-[85vh]">
                             {/* Custom Header matching screenshot */}
                             <div className="bg-white px-6 py-5 border-b border-gray-100 flex items-center gap-4">
                               <DialogClose className="p-1 hover:bg-gray-100 rounded-full transition-colors text-rose-brand">
                                 <ChevronLeft size={24} />
                               </DialogClose>
                               <DialogTitle className="font-display text-xl lg:text-2xl font-bold text-[#424242]">
                                 Coupons & Offers
                               </DialogTitle>
                             </div>

                             <div className="flex-1 overflow-y-auto custom-scrollbar bg-[#f8f9fb]">
                               {/* Top Manual Entry Bar like screenshot */}
                               <div className="p-4 md:p-6 bg-white shadow-sm mb-4">
                                  <div className="relative flex items-center bg-[#f0f2f5] rounded-xl border border-gray-200 overflow-hidden group focus-within:ring-2 focus-within:ring-rose-brand/20 transition-all">
                                    <input 
                                      type="text" 
                                      value={couponInput}
                                      onChange={(e) => setCouponInput(e.target.value.toUpperCase())}
                                      placeholder="Enter Coupon Code" 
                                      className="flex-1 bg-transparent border-none px-5 py-4 text-sm font-medium text-foreground outline-none placeholder:text-gray-400"
                                    />
                                    <button 
                                      onClick={() => { if(applyCoupon(couponInput)) setIsCouponsModalOpen(false); }}
                                      className="px-6 py-4 text-sm font-bold text-gray-500 hover:text-rose-brand transition-colors uppercase tracking-wider"
                                    >
                                      Apply
                                    </button>
                                  </div>
                               </div>

                               <div className="px-4 md:px-6 space-y-6 pb-20">
                                 {/* Unlocked Coupons section */}
                                 <div className="space-y-4">
                                   <div className="flex items-center justify-between px-1">
                                      <h5 className="text-[13px] font-medium text-[#4a5568] tracking-tight">Unlocked Coupons</h5>
                                   </div>

                                   <div className="grid gap-4">
                                     {availableCoupons.map((coupon, i) => (
                                       <div 
                                         key={coupon.code}
                                         className={`relative bg-white rounded-xl p-5 shadow-sm border ${appliedCoupon?.code === coupon.code ? 'border-gold shadow-md' : 'border-gray-100'}`}
                                       >
                                         <div className="flex justify-between items-start gap-4 mb-4">
                                           <div className="space-y-3 flex-1">
                                              {/* Boutique Identity */}
                                              <div className="flex items-center gap-2">
                                                 <h6 className="font-display text-lg font-bold text-gold/80 tracking-tight">
                                                   Glow Boutique
                                                 </h6>
                                              </div>
                                              <div>
                                                <h4 className="text-base font-bold text-foreground leading-tight uppercase tracking-tight">
                                                  {coupon.code === "GLOW20" ? "20% OFF" : 
                                                   coupon.code === "FESTIVE15" ? "15% OFF" : 
                                                   coupon.code === "FREESHIP" ? "FREE SHIPPING" : 
                                                   "₹500 OFF"}
                                                </h4>
                                                <p className="text-[11px] md:text-xs text-[#4a5568] mt-1 font-medium leading-relaxed">
                                                  {coupon.code === "GLOW20" ? "On your first order above ₹1999" : 
                                                   coupon.code === "FESTIVE15" ? "Limited time festive skincare sale" : 
                                                   coupon.code === "FREESHIP" ? "On all orders today only" : 
                                                   "When you spend ₹3499 or more"}
                                                </p>
                                              </div>
                                              <button className="text-[11px] font-bold text-[#4a5568] border-b border-gray-400 pb-0.5 hover:text-rose-brand transition-colors">
                                                View Details
                                              </button>
                                           </div>
                                           
                                           <button
                                             disabled={appliedCoupon?.code === coupon.code}
                                             onClick={() => { applyCoupon(coupon.code); setIsCouponsModalOpen(false); }}
                                             className={`px-8 py-2.5 rounded-xl border-2 text-sm font-bold transition-all ${appliedCoupon?.code === coupon.code ? 'bg-gold/10 border-gold text-gold cursor-default' : 'bg-white border-gray-100 text-gray-400 hover:border-gold/50 hover:text-gold active:scale-95'}`}
                                           >
                                             {appliedCoupon?.code === coupon.code ? "Applied" : "Apply"}
                                           </button>
                                         </div>

                                         {/* Dashed Border Code Box with Copy */}
                                         <div className="flex items-center justify-between bg-gold/5 border border-dashed border-gold/40 rounded-lg px-4 py-2 mt-2 group/copy">
                                            <div className="flex items-center gap-2">
                                              <span className="text-xs font-mono font-bold text-gold tracking-widest">{coupon.code}</span>
                                              <button 
                                                onClick={(e) => {
                                                  e.stopPropagation();
                                                  navigator.clipboard.writeText(coupon.code);
                                                  toast.success("Code copied!");
                                                }}
                                                className="p-1 hover:bg-gold/20 rounded transition-all text-gold/40 hover:text-gold"
                                                title="Copy Code"
                                              >
                                                <Copy size={12} />
                                              </button>
                                            </div>
                                            <span className="text-[10px] font-medium text-gray-500 italic">Expires on 1st May, 2026</span>
                                         </div>
                                       </div>
                                     ))}
                                   </div>
                                 </div>

                                 {/* Gift Cards Section */}
                                 {receivedGiftCards.length > 0 && (
                                   <div className="space-y-4 pt-4 border-t border-gray-200">
                                     <h5 className="text-[13px] font-medium text-[#4a5568] tracking-tight">Your Gift Cards</h5>
                                     <div className="grid gap-4">
                                       {receivedGiftCards.filter(card => appliedGiftCard?.code?.toUpperCase() !== card.code.toUpperCase()).map((card) => (
                                         <button 
                                           key={card.code}
                                           disabled={appliedGiftCard?.code?.toUpperCase() === card.code.toUpperCase()}
                                           onClick={() => { applyGiftCard(card.code); setIsCouponsModalOpen(false); }}
                                           className={`group text-left relative overflow-hidden rounded-2xl bg-charcoal p-4 flex items-center justify-between shadow-lg transition-all duration-300 hover:scale-[1.02] active:scale-95 disabled:opacity-50 disabled:hover:scale-100 ${appliedGiftCard?.code?.toUpperCase() === card.code.toUpperCase() ? 'ring-2 ring-gold' : ''}`}
                                         >
                                           <div className="flex items-center gap-4 relative z-10">
                                             <div className="w-16 h-10 rounded-lg overflow-hidden border border-white/10 flex-shrink-0">
                                                <img 
                                                  src={card.image || '/assets/gift-cards/gold.png'} 
                                                  alt="Gift" 
                                                  className="w-full h-full object-cover" 
                                                />
                                             </div>
                                             <div>
                                               <p className="text-[10px] font-body text-gold/80 uppercase tracking-widest leading-none mb-1">Gift Balance</p>
                                               <p className="text-lg font-display font-medium text-white tracking-tight">₹{card.balance.toLocaleString()}</p>
                                               <div className="flex items-center gap-2 mt-1.5">
                                                 <p className="text-[10px] font-mono text-white/90 uppercase tracking-widest bg-white/10 px-2 py-0.5 rounded">{card.code}</p>
                                                 <button 
                                                   onClick={(e) => {
                                                     e.stopPropagation();
                                                     navigator.clipboard.writeText(card.code);
                                                     toast.success("Gift code copied!");
                                                   }}
                                                   className="hover:scale-110 transition-transform text-white/60 hover:text-gold p-1"
                                                 >
                                                   <Copy size={12} />
                                                 </button>
                                               </div>
                                             </div>
                                           </div>
                                           <div className="relative z-10">
                                              {appliedGiftCard?.code?.toUpperCase() === card.code.toUpperCase() ? (
                                                <div className="w-8 h-8 rounded-full bg-gold flex items-center justify-center text-primary">
                                                  <CheckCircle2 size={16} />
                                                </div>
                                              ) : (
                                                <div className="px-4 py-1.5 bg-gold text-primary rounded-lg text-[9px] font-body font-bold uppercase tracking-widest hover:bg-white transition-all">Apply</div>
                                              )}
                                           </div>
                                           <div className="absolute top-0 right-0 p-2 opacity-[0.03] rotate-12 group-hover:rotate-0 transition-transform duration-700">
                                             <CreditCard size={60} />
                                           </div>
                                         </button>
                                       ))}
                                     </div>
                                   </div>
                                 )}
                               </div>
                             </div>
                          </DialogContent>
                        </Dialog>
                      </div>

                      {/* Display active discount feedback if applied */}
                      {(appliedGiftCard || appliedCoupon) && (
                        <div className="space-y-4 pt-4 animate-in fade-in slide-in-from-top-2 border-t border-gold/10">
                           {giftCardDiscount > 0 && (
                            <div className="flex justify-between items-center text-xs font-body font-bold text-gold uppercase tracking-wider">
                              <span className="flex items-center gap-2">
                                <span className="flex items-center gap-2 text-gold"><CreditCard size={12} /> Gift Balance Applied</span>
                                <button 
                                  onClick={removeGiftCard}
                                  className="ml-2 p-1 hover:bg-gold/10 rounded-full transition-colors text-gold/60 hover:text-rose-brand"
                                  title="Remove Gift Card"
                                >
                                  <Trash2 size={10} />
                                </button>
                              </span>
                              <span>- ₹{giftCardDiscount.toLocaleString()}</span>
                            </div>
                          )}

                          {discountAmount > 0 && (
                            <div className="flex justify-between items-center text-xs font-body font-bold text-rose-brand uppercase tracking-wider">
                              <span className="flex items-center gap-2">
                                <span className="flex items-center gap-2 text-rose-brand"><Tag size={12} /> Glow Discount</span>
                                <button 
                                  onClick={removeCoupon}
                                  className="ml-2 p-1 hover:bg-rose-brand/10 rounded-full transition-colors text-rose-brand/60 hover:text-destructive"
                                  title="Remove Coupon"
                                >
                                  <Trash2 size={10} />
                                </button>
                              </span>
                              <span>- ₹{discountAmount.toLocaleString()}</span>
                            </div>
                          )}
                        </div>
                      )}

                      <div className="pt-6 md:pt-8 border-t border-gold/20">
                        <div className="flex justify-between items-center">
                          <span className="font-display text-xl md:text-2xl font-light text-foreground">Total</span>
                          <span className="font-display text-3xl md:text-4xl font-normal text-gold text-glow-gold">₹{total.toLocaleString()}</span>
                        </div>
                      </div>
                    </div>

                    <button 
                      onClick={handleCompletePurchase}
                      disabled={isPlacingOrder || items.length === 0}
                      className="w-full group/btn relative py-5 bg-primary text-primary-foreground rounded-2xl font-body font-bold uppercase tracking-[0.2em] text-xs overflow-hidden transition-all hover:translate-y-[-2px] hover:shadow-2xl disabled:opacity-50 disabled:translate-y-0"
                    >
                      <span className="relative z-10 flex items-center justify-center gap-3">
                        {isPlacingOrder ? "Processing Ritual..." : "Complete Secure Purchase"} 
                        {!isPlacingOrder && <ArrowRight size={16} className="transition-transform group-hover/btn:translate-x-1" />}
                      </span>
                      <div className="absolute inset-0 bg-gold/90 transform -translate-x-full group-hover/btn:translate-x-0 transition-transform duration-500 origin-left" />
                    </button>

                    <div className="mt-10 grid grid-cols-3 gap-6 opacity-40 grayscale group-hover:grayscale-0 transition-all duration-700">
                      <div className="text-center">
                        <Truck size={18} className="mx-auto mb-2" />
                        <p className="text-[8px] font-bold tracking-widest">GLOBAL</p>
                      </div>
                      <div className="text-center">
                        <ShieldCheck size={18} className="mx-auto mb-2" />
                        <p className="text-[8px] font-bold tracking-widest">INSURED</p>
                      </div>
                      <div className="text-center">
                        <CreditCard size={18} className="mx-auto mb-2" />
                        <p className="text-[8px] font-bold tracking-widest">SSL</p>
                      </div>
                    </div>
                  </div>

                  <div className="p-8 bg-gold/5 rounded-[3rem] border border-gold/10">
                    <p className="text-xs font-body text-muted-foreground leading-relaxed text-center italic">
                      "Luxury is in each detail. Our eco-conscious premium packaging is included with every curated order."
                    </p>
                  </div>
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
