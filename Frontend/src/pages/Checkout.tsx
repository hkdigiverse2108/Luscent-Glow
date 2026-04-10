import React, { useState, useEffect } from "react";
import { useNavigate, Link } from "react-router-dom";
import { motion, AnimatePresence } from "framer-motion";
import { 
  ChevronLeft, 
  ChevronRight, 
  MapPin, 
  CreditCard, 
  CheckCircle2, 
  ShieldCheck, 
  Truck,
  Sparkles,
  ArrowRight,
  ShoppingBag,
  User,
  Phone,
  Mail,
  Home,
  ChevronDown,
  Wallet,
  Landmark,
  Banknote,
  Gift,
  BadgePercent,
  Smartphone,
  Info,
  QrCode,
  X
} from "lucide-react";
import { toast } from "sonner";
import { getApiUrl, getAssetUrl } from "@/lib/api";
import { useCart } from "@/context/CartContext";
import { useAuth } from "@/context/AuthContext";
import Header from "@/components/Header";
import Footer from "@/components/Footer";
import WhatsAppButton from "@/components/WhatsAppButton";
import { load } from '@cashfreepayments/cashfree-js';

const NYKAA_PINK = "hsl(var(--nykaa-pink))";
const GOLD = "hsl(var(--gold))";

const Checkout = () => {
  const navigate = useNavigate();
  const { items, subtotal, discountAmount, giftCardDiscount, clearCart } = useCart();
  const { user } = useAuth();
  
  const [step, setStep] = useState(1); // 1: Identify, 2: Address
  const [isPlacingOrder, setIsPlacingOrder] = useState(false);
  const [activePaymentTab, setActivePaymentTab] = useState<"UPI" | "CARD" | "COD" | "NETBANKING" | "WALLET" | "EMI">("UPI");
  
  // Sidebar toggles
  const [showBag, setShowBag] = useState(false);
  const [showAddress, setShowAddress] = useState(false);
  const [showPrice, setShowPrice] = useState(true);
  
  const [address, setAddress] = useState({
    fullName: user?.fullName || "",
    mobile: user?.mobileNumber || "",
    email: user?.email || "",
    street: user?.shippingAddress?.street || "",
    city: user?.shippingAddress?.city || "",
    state: user?.shippingAddress?.state || "",
    zipCode: user?.shippingAddress?.zipCode || ""
  });

  const [paymentMethod, setPaymentMethod] = useState<"ONLINE" | "COD">("ONLINE");
  const [isLookingUp, setIsLookingUp] = useState(false);

  // Auto-fill logged in user data
  useEffect(() => {
    if (user && !address.fullName && !address.mobile) {
      setAddress({
        fullName: user.fullName || "",
        mobile: user.mobileNumber || "",
        email: user.email || "",
        street: user.shippingAddress?.street || "",
        city: user.shippingAddress?.city || "",
        state: user.shippingAddress?.state || "",
        zipCode: user.shippingAddress?.zipCode || ""
      });
    }
  }, [user]);

  // Phone lookup logic for guest/returning users
  useEffect(() => {
    const lookupUser = async () => {
      if (address.mobile.length === 10 && !user) {
        setIsLookingUp(true);
        try {
          const res = await fetch(getApiUrl(`/api/users/lookup?mobile=${address.mobile}`));
          const data = await res.json();
          if (res.ok && data.fullName) {
            setAddress(prev => ({
              ...prev,
              fullName: data.fullName || prev.fullName,
              street: data.shippingAddress?.street || prev.street,
              city: data.shippingAddress?.city || prev.city,
              state: data.shippingAddress?.state || prev.state,
              zipCode: data.shippingAddress?.zipCode || prev.zipCode,
            }));
            toast.success("Welcome back! We've retrieved your contact details.");
          }
        } catch (err) {
          console.error("Lookup error:", err);
        } finally {
          setIsLookingUp(false);
        }
      }
    };

    const timer = setTimeout(lookupUser, 500);
    return () => clearTimeout(timer);
  }, [address.mobile, user]);

  const shipping = subtotal >= 999 ? 0 : 50;
  const total = Math.max(0, subtotal + shipping - discountAmount - giftCardDiscount);

  useEffect(() => {
    if (items.length === 0) {
      navigate("/cart");
    }
  }, [items, navigate]);

  const handleNextStep = (e: React.FormEvent) => {
    e.preventDefault();
    if (step === 1) {
        if (!address.fullName || !address.mobile) {
            toast.error("Please provide your contact details.");
            return;
        }
        setStep(2);
    } else if (step === 2) {
        if (!address.street || !address.city || !address.state || !address.zipCode) {
            toast.error("Please provide complete shipping details.");
            return;
        }
        handleCompletePurchase();
    }
    window.scrollTo({ top: 0, behavior: "smooth" });
  };

  const handleBackStep = () => {
    if (step > 1) setStep(step - 1);
    window.scrollTo({ top: 0, behavior: "smooth" });
  };

  const handleCompletePurchase = async (method?: "ONLINE" | "COD") => {
    setIsPlacingOrder(true);
    const finalMethod = method || (activePaymentTab === "COD" ? "COD" : "ONLINE");
    
    try {
      const orderData = {
        userMobile: address.mobile || user?.mobileNumber || "Guest",
        userName: address.fullName || user?.fullName || "Guest",
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
        totalAmount: total,
        paymentStatus: "Pending",
        shippingAddress: {
          street: address.street,
          city: address.city,
          state: address.state,
          zipCode: address.zipCode
        }
      };

      const response = await fetch(getApiUrl("/api/payments/initiate"), {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          ...orderData,
          paymentMethod: finalMethod
        }),
      });

      const data = await response.json();

      if (response.ok) {
        if (data.gateway === "cod") {
            toast.success("Order Confirmed! Your order has been placed.");
            clearCart();
            navigate(`/order-success?orderNumber=${data.orderNumber}`);
            return;
        }

        if (data.gateway === "cashfree" && data.paymentSessionId) {
          try {
            const cashfree = await load({ mode: "sandbox" });
            let checkoutOptions = {
                paymentSessionId: data.paymentSessionId,
                redirectTarget: "_modal",
            };
            
            cashfree.checkout(checkoutOptions).then(async (result: any) => {
                if(result.error){
                    toast.error(result.error.message || "Payment failed.");
                    setIsPlacingOrder(false);
                }
                if(result.paymentDetails){
                    const verifyResponse = await fetch(getApiUrl("/api/payments/verify"), {
                        method: "POST",
                        headers: { "Content-Type": "application/json" },
                        body: JSON.stringify({
                            gateway: "cashfree",
                            merchantTransactionId: data.merchantTransactionId
                        }),
                    });

                    const verifyData = await verifyResponse.json();
                    if (verifyResponse.ok && verifyData.success) {
                        toast.success("Purchase Complete! Preparing your order...");
                        clearCart();
                        navigate(`/order-success?orderNumber=${data.orderNumber}`);
                    } else {
                        toast.error("Verification failed. Please contact support.");
                        setIsPlacingOrder(false);
                    }
                }
            });
          } catch(err) {
             toast.error("Failed to load payment portal.");
             setIsPlacingOrder(false);
          }
        } 
        else if (data.gateway === "razorpay" && data.razorpayOrderId) {
          const options = {
            key: data.keyId,
            amount: data.amount,
            currency: "INR",
            name: "Luscent Glow",
            description: "Product Purchase",
            image: "/logo.png",
            order_id: data.razorpayOrderId,
            handler: async function (response: any) {
              try {
                const verifyResponse = await fetch(getApiUrl("/api/payments/verify"), {
                  method: "POST",
                  headers: { "Content-Type": "application/json" },
                  body: JSON.stringify({
                    gateway: "razorpay",
                    razorpay_payment_id: response.razorpay_payment_id,
                    razorpay_order_id: response.razorpay_order_id,
                    razorpay_signature: response.razorpay_signature,
                    merchantTransactionId: data.merchantTransactionId
                  }),
                });

                const verifyData = await verifyResponse.json();
                if (verifyResponse.ok && verifyData.success) {
                  toast.success("Purchase Complete!");
                  clearCart();
                  navigate(`/order-success?orderNumber=${data.orderNumber}`);
                } else {
                  toast.error("Verification failed.");
                  setIsPlacingOrder(false);
                }
              } catch (err) {
                toast.error("Could not verify your payment.");
                setIsPlacingOrder(false);
              }
            },
            prefill: {
              name: address.fullName,
              email: address.email,
              contact: address.mobile
            },
            theme: { color: "#B68F4C" },
            modal: { ondismiss: () => setIsPlacingOrder(false) }
          };

          const rzp = new (window as any).Razorpay(options);
          rzp.open();
        } else {
          toast.error("Payment gateway is offline.");
          setIsPlacingOrder(false);
        }
      } else {
        toast.error(data.message || "Fulfillment failed.");
        setIsPlacingOrder(false);
      }
    } catch (error) {
      toast.error("Could not reach our fulfillment center.");
      setIsPlacingOrder(false);
    }
  };

  const inputClass = "w-full px-6 py-4 bg-white/80 border border-gray-200 rounded-xl outline-none focus:border-gold transition-all font-body text-sm text-charcoal placeholder:text-muted-foreground/30";
  const labelClass = "text-[11px] font-bold text-gray-500 uppercase tracking-widest mb-2 block pl-1 font-body";

  return (
    <div className="min-h-screen bg-background flex flex-col font-body selection:bg-gold/20">
      <Header />
      
      {/* Stepper Header */}
      <div className="bg-white/80 backdrop-blur-md border-b border-gray-100 py-6 sticky top-0 z-40">
        <div className="container mx-auto px-4 max-w-6xl">
            <div className="flex items-center justify-center gap-2 md:gap-4 overflow-x-auto no-scrollbar">
                {/* Step 1: Sign up / Bag */}
                <div className="flex items-center gap-2 flex-shrink-0">
                    <div className={`w-8 h-8 rounded-full flex items-center justify-center text-xs font-black transition-all duration-500 ${step >= 1 ? 'bg-gold text-white shadow-lg shadow-gold/20' : 'bg-gray-100 text-gray-400'}`}>
                        {step > 1 ? <CheckCircle2 size={16} /> : "1"}
                    </div>
                    <span className={`text-[10px] font-black uppercase tracking-[0.2em] ${step >= 1 ? 'text-charcoal' : 'text-gray-400'}`}>Identify</span>
                </div>
                <div className={`w-8 md:w-20 h-px transition-all duration-700 ${step > 1 ? 'bg-gold' : 'bg-gray-200'}`} />
                
                {/* Step 2: Address */}
                <div className="flex items-center gap-2 flex-shrink-0">
                    <div className={`w-8 h-8 rounded-full flex items-center justify-center text-xs font-black transition-all duration-500 ${step >= 2 ? 'bg-gold text-white shadow-lg shadow-gold/20' : 'bg-gray-100 text-gray-400'}`}>
                        2
                    </div>
                    <span className={`text-[10px] font-black uppercase tracking-[0.2em] ${step >= 2 ? 'text-charcoal' : 'text-gray-400'}`}>Address</span>
                </div>
            </div>
        </div>
      </div>

      <main className="flex-1 pt-12 pb-24 px-4 relative z-10">
        <div className="max-w-7xl mx-auto">
          <div className="grid lg:grid-cols-12 gap-12 items-start">
            {/* Left Content Area */}
            <div className="lg:col-span-8 transition-all duration-700">
            <AnimatePresence mode="wait">
              {step === 1 && (
                <motion.div 
                  key="identify"
                  initial={{ opacity: 0, y: 10 }}
                  animate={{ opacity: 1, y: 0 }}
                  exit={{ opacity: 0, y: -10 }}
                  className="space-y-6"
                >
                  <div className="bg-white p-10 rounded-[40px] border border-gray-100 shadow-ethereal">
                    <h2 className="text-3xl font-display font-medium text-charcoal mb-8 flex items-center gap-4">
                        <ShoppingBag className="text-gold" size={28} /> Order Summary
                    </h2>
                    
                    <form onSubmit={handleNextStep} className="space-y-8">
                        <div className="grid md:grid-cols-2 gap-6">
                            <div className="space-y-2">
                                <label className={labelClass}>Full Name</label>
                                <div className="relative">
                                    <User size={18} className="absolute left-4 top-1/2 -translate-y-1/2 text-gray-400" />
                                    <input 
                                        type="text" required placeholder="Enter your name"
                                        className={`${inputClass} pl-12`}
                                        value={address.fullName}
                                        onChange={(e) => setAddress({...address, fullName: e.target.value})}
                                    />
                                </div>
                            </div>
                            <div className="space-y-2">
                                <label className={labelClass}>Mobile Number</label>
                                <div className="relative">
                                    <Phone size={18} className="absolute left-4 top-1/2 -translate-y-1/2 text-gray-400" />
                                    <input 
                                        type="tel" required placeholder="Enter 10-digit mobile"
                                        className={`${inputClass} pl-12`}
                                        value={address.mobile}
                                        onChange={(e) => setAddress({...address, mobile: e.target.value})}
                                    />
                                </div>
                            </div>
                        </div>
                        <div className="space-y-2">
                            <label className={labelClass}>Email (Optional)</label>
                            <div className="relative">
                                <Mail size={18} className="absolute left-4 top-1/2 -translate-y-1/2 text-gray-400" />
                                <input 
                                    type="email" placeholder="support@luscent.com"
                                    className={`${inputClass} pl-12`}
                                    value={address.email}
                                    onChange={(e) => setAddress({...address, email: e.target.value})}
                                />
                            </div>
                        </div>

                        <button type="submit" className="w-full py-5 bg-charcoal text-white rounded-2xl font-black uppercase tracking-[0.3em] hover:bg-gold transition-all shadow-xl shadow-charcoal/10 text-xs text-center block">
                            Proceed to Address
                        </button>
                    </form>
                  </div>
                </motion.div>
              )}

              {step === 2 && (
                <motion.div 
                  key="address"
                  initial={{ opacity: 0, y: 10 }}
                  animate={{ opacity: 1, y: 0 }}
                  exit={{ opacity: 0, y: -10 }}
                  className="space-y-6"
                >
                  <div className="bg-white p-10 rounded-[40px] border border-gray-100 shadow-ethereal">
                    <div className="flex items-center justify-between mb-10">
                        <h2 className="text-3xl font-display font-medium text-charcoal flex items-center gap-4">
                            <MapPin className="text-gold" size={28} /> Delivery Address
                        </h2>
                        <button onClick={handleBackStep} className="text-gold text-[10px] font-black uppercase tracking-[0.2em] flex items-center gap-2 hover:gap-3 transition-all">
                            <ChevronLeft size={16} /> Back
                        </button>
                    </div>

                    <form onSubmit={handleNextStep} className="space-y-6">
                        <div className="space-y-2">
                            <label className={labelClass}>Flat / House No. / Building / Street</label>
                            <div className="relative">
                                <Home size={18} className="absolute left-4 top-1/2 -translate-y-1/2 text-gray-400" />
                                <input 
                                    type="text" required placeholder="Address Line 1"
                                    className={`${inputClass} pl-12`}
                                    value={address.street}
                                    onChange={(e) => setAddress({...address, street: e.target.value})}
                                />
                            </div>
                        </div>

                        <div className="grid md:grid-cols-3 gap-6">
                            <div className="space-y-2">
                                <label className={labelClass}>City</label>
                                <input 
                                    type="text" required placeholder="City"
                                    className={inputClass}
                                    value={address.city}
                                    onChange={(e) => setAddress({...address, city: e.target.value})}
                                />
                            </div>
                            <div className="space-y-2">
                                <label className={labelClass}>State</label>
                                <input 
                                    type="text" required placeholder="State"
                                    className={inputClass}
                                    value={address.state}
                                    onChange={(e) => setAddress({...address, state: e.target.value})}
                                />
                            </div>
                            <div className="space-y-2 col-span-2 md:col-span-1">
                                <label className={labelClass}>Pincode</label>
                                <input 
                                    type="text" required placeholder="6 digits"
                                    className={inputClass}
                                    value={address.zipCode}
                                    onChange={(e) => setAddress({...address, zipCode: e.target.value})}
                                />
                            </div>
                        </div>

                        <div className="pt-6 border-t border-gray-100">
                             <label className={labelClass}>Payment Method</label>
                             <div className="grid grid-cols-2 gap-4">
                                <button 
                                    type="button"
                                    onClick={() => setActivePaymentTab("UPI")}
                                    className={`p-5 rounded-2xl border flex items-center justify-center gap-3 transition-all font-black text-[10px] uppercase tracking-[0.2em] ${
                                        activePaymentTab !== "COD" 
                                        ? "bg-gold text-white border-gold shadow-lg shadow-gold/20" 
                                        : "bg-white border-gray-100 text-gray-400 hover:border-gold/30 hover:text-gold"
                                    }`}
                                >
                                    <Sparkles size={18} /> Online Payment
                                </button>
                                <button 
                                    type="button"
                                    onClick={() => setActivePaymentTab("COD")}
                                    className={`p-5 rounded-2xl border flex items-center justify-center gap-3 transition-all font-black text-[10px] uppercase tracking-[0.2em] ${
                                        activePaymentTab === "COD" 
                                        ? "bg-gold text-white border-gold shadow-lg shadow-gold/20" 
                                        : "bg-white border-gray-100 text-gray-400 hover:border-gold/30 hover:text-gold"
                                    }`}
                                >
                                    <Banknote size={18} /> Cash on Delivery
                                </button>
                             </div>
                        </div>

                        <button 
                            type="submit" 
                            disabled={isPlacingOrder}
                            className={`w-full py-5 rounded-2xl font-black uppercase tracking-[0.3em] transition-all shadow-2xl flex items-center justify-center gap-4 text-xs mt-10 ${
                                isPlacingOrder 
                                ? "bg-gray-100 text-gray-400 cursor-not-allowed" 
                                : "bg-charcoal text-white hover:bg-gold shadow-charcoal/30 active:scale-[0.98]"
                            }`}
                        >
                            {isPlacingOrder ? (
                                <>
                                    <div className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin" />
                                    Processing Order...
                                </>
                            ) : (
                                <>
                                    {activePaymentTab === "COD" ? "Confirm Order" : "Pay & Place Order"}
                                    <ArrowRight size={20} />
                                </>
                            )}
                        </button>
                    </form>
                  </div>
                </motion.div>
              )}
            </AnimatePresence>
          </div>

            {/* Sidebar Summary Area */}
            <div className="lg:col-span-4 space-y-6 sticky top-32">
                
                {/* 1. Bag Accordion */}
                <div className="bg-white rounded-[32px] border border-gray-100 shadow-ethereal overflow-hidden transition-all duration-500 hover:shadow-gold/10">
                    <button 
                        onClick={() => setShowBag(!showBag)}
                        className="w-full flex items-center justify-between p-7 hover:bg-gray-50/50 transition-all group"
                    >
                        <div className="flex items-center gap-5">
                            <div className="w-12 h-12 bg-gold/10 rounded-2xl flex items-center justify-center text-gold transition-colors group-hover:bg-gold group-hover:text-white">
                                <ShoppingBag size={22} />
                            </div>
                            <div className="text-left">
                                <p className="text-[10px] font-black uppercase tracking-[0.3em] text-gold/60 mb-1">Your Order</p>
                                <span className="text-xs font-black uppercase tracking-widest text-charcoal">Bag Items</span>
                            </div>
                        </div>
                        {showBag ? <ChevronDown size={18} className="rotate-180 text-gold transition-transform" /> : <ChevronDown size={18} className="text-gold transition-transform" />}
                    </button>
                    <AnimatePresence>
                        {showBag && (
                            <motion.div 
                                initial={{ height: 0, opacity: 0 }}
                                animate={{ height: "auto", opacity: 1 }}
                                exit={{ height: 0, opacity: 0 }}
                                className="border-t border-gray-50 overflow-hidden bg-gray-50/20"
                            >
                                <div className="p-7 space-y-5 max-h-[350px] overflow-y-auto custom-scrollbar">
                                    {items.map((item, idx) => (
                                        <div key={idx} className="flex gap-5 group">
                                            <div className="w-20 h-24 rounded-2xl bg-white border border-gray-100 overflow-hidden flex-shrink-0 shadow-sm transition-transform duration-500 group-hover:scale-105">
                                                <img src={getAssetUrl(item.image)} className="w-full h-full object-cover" alt={item.name} />
                                            </div>
                                            <div className="flex-1 min-w-0 py-1">
                                                <h4 className="text-[11px] font-black text-charcoal tracking-widest">{item.name}</h4>
                                                <p className="text-[10px] text-gray-400 mt-1 font-body">Quantity: {item.quantity}</p>
                                                <p className="text-base font-black text-charcoal mt-3 font-body">₹{(item.price * item.quantity).toLocaleString()}</p>
                                            </div>
                                        </div>
                                    ))}
                                </div>
                            </motion.div>
                        )}
                    </AnimatePresence>
                </div>

                {/* 2. Address Accordion */}
                <div className="bg-white rounded-[32px] border border-gray-100 shadow-ethereal overflow-hidden transition-all duration-500 hover:shadow-gold/10">
                    <button 
                        onClick={() => setShowAddress(!showAddress)}
                        className="w-full flex items-center justify-between p-7 hover:bg-gray-50/50 transition-all group"
                    >
                        <div className="flex items-center gap-5">
                            <div className="w-12 h-12 bg-gold/10 rounded-2xl flex items-center justify-center text-gold transition-colors group-hover:bg-gold group-hover:text-white">
                                <MapPin size={22} />
                            </div>
                            <div className="text-left">
                                <p className="text-[10px] font-black uppercase tracking-[0.3em] text-gold/60 mb-1">Shipping</p>
                                <span className="text-xs font-black uppercase tracking-widest text-charcoal">Delivery Address</span>
                            </div>
                        </div>
                        {showAddress ? <ChevronDown size={18} className="rotate-180 text-gold transition-transform" /> : <ChevronDown size={18} className="text-gold transition-transform" />}
                    </button>
                    <AnimatePresence>
                        {showAddress && (
                            <motion.div 
                                initial={{ height: 0, opacity: 0 }}
                                animate={{ height: "auto", opacity: 1 }}
                                exit={{ height: 0, opacity: 0 }}
                                className="border-t border-gray-50 overflow-hidden bg-gray-50/20"
                            >
                                <div className="p-7">
                                    {address.street ? (
                                        <div className="space-y-4">
                                            <div>
                                                <p className="text-[9px] font-black uppercase tracking-[0.2em] text-gold mb-1">Recipient</p>
                                                <p className="text-sm font-bold text-charcoal">{address.fullName}</p>
                                            </div>
                                            <div>
                                                <p className="text-[9px] font-black uppercase tracking-[0.2em] text-gold mb-1">Shipping Address</p>
                                                <p className="text-xs text-gray-500 leading-relaxed font-body">{address.street}, {address.city}, {address.state} - {address.zipCode}</p>
                                            </div>
                                            <div className="pt-2 border-t border-gray-100/50 flex items-center gap-3">
                                                 <Phone size={14} className="text-gold" />
                                                 <span className="text-xs font-black text-charcoal/80 tracking-widest">{address.mobile}</span>
                                            </div>
                                        </div>
                                    ) : (
                                        <p className="text-xs italic text-gray-400 font-body">Complete the address step to view details.</p>
                                    )}
                                </div>
                            </motion.div>
                        )}
                    </AnimatePresence>
                </div>

                {/* 3. Price Details Accordion */}
                <div className="bg-white rounded-[32px] border border-gray-100 shadow-ethereal overflow-hidden transition-all duration-500 hover:shadow-gold/10">
                    <button 
                        onClick={() => setShowPrice(!showPrice)}
                        className="w-full flex items-center justify-between p-7 hover:bg-gray-50/50 transition-all group"
                    >
                        <div className="flex items-center gap-5">
                            <div className="w-12 h-12 bg-gold/10 rounded-2xl flex items-center justify-center text-gold transition-colors group-hover:bg-gold group-hover:text-white">
                                <CreditCard size={22} />
                            </div>
                            <div className="text-left">
                                <p className="text-[10px] font-black uppercase tracking-[0.3em] text-gold/60 mb-1">Summary</p>
                                <span className="text-xs font-black uppercase tracking-widest text-charcoal">Price Details</span>
                            </div>
                        </div>
                        {showPrice ? <ChevronDown size={18} className="rotate-180 text-gold transition-transform" /> : <ChevronDown size={18} className="text-gold transition-transform" />}
                    </button>
                    <AnimatePresence>
                        {showPrice && (
                            <motion.div 
                                initial={{ height: 0, opacity: 0 }}
                                animate={{ height: "auto", opacity: 1 }}
                                exit={{ height: 0, opacity: 0 }}
                                className="border-t border-gray-50 overflow-hidden bg-gray-50/20"
                            >
                                <div className="p-7 space-y-5">
                                    <div className="flex justify-between text-[10px] text-gray-400 font-black uppercase tracking-[0.2em]">
                                        <span>Items Total</span>
                                        <span className="text-charcoal">₹{subtotal.toLocaleString()}</span>
                                    </div>
                                    <div className="flex justify-between text-[10px] text-gray-400 font-black uppercase tracking-[0.2em]">
                                        <span>Shipping</span>
                                        <span className="text-[#008945] font-black italic">FREE</span>
                                    </div>
                                    {(discountAmount > 0 || giftCardDiscount > 0) && (
                                        <div className="flex justify-between text-[10px] text-gold font-black uppercase tracking-[0.2em]">
                                            <span>Discounts</span>
                                            <span>- ₹{(discountAmount + giftCardDiscount).toLocaleString()}</span>
                                        </div>
                                    )}
                                    <div className="pt-6 border-t border-gray-100 flex justify-between items-baseline">
                                        <span className="text-sm font-black text-charcoal uppercase tracking-[0.2em]">Grand Total</span>
                                        <span className="text-2xl md:text-3xl font-body font-bold text-gold tracking-tight">₹{total.toLocaleString()}</span>
                                    </div>
                                </div>
                            </motion.div>
                        )}
                    </AnimatePresence>
                </div>

                {/* Trust Section */}
                <div className="bg-charcoal text-white p-10 rounded-[40px] shadow-2xl relative overflow-hidden group">
                    <div className="absolute top-0 right-0 w-40 h-40 bg-gold/20 rounded-full -mr-20 -mt-20 blur-3xl transition-all duration-1000 group-hover:bg-gold/30" />
                    <div className="relative z-10 flex flex-col gap-6">
                        <div className="w-16 h-16 bg-gold rounded-2xl flex items-center justify-center shadow-lg shadow-gold/20 transition-transform duration-700 group-hover:rotate-[360deg]">
                            <Sparkles size={32} className="text-white" />
                        </div>
                        <div>
                            <p className="text-[10px] font-black uppercase tracking-[0.4em] text-gold mb-2">Secure Payment</p>
                            <p className="text-[13px] font-display italic text-white/90 leading-relaxed font-light">Your order is protected by secure 256-bit encryption. Safe & Authenticity Guaranteed.</p>
                        </div>
                        <div className="flex items-center gap-2 text-[9px] font-black uppercase tracking-widest text-gold/60">
                            <ShieldCheck size={14} /> PCI Security Standard Compliant
                        </div>
                    </div>
                </div>
            </div>
          </div>
        </div>
      </main>

      <Footer />
      <WhatsAppButton />
    </div>
  );
};

export default Checkout;
