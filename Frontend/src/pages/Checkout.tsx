import React, { useState, useEffect } from "react";
import { useNavigate, Link, useLocation } from "react-router-dom";
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
  X,
  Building,
  Plus,
  Tag,
  Scan,
  Trash2,
} from "lucide-react";
import { cn } from "@/lib/utils";
import { PhoneInput } from "@/components/PhoneInput";
import { toast } from "sonner";
import { getApiUrl, getAssetUrl } from "@/lib/api";
import { useCart } from "@/context/CartContext";
import { useAuth } from "@/context/AuthContext";
import Header from "@/components/Header";
import Footer from "@/components/Footer";
import { load } from '@cashfreepayments/cashfree-js';

const GOLD = "hsl(var(--gold))";
const CHARCOAL = "hsl(var(--charcoal))";

const INDIAN_STATES = [
  "Andaman and Nicobar Islands", "Andhra Pradesh", "Arunachal Pradesh", "Assam", "Bihar", 
  "Chandigarh", "Chhattisgarh", "Dadra and Nagar Haveli and Daman and Diu", "Delhi", "Goa", 
  "Gujarat", "Haryana", "Himachal Pradesh", "Jammu and Kashmir", "Jharkhand", "Karnataka", 
  "Kerala", "Ladakh", "Lakshadweep", "Madhya Pradesh", "Maharashtra", "Manipur", "Meghalaya", 
  "Mizoram", "Nagaland", "Odisha", "Puducherry", "Punjab", "Rajasthan", "Sikkim", 
  "Tamil Nadu", "Telangana", "Tripura", "Uttar Pradesh", "Uttarakhand", "West Bengal"
];

const Checkout = () => {
  const navigate = useNavigate();
  const location = useLocation();
  const { items, subtotal, discountAmount, giftCardDiscount, appliedGiftCard, clearCart, shippingSettings, appliedCoupon, availableCoupons, refreshSettings } = useCart();
  const { user, syncUser } = useAuth();

  useEffect(() => {
    refreshSettings();
  }, [refreshSettings]);

  // "Buy Now" (Direct Checkout) logic
  const directBuyItem = location.state?.directBuyItem;
  const isDirectBuy = !!directBuyItem;

  const checkoutItems = isDirectBuy ? [directBuyItem] : items;
  const checkoutSubtotal = isDirectBuy ? (directBuyItem.price * directBuyItem.quantity) : subtotal;
  
  const [step, setStep] = useState(1); // 1: Identify, 2: Address
  const [isPlacingOrder, setIsPlacingOrder] = useState(false);
  const [activePaymentTab, setActivePaymentTab] = useState<"UPI" | "CARD" | "COD" | "NETBANKING" | "WALLET" | "EMI">("UPI");
  
  // Sidebar toggles
  const [showBag, setShowBag] = useState(false);
  const [showAddress, setShowAddress] = useState(false);
  const [showPrice, setShowPrice] = useState(true);
  
  // Modal state
  const [isAddressModalOpen, setIsAddressModalOpen] = useState(false);
  const [editingAddress, setEditingAddress] = useState<any>(null);

  const [address, setAddress] = useState({
    label: "Home",
    fullName: user?.fullName || "",
    mobile: user?.mobileNumber || "",
    email: user?.email || "",
    street: user?.shippingAddress?.street || "",
    city: user?.shippingAddress?.city || "",
    state: user?.shippingAddress?.state || "Gujarat",
    zipCode: user?.shippingAddress?.zipCode || "",
    isDefault: false
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

  const baseShipping = checkoutSubtotal >= shippingSettings.threshold ? 0 : shippingSettings.fee;
  const shipping = appliedCoupon?.discountType === "shipping" ? appliedCoupon.value : baseShipping;
  
  // Calculate final discount - if it's a shipping coupon, cap it at the actual shipping cost
  const finalDiscountAmount = (appliedCoupon?.discountType === "shipping")
    ? Math.min(shipping, discountAmount)
    : discountAmount;

  const total = Math.max(0, checkoutSubtotal + shipping - (isDirectBuy ? 0 : finalDiscountAmount) - (isDirectBuy ? 0 : giftCardDiscount));

  useEffect(() => {
    if (checkoutItems.length === 0 && !isDirectBuy) {
      navigate("/cart");
    }
  }, [checkoutItems, isDirectBuy, navigate]);

  const handleNextStep = (e: React.FormEvent) => {
    e.preventDefault();
    if (step === 1) {
        // Validation for mobile number (last part should be 10 digits)
        const mobileParts = address.mobile.split(" ");
        const pureNumber = mobileParts.length === 2 ? mobileParts[1] : address.mobile.replace(/\D/g, "");
        
        if (pureNumber.length !== 10) {
          toast.error("Please enter a valid 10-digit mobile number");
          return;
        }

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

  const handleSaveAddress = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!user) {
        // Guest user - just update temporary state
        setIsAddressModalOpen(false);
        toast.success(editingAddress ? "Address updated for this order." : "Address added for this order.");
        return;
    }

    try {
        const url = editingAddress 
            ? getApiUrl(`/api/auth/addresses/${editingAddress.id}`)
            : getApiUrl("/api/auth/addresses");
        
        const response = await fetch(url, {
            method: editingAddress ? "PUT" : "POST",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify({
                userId: user.id || user._id,
                address: address
            })
        });

        const data = await response.json();
        if (response.ok) {
            syncUser(data.user);
            setIsAddressModalOpen(false);
            toast.success(editingAddress ? "Address updated permanently." : "New address saved to your profile.");
        } else {
            toast.error(data.detail || "Failed to save address ritual.");
        }
    } catch (error) {
        toast.error("Sanctuary communication error.");
    }
  };

  const handleDeleteAddress = async (addressId: string) => {
    if (!user) return;
    if (!confirm("Are you sure you want to remove this address from your sanctuary?")) return;

    try {
        const response = await fetch(getApiUrl(`/api/auth/addresses/${addressId}?userId=${user.id || user._id}`), {
            method: "DELETE"
        });

        const data = await response.json();
        if (response.ok) {
            syncUser(data.user);
            toast.success("Address removed from your records.");
            if (address.street === data.deletedStreet) { // Optional check
                 setAddress({ ...address, street: "" });
            }
        } else {
            toast.error("Failed to revoke address.");
        }
    } catch (error) {
        toast.error("Sanctuary communication error.");
    }
  };

  const handleCompletePurchase = async (method?: "ONLINE" | "COD") => {
    setIsPlacingOrder(true);
    const finalMethod = method || (activePaymentTab === "COD" ? "COD" : "ONLINE");
    
    try {
      // Sanitize total to prevent NaN/null ritual errors
      const sanitizedTotal = isNaN(total) || total < 0 ? 0 : total;

      const orderData = {
        userMobile: address.mobile || user?.mobileNumber || "Guest",
        userName: address.fullName || user?.fullName || "Guest",
        items: checkoutItems.map(item => ({
          productId: item.id,
          name: item.name,
          price: item.price,
          quantity: item.quantity,
          image: item.image,
          selectedShade: item.selectedShade,
          selectedSize: item.selectedSize,
          metadata: item.metadata || (isDirectBuy ? { directBuy: true } : {})
        })),
        totalAmount: sanitizedTotal,
        appliedGiftCardCode: isDirectBuy ? null : (appliedGiftCard?.code || null),
        giftCardDiscount: isDirectBuy ? 0 : (giftCardDiscount || 0),
        paymentStatus: "Pending",
        shippingAddress: {
          fullName: address.fullName || user?.fullName || "Guest",
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
            if (!isDirectBuy) clearCart();
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
                        if (!isDirectBuy) clearCart();
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
                  if (!isDirectBuy) clearCart();
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
                    
                    <form onSubmit={handleNextStep} className="space-y-10">
                        <div className="grid md:grid-cols-2 gap-x-10 gap-y-8">
                            {/* Full Name */}
                            <div className="premium-input-vessel group">
                                <label className="floating-label">Full Name</label>
                                <div className="flex items-center gap-3">
                                    <User size={16} className="text-gold opacity-40 group-focus-within:opacity-100 transition-opacity" />
                                    <input 
                                        type="text" 
                                        required 
                                        placeholder=" "
                                        className="w-full bg-transparent font-body text-sm text-charcoal outline-none placeholder:opacity-0"
                                        value={address.fullName}
                                        onChange={(e) => setAddress({...address, fullName: e.target.value})}
                                    />
                                </div>
                            </div>

                            {/* Mobile Number */}
                            <div className="premium-input-vessel group">
                                <label className="floating-label">Mobile Number</label>
                                <div className="flex items-center gap-3">
                                    <Phone size={16} className="text-gold opacity-40 group-focus-within:opacity-100 transition-opacity" />
                                    <PhoneInput 
                                        value={address.mobile}
                                        onChange={(val) => setAddress({...address, mobile: val})}
                                        className="premium-phone-input"
                                        placeholder="Enter phone number"
                                    />
                                </div>
                            </div>
                        </div>

                        {/* Email */}
                        <div className="premium-input-vessel group">
                            <label className="floating-label">Email Address (Optional)</label>
                            <div className="flex items-center gap-3">
                                <Mail size={16} className="text-gold opacity-40 group-focus-within:opacity-100 transition-opacity" />
                                <input 
                                    type="email" 
                                    placeholder=" "
                                    className="w-full bg-transparent font-body text-sm text-charcoal outline-none placeholder:opacity-0"
                                    value={address.email}
                                    onChange={(e) => setAddress({...address, email: e.target.value})}
                                />
                            </div>
                        </div>

                        <div className="pt-4">
                            <button 
                                type="submit" 
                                className="w-full py-5 bg-gold text-primary rounded-[2rem] font-bold uppercase tracking-[0.25em] hover:bg-gold/90 transition-all shadow-xl shadow-gold/10 text-[10px] text-center block active:scale-[0.98]"
                            >
                                Secure My Ritual Details
                            </button>
                            <p className="text-[10px] font-body text-muted-foreground/60 text-center mt-4 uppercase tracking-widest">
                                Your data is protected by the sanctuary of our encryption.
                            </p>
                        </div>
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
                        <div className="space-y-1">
                            <h2 className="text-3xl font-body font-bold text-charcoal">Choose Address</h2>
                            <p className="text-sm font-body text-charcoal/60">Detailed address will help our delivery partner reach your doorstep quickly</p>
                        </div>
                        <button onClick={handleBackStep} className="text-gold text-[10px] font-black uppercase tracking-[0.2em] flex items-center gap-2 hover:gap-3 transition-all">
                            <ChevronLeft size={16} /> Back
                        </button>
                    </div>

                    {user?.addresses && user.addresses.length > 0 && (
                        <div className="mb-10 space-y-4">
                            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                                {/* Add New Address Card */}
                                <motion.div 
                                    whileHover={{ y: -5 }}
                                    onClick={() => {
                                        setEditingAddress(null);
                                        setAddress({
                                            label: "Home",
                                            fullName: user?.fullName || "",
                                            mobile: user?.mobileNumber || "",
                                            email: user?.email || "",
                                            street: "",
                                            city: "",
                                            state: "Gujarat",
                                            zipCode: "",
                                            isDefault: false
                                        });
                                        setIsAddressModalOpen(true);
                                    }}
                                    className="aspect-[16/10] min-h-[160px] border-2 border-dashed border-gold/20 rounded-[2rem] flex flex-col items-center justify-center gap-4 cursor-pointer hover:border-gold hover:bg-gold/5 transition-all group"
                                >
                                    <div className="w-10 h-10 rounded-full border border-gold/40 flex items-center justify-center text-gold group-hover:scale-110 transition-transform">
                                        <Plus size={20} />
                                    </div>
                                    <span className="text-xs font-body font-bold text-gold uppercase tracking-widest">Add New Address</span>
                                </motion.div>
                                {user.addresses.map((addr: any, idx: number) => (
                                    <motion.div 
                                        key={idx}
                                        whileHover={{ y: -5 }}
                                        className={cn(
                                            "p-6 md:p-8 rounded-[2.5rem] border transition-all duration-500 relative flex flex-col justify-between h-full min-h-[220px]",
                                            (address.street === addr.street && address.city === addr.city) ? "border-gold ring-1 ring-gold bg-gold/[0.05] shadow-lg shadow-gold/5" : "border-gray-100 bg-white shadow-sm"
                                        )}
                                    >
                                        <div className="space-y-4">
                                            <div className="flex justify-between items-start">
                                                <div className="flex items-center gap-4">
                                                    <p className="font-body font-bold text-base md:text-lg text-charcoal capitalize">{addr.fullName}</p>
                                                    <div className="flex items-center gap-2">
                                                        {addr.isDefault && (
                                                            <span className="text-[8px] font-black bg-gold/10 text-gold px-2 py-1 rounded uppercase tracking-widest leading-none">Default</span>
                                                        )}
                                                        <button 
                                                            onClick={(e) => {
                                                                e.stopPropagation();
                                                                handleDeleteAddress(addr.id);
                                                            }}
                                                            className="w-8 h-8 rounded-full flex items-center justify-center text-gray-300 hover:text-red-400 hover:bg-red-50 transition-all hover:scale-110"
                                                            title="Delete Address"
                                                        >
                                                            <Trash2 size={14} />
                                                        </button>
                                                    </div>
                                                </div>
                                                <div className="text-gold/30 p-2 bg-gold/5 rounded-lg">
                                                    {addr.label === "Home" ? <Home size={14} /> : <Building size={14} />}
                                                </div>
                                            </div>

                                            <div className="space-y-1 text-[13px] font-body text-charcoal/60 leading-relaxed font-light">
                                                <p>{addr.street}</p>
                                                <p>{addr.city}, {addr.state} - {addr.zipCode}</p>
                                                <p className="pt-2 font-medium text-charcoal">{addr.mobile}</p>
                                            </div>
                                        </div>

                                        <div className="flex items-center gap-3 mt-8">
                                            <button 
                                                type="button"
                                                onClick={() => {
                                                    setEditingAddress(addr);
                                                    setAddress({ ...address, ...addr });
                                                    setIsAddressModalOpen(true);
                                                }}
                                                className="flex-1 py-3 border border-gray-200 rounded-xl font-body font-bold text-[10px] uppercase tracking-widest text-charcoal hover:bg-gray-50 transition-colors shadow-sm"
                                            >
                                                Edit
                                            </button>
                                            <button 
                                                type="button"
                                                onClick={() => {
                                                    setAddress({ ...address, ...addr });
                                                    // Smooth transition to payment selection
                                                    document.getElementById('payment-section')?.scrollIntoView({ behavior: 'smooth' });
                                                }}
                                                className="flex-[2] py-3 bg-charcoal text-white rounded-xl font-body font-bold text-[10px] uppercase tracking-widest hover:bg-gold hover:text-charcoal transition-all shadow-lg shadow-charcoal/20"
                                            >
                                                Deliver here
                                            </button>
                                        </div>
                                    </motion.div>
                                ))}
                            </div>
                        </div>
                    )}

                    {(!user?.addresses || user.addresses.length === 0) && !address.street && (
                        <div 
                            onClick={() => {
                                setEditingAddress(null);
                                setIsAddressModalOpen(true);
                            }}
                            className="bg-gray-50/50 border-2 border-dashed border-gray-200 rounded-[3rem] p-16 flex flex-col items-center justify-center gap-6 cursor-pointer hover:border-gold hover:bg-gold/5 transition-all group"
                        >
                            <div className="w-16 h-16 bg-white rounded-full shadow-xl flex items-center justify-center text-gold group-hover:scale-110 transition-transform">
                                <MapPin size={32} />
                            </div>
                            <div className="text-center">
                                <h3 className="text-xl font-body font-bold text-charcoal mb-2">No Saved Addresses</h3>
                                <p className="text-sm text-gray-500 max-w-xs mx-auto">Please add a shipping address to continue with your purchase</p>
                            </div>
                            <button className="mt-4 px-10 py-4 bg-charcoal text-white rounded-full font-black text-xs uppercase tracking-widest hover:bg-gold hover:text-charcoal transition-all shadow-xl shadow-charcoal/20 flex items-center gap-3">
                                <Plus size={18} /> Add New Address
                            </button>
                        </div>
                    )}

                    <div id="payment-section" className="pt-12 mt-12 border-t border-gray-100">
                         <div className="flex items-center gap-4 mb-8">
                            <span className="w-10 h-10 rounded-full bg-gold/10 flex items-center justify-center text-gold font-bold text-sm">3</span>
                            <h3 className="text-2xl font-body font-bold text-charcoal">Payment Method</h3>
                         </div>
                         <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                            <button 
                                type="button"
                                onClick={() => setActivePaymentTab("UPI")}
                                className={`p-4 rounded-2xl border flex items-center justify-between transition-all group ${
                                    activePaymentTab !== "COD" 
                                    ? "bg-charcoal text-white border-charcoal shadow-xl shadow-charcoal/20" 
                                    : "bg-white border-gray-100 text-gray-400 hover:border-gold/30 hover:text-gold"
                                }`}
                            >
                                <div className="flex items-center gap-4">
                                    <div className={`w-10 h-10 rounded-xl flex items-center justify-center transition-colors ${activePaymentTab !== "COD" ? "bg-white/10" : "bg-gold/5 text-gold group-hover:bg-gold group-hover:text-white"}`}>
                                        <Sparkles size={18} />
                                    </div>
                                    <div className="text-left font-black text-[9px] uppercase tracking-[0.2em]">Online Payment</div>
                                </div>
                                {activePaymentTab !== "COD" && <CheckCircle2 size={18} className="text-gold" />}
                            </button>
                            <button 
                                type="button"
                                onClick={() => setActivePaymentTab("COD")}
                                className={`p-4 rounded-2xl border flex items-center justify-between transition-all group ${
                                    activePaymentTab === "COD" 
                                    ? "bg-charcoal text-white border-charcoal shadow-xl shadow-charcoal/20" 
                                    : "bg-white border-gray-100 text-gray-400 hover:border-gold/30 hover:text-gold"
                                }`}
                            >
                                <div className="flex items-center gap-4">
                                    <div className={`w-10 h-10 rounded-xl flex items-center justify-center transition-colors ${activePaymentTab === "COD" ? "bg-white/10" : "bg-gold/5 text-gold group-hover:bg-gold group-hover:text-white"}`}>
                                        <Banknote size={18} />
                                    </div>
                                    <div className="text-left font-black text-[9px] uppercase tracking-[0.2em]">Cash on Delivery</div>
                                </div>
                                {activePaymentTab === "COD" && <CheckCircle2 size={18} className="text-gold" />}
                            </button>
                         </div>
                    </div>

                    <button 
                        onClick={() => handleCompletePurchase()}
                        disabled={isPlacingOrder || !address.street}
                        className={`w-full py-4 rounded-2xl font-black uppercase tracking-[0.3em] transition-all shadow-xl flex items-center justify-center gap-4 text-[10px] mt-8 ${
                            isPlacingOrder || !address.street
                            ? "bg-gray-100 text-gray-400 cursor-not-allowed" 
                            : "bg-gold text-white hover:bg-charcoal shadow-gold/20 active:scale-[0.98]"
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
                                    {checkoutItems.map((item, idx) => (
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
                                        <span className={shipping === 0 ? "text-[#008945] font-black italic" : "text-charcoal font-black"}>
                                            {shipping === 0 ? "FREE" : `₹${shipping.toLocaleString()}`}
                                        </span>
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

      {/* Address Modal */}
      <AnimatePresence>
        {isAddressModalOpen && (
          <div className="fixed inset-0 z-[100] flex items-center justify-center p-4">
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              onClick={() => setIsAddressModalOpen(false)}
              className="absolute inset-0 bg-charcoal/60 backdrop-blur-md"
            />
            <motion.div
              initial={{ opacity: 0, scale: 0.95, y: 20 }}
              animate={{ opacity: 1, scale: 1, y: 0 }}
              exit={{ opacity: 0, scale: 0.95, y: 20 }}
              className="relative w-full max-w-2xl bg-[#faf9f6] rounded-[2.5rem] shadow-2xl overflow-hidden"
            >
              <div className="p-6 md:p-10">
                <div className="flex justify-between items-start mb-6">
                  <div className="space-y-3">
                    <div className="flex items-center gap-3 text-gold">
                      <MapPin size={14} className="opacity-50" />
                      <span className="text-[9px] font-body font-bold uppercase tracking-[0.4em]">Checkout Address</span>
                    </div>
                    <h3 className="font-display text-4xl font-bold text-charcoal">{editingAddress ? "Update" : "Add New"} <span className="text-gold italic font-light">Address</span></h3>
                  </div>
                  <button 
                    onClick={() => setIsAddressModalOpen(false)}
                    className="w-10 h-10 border border-gold/10 rounded-full flex items-center justify-center text-charcoal/40 hover:text-gold hover:border-gold/30 transition-all"
                  >
                    <X size={20} />
                  </button>
                </div>

                <form className="space-y-6" onSubmit={handleSaveAddress}>
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                    <div className="space-y-3 group">
                      <label className="text-[10px] font-black uppercase tracking-[0.2em] text-charcoal/40 pl-1 group-focus-within:text-gold transition-colors flex items-center gap-2">
                        <Tag size={10} /> Address Type
                      </label>
                      <div className="relative">
                        <select 
                          value={address.label}
                          onChange={(e) => setAddress({...address, label: e.target.value})}
                          className="w-full h-12 bg-white border border-gold/10 rounded-xl px-5 font-body text-charcoal focus:ring-2 focus:ring-gold/20 focus:border-gold transition-all appearance-none shadow-sm text-sm"
                        >
                          <option value="Home">Home Address</option>
                          <option value="Work">Office Address</option>
                          <option value="Other">Other Address</option>
                        </select>
                        <ChevronDown className="absolute right-6 top-1/2 -translate-y-1/2 text-gold/40 pointer-events-none" size={18} />
                      </div>
                    </div>

                    <div className="space-y-3 group">
                      <label className="text-[10px] font-black uppercase tracking-[0.2em] text-charcoal/40 pl-1 group-focus-within:text-gold transition-colors flex items-center gap-2">
                        <User size={10} /> Full Name
                      </label>
                      <div className="relative">
                        <input 
                          type="text" required
                          className="w-full h-12 bg-white border border-gold/10 rounded-xl px-5 font-body text-charcoal focus:ring-2 focus:ring-gold/20 focus:border-gold transition-all shadow-sm text-sm"
                          value={address.fullName}
                          onChange={(e) => setAddress({...address, fullName: e.target.value})}
                          placeholder="Recipient Name"
                        />
                      </div>
                    </div>
                  </div>

                  <div className="space-y-3 group">
                    <label className="text-[10px] font-black uppercase tracking-[0.2em] text-charcoal/40 pl-1 group-focus-within:text-gold transition-colors flex items-center gap-2">
                      <Building size={10} /> Street Address
                    </label>
                    <textarea 
                      required rows={2}
                      className="w-full bg-white border border-gold/10 rounded-xl p-4 font-body text-charcoal focus:ring-2 focus:ring-gold/20 focus:border-gold transition-all shadow-sm resize-none text-sm"
                      value={address.street}
                      onChange={(e) => setAddress({...address, street: e.target.value})}
                      placeholder="Street, Building, Unit"
                    />
                  </div>

                  <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                    <div className="space-y-3 group">
                      <label className="text-[10px] font-black uppercase tracking-[0.2em] text-charcoal/40 pl-1 group-focus-within:text-gold transition-colors flex items-center gap-2">
                        <MapPin size={10} /> City
                      </label>
                      <input 
                        type="text" required
                        className="w-full h-12 bg-white border border-gold/10 rounded-xl px-5 font-body text-charcoal focus:ring-2 focus:ring-gold/20 focus:border-gold transition-all shadow-sm text-sm"
                        value={address.city}
                        onChange={(e) => setAddress({...address, city: e.target.value})}
                        placeholder="City"
                      />
                    </div>
                    <div className="space-y-3 group">
                      <label className="text-[10px] font-black uppercase tracking-[0.2em] text-charcoal/40 pl-1 group-focus-within:text-gold transition-colors flex items-center gap-2">
                        <Landmark size={10} /> State
                      </label>
                      <div className="relative">
                        <select 
                          value={address.state}
                          onChange={(e) => setAddress({...address, state: e.target.value})}
                          className="w-full h-12 bg-white border border-gold/10 rounded-xl px-5 font-body text-charcoal focus:ring-2 focus:ring-gold/20 focus:border-gold transition-all appearance-none shadow-sm text-sm"
                        >
                          {INDIAN_STATES.map(s => <option key={s} value={s}>{s}</option>)}
                        </select>
                        <ChevronDown className="absolute right-6 top-1/2 -translate-y-1/2 text-gold/40 pointer-events-none" size={18} />
                      </div>
                    </div>
                  </div>

                  <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                    <div className="space-y-3 group">
                      <label className="text-[10px] font-black uppercase tracking-[0.2em] text-charcoal/40 pl-1 group-focus-within:text-gold transition-colors flex items-center gap-2">
                        <Scan size={10} /> Pincode
                      </label>
                      <input 
                        type="text" required maxLength={6}
                        className="w-full h-12 bg-white border border-gold/10 rounded-xl px-5 font-body text-charcoal focus:ring-2 focus:ring-gold/20 focus:border-gold transition-all shadow-sm text-sm"
                        value={address.zipCode}
                        onChange={(e) => setAddress({...address, zipCode: e.target.value.replace(/\D/g, "")})}
                        placeholder="6-digit Pincode"
                      />
                    </div>
                    <div className="space-y-3 group">
                      <label className="text-[10px] font-black uppercase tracking-[0.2em] text-charcoal/40 pl-1 group-focus-within:text-gold transition-colors flex items-center gap-2">
                        <Smartphone size={10} /> Mobile Number
                      </label>
                      <input 
                        type="tel" required
                        className="w-full h-12 bg-white border border-gold/10 rounded-xl px-5 font-body text-charcoal focus:ring-2 focus:ring-gold/20 focus:border-gold transition-all shadow-sm text-sm"
                        value={address.mobile}
                        onChange={(e) => setAddress({...address, mobile: e.target.value})}
                        placeholder="Mobile Number"
                      />
                    </div>
                  </div>

                  <div className="flex items-center gap-3 py-2">
                    <button
                      type="button"
                      onClick={() => setAddress({ ...address, isDefault: !address.isDefault })}
                      className={`w-10 h-5 rounded-full transition-all relative ${address.isDefault ? 'bg-gold' : 'bg-gray-200'}`}
                    >
                      <div className={`absolute top-1 w-3 h-3 bg-white rounded-full transition-all ${address.isDefault ? 'left-6' : 'left-1'}`} />
                    </button>
                    <span className="text-[10px] font-bold uppercase tracking-widest text-charcoal/60">Set as default address</span>
                  </div>

                  <button 
                    type="submit"
                    className="w-full h-14 bg-charcoal text-white rounded-xl font-black uppercase tracking-[0.3em] hover:bg-gold hover:text-charcoal transition-all duration-500 shadow-xl shadow-charcoal/20 flex items-center justify-center gap-4 group text-[10px]"
                  >
                    {editingAddress ? "Update Address" : "Save Address"}
                    <ArrowRight size={20} className="group-hover:translate-x-2 transition-transform" />
                  </button>
                </form>
              </div>
            </motion.div>
          </div>
        )}
      </AnimatePresence>
    </div>
  );
};

export default Checkout;
