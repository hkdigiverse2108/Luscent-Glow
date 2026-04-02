import React from "react";
import { Link } from "react-router-dom";
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
  Tag
} from "lucide-react";
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
    discountAmount
  } = useCart();
  
  const [couponInput, setCouponInput] = React.useState("");
  const isFreeShipCoupon = appliedCoupon?.code === "FREESHIP";
  const shipping = (subtotal > 999 || isFreeShipCoupon) ? 0 : 99;
  const tax = Math.round((subtotal - discountAmount) * 0.18);
  const total = Math.max(0, subtotal + shipping + tax - discountAmount);

  const handleApplyCoupon = () => {
    if (!couponInput.trim()) return;
    applyCoupon(couponInput);
  };

  const freeShippingThreshold = 999;
  const progressToFreeShipping = Math.min((subtotal / freeShippingThreshold) * 100, 100);

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
                      <div className="relative w-24 h-32 md:w-32 md:h-40 lg:w-44 lg:h-56 bg-secondary rounded-xl md:rounded-[2rem] overflow-hidden flex-shrink-0 shadow-md group-hover:shadow-2xl transition-all duration-700">
                        <img 
                          src={item.image} 
                          alt={item.name} 
                          className="w-full h-full object-cover transition-transform duration-1000 group-hover:scale-110"
                        />
                      </div>
                      
                      <div className="flex-1 space-y-4">
                        <div className="flex justify-between items-start">
                          <div>
                            <p className="text-[9px] md:text-[10px] font-body font-bold text-gold uppercase tracking-[0.2em] mb-1 md:mb-2">{item.category}</p>
                            <h3 className="font-display text-xl md:text-2xl lg:text-3xl font-light text-foreground leading-tight">
                              {item.name}
                            </h3>
                          </div>
                        </div>

                        <div className="flex flex-wrap gap-2 md:gap-4 text-[8px] md:text-[10px] font-body font-bold uppercase tracking-widest text-muted-foreground mt-2">
                          {item.selectedShade && (
                            <div className="flex items-center gap-1 bg-white border border-border px-2 py-0.5 md:py-1 rounded-full">
                              <span className="w-1 h-1 rounded-full bg-gold" />
                              {item.selectedShade}
                            </div>
                          )}
                          {item.selectedSize && (
                            <div className="flex items-center gap-1 bg-white border border-border px-2 py-0.5 md:py-1 rounded-full">
                              <span className="w-1 h-1 rounded-full bg-gold" />
                              {item.selectedSize}
                            </div>
                          )}
                        </div>

                        <div className="flex items-center justify-between pt-4">
                          <div className="flex items-center border border-gold/10 rounded-xl bg-white p-1">
                            <button 
                              onClick={() => updateQuantity(item.id, item.quantity - 1, item.selectedShade, item.selectedSize)}
                              className="p-2 text-muted-foreground hover:text-gold transition-colors"
                            >
                              <Minus size={14} />
                            </button>
                            <span className="px-4 text-xs font-bold font-body min-w-[2.5rem] text-center">{item.quantity}</span>
                            <button 
                              onClick={() => updateQuantity(item.id, item.quantity + 1, item.selectedShade, item.selectedSize)}
                              className="p-2 text-muted-foreground hover:text-gold transition-colors"
                            >
                              <Plus size={14} />
                            </button>
                          </div>
                          <div className="text-right">
                            <p className="font-display text-xl lg:text-2xl font-normal text-foreground">₹{(item.price * item.quantity).toLocaleString()}</p>
                            <button 
                              onClick={() => removeItem(item.id, item.selectedShade, item.selectedSize)}
                              className="text-[10px] font-body font-bold uppercase tracking-[0.2em] text-muted-foreground hover:text-destructive transition-colors mt-2"
                            >
                              Dispose Item
                            </button>
                          </div>
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
                        <span className="text-foreground">
                          {shipping === 0 ? "COMPLIMENTARY" : `₹${shipping}`}
                        </span>
                      </div>
                      <div className="flex justify-between text-xs font-body font-bold text-muted-foreground uppercase tracking-wider">
                        <span>Duty (18% GST)</span>
                        <span className="text-foreground">₹{tax.toLocaleString()}</span>
                      </div>
                      
                      {/* Promo Code Slot */}
                      <div className="pt-4">
                        {!appliedCoupon ? (
                          <div className="group">
                            <h3 className="flex items-center gap-2 text-[10px] font-body font-bold text-gold uppercase tracking-widest mb-4">
                              Add Promo Code
                            </h3>
                            <div className="flex gap-2">
                              <input 
                                type="text" 
                                value={couponInput}
                                onChange={(e) => setCouponInput(e.target.value)}
                                placeholder="Enter Code" 
                                className="flex-1 bg-white/50 border border-gold/20 rounded-xl px-4 py-2 text-xs font-body focus:outline-none focus:ring-1 focus:ring-gold/30"
                              />
                              <button 
                                onClick={handleApplyCoupon}
                                className="px-4 py-2 bg-gold/20 text-gold rounded-xl text-[10px] font-body font-bold uppercase tracking-widest hover:bg-gold/30 transition-colors"
                              >
                                Apply
                              </button>
                            </div>
                          </div>
                        ) : (
                          <div className="bg-gold/10 border border-gold/30 rounded-2xl p-4 flex items-center justify-between">
                            <div className="flex items-center gap-3">
                              <div className="w-8 h-8 bg-gold rounded-full flex items-center justify-center text-primary">
                                <Tag size={14} />
                              </div>
                              <div>
                                <p className="text-[10px] font-body font-bold text-gold uppercase tracking-wider">Applied Coupon</p>
                                <p className="text-sm font-display font-medium text-primary uppercase">{appliedCoupon.code}</p>
                              </div>
                            </div>
                            <button 
                              onClick={removeCoupon}
                              className="text-[10px] font-body font-bold text-muted-foreground hover:text-destructive transition-colors uppercase"
                            >
                              Remove
                            </button>
                          </div>
                        )}
                      </div>

                      {discountAmount > 0 && (
                        <div className="flex justify-between text-xs font-body font-bold text-rose-brand uppercase tracking-wider animate-in fade-in slide-in-from-top-2">
                          <span>Glow Discount</span>
                          <span>- ₹{discountAmount.toLocaleString()}</span>
                        </div>
                      )}

                      <div className="pt-6 md:pt-8 border-t border-gold/20">
                        <div className="flex justify-between items-center">
                          <span className="font-display text-xl md:text-2xl font-light text-foreground">Total</span>
                          <span className="font-display text-3xl md:text-4xl font-normal text-gold text-glow-gold">₹{total.toLocaleString()}</span>
                        </div>
                      </div>
                    </div>

                    <button className="w-full group/btn relative py-5 bg-primary text-primary-foreground rounded-2xl font-body font-bold uppercase tracking-[0.2em] text-xs overflow-hidden transition-all hover:translate-y-[-2px] hover:shadow-2xl">
                      <span className="relative z-10 flex items-center justify-center gap-3">
                        Complete Secure Purchase <ArrowRight size={16} className="transition-transform group-hover/btn:translate-x-1" />
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
